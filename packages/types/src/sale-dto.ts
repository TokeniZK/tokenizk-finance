export interface SaleDto {

    id: number

    /**
     * 1: presale
     * 2: fairsale
     * 3: privatesale
     */
    saleType: number

    /**
     * L1TxHash
     */
    txHash: string
    status: number    

    tokenName: string
    tokenAddress: string
    tokenSymbol: string

    saleName: string
    saleAddress: string

    star: number

    // private no
    totalSaleSupply: number
    currency: string
    feeRate: string
    // fair/private no
    saleRate: number
    whitelistTreeRoot: string
    /**
     * comma separated list of addresses
     */
    whitelistMembers: string

    // fair no
    softCap: number
    // fair no
    hardCap: number
    minimumBuy: number
    maximumBuy: number
    startTimestamp: number
    endTimestamp: number
    cliffTime: number
    cliffAmountRate: number
    vestingPeriod: number
    vestingIncrement: number

    /**
     * 0: not yet, 1: handle
     * 
     */
    contributorsFetchFlag: number


    contributorsTreeRoot: string

    /**
     * 0: not yet, 1: handle
     * 
     */
    contributorsMaintainFlag: number
    
    totalContributedMina: number

    teamName: string

    logoUrl: string


    website: string


    facebook: string


    github: string


    twitter: string


    telegram: string


    discord: string


    reddit: string


    description: string


    updatedAt: number


    createdAt: number

}
