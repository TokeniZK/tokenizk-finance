import {
    State,
    state,
    UInt64,
    SmartContract,
    PublicKey,
    Permissions,
    Field,
    Reducer,
    method,
    Struct,
    Poseidon,
    VerificationKey,
    AccountUpdate,
    Experimental,
    Bool,
    Provable,
} from 'o1js';
import { PrivateSaleParams } from './privatesale/TokeniZkPrivateSale';
import { INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { RedeemAccount } from './user';


