import httpCodes from "@inip/http-codes"
import { BaseResponse, TokenDto, TokenDtoSchema } from '@tokenizk/types'

import { getConnection, In } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { BasiceToken } from "@tokenizk/entities"

const logger = getLogger('queryTokenList');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryTokenList = async function (addressList: string[]): Promise<BaseResponse<TokenDto[]>> {
    try {
        const connection = getConnection();
        const tokenRepo = connection.getRepository(BasiceToken);

        const tokenList: BasiceToken[] = [];
        if (addressList?.length > 0) {
            tokenList.push(... await tokenRepo.find({ where: { address: In(addressList) } }));
        } else {
            tokenList.push(... await tokenRepo.find());
        }

        return {
            code: 0,
            data: tokenList as any as TokenDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        // throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
