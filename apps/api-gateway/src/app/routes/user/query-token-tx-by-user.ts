import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, UserTokenTransferDto, UserTokenTransferDtoSchema } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { UserTokenTransfer} from "@tokenizk/entities"

const logger = getLogger('queryTokenTxByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryTokenTxByUser: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/user/token/tx",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<{ userAddress: string, tokenAddress: string }, null> = async function (
    req,
    res
): Promise<BaseResponse<UserTokenTransferDto[]>> {
    const {userAddress, tokenAddress} = req.body;
    try {
        const connection = getConnection();

        const userTokenTransferRepo = connection.getRepository(UserTokenTransfer);

        const userTokenTransferList0 = await userTokenTransferRepo.find({status:1, tokenAddress, from: userAddress});
        const userTokenTransferList1 = await userTokenTransferRepo.find({status:1, tokenAddress, to: userAddress});

        return {
            code: 0,
            data: userTokenTransferList0.concat(userTokenTransferList1) as any as UserTokenTransferDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'query Token Tx By User',
    tags: ["Token"],
    body: {
        type: 'object',
        properties: {
            address: {
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
                        type: UserTokenTransferDtoSchema.type,
                        properties: UserTokenTransferDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
