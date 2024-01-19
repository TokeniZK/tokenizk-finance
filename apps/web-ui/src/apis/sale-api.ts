import $httpInstance from '@/utils/http'
import type { AirdropDto, SaleReq, UserContributionDto } from '@tokenizk/types';
import type { BaseResponse, SaleContributorsDetailDto, SaleDto, SaleUserDto } from '@tokenizk/types'

export function getOngoingPresaleAPI() {
    $httpInstance.post('/presale/ongoing-presale')
    return $httpInstance({
        url: '/presale/ongoing-presale'
    })
}

export async function querySale(saleReq: SaleReq) {
    try {
        const rs = await $httpInstance.post<BaseResponse<SaleDto[]>>(`/sale/list`, saleReq).then(r => {
            return r.data.data
        });

        return rs ?? [];
    } catch (error) {
        console.error(error);
    }

}

/**
 * 
 * @param saleAddress 
 * @param tokenAddress 
 * @returns 
 */
export async function querySaleDetails(saleAddress: string, tokenAddress: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<SaleContributorsDetailDto>>('/sale/details', {
            saleAddress, tokenAddress
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
export async function submitSale(saleDto: SaleDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<number>>('/sale/create', saleDto).then(r => {
            return r.data.data
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

