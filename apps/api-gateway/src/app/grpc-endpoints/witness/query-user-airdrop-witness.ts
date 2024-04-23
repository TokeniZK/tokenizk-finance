
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, MerkleTreeId, MerkleProofDto, SaleStatus, UserRedeemClaimWitnessDto, UserRedeemClaimWitnessDtoSchema } from "@tokenizk/types";
import { RequestHandler } from '@/lib/types'
import { $axiosCore } from "@/lib/api"
import { getLogger } from "@/lib/logUtils"
import { coreClient } from ".";

const logger = getLogger('queryUserAirdropWitness');

export const queryUserAirdropWitness = async function (dto: { tokenAddr: string, airdropAddr: string, userAddr: string }): Promise<BaseResponse<UserRedeemClaimWitnessDto>> {
    try {
        // request core-service for the result.
        const rs = await coreClient.queryUserAirdropWitness(dto).then(r => {
            return r.data
        });

        return rs;
    } catch (err) {
        console.error(err);
        logger.error(err);
        // throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
