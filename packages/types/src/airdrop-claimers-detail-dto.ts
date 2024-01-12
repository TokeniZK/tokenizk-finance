import { AirdropDto } from "./airdrop-dto";
import {AirdropClaimerDto  } from "./airdrop-claimer-dto";

export interface AirdropClaimersDetailDto {
    airdropDto: AirdropDto
    claimerList: AirdropClaimerDto[]
}
