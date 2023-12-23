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


export class LauchpadPlatformParams extends Struct({
    basicTokenVk: Field,
    basicTokenCreationFee: UInt64,

    presaleContractVk: Field,
    presaleCreationFee: UInt64,
    presaleServiceFeeRate: UInt64,
    presaleMinaFundHolderVk: Field,

    fairSaleContractVk: Field,
    fairSaleCreationFee: UInt64,
    fairSaleServiceFeeRate: UInt64,

    privateSaleContractVk: Field,
    privateSaleCreationFee: UInt64,
    privateSaleServiceFeeRate: UInt64,
    privateSaleMinaFundHolderVk: Field,

    redeemAccountVk: Field
}) {

    hash() {
        return Poseidon.hash([
            this.basicTokenVk,
            ...this.basicTokenCreationFee.toFields(),

            this.presaleContractVk,
            ...this.presaleCreationFee.toFields(),
            ...this.presaleServiceFeeRate.toFields(),

            this.fairSaleContractVk,
            ... this.fairSaleCreationFee.toFields(),
            ... this.fairSaleServiceFeeRate.toFields(),

            this.presaleContractVk,
            ... this.privateSaleCreationFee.toFields(),
            ...this.privateSaleServiceFeeRate.toFields(),

            this.redeemAccountVk
        ]);
    }

}

