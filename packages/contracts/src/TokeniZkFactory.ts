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

export class ConfigLauchpadPlatformParamsEvent extends Struct({
    newLauchpadPlatformParams: LauchpadPlatformParams
}) { }

export class ConfigPlatfromFeeAddressEvent extends Struct({
    platfromFeeAddress: PublicKey
}) { }

export class CreateBasicTokenEvent extends Struct({
    basicTokenAddress: PublicKey,
    fee: UInt64
}) { }

export class CreatePresaleEvent extends Struct({
    basicTokenAddress: PublicKey,
    presaleContractAddress: PublicKey,
    fee: UInt64
}) { }

export class CreateFairSaleEvent extends Struct({
    basicTokenAddress: PublicKey,
    fairsaleContractAddress: PublicKey,
    fee: UInt64
}) { }

export class CreatePrivateSaleEvent extends Struct({
    privateSaleContractAddress: PublicKey,
    fee: UInt64
}) { }

export class CreateRedeemAccount extends Struct({
    redeemAccountAddress: PublicKey,
    nullifierRoot: Field
}) { }


export class TokeniZkFactory extends SmartContract {
    static tokeniZkFactoryAddress: PublicKey;// TODO

    static platfromFeeAddress: PublicKey;// TODO 
    static basicTokenVk: VerificationKey;// TODO 

    static presaleContractVk: VerificationKey;// TODO 
    static presaleMinaFundHolderVk: VerificationKey;// TODO 

    static fairSaleContractVk: VerificationKey;// TODO 

    static privateSaleContractVk: VerificationKey;// TODO 
    static privateSaleMinaFundHolderVk: VerificationKey;// TODO 

    static redeemAccountVk: VerificationKey;// TODO

    deployZkApp(lauchpadPlatformParams: LauchpadPlatformParams) {
        super.deploy();

        this.platfromFeeAddress.set(TokeniZkFactory.platfromFeeAddress);
        this.lauchpadPlatformParamsHash.set(lauchpadPlatformParams.hash());

        this.account.permissions.set({
            ...Permissions.default(),
            // editState: Permissions.signature(),// !!
            // access: Permissions.proofOrSignature(),
        });
    }
    events = {
        configPlatfromFeeAddress: ConfigPlatfromFeeAddressEvent,
        configLauchpadPlatformParams: ConfigLauchpadPlatformParamsEvent,
        createBasicToken: CreateBasicTokenEvent,
        createPresale: CreatePresaleEvent,
        createFairsale: CreateFairSaleEvent,
        createPrivateSale: CreatePrivateSaleEvent,
        createRedeemAccount: CreateRedeemAccount
    }
}
