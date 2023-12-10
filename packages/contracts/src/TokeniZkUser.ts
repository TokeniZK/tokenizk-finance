
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
