export interface UserRedeemClaimWitnessDto {
    saleContributorMembershipWitnessData: {
        leafData: {
            tokenAddress: string,
            tokenId: string,
            saleContractAddress: string,
            contributorAddress: string,
            minaAmount: number
        },
        siblingPath: string[],
        index: string
    },
    lowLeafWitness: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string
        },
        siblingPath: string[],
        index: string
    },
    oldNullWitness: string[],
}
