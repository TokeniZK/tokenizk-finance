import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, TokenDto, TokenDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenAirdrop, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('queryTokenByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryTokenByUser: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/user/token",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<{ address: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<TokenDto[]>> {
    const address = req.body.address;
    try {
        const connection = getConnection();
        const userTokenSaleRepo = connection.getRepository(UserTokenSale);
        const userTokenSaleList = (await userTokenSaleRepo.find({ where: { contributorAddress: address } })) ?? [];
        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop);
        const userTokenAirdropList = (await userTokenAirdropRepo.find({ where: { userAddress: address } })) ?? [];

        const tokenRepo = connection.getRepository(BasiceToken);

        const tokenList = await tokenRepo.find({
            where: {
                address: In(userTokenSaleList.map(u => u.tokenAddress).concat(userTokenAirdropList.map(u => u.tokenAddress)))
            }
        });

        return {
            code: 0,
            data: tokenList as any as TokenDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query basic token list',
    tags: ["Token"],
    body: {
        type: 'object',
        properties: {
            address: {
                type: 'string'
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
                    type: 'array',
                    items: {
                        type: TokenDtoSchema.type,
                        properties: TokenDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
