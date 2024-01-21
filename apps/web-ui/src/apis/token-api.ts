import { $httpInstance } from "@/utils"
import type { BaseResponse, TokenDto,UserTokenTransferDto } from "@tokenizk/types";

// submit token
export async function submitToken(tokenDto: TokenDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>('/token/create', tokenDto).then(r => {
            return r.data
        });
        if (rs.code == 0) {
            return true;
        }
    } catch (error) {
        console.error(error);

    }
    return false;
}

// query token
export async function queryToken(address?: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>(`/token/list`, address ? [address] : []).then(r => {
            return r.data.data
        });

        /*
        const rs = [{
            symbol: 'XMina',
            id: 1,
            txHash: 'ex4353fdsafdsafd',
            type: 0,
            status: 1,
            address: '',
            name: 'XMina Token',
            zkappUri: '',
            totalSupply: 210000000000000,
            totalAmountInCirculation: 1000000000,
            updatedAt: 17553321432430,
            createdAt: 17553321332430,
        } as TokenDto];
     */
        return rs ?? [];
    } catch (error) {
        console.error(error);
    }
    return [];
}
export async function submitTokenTransfer(userTokenTransferDto: UserTokenTransferDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>('/token/transfer', userTokenTransferDto).then(r => {
            return r.data
        });
        if (rs.code == 0) {
            return true;
        }
    } catch (error) {
        console.error(error);

    }
    return false;
}
