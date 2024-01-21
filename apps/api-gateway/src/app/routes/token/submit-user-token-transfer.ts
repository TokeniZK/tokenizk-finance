import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, UserTokenTransferDto, UserTokenTransferDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, UserTokenTransfer } from "@tokenizk/entities"

const logger = getLogger('createUserTokenTransfer');

export const createUserTokenTransfer: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/token/transfer",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}


const handler: RequestHandler<UserTokenTransferDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const dto = req.body

    try {
        const connection = getConnection();
        const tokenRepo = connection.getRepository(BasiceToken);

        const token1 = await tokenRepo.findOne({ address: dto.tokenAddress });
        if (token1) {
            const userTokenTransferRepo = connection.getRepository(UserTokenTransfer);
            let userTokenTransfer = new UserTokenTransfer();
            userTokenTransfer.status = 0;
            userTokenTransfer.from = dto.from;
            userTokenTransfer.to = dto.to;
            userTokenTransfer.amount = dto.amount;
            userTokenTransfer.tokenId = dto.tokenId;
            userTokenTransfer.tokenAddress = dto.tokenAddress;
            userTokenTransfer.txHash = dto.txHash;
            userTokenTransfer.createdAt = new Date();
            userTokenTransfer.updatedAt = new Date();

            userTokenTransfer = await userTokenTransferRepo.save(userTokenTransfer);

            return {
                code: 0,
                data: userTokenTransfer.id,
                msg: ''
            };
        }

        return {
            code: 1,
            data: 0,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'create User Token Transfer',
    tags: ["Token"],
    body: {
        type: UserTokenTransferDtoSchema.type,
        properties: UserTokenTransferDtoSchema.properties
    },
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
