export interface AirdropClaimerDto {

    id: number

    status: number

    userAddress: string

    airdropId: number


    airdropAddress: string


    tokenAddress: string


    tokenId: string


    /**
     * claim TxHash
     */
    claimTxHash: string


    claimAmount: string

    claimBlockHeight

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
