import { $httpInstance } from "@/utils"
import type { BaseResponse, TokenDto, UserTokenTransferDto } from "@tokenizk/types";

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

export async function queryTokenTransferRecord(userAddr: string, tokenAddr: string) {
    try {
        /*
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>(`/token/record`, {owner: userAddr, tokenAddr}).then(r => {
            return r.data.data
        });
        return rs ?? [];
        */
        return [
            {
                date: '2024/05/15 16:31:53',
                receiver: 'B62qmqL2tgB8r1ZWxey1NTNaUenDQDuMNbrAMKqcepY3Zc711drXzuN',
                amount: '+200'
            },
            {
                date: '2024/05/15 12:18:21',
                receiver: 'B62qmqL2tgB8r1ZWxeyY3Zc711drXzuN1NTNaUenDQDuMNbrAMKqcep',
                amount: '-600'
            },
            {
                date: '2024/05/15 03:11:45',
                receiver: 'B62qmqL2tgB8r1ZWxeyuMNbrAMKqcepY3Zc711drXzuN1NTNaUenDQD',
                amount: '-3000'
            },
            {
                date: '2024/05/14 12:55:25',
                receiver: 'B62qmqL2tgKqcepY3Zc711drXzuNB8r1ZWxey1NTNaUenDQDuMNbrAM',
                amount: '+700'
            },
            {
                date: '2024/05/14 09:42:33',
                receiver: 'B62qmqL2brAMKqcepY3Zc711drXzuNtgB8r1ZWxey1NTNaUenDQDuMN',
                amount: '-1800'
            },
            {
                date: '2024/05/14 07:39:15',
                receiver: 'B62qmqL2tqcepY3Zc711drXzuNgB8r1ZWxey1NTNaUenDQDuMNbrAMK',
                amount: '-100'
            },
            {
                date: '2024/05/14 02:51:50',
                receiver: 'B62qmqL2tg1NTNaUenDQDuMNbrAMKqcepY3Zc711drXzuNB8r1ZWxey',
                amount: '+5000'
            },
        ];
    } catch (error) {
        console.error(error);
    }
    return [];
}
