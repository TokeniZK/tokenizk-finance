import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, SaleDto, UserContributionDto, SaleContributorsDetailDto, SaleContributorsDetailDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenSale, } from "@tokenizk/entities"

const logger = getLogger('querySaleDetails');

export const querySaleDetails = async function (saleReq: SaleReq): Promise<BaseResponse<SaleContributorsDetailDto>> {
    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Sale)

        const queryBuilder = saleRepo.createQueryBuilder('ps');

        if (saleReq?.saleAddress) {
            queryBuilder.andWhere(`ps.saleAddress = '${saleReq.saleAddress}'`);
        }

        if (saleReq?.tokenAddress) {
            queryBuilder.andWhere(`ps.tokenAddress = '${saleReq.tokenAddress}'`);
        }

        const sale = ((await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [])[0];

        if (sale.totalSaleSupply != 0) {// exclude private sale
            const token = (await connection.getRepository(BasiceToken).findOne({
                where: {
                    address: sale.tokenAddress
                }
            }))!;
            (sale as any as SaleDto).tokenSymbol = token.symbol;
            (sale as any as SaleDto).teamName = token.name;

        } else { // for private sale
            (sale as any as SaleDto).tokenSymbol = 'MINA'
        }

        const userTokenSaleRepo = connection.getRepository(UserTokenSale)
        const userTokenSaleList = await userTokenSaleRepo.find({
            where: {
                saleId: sale.id
            }
        });

        return {
            code: 0,
            data: {
                saleDto: (sale as any as SaleDto),
                contributorList: userTokenSaleList as UserContributionDto[]

            } as SaleContributorsDetailDto,
            msg: ''
        };
    } catch (err) {
        logger.error(err);

        throw new Error("Internal server error");
    }
}

