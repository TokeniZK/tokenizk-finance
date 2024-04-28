import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropClaimerDto, AirdropClaimerDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { UserTokenAirdrop } from "@tokenizk/entities"

const logger = getLogger('claimAirdrop');

export const claimAirdrop = async function (airdropClaimerDto: AirdropClaimerDto): Promise<BaseResponse<number>> {
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
            userTokenAirdrop.status = 0;
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

        throw new Error("Internal server error")
    }
}
