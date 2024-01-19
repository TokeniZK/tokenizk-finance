import { AirdropDto } from "./airdrop-dto";

export interface AirdropUserDto {
    airdropDto: AirdropDto
    userClaim: {
        txHash: string,
        claimBlockHeight: number,
        claimAmount: string
    }
}
