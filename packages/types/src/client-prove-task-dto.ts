export interface ClientProveTaskDto {

  id: number

  /**
   * 0: airdrop
   * 1: presale
   */

  type: number


  params: string


  result: string


  userAddress: string


  targetAddress: string

  tokenAddress: string

  txHash: string

  /**
   * 0: pending
   * 1: done
   */
  status: number


  updatedAt: number

  createdAt: number
}