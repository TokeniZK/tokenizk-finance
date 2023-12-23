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


    /**
     * the address for receiving lauchpad fee
     */
    @state(PublicKey)
    public platfromFeeAddress = State<PublicKey>();

    /**
     * the Hash of lauchpad Platform Params
     */
    @state(Field)
    public lauchpadPlatformParamsHash = State<Field>();

    @method
    public getPlatfromFeeAddress() {
        return this.platfromFeeAddress.getAndRequireEquals();
    }

    /**
     * only by signature
     * @param address 
     */
    @method
    public setPlatfromFeeAddress(address: PublicKey) {
        // const currentAddr = this.platfromFeeAddress.getAndRequireEquals();// TODO no need this??

        this.platfromFeeAddress.set(address);

        this.emitEvent('configPlatfromFeeAddress', new ConfigPlatfromFeeAddressEvent({
            platfromFeeAddress: address
        }));
    }

    @method
    public getLauchpadPlatformParamsHash() {
        return this.lauchpadPlatformParamsHash.getAndRequireEquals();
    }

        /**
     * only by signature
     * @param newParams 
     */
    @method
    public configLauchpadPlatformParams(newParams: LauchpadPlatformParams) {

        newParams.basicTokenCreationFee.assertGreaterThan(UInt64.from(0));
        newParams.presaleCreationFee.assertGreaterThan(UInt64.from(0));
        newParams.presaleServiceFeeRate.assertGreaterThan(UInt64.from(0));
        newParams.fairSaleCreationFee.assertGreaterThan(UInt64.from(0));
        newParams.fairSaleServiceFeeRate.assertGreaterThan(UInt64.from(0));
        newParams.privateSaleCreationFee.assertGreaterThan(UInt64.from(0));
        newParams.privateSaleServiceFeeRate.assertGreaterThan(UInt64.from(0));

        // this.lauchpadPlatformParamsHash.getAndRequireEquals();
        this.lauchpadPlatformParamsHash.set(newParams.hash());

        this.emitEvent('configLauchpadPlatformParams', new ConfigLauchpadPlatformParamsEvent({
            newLauchpadPlatformParams: newParams
        }));
    }

    
    @method
    public createBasicToken(newParams: LauchpadPlatformParams, tokenAddr: PublicKey, basicTokenVk: VerificationKey, totalSupply: Field) {
        const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();

        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        const newParamsHash = newParams.hash();
        lauchpadPlatformParamsHash.assertEquals(newParamsHash, 'newParamsHash is not equaled to existing lauchpadPlatformParamsHash');

        newParams.basicTokenVk.assertEquals(basicTokenVk.hash, 'new basicTokenVk.hash is not equaled to existing basicTokenVk.hash');

        let zkapp = AccountUpdate.defaultAccountUpdate(tokenAddr);
        zkapp.account.isNew.requireEquals(Bool(true));
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(basicTokenVk);
        AccountUpdate.setValue(zkapp.body.update.appState[0], totalSupply);//totalSupply
        AccountUpdate.setValue(zkapp.body.update.appState[1], Field(0));//totalAmountInCirculation
        // AccountUpdate.attachToTransaction(zkapp);//!!!

        const feePayer = AccountUpdate.createSigned(this.sender);
        const feeReceiverAU = AccountUpdate.create(platfromFeeAddress);
        feePayer.send({ to: feeReceiverAU, amount: newParams.basicTokenCreationFee });

        this.emitEvent('createBasicToken', new CreateBasicTokenEvent({
            basicTokenAddress: tokenAddr,
            fee: newParams.basicTokenCreationFee
        }));
    }
}
