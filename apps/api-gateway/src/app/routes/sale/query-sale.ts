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
        url: "/sale/list",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}
const handler: RequestHandler<SaleReq, null> = async function (
    req,
    res
): Promise<BaseResponse<SaleDto[]>> {
    const saleReq = req.body

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Sale)

        const queryBuilder = saleRepo.createQueryBuilder('ps').andWhere(`ps.status = 1`);

        if (saleReq?.saleType != undefined) {
            queryBuilder.andWhere(`ps.saleType = '${saleReq.saleType}'`);
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

        if (saleReq?.limit) {
            queryBuilder.limit(saleReq.limit);
        }

        if (saleReq?.take) {
            queryBuilder.take(saleReq.take);
        }

        const saleList = (await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];

        if (saleList.length > 0) {
            const tokenList = await connection.getRepository(BasiceToken).find({
                where: {
                    address: In(saleList.map(p => p.tokenAddress))
                }
            });

            if (tokenList.length > 0) {// for non-private sale case
                saleList.forEach(p => {
                    const token = tokenList.filter(t => t.address == p.tokenAddress)[0];
                    (p as any as SaleDto).tokenSymbol = token.symbol
                })
            }

            if (saleReq?.queryBriefInfo) {
                const userTokenSaleRepo = connection.getRepository(UserTokenSale)

                for (let i = 0; i < saleList.length; i++) {
                    const s = saleList[i];
                    //if (s.endTimestamp > currentBLockHeight) {
                    s.totalContributedMina = (await userTokenSaleRepo.find({
                        where: {
                            saleId: s.id,
                            // status: 1  // TODO !!! when fetchEvent is ok, then need it!!!
                        }
                    }) ?? []).reduce<number>((p, c)=>{
                        return p + Number(c.contributeCurrencyAmount)
                    }, 0);
                    //}
                }
            }
        }

        return {
            code: 0,
            data: saleList as any as SaleDto[],
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
