import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, SaleDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Sale, UserTokenSale } from "@tokenizk/entities"
import { PublicKey, fetchAccount, TokenId } from "o1js";
import { WHITELIST_TREE_ROOT } from "@tokenizk/contracts"

const logger = getLogger('createSale');

export const createSale: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/sale/create",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<SaleDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const saleDto = req.body

    try {
        PublicKey.fromBase58(saleDto.saleAddress);
    } catch (error) {
        logger.error(`saleAddress: ${saleDto.saleAddress} is invalid`);

        throw req.throwError(httpCodes.BAD_REQUEST, "saleAddress is invalid")
    }

    try {
        PublicKey.fromBase58(saleDto.tokenAddress);
    } catch (error) {
        logger.error(`tokenAddress: ${saleDto.tokenAddress} is invalid`);

        throw req.throwError(httpCodes.BAD_REQUEST, "tokenAddress is invalid")
    }

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Sale)


        let sale = await saleRepo.findOne({
            where: {
                saleAddress: saleDto.saleAddress,
                tokenAddress: saleDto.tokenAddress,
            }
        });

        if (sale) {
            sale.txHash = saleDto.txHash;
            sale.updatedAt = new Date();
        } else {

            const tokenAddr = PublicKey.fromBase58(saleDto.tokenAddress);
            const tokenAccount = await fetchAccount({ publicKey: tokenAddr, tokenId: TokenId.derive(tokenAddr) });
            if (!tokenAccount || tokenAccount.error) {
                throw req.throwError(httpCodes.BAD_REQUEST, "token Account is not exiting");
            }

            if (saleDto.totalSaleSupply <= 0 || Number(tokenAccount?.account?.balance.toString()) < saleDto.totalSaleSupply) {
                throw req.throwError(httpCodes.BAD_REQUEST, "totalAirdropSupply is not valid");
            }

            if (saleDto.saleType == 0 || saleDto.saleType == 2) {
                if (saleDto.softCap > saleDto.hardCap) {
                    throw req.throwError(httpCodes.BAD_REQUEST, "softCap should not be greater than hardCap");
                }
            }

            if (saleDto.minimumBuy > saleDto.maximumBuy) {
                throw req.throwError(httpCodes.BAD_REQUEST, "minimumBuy should not be greater than maximumBuy");
            }

            if (saleDto.startTimestamp > saleDto.endTimestamp) {
                throw req.throwError(httpCodes.BAD_REQUEST, "startTimestamp should not be greater than endTimestamp");
            }
            if (saleDto?.whitelistMembers) {
                if (saleDto.whitelistTreeRoot == WHITELIST_TREE_ROOT.toString() || saleDto.whitelistTreeRoot.length == 0) {
                    throw req.throwError(httpCodes.BAD_REQUEST, "whitelistTreeRoot is not aligned with whitelistMembers");
                }
            }
            if (saleDto.cliffAmountRate < 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "cliffAmountRate is not valid");
            }
            if (saleDto.cliffTime <= 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "cliffTime is not valid");
            }
            if (saleDto.vestingPeriod < 1) {
                throw req.throwError(httpCodes.BAD_REQUEST, "vestingPeriod is not valid");
            }
            if (saleDto.vestingIncrement < 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "vestingIncrement is not valid");
            }
            if (!saleDto.saleName) {
                throw req.throwError(httpCodes.BAD_REQUEST, "saleName is not valid");
            }
            if (saleDto.totalSaleSupply <= 0) {// TODO
                throw req.throwError(httpCodes.BAD_REQUEST, "totalSaleSupply is not valid");
            }
            if (saleDto.logoUrl == '') {
                throw req.throwError(httpCodes.BAD_REQUEST, "logoUrl is not valid");
            }

            // transform from SaleDto to Sale
            sale = Sale.fromDto(saleDto);
            sale.contributorsTreeRoot = null as any as string;
            sale.createdAt = new Date();
            sale.updatedAt = new Date();
        }

        sale = await saleRepo.save(sale);

        return {
            code: 0,
            data: sale.id,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'create sale',
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
