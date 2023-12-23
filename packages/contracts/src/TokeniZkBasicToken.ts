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
    DeployArgs,
    Provable,
} from 'o1js';
import { LauchpadPlatformParams, TokeniZkFactory } from './TokeniZkFactory';
import { STANDARD_TREE_INIT_ROOT_12, STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { SaleParams } from './sale-models';

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

    deployZkApp(totalSupply: UInt64) {
        super.deploy();

        this.totalSupply.set(totalSupply);// TODO should be as a constant inside circuit, rather than a state !!!

        this.totalAmountInCirculation.set(UInt64.from(0));

        // this.account.tokenSymbol.set('');
        // this.account.zkappUri.set('');

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });

    }

    /**
     * TODO 尝试令FairSaleContract自定义部署，然后在此approve其accountUpdate.
     * @param accountUpdate 'fairSaleContract.self' during deployment within the tx
     */
    /*
    @method
    public approveDeployFairSale(newParams: LauchpadPlatformParams, accountUpdate: AccountUpdate, verificationKey: VerificationKey) {
        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        const platfromFeeAddress = tokeniZkFactory.getPlatfromFeeAddress();
        const lauchpadPlatformParamsHash = tokeniZkFactory.getLauchpadPlatformParamsHash();

        newParams.hash().assertEquals(lauchpadPlatformParamsHash);

        newParams.fairSaleContractVk.equals(verificationKey.hash);// !!
        accountUpdate.account.verificationKey.set(verificationKey);

        accountUpdate.account.provedState.assertEquals(Bool(false));// TODO check it
        let balanceChange = Int64.fromObject(accountUpdate.body.balanceChange);
        balanceChange.assertEquals(Int64.from(0));

        this.approve(accountUpdate, AccountUpdate.Layout.AnyChildren);

        // tranfer creation fee 
        this.send({ to: platfromFeeAddress, amount: newParams.fairSaleCreationFee });
    }
    */

    /**
     * TODO 尝试令PreSaleContract自定义部署，然后在此approve其accountUpdate.
     * @param accountUpdate 'preSaleContract.self' during deployment within the tx
     */
    /*
    @method
    public approveDeployPresale(newParams: LauchpadPlatformParams, accountUpdate: AccountUpdate, verificationKey: VerificationKey) {
        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        const platfromFeeAddress = tokeniZkFactory.getPlatfromFeeAddress();
        const lauchpadPlatformParamsHash = tokeniZkFactory.getLauchpadPlatformParamsHash();

        newParams.hash().assertEquals(lauchpadPlatformParamsHash);

        newParams.presaleContractVk.equals(verificationKey.hash);
        accountUpdate.account.verificationKey.set(verificationKey);

        accountUpdate.account.provedState.assertEquals(Bool(false));// TODO check it
        let balanceChange = Int64.fromObject(accountUpdate.body.balanceChange);
        balanceChange.assertEquals(Int64.from(0));

        this.approve(accountUpdate, AccountUpdate.Layout.AnyChildren);

        // tranfer creation fee 
        this.send({ to: platfromFeeAddress, amount: newParams.presaleCreationFee });
    }
    */

    /**
     * 
     * @param lauchpadPlatformParams 
     * @param presaleAddress 
     * @param presaleVk 
     */
    @method
    public createPresale(lauchpadPlatformParams: LauchpadPlatformParams,
        presaleAddress: PublicKey, presaleVk: VerificationKey, presaleParams: SaleParams,
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
        const presaleParams = new SaleParams({
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

        presaleParams.tokenAddress.assertEquals(this.address);
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

        this.mint(presaleAddress, presaleParams.totalSaleSupply);
    }

    /**
     * 
     * @param newParams 
     * @param fairsaleAddress 
     * @param verificationKey 
     */
    @method
    public createFairSale(newParams: LauchpadPlatformParams, fairsaleAddress: PublicKey, verificationKey: VerificationKey, fairsaleParams: SaleParams) {
        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        tokeniZkFactory.createFairSale(newParams, this.address, fairsaleAddress, verificationKey);

        let tokenId = this.token.id;
        let zkapp = AccountUpdate.defaultAccountUpdate(fairsaleAddress, tokenId);

        /* as a sample here
        const fairsaleParams = new FairSaleParams({
            tokeniZkBasicTokenAddress: this.address,//!!
            totalPresaleSupply: UInt64.from(0),
            Rate: UInt64.from(0),
            whitelistTreeRoot: Field(0),
            minimumBuy: UInt64.from(0),
            maximumBuy: UInt64.from(0),
            startTime: UInt64.from(0),
            endTime: UInt64.from(0),
            cliffTime: UInt32.from(0),
            cliffAmountRate: UInt64.from(0),
            vestingPeriod: UInt32.from(0),
            vestingIncrement: UInt64.from(0)
        });
        */

        fairsaleParams.tokenAddress.assertEquals(this.address);
        fairsaleParams.whitelistTreeRoot.assertGreaterThanOrEqual(0);
        // TODO do I need add 'assertGreaterThanOrEqual(0)' for other fields of 'UInt64'?

        AccountUpdate.setValue(zkapp.body.update.appState[0], fairsaleParams.hash());//  fairsaleParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[1], fairsaleParams.vestingParamsHash());//vestingParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[2], STANDARD_TREE_INIT_ROOT_16);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[3], Field(0));// totalContributedMina TODO ‘UInt64.from(0).toFields()[0]’ check if UInt64 is composed of only one Field !!!
        AccountUpdate.setValue(zkapp.body.update.appState[4], Reducer.initialActionState);// fromActionState

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();

        this.approve(zkapp);
        this.mint(fairsaleAddress, fairsaleParams.totalSaleSupply);

    }

    /**
     * 
     * @param receiverAddress - address of the receiver
     * @param amount 
     */
    mint(receiverAddress: PublicKey, amount: UInt64) {
        let totalAmountInCirculation = this.totalAmountInCirculation.getAndRequireEquals();
        let totalSupply = this.totalSupply.getAndRequireEquals();

        let newTotalAmountInCirculation = totalAmountInCirculation.add(amount);
        newTotalAmountInCirculation.assertLessThanOrEqual(
            totalSupply,
            "Can't mint more than the total supply"
        );

        this.token.mint({
            address: receiverAddress,
            amount,
        });

        this.totalAmountInCirculation.set(newTotalAmountInCirculation);

        this.self.requireSignature();// mint need signature of tokenOwner
    }

    /**
     * 
     * @param receiverAddress - address of the receiver
     * @param amount 
     */
    burn(receiverAddress: PublicKey, amount: UInt64) {
        let totalAmountInCirculation = this.totalAmountInCirculation.get();
        this.totalAmountInCirculation.assertEquals(totalAmountInCirculation);

        let newTotalAmountInCirculation = totalAmountInCirculation.sub(amount);
        totalAmountInCirculation.assertGreaterThanOrEqual(
            UInt64.from(0),
            "Can't burn less than 0"
        );

        this.token.burn({
            address: receiverAddress,
            amount,
        });
        this.totalAmountInCirculation.set(newTotalAmountInCirculation);

        this.self.requireSignature();// mint need signature of tokenOwner
    }

    /**
     * 
     * @param senderAddress - address of the sender
     * @param receiverAddress 
     * @param amount 
     * @param callback 
     */
    @method approveTransferCallback(
        senderAddress: PublicKey,
        receiverAddress: PublicKey,
        amount: UInt64,
        callback: Experimental.Callback<any>
    ) {
        let layout = AccountUpdate.Layout.AnyChildren; // TODO Allow only 1 accountUpdate with no children
        let senderAccountUpdate = this.approve(callback, layout);

        let negativeAmount = Int64.fromObject(
            senderAccountUpdate.body.balanceChange
        );
        negativeAmount.assertEquals(Int64.from(amount).neg());

        let tokenId = this.token.id;
        senderAccountUpdate.body.tokenId.assertEquals(tokenId);

        senderAccountUpdate.body.publicKey.assertEquals(senderAddress);

        // TODO !!!! check this approach is ok for new addresses !!!!
        let receiverAccountUpdate = Experimental.createChildAccountUpdate(
            this.self,
            receiverAddress,
            tokenId
        );
        receiverAccountUpdate.balance.addInPlace(amount);
    }

    /**
     * 
     * @param senderAddress - address of the sender
     * @param receiverAddress 
     * @param amount 
     * @param callback 
     */
    @method approveTransferCallbackWithVesting(
        senderAddress: PublicKey,
        receiverAddress: PublicKey,
        amount: UInt64,
        callback: Experimental.Callback<any>,
        vestingParams: VestingParams
    ) {
        let layout = AccountUpdate.Layout.AnyChildren; // TODO Allow only 1 accountUpdate with no children
        let senderAccountUpdate = this.approve(callback, layout);

        let negativeAmount = Int64.fromObject(
            senderAccountUpdate.body.balanceChange
        );
        negativeAmount.assertEquals(Int64.from(amount).neg());

        let tokenId = this.token.id;
        senderAccountUpdate.body.tokenId.assertEquals(tokenId);

        senderAccountUpdate.body.publicKey.assertEquals(senderAddress);

        // check vestingParams
        AccountUpdate.assertEquals(
            senderAccountUpdate.body.preconditions.account.state[1],
            vestingParams.hash()
        );

        // TODO !!!! check this approach is ok for new addresses !!!!
        let receiverAccountUpdate = Experimental.createChildAccountUpdate(
            this.self,
            receiverAddress,
            tokenId
        );
        receiverAccountUpdate.balance.addInPlace(amount);

        // vesting receiver's token
        const initialMinimumBalance = amount;
        const cliffAmount = UInt64.from(initialMinimumBalance.div(vestingParams.cliffAmountRate));
        receiverAccountUpdate.account.timing.set({
            initialMinimumBalance,
            cliffTime: vestingParams.cliffTime,
            cliffAmount,
            vestingPeriod: vestingParams.vestingPeriod,
            vestingIncrement: vestingParams.vestingIncrement
        });
    }
}
