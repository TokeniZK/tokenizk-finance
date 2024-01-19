import { $httpInstance } from "@/utils"
import type { BaseResponse, TokenDto } from "@tokenizk/types";

// query token
export async function queryTokenByUser(address?: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<TokenDto[]>>(`/user/token`, { address }).then(r => {
            return (r.data.data ?? []) as TokenDto[]
        });

        return rs;
    } catch (error) {
        console.error(error);
    }
}

// submit airdrop
export async function submitUser(userDto: any) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<number>>('/user/create', userDto).then(r => {
            return r.data.data
        });
        return true;
    } catch (error) {
        console.error(error);
    }
    return false;
}
