import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleDto, SaleUserDto, SaleUserDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { In, getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken, Sale, UserTokenSale } from "@tokenizk/entities"

const logger = getLogger('querySaleListByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const querySaleListByUser: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/sale/user",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

export const handler: RequestHandler<{ saleType: number, userAddress: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<SaleUserDto[]>> {
    const { userAddress, saleType } = req.body

    try {
        const connection = getConnection();
        const presaleRepo = connection.getRepository(Sale)

        const userTokenSaleRepo = connection.getRepository(UserTokenSale)
        const userSaleList = await userTokenSaleRepo.find({
            where: {
                userAddress: userAddress
            }
        }) ?? [];

        const presaleUserDtoList: SaleUserDto[] = [];
        const presaleList = await presaleRepo.find({ where: { id: In(userSaleList.map(us => us.saleId)), saleType } });
        const tokenList = await connection.getRepository(BasiceToken).find({
            where: {
                tokenAddress: In(presaleList.map(p => p.tokenAddress))
            }
        });
        presaleList.forEach(p => {
            const token = tokenList.filter(t => t.tokenAddress == p.tokenAddress)[0];
            (p as any as SaleDto).tokenSymbol = token.tokenSymbol
        })

        for (let i = 0; i < userSaleList.length; i++) {
            const ufs = userSaleList[i];

            const presale = presaleList.filter(p => p.id == ufs.saleId)[0];

            const fsDto: SaleUserDto = {
                saleDto: presale as SaleDto,
                userContribute: {
                    txHash: ufs.contributeTxHash,
                    contributeTimestamp: ufs.contributeBlockHeight,
                    contributedCurrencyAmount: ufs.contributeCurrencyAmount
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
    tags: ["Sale"],
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
                        type: SaleUserDtoSchema.type,
                        properties: SaleUserDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
