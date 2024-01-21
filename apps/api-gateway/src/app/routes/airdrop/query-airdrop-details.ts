import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDto, AirdropClaimerDto, AirdropClaimersDetailDto, AirdropClaimersDetailDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Airdrop, UserTokenAirdrop, } from "@tokenizk/entities"

const logger = getLogger('queryAirdropDetails');

export const queryAirdropDetails: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/airdrop/details",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<AirdropReq, null> = async function (
    req,
    res
): Promise<BaseResponse<AirdropClaimersDetailDto>> {
    const airdropReq = req.body

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Airdrop)

        const queryBuilder = saleRepo.createQueryBuilder('ps');

        if (airdropReq?.airdropAddress) {
            queryBuilder.andWhere(`ps.airdropAddress = '${airdropReq.airdropAddress}'`);
        }

        if (airdropReq?.tokenAddress) {
            queryBuilder.andWhere(`ps.tokenAddress = '${airdropReq.tokenAddress}'`);
        }

        const airdrop = ((await queryBuilder.orderBy({ createdAt: 'DESC' }).getMany()) ?? [])[0];

        const token = (await connection.getRepository(BasiceToken).findOne({
            where: {
                address: airdrop.tokenAddress
            }
        }))!;
        (airdrop as any as AirdropDto).tokenSymbol = token.symbol;
        (airdrop as any as AirdropDto).teamName = token.name

        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)
        const userTokenAirdropList = await userTokenAirdropRepo.find({
            where: {
                airdropId: airdrop.id
            }
        });

        return {
            code: 0,
            data: {
                airdropDto: (airdrop as any as AirdropDto),
                claimerList: userTokenAirdropList as AirdropClaimerDto[]

            } as AirdropClaimersDetailDto,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query airdrop details',
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
                    type: AirdropClaimersDetailDtoSchema.type,
                    properties: AirdropClaimersDetailDtoSchema.properties
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
