export interface UserContributionDto {

    id: number


    contributorAddress: string


    saleId: number


    saleAddress: string


    tokenAddress: string


    tokenId: string

    /**
     * contribution TxHash
     */
    contributeTxHash: string


    contributeBlockHeight: number


    contributeCurrencyAmount: string


    contributeActionIndex: number

    /**
     * redeem TxHash
     */
    redeemTxHash: string


    redeemOrClaimBlockHeight: number

    /**
     * claim TxHash
     */
    claimTxHash: string


    claimAmount: string

    /**
     * 0: default
     * 1: synced
     */
    syncNullTreeFlag: number

    /**
     * record the leaf index in user_nullifier_tree
     */
    nullTreeLeafIndex: number


    updatedAt: Date


    createdAt: Date
}
