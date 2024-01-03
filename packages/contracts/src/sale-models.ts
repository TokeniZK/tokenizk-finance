import {
    UInt64,
    PublicKey,
    Field,
    Struct,
    UInt32,
    Poseidon,
    Provable,
} from 'o1js';
import {
    CONTRIBUTORS_TREE_HEIGHT,
    USER_NULLIFIER_TREE_HEIGHT,
    WHITELIST_TREE_HEIGHT,
} from './constants';
import { SiblingPath } from '@tokenizk/merkle-tree';

import {
    SALE_ACTION_BATCH_SIZE,
} from './constants';


export class VestingParams extends Struct({
    cliffTime: UInt32,
    cliffAmountRate: UInt64,
    vestingPeriod: UInt32, // 0 is not allowed, default value is 1
    vestingIncrement: UInt64
}) {
    hash() {
        return Poseidon.hash(this.toFields());
    }

    toFields() {
        return [
            ...this.cliffTime.toFields(),
            ...this.cliffAmountRate.toFields(),
            ...this.vestingPeriod.toFields(),
            ...this.vestingIncrement.toFields()
        ];
    }
}

export class SaleParams extends Struct({
    tokenAddress: PublicKey,

    totalSaleSupply: UInt64,

    /**
     * Presale rate: the amount of tokens returned for each Mina during contribution
     */
    saleRate: UInt64,

    /**
     * Whitelist Tree Root: default empty merkle tree root
     */
    whitelistTreeRoot: Field,

    /**
     * Soft cap in 'MINA', must be >= 25% of Hard cap
     */
    softCap: UInt64,

    /**
     * Hard cap in 'MINA'
     */
    hardCap: UInt64,

    /**
     * Minimum buy in 'MINA'
     */
    minimumBuy: UInt64,

    /**
     * Maximum buy in 'MINA'
     */
    maximumBuy: UInt64,

    /** 
     * Start time stamp
     */
    startTime: UInt64,

    /**
     * End time stamp
     */
    endTime: UInt64,

    cliffTime: UInt32,
    cliffAmountRate: UInt64,
    vestingPeriod: UInt32, // 0 is not allowed, default value is 1
    vestingIncrement: UInt64
}) {
    hash() {
        return Poseidon.hash([
            ...this.tokenAddress.toFields(),
            ...this.totalSaleSupply.toFields(),
            ...this.saleRate.toFields(),
            this.whitelistTreeRoot,
            ...this.softCap.toFields(),
            ...this.hardCap.toFields(),
            ...this.minimumBuy.toFields(),
            ...this.maximumBuy.toFields(),
            ...this.startTime.toFields(),
            ...this.endTime.toFields(),
            ...this.cliffTime.toFields(),
            ...this.cliffAmountRate.toFields(),
            ...this.vestingPeriod.toFields(),
            ...this.vestingIncrement.toFields(),
        ]
        );
    }

    vestingParamsHash() {
        return this.vestingParams().hash();
    }

    vestingParams() {
        return new VestingParams({
            cliffTime: this.cliffTime,
            cliffAmountRate: this.cliffAmountRate,
            vestingPeriod: this.vestingPeriod,
            vestingIncrement: this.vestingIncrement
        });
    }

}

export class SaleContribution extends Struct({
    tokenAddress: PublicKey,
    tokenId: Field,
    saleContractAddress: PublicKey,
    contributorAddress: PublicKey,
    minaAmount: UInt64
}) {
    static dummy() {
        return new SaleContribution({
            tokenAddress: PublicKey.empty(),
            tokenId: Field(0),
            saleContractAddress: PublicKey.empty(),
            contributorAddress: PublicKey.empty(),
            minaAmount: UInt64.zero,
        });
    }

    hash() {
        return Poseidon.hash(this.toFields());
    }

    toFields() {
        return [
            ...this.tokenAddress.toFields(),
            this.tokenId,
            ...this.saleContractAddress.toFields(),
            ...this.contributorAddress.toFields(),
            ...this.minaAmount.toFields()
        ];
    }
}


export class SaleRollupState extends Struct({
    membershipTreeRoot: Field,
    currentIndex: Field,
    currentActionsHash: Field,
    currentMinaAmount: UInt64,
}) {
    assertEquals(other: SaleRollupState) {
        Provable.assertEqual(SaleRollupState, this, other);
    }

    toPretty(): any {
        return {
            membershipTreeRoot: this.membershipTreeRoot.toString(),
            currentIndex: this.currentIndex.toString(),
            currentActionsHash: this.currentActionsHash.toString(),
            currentMinaAmount: this.currentMinaAmount.toString()
        };
    }
}

