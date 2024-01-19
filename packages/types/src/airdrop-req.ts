
export interface AirdropReq {
    airdropType?: number;
    airdropName?: string;
    airdropAddress?: string;
    tokenAddress?: string;
    
    limit: number,
    
    take: number
}
