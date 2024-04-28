import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDtoSchema, AirdropDto } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { Airdrop, BasiceToken, Sale, UserTokenAirdrop, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('queryAirdropMeta');

export const queryAirdropMeta = async function (): Promise<BaseResponse<{ totalAirdrops: number, totalParticipants: number }>> {

    try {
        const connection = getConnection();

        const airdropRepo = connection.getRepository(Airdrop)
        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)

        const totalAirdrops = await airdropRepo.count({ where: { status: 1 } });
        const totalParticipants = await userTokenAirdropRepo.count();

        return {
            code: 0,
            data: { totalAirdrops, totalParticipants },
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        throw new Error("Internal server error")
    }
}
