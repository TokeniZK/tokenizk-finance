import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, SaleDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Sale, UserTokenSale } from "@tokenizk/entities"

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
        url: "/sale/create",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}


export const handler: RequestHandler<SaleDto, null> = async function (
    req,
    res
): Promise<BaseResponse<string>> {
    const presaleDto = req.body

    try {
        const connection = getConnection();
        const presaleRepo = connection.getRepository(Sale)

        // transform from SaleDto to Sale
        const presale = new Sale();
        // TODO
        //
        //
        //
 
        await presaleRepo.save(presale);

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
    description: 'create presale',
    tags: ["Sale"],
    body: {
        type: SaleDtoSchema.type,
        properties: SaleDtoSchema.properties
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
