
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId, SaleStatus, UserRedeemClaimWitnessDto, UserRedeemClaimWitnessDtoSchema } from "@tokenizk/types";
import { getConnection } from "typeorm";
import { PublicKey, Field, UInt64 } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { LeafData } from "@tokenizk/merkle-tree";
import { Sale, UserTokenSale } from "@tokenizk/entities";
import { SaleContribution } from "@tokenizk/contracts";

const logger = getLogger('queryUserContributionWitness');

export const queryUserContributionWitness: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/user-contribution-witness",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<{ tokenAddr: string, saleAddr: string, userAddr: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<UserRedeemClaimWitnessDto>> {
    const { tokenAddr, saleAddr, userAddr } = req.body;

    logger.info(`a new witness query begin, target{tokenAddr:${tokenAddr}, saleAddr: ${saleAddr}, userAddr: ${userAddr}}`);

    try {
        const connection = getConnection();
        const userTokenSaleRepo = connection.getRepository(UserTokenSale);
        const userTokenSale = await userTokenSaleRepo.findOne({
            where: {
                tokenAddress: tokenAddr,
                saleAddress: saleAddr,
                ownerAddress: userAddr,
            }
        });

        // check if sale is ended
        const saleRepo = connection.getRepository(Sale);
        const sale = await saleRepo.findOne({
            where: {
                tokenAddress: tokenAddr,
                saleAddress: saleAddr,
                saleStatus: SaleStatus.CONFIRMED,
            }
        });
        if (!sale) {
            logger.warn(`no Sale found, end.`);
            return { code: 1, data: undefined, msg: 'Cannot find the user contribution record!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        } else if (sale.endTimestamp > new Date().getTime()) {
            logger.warn(`sale is not end yet, end.`);
            return { code: 1, data: undefined, msg: 'Please wait for sale end!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        } else if (sale.contributorsMaintainFlag != 1) {
            logger.warn(`contributors is not maintained yet, end.`);
            return { code: 1, data: undefined, msg: 'Please wait serveral minutes for contributors tree maintainance done!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

        if (!userTokenSale) {
            logger.warn(`no userTokenSale, end.`);
            return { code: 1, data: undefined, msg: 'Cannot find the user contribution record!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        } else if (!userTokenSale.nullTreeLeafIndex) {
            logger.warn(`the userTokenSale has been consumed, end.`);
            return { code: 1, data: undefined, msg: 'This asset has been claimed or redeemed!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

        // check if already init
        const hasTree = await this.indexDB.get(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddr}`);
        if (hasTree) {// undefined
            await this.userNullifierDB.initTree(PublicKey.fromBase58(userAddr));
            await this.userNullifierDB.commit();
            logger.info(`created userNullifierTree for ${userAddr}]`);
        } else {
            await this.userNullifierDB.loadTree(PublicKey.fromBase58(userAddr));
            logger.info(`loaded userNullifierTree for ${userAddr}]`);
        }

        // print tree info
        logger.info(`print user tree info:`);
        logger.info(`  treeId: ${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddr}`);
        logger.info(`  depth: ${this.userNullifierDB.getDepth()}`);
        logger.info(`  leafNum: ${this.userNullifierDB.getNumLeaves(false).toString()}`);
        logger.info(`  treeRoot: ${this.userNullifierDB.getRoot(false).toString()}`);

        const contributionTreeLeafIndx = userTokenSale.contributeActionIndex;
        const targetIndx = this.userNullifierDB.getNumLeaves(false);

        const contributorsTreeRoot = this.saleContributorsDB.getRoot(false).toString();
        logger.info(`current root of Contributors Tree: ${contributorsTreeRoot}`);

        const saleContributionHash = (new SaleContribution({
            tokenAddress: PublicKey.fromBase58(userTokenSale.tokenAddress),
            tokenId: Field(userTokenSale.tokenId),
            saleContractAddress: PublicKey.fromBase58(userTokenSale.saleAddress),
            contributorAddress: PublicKey.fromBase58(userTokenSale.contributorAddress),
            minaAmount: UInt64.from(userTokenSale.contributeCurrencyAmount)
        })).hash();
        const lowLeafWitness = await this.userNullifierDB.findPreviousValueAndMp(Field(saleContributionHash), true);
        const predecessorLeafData = lowLeafWitness.leafData;
        const predecessorIdx = lowLeafWitness.index;

        logger.info(`predecessor's index: ${predecessorIdx}`);
        logger.info(`predecessor: {value:${predecessorLeafData?.value}, nextValue:${predecessorLeafData?.nextValue}, nextIndex:${predecessorLeafData?.nextIndex}}`);

        logger.info(`before modify predecessor, nullifierTree Root: ${await this.userNullifierDB.getRoot(true)}`);
        // logger.info(`before modify predecessor, nullifierTree Num: ${await this.userNullifierDB.getNumLeaves(true)}`);
        const modifiedPredecessorLeafDataTmp: LeafData = {
            value: predecessorLeafData.value.toBigInt(),
            nextValue: saleContributionHash.toBigInt(),
            nextIndex: targetIndx
        };
        await this.userNullifierDB.updateLeaf(modifiedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
        logger.info(`after modify predecessor, nullifierTree Root: ${await this.userNullifierDB.getRoot(true)}`);
        // logger.info(`after modify predecessor, nullifierTree Num: ${await this.userNullifierDB.getNumLeaves(true)}`);

        // obtain oldNullWitness
        const oldNullWitness = (await this.userNullifierDB.getSiblingPath(BigInt(targetIndx), true))!.path.map(p => p.toString());
        logger.info('obtain oldNullWitness done.');

        const revertedPredecessorLeafDataTmp: LeafData = {
            value: predecessorLeafData.value.toBigInt(),
            nextValue: predecessorLeafData.nextValue.toBigInt(),
            nextIndex: predecessorLeafData.nextIndex.toBigInt()
        };
        await this.userNullifierDB.updateLeaf(revertedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
        logger.info(`after revert predecessor, nullifierTree Root: ${await this.userNullifierDB.getRoot(true)}`);
        // logger.info(`after revert predecessor, nullifierTree Num: ${await this.userNullifierDB.getNumLeaves(true)}`);

        const witnessOnContributorTree = (await this.saleContributorsDB.getSiblingPath(BigInt(contributionTreeLeafIndx), false))!.path.map(p => p.toString());
        logger.info(`witnessOnContributorTree: ${JSON.stringify(witnessOnContributorTree)}`);

        const rs = {
            saleContributorMembershipWitnessData: {
                leafData: {
                    tokenAddress: userTokenSale.tokenAddress,
                    tokenId: userTokenSale.tokenId,
                    saleContractAddress: userTokenSale.saleAddress,
                    contributorAddress: userTokenSale.contributorAddress,
                    minaAmount: Number(userTokenSale.contributeCurrencyAmount)
                },
                siblingPath: witnessOnContributorTree,
                index: contributionTreeLeafIndx.toString()
            },
            lowLeafWitness: {
                leafData: {
                    value: predecessorLeafData!.value.toString(),
                    nextIndex: predecessorLeafData!.nextIndex.toString(),
                    nextValue: predecessorLeafData!.nextValue.toString()
                },
                siblingPath: lowLeafWitness.siblingPath.path.map(p => p.toString()),
                index: predecessorIdx.toString()
            },
            oldNullWitness,
        } as UserRedeemClaimWitnessDto

        await this.userNullifierDB.reset();

        return { code: 0, data: rs, msg: '' };
    } catch (err) {
        logger.error(err);
        console.error(err);
        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query Witness upon user contribution',
    tags: ['Witness'],
    params: {
        type: "object",
        properties: {
            tokenAddr: {
                type: "string",
            },
            saleAddr: {
                type: "string",
            },
            userAddr: {
                type: "string",
            }

        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'object',
                    properties: UserRedeemClaimWitnessDtoSchema.properties
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
