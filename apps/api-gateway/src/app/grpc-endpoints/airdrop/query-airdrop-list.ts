import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDtoSchema, AirdropDto } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('queryAirdropList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryAirdropList = async function ( airdropReq: AirdropReq ): Promise<BaseResponse<AirdropDto[]>> {
    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Airdrop)

        const queryBuilder = saleRepo.createQueryBuilder('ps').andWhere(`ps.status = 1`);

        if (airdropReq?.airdropType != undefined) {
            queryBuilder.andWhere(`ps.type = '${airdropReq.airdropType}'`);
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

        if (airdropReq?.limit) {
            queryBuilder.limit(airdropReq.limit);
        }

        if (airdropReq?.take) {
            queryBuilder.take(airdropReq.take);
        }

        const airdropList = (await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [];
        if (airdropList.length > 0) {
            const tokenList = await connection.getRepository(BasiceToken).find({
                where: {
                    address: In(airdropList.map(p => p.tokenAddress))
                }
            });
            if (tokenList.length > 0) {
                airdropList.forEach(p => {
                    const token = tokenList.filter(t => t.address == p.tokenAddress)[0];
                    (p as any as AirdropDto).tokenSymbol = token.symbol;
                    (p as any as AirdropDto).teamName = token.name
                })
            }
        }
        return {
            code: 0,
            data: airdropList as any as AirdropDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        // throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
