import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { AirdropDto, AirdropDtoSchema, BaseResponse, SaleDto, SaleReq, SaleReqSchema, TokenDto, TokenDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('exportSalesAirdropByToken');

/**
 * 
 * @param instance 
 * @param options 
 * @param done 
 */
export const exportSalesAirdropByToken: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/token/sales-airdrops",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<{tokenAddr: string}, null> = async function (
    req,
    res
): Promise<BaseResponse<{
    token: TokenDto,
    sales: SaleDto[],
    airdrops: AirdropDto[]
}>> {
    const tokenAddr = req.body.tokenAddr;
    try {
        const connection = getConnection();
        const tokenRepo = connection.getRepository(BasiceToken);

        const tokenDto = await tokenRepo.find({
            where: {
                address: tokenAddr
            }
        }) as any as TokenDto;

        const saleRepo = connection.getRepository(Sale)
        const queryBuilder = saleRepo.createQueryBuilder('ps').andWhere(`ps.status = 1`).andWhere(`ps.tokenAddress = ${tokenAddr}`);
        const saleList = (await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];

        const airdropRepo = connection.getRepository(Airdrop)
        const queryBuilder2 = airdropRepo.createQueryBuilder('airdrop').andWhere(`ps.status = 1`).andWhere(`ps.tokenAddress = ${tokenAddr}`);
        const airdropsList = (await queryBuilder2.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];

        return {
            code: 0,
            data: {
                token: tokenDto,
                sales: saleList as any as SaleDto[],
                airdrops: airdropsList as any as AirdropDto[]
            },
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'export sales & airdrops of specified token',
    tags: ["Token"],
    body: {
        type: 'object',
        items: {
            type: 'string'
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
                    token: {
                        type: TokenDtoSchema.type,
                        properties: TokenDtoSchema.properties
                    },
                    sales: {
                        type: 'array',
                        items: {
                            type: SaleReqSchema.type,
                            properties: SaleReqSchema.properties
                        }
                    },
                    airdrops: {
                        type: 'array',
                        items: {
                            type: AirdropDtoSchema.type,
                            properties: AirdropDtoSchema.properties
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
