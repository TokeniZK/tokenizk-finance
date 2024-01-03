import $httpInstance from '@/utils/http'
import type { BaseResponse, SaleUserDto } from '@tokenizk/types'

/**
 * 
 * @param saleId 
 * @param userAddress 
 * @returns 
 */
export async function queryContributorWitnessByUser(tokenAddr: string, saleAddr: string, userAddr: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleUserDto[]>>('/sale/contributor-witness', {
            tokenAddr, saleAddr, userAddr
        }).then(r => {
            return r?.data?.data ?? []
        });
        return rs;
    } catch (error) {
        console.error(error);
    }
    return [];
}
