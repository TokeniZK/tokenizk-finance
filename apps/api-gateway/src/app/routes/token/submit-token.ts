import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, TokenDto, TokenDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('createSale');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const createSale: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/token/create",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}


const handler: RequestHandler<TokenDto, null> = async function (
    req,
    res
): Promise<BaseResponse<string>> {
    const dto = req.body

    try {
        const connection = getConnection();
        const tokenRepo = connection.getRepository(BasiceToken)

        // transform from TokenDto to Sale
        const token = new BasiceToken();
        token.status = 0;
        token.type = dto.type;
        token.address = dto.address;
        token.name = dto.name;
        token.symbol = dto.symbol;
        token.zkappUri = dto.zkappUri;
        token.totalAmountInCirculation = 0;// init 0
        token.totalSupply = dto.totalSupply.toString();
        token.zkappUri = dto.zkappUri;

        await tokenRepo.save(token);

        return {
            code: 0,
            data: '',
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'create token',
    tags: ["Token"],
    body: {
        type: TokenDtoSchema.type,
        properties: TokenDtoSchema.properties
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'string'
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
