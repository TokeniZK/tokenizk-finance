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
import { SaleParams, VestingParams } from './sale-models';
import { AirdropParams } from './TokeniZkAirdrop';


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

    @state(PublicKey) tokeniZkFactoryAddress = State<PublicKey>();


    deployZkApp(totalSupply: UInt64) {
        super.deploy();

        this.totalSupply.set(totalSupply);// TODO should be as a constant inside circuit, rather than a state !!!

        this.totalAmountInCirculation.set(UInt64.from(0));

        // this.account.tokenSymbol.set('');
        // this.account.zkappUri.set('');

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),// !!! need it
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
     * @param saleAddress 
     * @param saleContractVk 
     */
    @method
    public createPresale(lauchpadPlatformParams: LauchpadPlatformParams,
        saleAddress: PublicKey, saleContractVk: VerificationKey, saleParams: SaleParams,
        presaleMinaFundHolderVk: VerificationKey) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);// TODO!!!
        tokeniZkFactory.createPresale(lauchpadPlatformParams, saleParams, this.address, saleAddress, saleContractVk, presaleMinaFundHolderVk);

        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            saleAddress,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));

        saleParams.tokenAddress.assertEquals(this.address);
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        saleParams.softCap.mul(4).assertGreaterThanOrEqual(saleParams.hardCap);
        saleParams.minimumBuy.assertLessThanOrEqual(saleParams.maximumBuy);
        saleParams.startTime.assertLessThan(saleParams.endTime.sub(10 * 5 * 60 * 1000)); // at least last for 10 blocks
        saleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));

        AccountUpdate.setValue(zkapp.body.update.appState[0], saleParams.hash());
        AccountUpdate.setValue(zkapp.body.update.appState[1], saleParams.vestingParamsHash());
        AccountUpdate.setValue(zkapp.body.update.appState[2], STANDARD_TREE_INIT_ROOT_16);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[3], Reducer.initialActionState);//fromActionState
        AccountUpdate.setValue(zkapp.body.update.appState[4], Field(0));// totalDistributed
        AccountUpdate.setValue(zkapp.body.update.appState[5], Field(0));//totalContributedMina

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });
        zkapp.account.verificationKey.set(saleContractVk);
        zkapp.requireSignature();
        this.approve(zkapp);

        this.mintToken(saleAddress, saleParams.totalSaleSupply);
    }

    /**
     * 
     * @param lauchpadPlatformParams 
     * @param saleAddress 
     * @param saleContractVk 
     */
    @method
    public createFairSale(lauchpadPlatformParams: LauchpadPlatformParams,
        saleAddress: PublicKey, saleContractVk: VerificationKey, saleParams: SaleParams) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        tokeniZkFactory.createFairSale(lauchpadPlatformParams, saleParams, this.address, saleAddress, saleContractVk);

        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            saleAddress,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));

        saleParams.tokenAddress.assertEquals(this.address);
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        saleParams.minimumBuy.assertLessThanOrEqual(saleParams.maximumBuy);
        saleParams.startTime.assertLessThan(saleParams.endTime.sub(10 * 5 * 60 * 1000)); // at least last for 10 blocks
        saleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));
        saleParams.saleRate.assertEquals(UInt64.from(0));// !
        saleParams.softCap.assertEquals(UInt64.from(0));// !
        saleParams.hardCap.assertEquals(UInt64.from(0));// !

        AccountUpdate.setValue(zkapp.body.update.appState[0], saleParams.hash());//  fairsaleParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[1], saleParams.vestingParamsHash());//vestingParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[2], STANDARD_TREE_INIT_ROOT_16);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[3], Reducer.initialActionState);// fromActionState
        AccountUpdate.setValue(zkapp.body.update.appState[4], Field(0));// totalContributedMina TODO ‘UInt64.from(0).toFields()[0]’ check if UInt64 is composed of only one Field !!!

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });
        zkapp.account.verificationKey.set(saleContractVk);
        zkapp.requireSignature();
        this.approve(zkapp);

        this.mintToken(saleAddress, saleParams.totalSaleSupply);
    }

    /**
     * 
     * @param receiverAddress - address of the receiver
     * @param amount 
     */
    mintToken(receiverAddress: PublicKey, amount: UInt64) {
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
     * @param lauchpadPlatformParams 
     * @param airdropAddress 
     * @param airdropContractVk 
     */
    @method
    public createAirdrop(lauchpadPlatformParams: LauchpadPlatformParams,
        airdropAddress: PublicKey, airdropContractVk: VerificationKey, airdropParams: AirdropParams) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        tokeniZkFactory.createAirdrop(lauchpadPlatformParams, airdropParams, this.address, airdropAddress, airdropContractVk);

        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            airdropAddress,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));

        airdropParams.tokenAddress.assertEquals(this.address);
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        // airdropParams.startTime.assertLessThan(airdropParams.endTime.sub(10 * 5 * 60 * 1000)); // at least last for 10 blocks
        airdropParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));

        AccountUpdate.setValue(zkapp.body.update.appState[0], airdropParams.hash());//  airdropParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[1], airdropParams.vestingParamsHash());//vestingParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[2], Field(0));// totalDistributed

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });

        zkapp.account.verificationKey.set(airdropContractVk);
        zkapp.requireSignature();
        this.approve(zkapp);

        this.mintToken(airdropAddress, airdropParams.totalAirdropSupply);
    }


    /**
     * 
     * @param receiverAddress - address of the receiver
     * @param amount 
     */
    burnToken(receiverAddress: PublicKey, amount: UInt64) {
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
     * for narmal transfer (require from's signature underly)
     * @param from 
     * @param to 
     * @param value 
     */
    @method
    transferToken(from: PublicKey, to: PublicKey, value: UInt64) {
        this.token.send({ from, to, amount: value });
    }

    /**
     * 
     * @param senderAddress - address of the sender
     * @param receiverAddress 
     * @param amount 
     * @param callback 
     */
    @method
    approveTransferCallback(
        //callback: Experimental.Callback<any>,
        zkappUpdate: AccountUpdate,
        receiverAddress: PublicKey,
        amount: UInt64,
    ) {
        let layout = AccountUpdate.Layout.AnyChildren; // TODO Allow only 1 accountUpdate with no children
        let senderAccountUpdate = this.approve(zkappUpdate, layout);

        //let layout = AccountUpdate.Layout.AnyChildren; // Allow only 1 accountUpdate with no children
        //let senderAccountUpdate = this.approve(callback, layout);

        let negativeAmount = Int64.fromObject(
            senderAccountUpdate.body.balanceChange
        );
        negativeAmount.assertEquals(Int64.from(amount).neg());

        let tokenId = this.token.id;
        senderAccountUpdate.body.tokenId.assertEquals(tokenId);

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
    @method
    approveTransferCallbackWithVesting(
        zkappUpdate: AccountUpdate,
        receiverAddress: PublicKey,
        amount: UInt64,
        vestingParams: VestingParams
    ) {
        let layout = AccountUpdate.Layout.AnyChildren; // TODO Allow only 1 accountUpdate with no children
        let senderAccountUpdate = this.approve(zkappUpdate, layout);

        let negativeAmount = Int64.fromObject(
            senderAccountUpdate.body.balanceChange
        );
        negativeAmount.assertEquals(Int64.from(amount).neg());

        let tokenId = this.token.id;
        senderAccountUpdate.body.tokenId.assertEquals(tokenId);
        
        // create a new AccountUpdate to check vestingParams
        let senderAU = Experimental.createChildAccountUpdate(
            this.self,
            zkappUpdate.body.publicKey,
            tokenId
        );
        AccountUpdate.assertEquals(
            senderAU.body.preconditions.account.state[1],
            vestingParams.hash()
        );

        // increase receiver's token
        let receiverAccountUpdate = Experimental.createChildAccountUpdate(
            this.self,
            receiverAddress,
            tokenId
        );
        receiverAccountUpdate.balance.addInPlace(amount);

        // vesting receiver's token
        const initialMinimumBalance = amount.sub(1);
        const cliffAmount = UInt64.from(initialMinimumBalance.mul(vestingParams.cliffAmountRate).div(100));
        receiverAccountUpdate.account.timing.set({
            initialMinimumBalance,
            cliffTime: vestingParams.cliffTime,
            cliffAmount,
            vestingPeriod: vestingParams.vestingPeriod,
            vestingIncrement: vestingParams.vestingIncrement
        });
        receiverAccountUpdate.requireSignature();
    }
}
