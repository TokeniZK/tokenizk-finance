import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, SaleDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('querySaleList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const querySaleList: FastifyPlugin = async function (
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
): Promise<BaseResponse<SaleDto[]>> {
    const saleReq = req.body

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Sale)

        const queryBuilder = saleRepo.createQueryBuilder('ps');

        if (saleReq?.saleType) {
            queryBuilder.andWhere(`ps.saleType = '%${saleReq.saleType}%'`);
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

        const presaleList = (await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];

        const tokenList = await connection.getRepository(BasiceToken).find({
            where: {
                tokenAddress: In(presaleList.map(p => p.tokenAddress))
            }
        });

        presaleList.forEach(p => {
            const token = tokenList.filter(t => t.tokenAddress == p.tokenAddress)[0];
            (p as any as SaleDto).tokenSymbol = token.tokenSymbol
        })

        return {
            code: 0,
            data: presaleList as SaleDto[],
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
    tags: ["Sale"],
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
                    type: 'array',
                    items: {
                        type: SaleDtoSchema.type,
                        properties: SaleDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
