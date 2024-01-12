import exp from "constants";

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

export enum AirdropStatus {

    UNCONFIRMED,

    CONFIRMED,

}


export enum ClientProofReqType {

    AIRDROP_CLAIM_TOKEN,

    PRESALE_CONTRIBUTE,
    PRESALE_CLAIM_TOKEN,
    PRESALE_REDEEM_FUND,

    FAIRSALE_CONTRIBUTE,
    FAIRSALE_CLAIM_TOKEN,

    PRIVATESALE_CONTRIBUTE,
}

export enum SaleType {
    PRESALE,
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
