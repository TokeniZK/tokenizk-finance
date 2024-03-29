
export interface SaleReq {
    status: number,

    saleType:number,

    tokenAddress: string,

    saleAddress: string,

    saleName: string,

    contributorAddress: string,

    tokenSymbol: string,

    limit: number,
    
    take: number,

    queryBriefInfo: boolean
}
