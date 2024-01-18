import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, UserContributionDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('contributeSale');

export const contributeSale: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/sale/contribute",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<UserContributionDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const userContributionDto = req.body

    try {
        const connection = getConnection();
        const userTokenSaleRepo = connection.getRepository(UserTokenSale)

        let userTokenSale = await userTokenSaleRepo.findOne({
            where: {
                saleId: userContributionDto.saleId,
                saleAddress: userContributionDto.saleAddress,
                tokenAddress: userContributionDto.tokenAddress,
                contributorAddress: userContributionDto.contributorAddress
            }
        });

        if (userTokenSale) {
            if (userContributionDto.contributeTxHash) {
                userTokenSale.contributeTxHash = userContributionDto.contributeTxHash;
            } else if (userContributionDto.claimTxHash) {
                userTokenSale.claimAmount = userContributionDto.claimAmount;
                userTokenSale.claimTxHash = userContributionDto.claimTxHash;
            } else if (userContributionDto.redeemTxHash) {
                userTokenSale.redeemTxHash = userContributionDto.redeemTxHash;
            }
            userTokenSale.updatedAt = new Date();
        } else {
            // transform from SaleDto to Sale
            userTokenSale = new UserTokenSale();
            userTokenSale.createdAt = new Date();
            Object.assign(userTokenSale, userContributionDto);

            userTokenSale.syncNullTreeFlag = 0;
        }
        userTokenSale = await userTokenSaleRepo.save(userTokenSale);

        return {
            code: 0,
            data: userTokenSale.id,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'contributeSale',
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
                    type: 'number'
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
