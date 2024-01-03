import {
    CONTRIBUTORS_TREE_HEIGHT,
    USER_NULLIFIER_TREE_HEIGHT,
    WHITELIST_TREE_HEIGHT,
} from './constants';
import { SiblingPath } from '@tokenizk/merkle-tree';
import { Field, Poseidon, PublicKey, Struct, UInt64 } from 'o1js';
import { SaleContribution } from './sale-models';

const DUMMY_FIELD = Field(0);

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
