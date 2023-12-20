import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, PresaleDto, PresaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Presale, UserTokenPresale } from "@tokenizk/entities"

const logger = getLogger('queryPresaleList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryPresaleList: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/presale/list",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

export const handler: RequestHandler<SaleReq, null> = async function (
    req,
    res
): Promise<BaseResponse<PresaleDto[]>> {
    const saleReq = req.body

}

const schema = {
    description: 'query presale list',
    tags: ["Presale"],
    body: {
        type: SaleReqSchema.type,
        properties: SaleReqSchema.properties
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: PresaleDtoSchema.type,
                    properties: PresaleDtoSchema.properties
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
