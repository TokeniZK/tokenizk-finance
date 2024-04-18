
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId, SaleStatus, UserRedeemClaimWitnessDto, UserRedeemClaimWitnessDtoSchema } from "@tokenizk/types";
import { getConnection } from "typeorm";
import { PublicKey, Field, UInt64, fetchLastBlock, TokenId } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { LeafData } from "@tokenizk/merkle-tree";
import { Sale, UserTokenSale } from "@tokenizk/entities";
import { SaleContribution } from "@tokenizk/contracts";

import * as StateDB from "@/app/grpc-endpoints/state-util"

const logger = getLogger('queryUserContributionWitness');

let lastFetchBlockTs = 0;
let currentBlockHeight = 0;

export const queryUserContributionWitness = async function (dto:{ tokenAddr: string, saleAddr: string, userAddr: string }) {
    const { tokenAddr, saleAddr, userAddr } = dto;
    
    logger.info(`a new witness query begin, target{tokenAddr:${tokenAddr}, saleAddr: ${saleAddr}, userAddr: ${userAddr}}`);

    try {
        const connection = getConnection();
        const userTokenSaleRepo = connection.getRepository(UserTokenSale);
        const userTokenSale = await userTokenSaleRepo.findOne({
            where: {
                tokenAddress: tokenAddr,
                saleAddress: saleAddr,
                contributorAddress: userAddr,
            }
        });

        // check if sale is ended
        const saleRepo = connection.getRepository(Sale);
        const sale = await saleRepo.findOne({
            where: {
                tokenAddress: tokenAddr,
                saleAddress: saleAddr,
                status: SaleStatus.CONFIRMED,
            }
        });
        if (!sale) {
            logger.warn(`no Sale found, end.`);
            return { code: 1, data: undefined, msg: 'Cannot find the user contribution record!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

        if (sale.contributorsMaintainFlag != 1) {
            logger.warn(`contributors is not maintained yet, end.`);
            return { code: 1, data: undefined, msg: 'Please wait serveral minutes for contributors tree maintainance done!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

        if (!userTokenSale) {
            logger.warn(`no userTokenSale, end.`);
            return { code: 1, data: undefined, msg: 'Cannot find the user contribution record!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        } else if (userTokenSale.nullTreeLeafIndex) {
            logger.warn(`the userTokenSale has been consumed, end.`);
            return { code: 1, data: undefined, msg: 'This asset has been claimed or redeemed!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

        if (new Date().getTime() - lastFetchBlockTs > 1000 * 60 * 1) {
            currentBlockHeight = Number((await fetchLastBlock()).blockchainLength.toString());
        }

        /*
                if (Number(sale.endTimestamp) < currentBlockHeight + 2) {
                    logger.warn(`sale is not end yet, end.`);
                    return { code: 1, data: undefined, msg: 'Please wait for sale end!' } as BaseResponse<UserRedeemClaimWitnessDto>;
                }
        */

        // check if already init
        const hasTree = await StateDB.indexDB.get(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddr}`);
        if (!hasTree) {// undefined
            await StateDB.userNullifierDB.initTree(PublicKey.fromBase58(userAddr));
            await StateDB.userNullifierDB.commit();
            await StateDB.indexDB.put(`${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddr}`, '1');
            logger.info(`created userNullifierTree for ${userAddr}]`);
        } else {
            await StateDB.userNullifierDB.loadTree(PublicKey.fromBase58(userAddr));
            logger.info(`loaded userNullifierTree for ${userAddr}]`);
        }

        // print tree info
        logger.info(`print user tree info:`);
        logger.info(`  treeId: ${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${userAddr}`);
        logger.info(`  depth: ${StateDB.userNullifierDB.getDepth()}`);
        logger.info(`  leafNum: ${StateDB.userNullifierDB.getNumLeaves(false).toString()}`);
        logger.info(`  treeRoot: ${StateDB.userNullifierDB.getRoot(false).toString()}`);

        const targetIndx = StateDB.userNullifierDB.getNumLeaves(false);

        const tokenAddress = PublicKey.fromBase58(userTokenSale.tokenAddress);
        const tokenId = TokenId.derive(tokenAddress);
        const saleContributionHash = (new SaleContribution({
            tokenAddress,
            tokenId,
            saleContractAddress: PublicKey.fromBase58(userTokenSale.saleAddress),
            contributorAddress: PublicKey.fromBase58(userTokenSale.contributorAddress),
            minaAmount: UInt64.from(userTokenSale.contributeCurrencyAmount)
        })).hash();
        const lowLeafWitness = await StateDB.userNullifierDB.findPreviousValueAndMp(Field(saleContributionHash), true);
        const predecessorLeafData = lowLeafWitness.leafData;
        const predecessorIdx = lowLeafWitness.index;

        logger.info(`predecessor's index: ${predecessorIdx}`);
        logger.info(`predecessor: {value:${predecessorLeafData?.value}, nextValue:${predecessorLeafData?.nextValue}, nextIndex:${predecessorLeafData?.nextIndex}}`);

        logger.info(`before modify predecessor, nullifierTree Root: ${await StateDB.userNullifierDB.getRoot(true)}`);
        // logger.info(`before modify predecessor, nullifierTree Num: ${await StateDB.userNullifierDB.getNumLeaves(true)}`);
        const modifiedPredecessorLeafDataTmp: LeafData = {
            value: predecessorLeafData.value.toBigInt(),
            nextValue: saleContributionHash.toBigInt(),
            nextIndex: targetIndx
        };
        await StateDB.userNullifierDB.updateLeaf(modifiedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
        logger.info(`after modify predecessor, nullifierTree Root: ${await StateDB.userNullifierDB.getRoot(true)}`);
        // logger.info(`after modify predecessor, nullifierTree Num: ${await StateDB.userNullifierDB.getNumLeaves(true)}`);

        // obtain oldNullWitness
        const oldNullWitness = (await StateDB.userNullifierDB.getSiblingPath(BigInt(targetIndx), true))!.path.map(p => p.toString());
        logger.info('obtain oldNullWitness done.');

        const revertedPredecessorLeafDataTmp: LeafData = {
            value: predecessorLeafData.value.toBigInt(),
            nextValue: predecessorLeafData.nextValue.toBigInt(),
            nextIndex: predecessorLeafData.nextIndex.toBigInt()
        };
        await StateDB.userNullifierDB.updateLeaf(revertedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
        logger.info(`after revert predecessor, nullifierTree Root: ${await StateDB.userNullifierDB.getRoot(true)}`);
        // logger.info(`after revert predecessor, nullifierTree Num: ${await StateDB.userNullifierDB.getNumLeaves(true)}`);

        await StateDB.saleContributorsDB.loadTree(PublicKey.fromBase58(sale.tokenAddress), PublicKey.fromBase58(sale.saleAddress));
        const contributionTreeLeafIndx = userTokenSale.contributeActionIndex;
        const witnessOnContributorTree = (await StateDB.saleContributorsDB.getSiblingPath(BigInt(contributionTreeLeafIndx), false))!.path.map(p => p.toString());
        logger.info(`witnessOnContributorTree: ${JSON.stringify(witnessOnContributorTree)}`);

        const rs = {
            saleContributorMembershipWitnessData: {
                leafData: {
                    tokenAddress: userTokenSale.tokenAddress,
                    tokenId: tokenId.toString(),
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

        await StateDB.userNullifierDB.reset();
        await StateDB.saleContributorsDB.reset();

        return { code: 0, data: rs, msg: '' };
    } catch (err) {
        logger.error(err);
        console.error(err);
        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
