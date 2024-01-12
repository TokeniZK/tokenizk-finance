export interface AirdropDto {

    id: number

    /**
     * 0
     */
    type: number

    /**
     * L1TxHash
     */
    txHash: string
    status: number

    tokenName: string
    tokenAddress: string
    tokenSymbol: string

    airdropName: string
    airdropAddress: string

    star: number

    totalAirdropSupply: number

    currency: string
    feeRate: string

    whitelistTreeRoot: string
    /**
     * comma separated list of addresses
     */
    whitelistMembers: string

    startTimestamp: number
    endTimestamp: number

    cliffTime: number
    cliffAmountRate: number
    vestingPeriod: number
    vestingIncrement: number

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
