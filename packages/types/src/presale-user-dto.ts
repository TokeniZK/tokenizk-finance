import { PresaleDto } from "./presale-dto";

export interface PresaleUserDto {
    saleDto: PresaleDto
    userContribute: {
        txHash: string,
        contributeTimestamp: string,
        contributedCurrencyAmount: string
    }
}
