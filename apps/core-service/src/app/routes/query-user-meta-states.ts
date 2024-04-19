import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, MerkleTreeId } from "@tokenizk/types";
import { getConnection, In, IsNull, MoreThanOrEqual } from "typeorm";
import { PublicKey, Field, UInt64 } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { User, UserTokenAirdrop, UserTokenSale } from "@tokenizk/entities";
import { } from "typeorm";
import { AirdropClaim, SaleContribution } from "@tokenizk/contracts";

import * as StateDB from "@/app/grpc-endpoints/state-util"

const logger = getLogger('queryUserMetaStates');

export const queryUserMetaStates = async function (dto: { userAddress: string }) {
    const userAddress = dto.userAddress;
    try {
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

        return {
            code: 0, data: {
                root: await StateDB.userNullifierDB.getRoot(false).toString(),
                depth: await StateDB.userNullifierDB.getDepth(),
                leaves: Number(await StateDB.userNullifierDB.getNumLeaves(false))
            }, msg: ''
        };

    } catch (err) {
        logger.error(`process record[${userAddress}, error!]`);
        logger.error(err);

    } finally {
        await StateDB.userNullifierDB.reset();

        logger.info(`process record[${userAddress}, done.]`);
    }

    return {
        code: 1,
        data: undefined,
        msg: ''
    };
}
