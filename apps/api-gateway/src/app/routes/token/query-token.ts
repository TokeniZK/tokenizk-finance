import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, TokenDto, TokenDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('querySaleList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryTokenList: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/token/list",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

export const handler: RequestHandler<null, { address: string }> = async function (
    req,
    res
): Promise<BaseResponse<TokenDto[]>> {
    const address = req.params.address;
    try {
        const connection = getConnection();
        const tokenRepo = connection.getRepository(BasiceToken);

        const tokenList: BasiceToken[] = [];
        if (address) {
            tokenList.push(... await tokenRepo.find({ where: { address } }));
        } else {
            tokenList.push(... await tokenRepo.find());
        }

        return {
            code: 0,
            data: tokenList as TokenDto[],
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