export class SaleRollupStateTransition extends Struct({
    source: SaleRollupState,
    target: SaleRollupState,
}) {
    toPretty(): any {
        return {
            source: this.source.toPretty(),
            target: this.target.toPretty(),
        };
    }
}

export class SaleParamsConfigurationEvent extends Struct({
    saleParams: SaleParams,
    tokenId: Field
}) { }

export class ContributionEvent extends Struct({
    tokenAddress: PublicKey,
    tokenId: Field,
    saleContractAddress: PublicKey,
    contributorAddress: PublicKey,
    minaAmount: UInt64,
    tokenAmount: UInt64
}) { }

export class RedeemEvent extends Struct({
    saleContribution: SaleContribution
}) { }



/**
 * Merkle tree witness for the sale whitelist
 */
export class WhitelistMembershipMerkleWitness extends SiblingPath(
    WHITELIST_TREE_HEIGHT
) { }

/**
 * Merkle tree witness for the sale contributors
 */
export class ContributorsMembershipMerkleWitness extends SiblingPath(
    CONTRIBUTORS_TREE_HEIGHT
) { }

/**
 * Merkle tree witness for the user nullifiers
 */
export class UserNullifierMerkleWitness extends SiblingPath(
    USER_NULLIFIER_TREE_HEIGHT
) { }

export class LeafData extends Struct({
    value: Field,
    nextValue: Field,
    nextIndex: Field,
}) {
    static zero(): LeafData {
        return new LeafData({
            value: DUMMY_FIELD,
            nextValue: DUMMY_FIELD,
            nextIndex: DUMMY_FIELD,
        });
    }

    commitment(): Field {
        return Poseidon.hash([this.value, this.nextValue, this.nextIndex]);
    }
}


const DUMMY_FIELD = Field(0);

export class UserLowLeafWitnessData extends Struct({
    leafData: LeafData,
    siblingPath: UserNullifierMerkleWitness,
    index: Field,
}) {
    static zero(zeroWitness: UserNullifierMerkleWitness): UserLowLeafWitnessData {
        return new UserLowLeafWitnessData({
            leafData: LeafData.zero(),
            siblingPath: zeroWitness,
            index: DUMMY_FIELD,
        });
    }

    static fromDTO(dto: {
        leafData: {
            value: string;
            nextValue: string;
            nextIndex: string;
        };
        siblingPath: string[];
        index: string;
    }) {
        const leafData = LeafData.fromJSON(dto.leafData) as LeafData;
        const siblingPath = UserNullifierMerkleWitness.fromJSON({
            path: dto.siblingPath,
        });
        const index = Field(dto.index);

        return new UserLowLeafWitnessData({ leafData, siblingPath, index });
    }

    public checkMembershipAndAssert(root: Field, msg?: string) {
        const leaf = this.leafData.commitment();
        this.siblingPath.calculateRoot(leaf, this.index).assertEquals(root, msg);
    }
}

export class SaleContributorMembershipWitnessData extends Struct({
    leafData: SaleContribution,
    siblingPath: ContributorsMembershipMerkleWitness,
    index: Field,
}) {
    static fromDTO(dto: {
        leafData: {
            tokenAddress: string,
            tokenId: string;
            saleContractAddress: string,
            contributorAddress: string;
            minaAmount: string;
        };
        siblingPath: string[];
        index: string;
    }) {
        const leafData = new SaleContribution({
            tokenAddress: PublicKey.fromBase58(dto.leafData.tokenAddress),
            tokenId: Field.from(dto.leafData.tokenId),
            saleContractAddress: PublicKey.fromBase58(dto.leafData.saleContractAddress),
            contributorAddress: PublicKey.fromBase58(dto.leafData.contributorAddress),
            minaAmount: UInt64.from(dto.leafData.minaAmount)
        });
        const siblingPath = ContributorsMembershipMerkleWitness.fromJSON({
            path: dto.siblingPath,
        });
        const index = Field(dto.index);

        return new SaleContributorMembershipWitnessData({ leafData, siblingPath, index });
    }

    public checkMembershipAndAssert(root: Field, msg?: string) {
        const leaf = this.leafData.hash();
        this.siblingPath.calculateRoot(leaf, this.index).assertEquals(root, msg);
    }
}

export class SaleActionBatch extends Struct({
    actions: Provable.Array(SaleContribution, SALE_ACTION_BATCH_SIZE),
    merkleWitnesses: Provable.Array(
        ContributorsMembershipMerkleWitness,
        SALE_ACTION_BATCH_SIZE
    ),
}) {
    static batchSize = SALE_ACTION_BATCH_SIZE;

    toPretty(): any {
        return {
            actions: this.actions.toString(),
            merkleWitnesses: this.merkleWitnesses
                .map((w) => w.path.toString())
                .toString(),
        };
    }
}
