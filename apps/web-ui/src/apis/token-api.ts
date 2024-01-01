import { $httpInstance } from "@/utils"
import type { BaseResponse, TokenDto } from "@tokenizk/types";

// submit token
export async function submitToken(tokenDto: TokenDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>('/token/create', tokenDto).then(r => {
            return r.data
        });
        return true;
    } catch (error) {
        console.error(error);

    }
    return false;
}


// query token
export async function queryToken(address?: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.get<BaseResponse<TokenDto[]>>(`/token/list?address=${address}`).then(r => {
            return r.data
        });

        return rs;
    } catch (error) {
        console.error(error);
    }
}
