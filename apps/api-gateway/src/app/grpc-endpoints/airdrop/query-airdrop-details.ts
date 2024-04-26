import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropReq, AirdropReqSchema, AirdropDto, AirdropClaimerDto, AirdropClaimersDetailDto, AirdropClaimersDetailDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Airdrop, UserTokenAirdrop, } from "@tokenizk/entities"
import { PublicKey } from "o1js";

const logger = getLogger('queryAirdropDetails');

export const queryAirdropDetails = async function (airdropReq: AirdropReq): Promise<BaseResponse<AirdropClaimersDetailDto>> {
    if (airdropReq?.airdropAddress) {
        try {
            PublicKey.fromBase58(airdropReq.airdropAddress);
        } catch (error) {
            throw new Error("airdropAddress is invalid");
        }
    }
    if (airdropReq?.tokenAddress) {
        try {
            PublicKey.fromBase58(airdropReq.tokenAddress);
        } catch (error) {
            throw new Error("tokenAddress is invalid");
        }
    }

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

        throw new Error("Internal server error")
    }
}
