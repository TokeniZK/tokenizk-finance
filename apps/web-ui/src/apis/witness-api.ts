import $httpInstance from '@/utils/http'
import type { BaseResponse, UserRedeemClaimWitnessDto } from '@tokenizk/types'

/**
 * 
 * @param saleId 
 * @param userAddress 
 * @returns 
 */
export async function queryContributorWitnessByUser(tokenAddr: string, saleAddr: string, userAddr: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<UserRedeemClaimWitnessDto>>('/user-contribution-witness', {
            tokenAddr, saleAddr, userAddr
        }).then(r => {
            return r?.data?.data
        });
        return rs;
    } catch (error) {
        console.error(error);
    }
}


/**
 * 
 * @param saleId 
 * @param userAddress 
 * @returns 
 */
export async function queryAirdropClaimerWitnessByUser(tokenAddr: string, airdropAddr: string, userAddr: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<UserRedeemClaimWitnessDto>>('/user-airdrop-witness', {
            tokenAddr, airdropAddr, userAddr
        }).then(r => {
            return r?.data.data
        });
        return rs;
    } catch (error) {
        console.error(error);
    }
}
