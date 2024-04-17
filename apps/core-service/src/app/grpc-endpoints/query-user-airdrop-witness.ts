
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId, AirdropStatus, UserRedeemClaimWitnessDto, UserRedeemClaimWitnessDtoSchema } from "@tokenizk/types";
import { getConnection } from "typeorm";
import { PublicKey, Field, UInt64, TokenId } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { LeafData } from "@tokenizk/merkle-tree";
import { Airdrop, UserTokenAirdrop } from "@tokenizk/entities";
import { AirdropClaim } from "@tokenizk/contracts";
import * as StateDB from "@/app/grpc-endpoints/state-util"

const logger = getLogger('queryUserAirdropWitness');

export const queryUserAirdropWitness = async function (dto: { tokenAddr: string, airdropAddr: string, userAddr: string }) {
    const { tokenAddr, airdropAddr, userAddr } = dto;

    logger.info(`a new witness query begin, target{tokenAddr:${tokenAddr}, airdropAddr: ${airdropAddr}, userAddr: ${userAddr}}`);

    try {
        const connection = getConnection();

        // check if airdrop is ended
        const airdropRepo = connection.getRepository(Airdrop);
        const airdrop = await airdropRepo.findOne({
            where: {
                tokenAddress: tokenAddr,
                airdropAddress: airdropAddr,
                status: AirdropStatus.CONFIRMED,
            }
        });
        if (!airdrop) {
            logger.warn(`no Airdrop found, end.`);
            return { code: 1, data: undefined, msg: 'Cannot find the user contribution record!' } as BaseResponse<UserRedeemClaimWitnessDto>;
        }

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

        const tokenAmount = Math.floor(airdrop.totalAirdropSupply / airdrop.whitelistMembers.split(',').length);
        const airdropClaimHash = new AirdropClaim({
            tokenAddress: PublicKey.fromBase58(airdrop.tokenAddress),
            tokenId: TokenId.derive(PublicKey.fromBase58(airdrop.tokenAddress)),
            airdropContractAddress: PublicKey.fromBase58(airdrop.airdropAddress),
            claimerAddress: PublicKey.fromBase58(userAddr),
            tokenAmount: UInt64.from(tokenAmount)
        }).hash();

        const lowLeafWitness = await StateDB.userNullifierDB.findPreviousValueAndMp(Field(airdropClaimHash), true);
        const predecessorLeafData = lowLeafWitness.leafData;
        const predecessorIdx = lowLeafWitness.index;

        logger.info(`predecessor's index: ${predecessorIdx}`);
        logger.info(`predecessor: {value:${predecessorLeafData?.value}, nextValue:${predecessorLeafData?.nextValue}, nextIndex:${predecessorLeafData?.nextIndex}}`);

        logger.info(`before modify predecessor, nullifierTree Root: ${await StateDB.userNullifierDB.getRoot(true)}`);
        // logger.info(`before modify predecessor, nullifierTree Num: ${await StateDB.userNullifierDB.getNumLeaves(true)}`);
        const modifiedPredecessorLeafDataTmp: LeafData = {
            value: predecessorLeafData.value.toBigInt(),
            nextValue: airdropClaimHash.toBigInt(),
            nextIndex: targetIndx
        };
        await StateDB.userNullifierDB.updateLeaf(modifiedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
        logger.info(`after modify predecessor, nullifierTree Root: ${await StateDB.userNullifierDB.getRoot(true)}`);

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

        const rs = {
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

        return { code: 0, data: rs, msg: '' };
    } catch (err) {
        logger.error(err);
        console.error(err);
        // throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
