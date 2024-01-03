import { SaleDto } from "./sale-dto";

export interface SaleUserDto {
    saleDto: SaleDto
    userContribute: {
        txHash: string,
        contributeBlockHeight: number,
        contributedCurrencyAmount: string
    }
}
