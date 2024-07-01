import {
    State,
    state,
    SmartContract,
    method,
    Field,
    Struct,
    Bool,
    Provable,
} from 'o1js';
import { greaterThanFor254BitField, checkMembershipAndAssert } from './utils';
import { UserLowLeafWitnessData, UserNullifierMerkleWitness, LeafData } from './sale-models';

const DUMMY_FIELD = Field(0);

export class UserState extends Struct({
    nullifierRoot: Field,
    nullStartIndex: Field,
}) { }

export class RedeemAccount extends SmartContract {
    @state(UserState) userState = State<UserState>();

    async deployZkApp(userState: UserState) {
        await super.deploy();
        this.userState.set(userState);
    }

    @method async updateState(nullifier: Field,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {

        const userState = this.userState.getAndRequireEquals();

        // for avoid double redeem and nullify current preSaleContribution
        const newUserState = updateNullifierRootAndNullStartIndex(userState.nullifierRoot, userState.nullStartIndex, nullifier, lowLeafWitness, oldNullWitness);
        // update user state
        this.userState.set(new UserState(newUserState));

        // this.self.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken; // no need this for MINA account
    }
}


export function updateNullifierRootAndNullStartIndex(
    nullifierRoot: Field,
    nullStartIndex: Field,
    nullifier: Field,
    lowLeafWitness: UserLowLeafWitnessData,
    oldNullWitness: UserNullifierMerkleWitness
): { nullifierRoot: Field; nullStartIndex: Field } {
    nullifier.assertNotEquals(DUMMY_FIELD, 'nullifier is dummy field');

    let currentNullRoot = nullifierRoot;
    // check nullifier not exist in nullifier tree
    lowLeafWitness.checkMembershipAndAssert(
        currentNullRoot,
        'lowLeafWitness is not valid'
    );

    greaterThanFor254BitField(
        nullifier,
        lowLeafWitness.leafData.value
    ).assertTrue(
        'Nullifier should not exist in null tree (Nullifier should be greater than lowLeafWitness.leafData.value)'
    );
    const lowLeafNextValue = lowLeafWitness.leafData.nextValue;
    Provable.log('lowLeafNextValue', lowLeafNextValue);

    Provable.if(
        lowLeafNextValue.equals(DUMMY_FIELD),
        Bool,
        Bool(true),
        greaterThanFor254BitField(lowLeafNextValue, nullifier)
    ).assertTrue(
        'Nullifier should not exist in null tree (nullifier >= lowLeafWitness.leafData.nextValue)'
    );

    const nullifierLeafData = new LeafData({
        value: nullifier,
        nextValue: lowLeafWitness.leafData.nextValue,
        nextIndex: lowLeafWitness.leafData.nextIndex,
    });
    // update lowLeafData in nullifier tree
    const newLowLeafData = new LeafData({
        value: lowLeafWitness.leafData.value,
        nextValue: nullifierLeafData.value,
        nextIndex: nullStartIndex,
    });
    currentNullRoot = lowLeafWitness.siblingPath.calculateRoot(
        newLowLeafData.commitment(),
        lowLeafWitness.index
    );
    Provable.log('after update lowLeafData, currentNullRoot: ', currentNullRoot);

    // check index and witness of nullifier
    checkMembershipAndAssert(
        DUMMY_FIELD,
        nullStartIndex,
        oldNullWitness,
        currentNullRoot,
        'oldNullWitness illegal'
    );

    // use index, witness and new nullifier to update null root
    currentNullRoot = oldNullWitness.calculateRoot(
        nullifierLeafData.commitment(),
        nullStartIndex
    );
    Provable.log('after update nullifier, currentNullRoot: ', currentNullRoot);

    nullStartIndex = nullStartIndex.add(1);
    Provable.log('after update nullStartIndex, nullStartIndex: ', nullStartIndex);

    return { nullifierRoot: currentNullRoot, nullStartIndex };
}
