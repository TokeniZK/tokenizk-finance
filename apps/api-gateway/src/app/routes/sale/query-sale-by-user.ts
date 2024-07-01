import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, SaleDto, SaleUserDto, SaleUserDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { In, IsNull, Not, getConnection } from "typeorm"
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
const handler: RequestHandler<{ saleType: number, userAddress: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<SaleUserDto[]>> {
    const { userAddress, saleType } = req.body

    try {
        const connection = getConnection();
        const saleRepo = connection.getRepository(Sale)

        const userTokenSaleRepo = connection.getRepository(UserTokenSale)
        const userSaleList = await userTokenSaleRepo.find({
            where: {
                contributorAddress: userAddress,
                contributeTxHash: Not(IsNull())
            }
        }) ?? [];

        const presaleUserDtoList: SaleUserDto[] = [];
        if (userSaleList.length > 0) {
            const saleList = await saleRepo.find({ where: { id: In(userSaleList.map(us => us.saleId)), saleType } });
            if (saleList.length > 0) {
                const tokenList = await connection.getRepository(BasiceToken).find({
                    where: {
                        address: In(saleList.map(p => p.tokenAddress))
                    }
                });
                
                for (let i = 0; i < saleList.length; i++) {
                    const sale = saleList[i];
                    const token = tokenList.filter(t => t.address == sale.tokenAddress)[0];
                    (sale as any as SaleDto).tokenSymbol = token.symbol;
                    (sale as any as SaleDto).teamName = token.name;

                    sale.totalContributedMina = (await userTokenSaleRepo.find({
                        where: {
                            saleId: sale.id,
                            contributeTxHash: Not(IsNull())
                            // status: 1  // TODO !!! when fetchEvent is ok, then need it!!!
                        }
                    }) ?? []).reduce<number>((p, c) => {
                        return p + Number(c.contributeCurrencyAmount??0)
                    }, 0);
                }

                for (let i = 0; i < userSaleList.length; i++) {
                    const ufs = userSaleList[i];

                    const sale = saleList.filter(p => p.id == ufs.saleId)[0];

                    const fsDto: SaleUserDto = {
                        saleDto: sale as any as SaleDto,
                        userContribute: {
                            txHash: ufs.contributeTxHash,
                            contributeBlockHeight: ufs.contributeBlockHeight,
                            contributedCurrencyAmount: ufs.contributeCurrencyAmount
                        }
                    }
                    presaleUserDtoList.push(fsDto);
                }
            }
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
        type: 'object',
        properties: {
            saleType: {
                type: 'number'
            },
            userAddress: {
                type: 'string'
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
