
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId } from "@tokenizk/types";
import { getConnection, In, IsNull, MoreThanOrEqual } from "typeorm";
import { PublicKey, Field, UInt64 } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { User, UserTokenSale } from "@tokenizk/entities";
import { } from "typeorm";
import { SaleContribution } from "@tokenizk/contracts";

const logger = getLogger('syncUserNullifier');

/**
 * sync User Nullifier
 */
export const syncUserNullifier: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/sync-user-nullifier",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<null, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const connection = getConnection();

    const userTokenSaleList = await connection.getRepository(UserTokenSale).find({
        where: {
            redeemOrClaimBlockHeight: MoreThanOrEqual(0),
            syncNullTreeFlag: 0
        }
    }) ?? [];

    if (userTokenSaleList.length == 0) {
        logger.warn(`no new NOT_SYNC record, end.`);

        return { code: 0, data: 0, msg: '' }
    }
    logger.info(`NOT_SYNC recordList: ${JSON.stringify(userTokenSaleList.map(r => r.id))}`);

    const userTokenSaleMap = new Map<string, UserTokenSale[]>();
    for (let i = 0; i < userTokenSaleList.length; i++) {
        const userTokenSale = userTokenSaleList[i];
        if (!userTokenSaleMap.get(userTokenSale.contributorAddress)) {
            userTokenSaleMap.set(userTokenSale.contributorAddress, []);
        }
        userTokenSaleMap.get(userTokenSale.contributorAddress)!.push(userTokenSale);
    }

    for (const entry of userTokenSaleMap.entries()) {
        const userAddress = entry[0];
        const userTokenSaleListX = entry[1];

        logger.info(`start processing record[${userAddress}...]`);

        userTokenSaleListX.sort((a, b) => a.redeemOrClaimBlockHeight - b.redeemOrClaimBlockHeight);

        const hasTree = await this.indexDB.get(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddress}`);
        if (hasTree) {// undefined
            await this.userNullifierDB.initTree(PublicKey.fromBase58(userAddress));
            await this.userNullifierDB.commit();
            logger.info(`created userNullifierTree for ${userAddress}]`);
        } else {
            await this.userNullifierDB.loadTree(PublicKey.fromBase58(userAddress));
            logger.info(`loaded userNullifierTree for ${userAddress}]`);
        }

        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();

        const user = ((await queryRunner.manager.find(User, { address: userAddress })) ?? [])[0];
        try {
            for (let i = 0; i < userTokenSaleListX.length; i++) {
                const uts = userTokenSaleListX[i];
                logger.info(` processing record[${uts.id}...]`);

                const leaf = (new SaleContribution({
                    tokenAddress: PublicKey.fromBase58(uts.tokenAddress),
                    tokenId: Field(uts.tokenId),
                    saleContractAddress: PublicKey.fromBase58(uts.saleAddress),
                    contributorAddress: PublicKey.fromBase58(uts.contributorAddress),
                    minaAmount: UInt64.from(uts.contributeCurrencyAmount)
                })).hash();
                await this.userNullifierDB.appendLeaf(leaf);

                uts.syncNullTreeFlag = 1;
                uts.nullTreeLeafIndex = Number(this.userNullifierDB.getNumLeaves(true));
                await queryRunner.manager.save(uts);
            }
            user.nullifierRoot = (await this.userNullifierDB.getRoot(true)).toString();
            user.nullStartIndex = (Number(user.nullStartIndex) + Number(this.userNullifierDB.getNumLeaves(true))).toString();
            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();

            // if process crashes here before commit, will restore tree when process restart.
            await this.userNullifierDB.commit();// commit tree
        } catch (err) {
            logger.error(`process record[${userAddress}, error!]`);
            logger.error(err);
            await this.userNullifierDB.rollback();

            await queryRunner.rollbackTransaction();

        } finally {
            await this.userNullifierDB.reset();

            await queryRunner.release();

            logger.info(`process record[${userAddress}, done.]`);
        }
        return { code: 1, data: 0, msg: '' };
    }

    logger.info(`this round end.`);

    return { code: 0, data: 1, msg: '' };
}

const schema = {
    description: 'sync user nullifiers',
    tags: ['Maintain Tree'],
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'number'
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
