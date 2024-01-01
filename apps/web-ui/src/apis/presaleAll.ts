import $httpInstance from '@/utils/http'
import type { BaseResponse, SaleDto } from '@tokenizk/types'

export function getOngoingPresaleAPI() {
  $httpInstance.post('/presale/ongoing-presale')
  return $httpInstance({
    url: '/presale/ongoing-presale'
  })
}

export function getAllLaunchpadsAPI() {
  return $httpInstance({
    url: '/presale/all-launchpads'
  })
}

export function getMyContributionsAPI() {
  return $httpInstance({
    url: '/presale/my-contribution'
  })
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

