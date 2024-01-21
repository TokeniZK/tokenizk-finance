export interface UserTokenTransferDto {

    id: number
  
    status: number
  
    from: string
  
    to: string
  
    amount: string
  
    tokenAddress: string
  
    tokenId: string

    txHash: string
  
    blockHeight: number
  
    updatedAt: number

    createdAt: number
}
