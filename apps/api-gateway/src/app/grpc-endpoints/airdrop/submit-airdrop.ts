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

export const createAirdrop = async function (
    airdropDto: AirdropDto,
    res
): Promise<BaseResponse<number>> {

    if (airdropDto?.airdropAddress) {
        try {
            PublicKey.fromBase58(airdropDto.airdropAddress);
        } catch (error) {
            throw new Error("airdropAddress is invalid");
        }
    }
    if (airdropDto?.tokenAddress) {
        try {
            PublicKey.fromBase58(airdropDto.tokenAddress);
        } catch (error) {
            throw new Error("tokenAddress is invalid");
        }
    }

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
            const tokenAddr = PublicKey.fromBase58(airdropDto.tokenAddress);
            const tokenAccount = await fetchAccount({ publicKey: tokenAddr, tokenId: TokenId.derive(tokenAddr) });
            if (!tokenAccount || tokenAccount.error) {
                throw new Error("token Account is not exiting");
            }

            if (airdropDto.startTimestamp > airdropDto.endTimestamp) {
                throw new Error("startTimestamp should not be greater than endTimestamp");
            }
            if (airdropDto?.whitelistMembers) {
                if (airdropDto.whitelistTreeRoot == WHITELIST_TREE_ROOT.toString() || airdropDto.whitelistTreeRoot.length == 0) {
                    throw new Error("whitelistTreeRoot is not aligned with whitelistMembers");
                }
            }
            if (airdropDto.cliffAmountRate < 0) {
                throw new Error("cliffAmountRate is not valid");
            }
            if (airdropDto.cliffTime <= 0) {
                throw new Error("cliffTime is not valid");
            }
            if (airdropDto.vestingPeriod < 1) {
                throw new Error("vestingPeriod is not valid");
            }
            if (airdropDto.vestingIncrement < 0) {
                throw new Error("vestingIncrement is not valid");
            }
            if (!airdropDto.airdropName) {
                throw new Error("airdropName is not valid");
            }
            if (airdropDto.totalAirdropSupply <= 0 || Number(tokenAccount?.account?.balance.toString()) < airdropDto.totalAirdropSupply) {
                throw new Error("totalAirdropSupply is not valid");
            }

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

        throw new Error("Internal server error")
    }
}
