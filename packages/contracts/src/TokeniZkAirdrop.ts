import {
    State,
    state,
    UInt64,
    SmartContract,
    method,
    Permissions,
    Field,
    Poseidon,
    TokenId,
    Provable,
    TransactionVersion,
} from 'o1js';
import { AirdropClaim, AirdropParams, WhitelistMembershipMerkleWitness, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './sale-models';
import { RedeemAccount } from './TokeniZkUser';
import { WHITELIST_TREE_ROOT } from './constants';