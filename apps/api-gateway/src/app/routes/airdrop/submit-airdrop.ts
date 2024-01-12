import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleReq, SaleReqSchema, AirdropDtoSchema, AirdropDto } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"
import { TokeniZkBasicToken } from "@tokenizk/contracts"

const logger = getLogger('createSale');

export const createAirdrop: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/airdrop/create",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<AirdropDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const airdropDto = req.body

    try {
        const connection = getConnection();
        const airdropRepo = connection.getRepository(Airdrop)
        const basicTokenRepo = connection.getRepository(BasiceToken)

        console.log(`airdropDto: ${JSON.stringify(airdropDto)}`);

        let airdrop = await airdropRepo.findOne({
            tokenAddress: airdropDto.tokenAddress,
            airdropAddress: airdropDto.airdropAddress
        });
        if (airdrop) {
            airdrop.txHash = airdropDto.txHash;
            airdrop = await airdropRepo.save(airdrop);
        } else {
            // transform from airdropDto to Sale
            airdrop = Airdrop.fromDto(airdropDto);
            airdrop.createdAt = new Date();
            airdrop.updatedAt = new Date();
            airdrop = await airdropRepo.save(airdrop);

            const token = await basicTokenRepo.findOne({
                where: {
                    address: airdropDto.tokenAddress
                }
            });
            token!.totalAmountInCirculation += airdropDto.totalAirdropSupply;

            await basicTokenRepo.save(token!);
        }

        return {
            code: 0,
            data: airdrop.id,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'create Airdrop',
    tags: ["Airdrop"],
    body: {
        type: AirdropDtoSchema.type,
        properties: AirdropDtoSchema.properties
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
