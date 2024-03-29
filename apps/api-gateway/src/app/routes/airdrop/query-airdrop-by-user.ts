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
        PublicKey.fromBase58(userAddress);
    } catch (error) {
        logger.error(`userAddress: ${userAddress} is invalid`);

        throw req.throwError(httpCodes.BAD_REQUEST, "userAddress is invalid")
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
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query airdrop by user',
    tags: ["Airdrop"],
    body: {
        type: 'object',
        properties: {
            userAddress: {
                type: 'string',
                description: 'user address'
            },
            airdropType: {
                type: 'number',
                description: 'airdrop type'
            }
        }
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
