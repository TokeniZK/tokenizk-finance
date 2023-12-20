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

    const saleReq = req.body

    try {
        const connection = getConnection();
        const presaleRepo = connection.getRepository(Presale)

        const queryBuilder = presaleRepo.createQueryBuilder('ps');

        if (saleReq?.contributorAddress) {
            //
            const presaleRepo = connection.getRepository(UserTokenPresale)
            const userPresaleList = await presaleRepo.find({
                where: {
                    userAddress: saleReq.contributorAddress
                }
            })??[]

            if (userPresaleList.length > 0) {
                queryBuilder.andWhereInIds(userPresaleList.map(p => p.saleId));
            }
        }

        if (saleReq?.saleName) {
            queryBuilder.andWhere(`ps.saleName like '%${saleReq.saleName}%'`);
        }

        if (saleReq?.saleAddress) {
            queryBuilder.andWhere(`ps.saleAddress = '${saleReq.saleAddress}'`);
        }

        if (saleReq?.tokenAddress) {
            queryBuilder.andWhere(`ps.tokenAddress = '${saleReq.tokenAddress}'`);
        }

        const presaleList = (await queryBuilder.orderBy({createdAt: 'DESC'}).getMany()) ?? [];

        return {
            code: 0,
            data: presaleList as PresaleDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
    
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
