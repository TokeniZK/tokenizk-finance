
export enum SaleStatus {

    UNCONFIRMED,

    CONFIRMED,

    /*
        UPCOMING,

        ONGOING,

        FULL,

        ENDED,

        CANCELLED
    */
}

export enum SaleType {
    PRESALE ,
    FAIRSALE,
    PRIVATESALE
}


/**
 * Defines the  Merkle tree IDs.
 */
export enum MerkleTreeId {
    CONTRIBUTORS_TREE,
    USER_NULLIFIER_TREE
}
