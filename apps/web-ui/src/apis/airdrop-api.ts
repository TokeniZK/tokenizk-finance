import $httpInstance from '@/utils/http'
import type { AirdropClaimerDto, AirdropDto, AirdropReq, UserContributionDto } from '@tokenizk/types';
import type { BaseResponse, AirdropUserDto, AirdropClaimersDetailDto } from '@tokenizk/types'

export function getOngoingPreairdropAPI() {
    $httpInstance.post('/airdrop/ongoing-airdrop')
    return $httpInstance({
        url: '/airdrop/ongoing-airdrop'
    })
}

export async function queryAirdropMeta() {
    try {
        const rs = await $httpInstance.get<BaseResponse<{ totalAirdrops: number, totalParticipants: number }>>(`/airdrop/meta`).then(r => {
            return r.data.data
        });

        return rs!;
    } catch (error) {
        console.error(error);

        return { totalAirdrops: 0, totalParticipants: 0 }
    }

}

export async function queryAirdrop(airdropReq: AirdropReq) {
    try {
        const rs = await $httpInstance.post<BaseResponse<AirdropDto[]>>(`/airdrop/list`, airdropReq).then(r => {
            return r.data.data
        });

        return rs ?? [];
    } catch (error) {
        console.error(error);
    }

}

/**
 * 
 * @param airdropAddress 
 * @param tokenAddress 
 * @returns 
 */
export async function queryAirdropDetails(airdropAddress: string, tokenAddress: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<AirdropClaimersDetailDto>>('/airdrop/details', {
            airdropAddress, tokenAddress
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
 * @param airdropType 
 * @param userAddress 
 * @returns 
 */
export async function queryAirdropUserContribution(airdropType: number, userAddress: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<AirdropUserDto[]>>('/airdrop/user', {
            airdropType, userAddress
        }).then(r => {
            return r?.data?.data ?? []
        });
        return rs;
    } catch (error) {
        console.error(error);
    }
    return [];
}

// submit airdrop
export async function submitAirdrop(airdropDto: AirdropDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<number>>('/airdrop/create', airdropDto).then(r => {
            return r.data.data
        });
        return true;
    } catch (error) {
        console.error(error);
    }
    return false;
}

// submit airdrop
export async function submitAirdropClaim(airdropClaimerDto: AirdropClaimerDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<number>>('/airdrop/claim', airdropClaimerDto).then(r => {
            return r.data.data
        });
        return true;
    } catch (error) {
        console.error(error);

    }
    return false;
}

