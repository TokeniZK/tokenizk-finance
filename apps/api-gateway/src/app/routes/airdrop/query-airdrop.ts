import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDtoSchema, AirdropDto} from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('querySaleList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryAirdropList: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/airdrop/list",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}


const handler: RequestHandler<AirdropReq, null> = async function (
    req,
    res
): Promise<BaseResponse<AirdropDto[]>> {
    const airdropReq = req.body

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Airdrop)

        const queryBuilder = saleRepo.createQueryBuilder('ps');

        if (airdropReq?.airdropType) {
            queryBuilder.andWhere(`ps.type = '%${airdropReq.airdropType}%'`);
        }

        if (airdropReq?.airdropName) {
            queryBuilder.andWhere(`ps.airdropName like '%${airdropReq.airdropName}%'`);
        }

        if (airdropReq?.airdropAddress) {
            queryBuilder.andWhere(`ps.airdropAddress = '${airdropReq.airdropAddress}'`);
        }

        if (airdropReq?.tokenAddress) {
            queryBuilder.andWhere(`ps.tokenAddress = '${airdropReq.tokenAddress}'`);
        }

        const airdropList = (await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];

        const tokenList = await connection.getRepository(BasiceToken).find({
            where: {
                address: In(airdropList.map(p => p.tokenAddress))
            }
        });

        airdropList.forEach(p => {
            const token = tokenList.filter(t => t.address == p.tokenAddress)[0];
            (p as any as AirdropDto).tokenSymbol = token.symbol
        })

        return {
            code: 0,
            data: airdropList as any as AirdropDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query airdrop list',
    tags: ["Airdrop"],
    body: {
        type: AirdropReqSchema.type,
        properties: AirdropReqSchema.properties
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
                        type: AirdropDtoSchema.type,
                        properties: AirdropDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
