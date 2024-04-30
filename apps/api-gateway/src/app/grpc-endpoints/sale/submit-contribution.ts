import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, UserContributionDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { PublicKey } from "o1js";
import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('contributeSale');

export const contributeSale = async function (userContributionDto: UserContributionDto): Promise<BaseResponse<number>> {
    try {
        PublicKey.fromBase58(userContributionDto.saleAddress);
    } catch (error) {
        logger.error(`saleAddress: ${userContributionDto.saleAddress} is invalid`);

        throw new Error("saleAddress is invalid")
    }

    try {
        PublicKey.fromBase58(userContributionDto.tokenAddress);
    } catch (error) {
        logger.error(`tokenAddress: ${userContributionDto.tokenAddress} is invalid`);

        throw new Error("tokenAddress is invalid")
    }

    try {
        PublicKey.fromBase58(userContributionDto.contributorAddress);
    } catch (error) {
        logger.error(`contributorAddress: ${userContributionDto.contributorAddress} is invalid`);

        throw new Error("contributorAddress is invalid")
    }

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

        throw new Error("Internal server error")
    }
}
