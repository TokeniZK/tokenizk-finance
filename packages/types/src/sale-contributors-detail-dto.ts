import { SaleDto } from "./sale-dto";
import { UserContributionDto } from "./user-contribution-dto";

export interface SaleContributorsDetailDto {
    saleDto: SaleDto
    contributorList:UserContributionDto[]
}
