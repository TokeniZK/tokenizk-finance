import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, SaleDto, SaleDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import {  PublicKey} from "o1js";
import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Sale, UserTokenSale } from "@tokenizk/entities"

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
