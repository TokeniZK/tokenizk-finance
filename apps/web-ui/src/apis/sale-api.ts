import $httpInstance from '@/utils/http'
import type { UserContributionDto } from '@tokenizk/types';
import type { BaseResponse, SaleContributorsDetailDto, SaleDto, SaleUserDto } from '@tokenizk/types'

export function getOngoingPresaleAPI() {
    $httpInstance.post('/presale/ongoing-presale')
    return $httpInstance({
        url: '/presale/ongoing-presale'
    })
}

/**
 * 
 * @param saleAddress 
 * @param userAddress 
 * @returns 
 */
export async function querySaleDetails(saleAddress: string, userAddress: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleContributorsDetailDto>>('/sale/details', {
            saleAddress, userAddress
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
 * @param saleType 
 * @param userAddress 
 * @returns 
 */
export async function querySaleUserContribution(saleType: number, userAddress: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleUserDto[]>>('/sale/user', {
            saleType, userAddress
        }).then(r => {
            return r?.data?.data ?? []
        });
        return rs;
    } catch (error) {
        console.error(error);
    }
    return [];
}

// submit sale
export async function submitSale(tokenDto: SaleDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleDto[]>>('/sale/create', tokenDto).then(r => {
            return r.data
        });
        return true;
    } catch (error) {
        console.error(error);

    }
    return false;
}


// submit sale
export async function submitContribution(userContributionDto: UserContributionDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleDto[]>>('/sale/contribute', userContributionDto).then(r => {
            return r.data
        });
        return true;
    } catch (error) {
        console.error(error);

    }
    return false;
}

