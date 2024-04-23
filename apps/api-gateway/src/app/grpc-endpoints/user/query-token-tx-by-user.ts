import { BaseResponse, UserTokenTransferDto } from '@tokenizk/types'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { UserTokenTransfer} from "@tokenizk/entities"

const logger = getLogger('queryTokenTxByUser');

// query all, filter by status==on, order by createTime, limit 18
// by tokenName
// by userAddress 
export const queryTokenTxByUser = async function (dto: { userAddress: string, tokenAddress: string }): Promise<BaseResponse<UserTokenTransferDto[]>> {
    const {userAddress, tokenAddress} = dto;
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

        // throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}
