
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, MerkleTreeId, MerkleProofDto, SaleStatus, UserRedeemClaimWitnessDto, UserRedeemClaimWitnessDtoSchema } from "@tokenizk/types";
import { RequestHandler } from '@/lib/types'
import { $axiosCore } from "@/lib/api"
import { getLogger } from "@/lib/logUtils"

const logger = getLogger('query-user-contribution-witness');

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
): Promise<BaseResponse<UserRedeemClaimWitnessDto[]>> {
    try {
        // request sequencer for the result.
        const rs = await $axiosCore.post<BaseResponse<UserRedeemClaimWitnessDto[]>>('/user-contribution-witness', req.body).then(r => {
            return r.data
        })

        return rs;
    } catch (err) {
        console.error(err);
        logger.error(err);
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
