import { $httpInstance } from "@/utils";
import type { BaseResponse, SaleDto } from "@tokenizk/types";

export async function getSearchProjectAPI(saleType: number, keyWord?: string) {
    try {
        const saleReq = {
            saleType,
            saleName: keyWord
        }
        const rs = await $httpInstance.post<BaseResponse<SaleDto[]>>(`/presale/list`, saleReq).then(r => {
            return r.data.data
        });

        return rs;
    } catch (error) {
        console.error(error);
    }

}
