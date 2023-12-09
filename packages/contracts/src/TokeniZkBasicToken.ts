import {
    State,
    state,
    UInt64,
    Bool,
    SmartContract,
    Mina,
    PrivateKey,
    AccountUpdate,
    method,
    PublicKey,
    Permissions,
    VerificationKey,
    Field,
    Experimental,
    Int64,
    TokenId,
    Struct,
    UInt32,
    Poseidon,
    Reducer,
} from 'o1js';
import { LauchpadPlatformParams, TokeniZkFactory } from './TokeniZkFactory';
import { STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { PresaleParams } from './presale/TokeniZkPresale';
import { FairSaleParams } from './fairsale/TokeniZkFairSale';

const tokenSymbol = 'XINA';

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
