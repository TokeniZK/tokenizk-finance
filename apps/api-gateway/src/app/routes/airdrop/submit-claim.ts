import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropClaimerDto, AirdropClaimerDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { UserTokenAirdrop } from "@tokenizk/entities"

const logger = getLogger('claimAirdrop');

export const claimAirdrop: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/airdrop/claim",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<AirdropClaimerDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const airdropClaimerDto = req.body

    try {
        const connection = getConnection();
        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)

        let userTokenAirdrop = await userTokenAirdropRepo.findOne({
            where: {
                airdropAddress: airdropClaimerDto.airdropAddress,
                tokenAddress: airdropClaimerDto.tokenAddress,
                userAddress: airdropClaimerDto.userAddress
            }
        });

        if (userTokenAirdrop) {
            if (airdropClaimerDto.claimTxHash) {
                userTokenAirdrop.claimAmount = airdropClaimerDto.claimAmount;
                userTokenAirdrop.claimTxHash = airdropClaimerDto.claimTxHash;
            }
        } else {
            userTokenAirdrop = new UserTokenAirdrop();
            Object.assign(userTokenAirdrop, airdropClaimerDto);
        }
        userTokenAirdrop = await userTokenAirdropRepo.save(userTokenAirdrop);

        return {
            code: 0,
            data: userTokenAirdrop.id,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'claim airdrop',
    tags: ["Airdrop"],
    body: {
        type: AirdropClaimerDtoSchema.type,
        properties: AirdropClaimerDtoSchema.properties
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
