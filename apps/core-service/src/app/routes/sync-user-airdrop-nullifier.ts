
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId } from "@tokenizk/types";
import { getConnection, In, IsNull, MoreThanOrEqual } from "typeorm";
import { PublicKey, Field, UInt64 } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { User, UserTokenSale } from "@tokenizk/entities";
import { } from "typeorm";
import { SaleContribution } from "@tokenizk/contracts";
import * as StateDB from "@/app/grpc-endpoints/state-util"

const logger = getLogger('syncUserSaleNullifier');

export const syncUserAirdropNullifier = async function () {
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

        const hasTree = await StateDB.indexDB.get(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddress}`);
        if (hasTree) {// undefined
            await StateDB.userNullifierDB.initTree(PublicKey.fromBase58(userAddress));
            await StateDB.userNullifierDB.commit();
            logger.info(`created userNullifierTree for ${userAddress}]`);

            await StateDB.indexDB.put(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddress}`, '1');
        } else {
            await StateDB.userNullifierDB.loadTree(PublicKey.fromBase58(userAddress));
            logger.info(`loaded userNullifierTree for ${userAddress}]`);
        }

        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();

        const user = await queryRunner.manager.findOne(User, { address: userAddress }) ?? new User();
        user.address = userAddress;
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
                await StateDB.userNullifierDB.appendLeaf(leaf);

                uts.syncNullTreeFlag = 1;
                uts.nullTreeLeafIndex = Number(StateDB.userNullifierDB.getNumLeaves(true));
                await queryRunner.manager.save(uts);
            }
            user.nullifierRoot = (await StateDB.userNullifierDB.getRoot(true)).toString();
            user.nullStartIndex = StateDB.userNullifierDB.getNumLeaves(true).toString();
            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();

            // if process crashes here before commit, will restore tree when process restart.
            await StateDB.userNullifierDB.commit();// commit tree
        } catch (err) {
            logger.error(`process record[${userAddress}, error!]`);
            console.error(err);
            await StateDB.userNullifierDB.rollback();

            await queryRunner.rollbackTransaction();

        } finally {
            await StateDB.userNullifierDB.reset();

            await queryRunner.release();

            logger.info(`process record[${userAddress}, done.]`);
        }
        return { code: 1, data: 0, msg: '' };
    }

    logger.info(`this round end.`);

    return { code: 0, data: 1, msg: '' };
}
