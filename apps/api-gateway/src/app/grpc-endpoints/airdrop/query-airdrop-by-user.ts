import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropDto, AirdropUserDto, AirdropUserDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { In, getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Airdrop, UserTokenAirdrop } from "@tokenizk/entities"
import { PublicKey } from "o1js";

const logger = getLogger('queryAirdropListByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryAirdropListByUser  = async function (dto: { airdropType: number, userAddress: string }): Promise<BaseResponse<AirdropUserDto[]>> {
    const { userAddress, airdropType } = dto

    try {
        PublicKey.fromBase58(userAddress);
    } catch (error) {
        logger.error(`userAddress: ${userAddress} is invalid`);

        throw new Error('userAddress is invalid');
    }

    try {
        const connection = getConnection();
        const airdropRepo = connection.getRepository(Airdrop)

        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)
        const userAirdropList = await userTokenAirdropRepo.find({
            where: {
                userAddress
            }
        }) ?? [];

        const airdropUserDtoList: AirdropUserDto[] = [];

        if (userAirdropList.length > 0) {
            const airdropList = await airdropRepo.find({ where: { id: In(userAirdropList.map(us => us.airdropId)), type: airdropType } });
            const tokenList = await connection.getRepository(BasiceToken).find({
                where: {
                    address: In(airdropList.map(p => p.tokenAddress))
                }
            });
            airdropList.forEach(p => {
                const token = tokenList.filter(t => t.address == p.tokenAddress)[0];
                (p as any as AirdropDto).tokenSymbol = token.symbol;
                (p as any as AirdropDto).teamName = token.name
            })

            for (let i = 0; i < userAirdropList.length; i++) {
                const ual = userAirdropList[i];

                const airdrop = airdropList.filter(p => p.id == ual.airdropId)[0];

                const fsDto: AirdropUserDto = {
                    airdropDto: airdrop as any as AirdropDto,
                    userClaim: {
                        txHash: ual.claimTxHash,
                        claimBlockHeight: ual.claimBlockHeight,
                        claimAmount: ual.claimAmount
                    }
                }
                airdropUserDtoList.push(fsDto);
            }
        }


        return {
            code: 0,
            data: airdropUserDtoList,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        throw err;
    }
}
