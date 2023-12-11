
import {
    State,
    state,
    SmartContract,
    AccountUpdate,
    method,
    Field,
    Struct,
    Bool,
    Provable,
} from 'o1js';
import { greaterThanFor254BitField, checkMembershipAndAssert } from '../utils/utils';
import { UserLowLeafWitnessData, UserNullifierMerkleWitness, LeafData } from './merkle_witness';

export const DUMMY_FIELD = Field(0);

export class UserState extends Struct({
    nullifierRoot: Field,
    nullStartIndex: Field,
}) { }


export class RedeemAccount extends SmartContract {
    @state(UserState) userState = State<UserState>();

    @method getUserState(): UserState {
        const userState = this.userState.getAndAssertEquals();
        return userState;
    }

    @method updateState(nullifier: Field,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {

        const userState = this.userState.getAndAssertEquals();

        // for avoid double redeem and nullify current preSaleContribution
        const newUserState = updateNullifierRootAndNullStartIndex(userState.nullifierRoot, userState.nullStartIndex, nullifier, lowLeafWitness, oldNullWitness);
        // update user state
        this.userState.set(new UserState(newUserState));

        // this.self.body.mayUseToken = AccountUpdate.MayUseToken.ParentsOwnToken; // no need this for MINA account
    }
}
