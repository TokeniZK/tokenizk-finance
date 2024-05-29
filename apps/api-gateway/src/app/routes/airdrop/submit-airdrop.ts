import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropDtoSchema, AirdropDto } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken } from "@tokenizk/entities"
import { PublicKey, fetchAccount, TokenId } from "o1js";
import { WHITELIST_TREE_ROOT } from "@tokenizk/contracts"

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

    if (airdropDto?.airdropAddress) {
        try {
            PublicKey.fromBase58(airdropDto.airdropAddress);
        } catch (error) {
            throw req.throwError(httpCodes.BAD_REQUEST, "airdropAddress is invalid");
        }
    }
    if (airdropDto?.tokenAddress) {
        try {
            PublicKey.fromBase58(airdropDto.tokenAddress);
        } catch (error) {
            throw req.throwError(httpCodes.BAD_REQUEST, "tokenAddress is invalid");
        }
    }

    try {
        const connection = getConnection();
        const airdropRepo = connection.getRepository(Airdrop)

        console.log(`airdropDto: ${JSON.stringify(airdropDto)}`);

        let airdrop = await airdropRepo.findOne({
            tokenAddress: airdropDto.tokenAddress,
            airdropAddress: airdropDto.airdropAddress
        });
        if (airdrop) {
            airdrop.txHash = airdropDto.txHash;
            airdrop = await airdropRepo.save(airdrop);
        } else {
            const tokenAddr = PublicKey.fromBase58(airdropDto.tokenAddress);
            const tokenAccount = await fetchAccount({ publicKey: tokenAddr});
            if (!tokenAccount || tokenAccount.error) {
                throw req.throwError(httpCodes.BAD_REQUEST, "token Account is not exiting");
            }

            /*             
            if (airdropDto.startTimestamp > airdropDto.endTimestamp) {
                throw req.throwError(httpCodes.BAD_REQUEST, "startTimestamp should not be greater than endTimestamp");
            } 
            */
            if (airdropDto?.whitelistMembers) {
                if (airdropDto.whitelistTreeRoot == WHITELIST_TREE_ROOT.toString() || airdropDto.whitelistTreeRoot.length == 0) {
                    throw req.throwError(httpCodes.BAD_REQUEST, "whitelistTreeRoot is not aligned with whitelistMembers");
                }
            }
            if (airdropDto.cliffAmountRate < 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "cliffAmountRate is not valid");
            }
            if (airdropDto.cliffTime <= 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "cliffTime is not valid");
            }
            if (airdropDto.vestingPeriod < 1) {
                throw req.throwError(httpCodes.BAD_REQUEST, "vestingPeriod is not valid");
            }
            if (airdropDto.vestingIncrement < 0) {
                throw req.throwError(httpCodes.BAD_REQUEST, "vestingIncrement is not valid");
            }
            if (!airdropDto.airdropName) {
                throw req.throwError(httpCodes.BAD_REQUEST, "airdropName is not valid");
            }
            if (airdropDto.totalAirdropSupply <= 0 || Number(tokenAccount?.account?.zkapp?.appState[1]) < airdropDto.totalAirdropSupply) {
                throw req.throwError(httpCodes.BAD_REQUEST, "totalAirdropSupply is not valid");
            }

            // transform from airdropDto to Sale
            airdrop = Airdrop.fromDto(airdropDto);

            airdrop.createdAt = new Date();
            airdrop.updatedAt = new Date();
            airdrop = await airdropRepo.save(airdrop);
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
