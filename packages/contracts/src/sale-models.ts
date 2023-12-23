import {
    UInt64,
    PublicKey,
    Field,
    Struct,
    UInt32,
    Poseidon,
    Provable,
} from 'o1js';
import { MembershipMerkleWitness } from '@tokenizk/types';
import {
    SALE_ACTION_BATCH_SIZE,
} from './constants';

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
        return Poseidon.hash([
            ...this.cliffTime.toFields(),
            ...this.cliffAmountRate.toFields(),
            ...this.vestingPeriod.toFields(),
            ...this.vestingIncrement.toFields(),
        ]
        );
    }

}

export class SaleContribution extends Struct({
    saleContractAddress: PublicKey,
    contributorAddress: PublicKey,
    tokenId: Field,
    minaAmount: UInt64
}) {
    static dummy() {
        return new SaleContribution({
            saleContractAddress: PublicKey.empty(),
            contributorAddress: PublicKey.empty(),
            tokenId: Field(0),
            minaAmount: UInt64.zero,
        });
    }

    hash() {
        return Poseidon.hash(this.toFields());
    }

    toFields() {
        return [
            ...this.saleContractAddress.toFields(),
            ...this.contributorAddress.toFields(),
            this.tokenId,
            ...this.minaAmount.toFields()
        ];
    }
}

export class SaleActionBatch extends Struct({
    actions: Provable.Array(SaleContribution, SALE_ACTION_BATCH_SIZE),
    merkleWitnesses: Provable.Array(
        MembershipMerkleWitness,
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
    address: PublicKey,
    tokenId: Field,
    minaAmount: UInt64,
    tokenAmount: UInt64
}) { }
