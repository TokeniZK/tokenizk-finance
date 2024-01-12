import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, AirdropDto, AirdropUserDto, AirdropUserDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { In, getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Airdrop, UserTokenAirdrop } from "@tokenizk/entities"

const logger = getLogger('queryAirdropListByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryAirdropListByUser: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/airdrop/user",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}
const handler: RequestHandler<{ airdropType: number, userAddress: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<AirdropUserDto[]>> {
    const { userAddress, airdropType } = req.body

    try {
        const connection = getConnection();
        const airdropRepo = connection.getRepository(Airdrop)

        const userTokenAirdropRepo = connection.getRepository(UserTokenAirdrop)
        const userAirdropList = await userTokenAirdropRepo.find({
            where: {
                userAddress: userAddress
            }
        }) ?? [];

        const presaleUserDtoList: AirdropUserDto[] = [];
        const airdropList = await airdropRepo.find({ where: { id: In(userAirdropList.map(us => us.airdropId)), airdropType } });
        const tokenList = await connection.getRepository(BasiceToken).find({
            where: {
                tokenAddress: In(airdropList.map(p => p.tokenAddress))
            }
        });
        airdropList.forEach(p => {
            const token = tokenList.filter(t => t.address == p.tokenAddress)[0];
            (p as any as AirdropDto).tokenSymbol = token.symbol
        })

        for (let i = 0; i < userAirdropList.length; i++) {
            const ufs = userAirdropList[i];

            const airdrop = airdropList.filter(p => p.id == ufs.airdropId)[0];

            const fsDto: AirdropUserDto = {
                saleDto: airdrop as any as AirdropDto,
                userClaim: {
                    txHash: ufs.claimTxHash,
                    claimBlockHeight: ufs.claimBlockHeight,
                    claimAmount: ufs.claimAmount
                }
            }
            presaleUserDtoList.push(fsDto);
        }

        return {
            code: 0,
            data: presaleUserDtoList,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query presale by user',
    tags: ["Airdrop"],
    body: {
        type: 'string'
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'array',
                    items: {
                        type: AirdropUserDtoSchema.type,
                        properties: AirdropUserDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
