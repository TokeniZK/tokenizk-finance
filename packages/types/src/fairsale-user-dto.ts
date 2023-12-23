import { FairsaleDto } from "./fairsale-dto";

export interface FairsaleUserDto {
    saleDto: FairsaleDto
    userContribute: {
        txHash: string,
        contributeTimestamp: string,
        contributedCurrencyAmount: string
    }
}
