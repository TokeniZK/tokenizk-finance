import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDtoSchema, AirdropDto } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenAirdrop, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('queryAirdropMeta');

export const queryAirdropMeta: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/airdrop/meta",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}


const handler: RequestHandler<null, null> = async function (
    req,
    res
): Promise<BaseResponse<{ totalAirdrops: number, totalParticipants: number }>> {

    try {
        const connection = getConnection();

        const airdropRepo = connection.getRepository(Airdrop)
        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)

        const totalAirdrops = await airdropRepo.count({ where: { status: 1 } });
        const totalParticipants = await userTokenAirdropRepo.count();

        return {
            code: 0,
            data: { totalAirdrops, totalParticipants },
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query airdrop meta',
    tags: ["Airdrop"],
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'object',
                    properties: {
                        totalAirdrops: {
                            type: 'number',
                        },
                        totalParticipants: {
                            type: 'number',
                        }
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
