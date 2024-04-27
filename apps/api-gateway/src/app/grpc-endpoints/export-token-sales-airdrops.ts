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
export const exportSalesAirdropByToken = async function (info: { tokenAddr: string }): Promise<BaseResponse<{
    token: TokenDto,
    sales: SaleDto[],
    airdrops: AirdropDto[]
}>> {
    const tokenAddr = info.tokenAddr;
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
