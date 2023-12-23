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


const SUPPLY = UInt64.from(10n ** 18n);

export class TokeniZkBasicToken extends SmartContract {
    /**
     * Total supply of tokens
     */
    @state(UInt64) totalSupply = State<UInt64>();

    /**
     * Total amount in circulation
     */
    @state(UInt64) totalAmountInCirculation = State<UInt64>();


    init() {
        super.init();

        this.totalSupply.set(SUPPLY);// TODO should be as a constant inside circuit, rather than a state !!!

        this.totalAmountInCirculation.set(new UInt64(0));

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
    }
    /**
     * 
     * @param newParams 
     * @param presaleAddress 
     * @param presaleVk 
     */
    @method
    public createPresale(newParams: LauchpadPlatformParams,
        presaleAddress: PublicKey, presaleVk: VerificationKey, presaleParams: PresaleParams
                              privateSaleMinaFundHolderVk: VerificationKey)   ){
presaleAddress: PublicKey, presaleVk: VerificationKey, presaleParams: PresaleParams,
        privateSaleMinaFundHolderVk: VerificationKey) {

        let totalAmountInCirculation = this.totalAmountInCirculation.getAndRequireEquals();


        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        tokeniZkFactory.createPresale(lauchpadPlatformParams, this.address, presaleAddress, presaleVk, privateSaleMinaFundHolderVk);

        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            presaleAddress,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));

        /* as a sample here
        const presaleParams = new PresaleParams({
            tokeniZkBasicTokenAddress: this.address,
            totalPresaleSupply: UInt64.from(0),
            presaleRate: UInt64.from(0),
            whitelistTreeRoot: Field(0),
            softCap: UInt64.from(0),
            hardCap: UInt64.from(0),
            minimumBuy: UInt64.from(0),
            maximumBuy: UInt64.from(0),
            startTime: UInt64.from(0),
            endTime: UInt64.from(0),
            cliffTime: UInt32.from(0),
            cliffAmountRate: UInt64.from(0),
            vestingPeriod: UInt32.from(1), // 0 is not allowed, default value is 1
            vestingIncrement: UInt64.from(0)
        });
        */

        presaleParams.tokeniZkBasicTokenAddress.assertEquals(this.address);
        presaleParams.whitelistTreeRoot.equals(0).or(presaleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        presaleParams.softCap.mul(4).assertGreaterThanOrEqual(presaleParams.hardCap);
        presaleParams.minimumBuy.assertLessThanOrEqual(presaleParams.maximumBuy);
        presaleParams.startTime.assertLessThan(presaleParams.endTime.sub(10 * 5 * 60 * 1000)); // at least last for 10 blocks
        presaleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));

            AccountUpdate.setValue(zkapp.body.update.appState[0], presaleParams.hash());
        AccountUpdate.setValue(zkapp.body.update.appState[1], presaleParams.vestingParamsHash());
        AccountUpdate.setValue(zkapp.body.update.appState[2], Field(0));// totalDistributed
        AccountUpdate.setValue(zkapp.body.update.appState[3], STANDARD_TREE_INIT_ROOT_16);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[4], Field(0));//totalContributedMina
        AccountUpdate.setValue(zkapp.body.update.appState[5], Reducer.initialActionState);//fromActionState

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(presaleVk);
        zkapp.requireSignature();
        this.approve(zkapp);

        this.mint(presaleAddress, presaleParams.totalPresaleSupply);
    }
    
}

