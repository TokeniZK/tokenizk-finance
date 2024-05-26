import {
    State,
    state,
    UInt64,
    Bool,
    AccountUpdate,
    method,
    PublicKey,
    Permissions,
    VerificationKey,
    Field,
    UInt32,
    Reducer,
    TokenContract,
    AccountUpdateForest,
} from 'o1js';
import { LauchpadPlatformParams, TokeniZkFactory } from './TokeniZkFactory';
import { CONTRIBUTORS_TREE_ROOT } from './constants';
import { SaleParams, TokenTransferEvent, VestingParams,AirdropParams } from './sale-models';

const SUPPLY = UInt64.from(10n ** 18n);

export class TokeniZkBasicToken extends TokenContract {

    events = {
        tokenTransferEvent: TokenTransferEvent,
    }
    /**
     * Total supply of tokens
     */
    @state(Field) totalSupply = State<Field>();

    /**
     * Total amount in circulation
     */
    @state(Field) totalAmountInCirculation = State<Field>();

    @state(PublicKey) tokeniZkFactoryAddress = State<PublicKey>();


    deployZkApp(totalSupply: Field) {
        super.deploy();

        this.totalSupply.set(totalSupply);// TODO should be as a constant inside circuit, rather than a state !!!

        this.totalAmountInCirculation.set(Field.from(0));

        // this.account.tokenSymbol.set('');
        // this.account.zkappUri.set('');

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            access: Permissions.proofOrSignature(),// !!! need it
        });

    }

    @method
    async approveBase(forest: AccountUpdateForest) {
        this.checkZeroBalanceChange(forest);
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
    public async createPresale(lauchpadPlatformParams: LauchpadPlatformParams,
        saleAddress: PublicKey, saleContractVk: VerificationKey, saleParams: SaleParams,
        presaleMinaFundHolderVk: VerificationKey) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);// TODO!!!
        await tokeniZkFactory.createPresale(lauchpadPlatformParams, saleParams, this.address, saleAddress, saleContractVk, presaleMinaFundHolderVk);

        let tokenId = this.deriveTokenId();

        const zkapp = AccountUpdate.createSigned(saleAddress, tokenId);
        zkapp.account.isNew.requireEquals(Bool(true));

        saleParams.tokenAddress.assertEquals(this.address);
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        saleParams.softCap.mul(4).assertGreaterThanOrEqual(saleParams.hardCap);
        saleParams.minimumBuy.assertLessThanOrEqual(saleParams.maximumBuy);
        // ~saleParams.startTime.assertLessThan(saleParams.endTime.sub(10)); // at least last for 10 blocks~
        saleParams.startTime.assertLessThan(saleParams.endTime.sub(10 * 3 * 60 * 1000));
        saleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));

        AccountUpdate.setValue(zkapp.body.update.appState[0], saleParams.hash());
        AccountUpdate.setValue(zkapp.body.update.appState[1], saleParams.vestingParamsHash());
        AccountUpdate.setValue(zkapp.body.update.appState[2], CONTRIBUTORS_TREE_ROOT);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[3], Reducer.initialActionState);//fromActionState
        AccountUpdate.setValue(zkapp.body.update.appState[4], Field(0));// totalDistributed
        AccountUpdate.setValue(zkapp.body.update.appState[5], Field(0));//totalContributedMina

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            // access: Permissions.proofOrSignature()
        });
        zkapp.account.verificationKey.set(saleContractVk);
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
    public async createFairSale(lauchpadPlatformParams: LauchpadPlatformParams,
        saleAddress: PublicKey, saleContractVk: VerificationKey, saleParams: SaleParams) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        await tokeniZkFactory.createFairSale(lauchpadPlatformParams, saleParams, this.address, saleAddress, saleContractVk);

        let tokenId = this.deriveTokenId();
        const zkapp = AccountUpdate.createSigned(saleAddress, tokenId);
        zkapp.account.isNew.requireEquals(Bool(true));

        saleParams.tokenAddress.assertEquals(this.address);
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);
        saleParams.minimumBuy.assertLessThanOrEqual(saleParams.maximumBuy);
        // ~saleParams.startTime.assertLessThan(saleParams.endTime.sub(10)); // at least last for 10 blocks~
        saleParams.startTime.assertLessThan(saleParams.endTime.sub(10 * 3 * 60 * 1000));
        saleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));
        saleParams.saleRate.assertEquals(UInt64.from(0));// !
        saleParams.softCap.assertEquals(UInt64.from(0));// !
        saleParams.hardCap.assertEquals(UInt64.from(0));// !

        AccountUpdate.setValue(zkapp.body.update.appState[0], saleParams.hash());//  fairsaleParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[1], saleParams.vestingParamsHash());//vestingParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[2], CONTRIBUTORS_TREE_ROOT);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[3], Reducer.initialActionState);// fromActionState
        AccountUpdate.setValue(zkapp.body.update.appState[4], Field(0));// totalContributedMina TODO ‘UInt64.from(0).toFields()[0]’ check if UInt64 is composed of only one Field !!!

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });
        zkapp.account.verificationKey.set(saleContractVk);
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

        let newTotalAmountInCirculation = totalAmountInCirculation.add(amount.toFields()[0]);
        newTotalAmountInCirculation.assertLessThanOrEqual(
            totalSupply,
            "Can't mint more than the total supply"
        );

        this.internal.mint({
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
    public async createAirdrop(lauchpadPlatformParams: LauchpadPlatformParams,
        airdropAddress: PublicKey, airdropContractVk: VerificationKey, airdropParams: AirdropParams) {

        const tokeniZkFactory = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        await tokeniZkFactory.createAirdrop(lauchpadPlatformParams, airdropParams, this.address, airdropAddress, airdropContractVk);

        let tokenId = this.deriveTokenId();
        const zkapp = AccountUpdate.createSigned(airdropAddress, tokenId);
        zkapp.account.isNew.requireEquals(Bool(true));

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
        this.totalAmountInCirculation.requireEquals(totalAmountInCirculation);

        let newTotalAmountInCirculation = totalAmountInCirculation.sub(amount.toFields()[0]);
        totalAmountInCirculation.assertGreaterThanOrEqual(
            0,
            "Can't burn less than 0"
        );

        this.internal.burn({
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
    async transferToken(from: PublicKey, to: PublicKey, value: UInt64) {
        await this.transfer(from, to, value);
        this.emitEvent('tokenTransferEvent', new TokenTransferEvent({
            tokenAddress: this.address,
            tokenId: this.deriveTokenId(),
            from: from,
            to: to,
            value: value
        }));
    }

    /**
     * 
     * @param senderAddress - address of the sender
     * @param receiverAddress 
     * @param amount 
     * @param callback 
     */
    @method
    async approveTransferCallback(
        //callback: Experimental.Callback<any>,
        zkappUpdate: AccountUpdate,
        receiverAddress: PublicKey,
        amount: UInt64,
    ) {
        await this.transfer(zkappUpdate, receiverAddress, amount);

        this.emitEvent('tokenTransferEvent', new TokenTransferEvent({
            tokenAddress: this.address,
            tokenId: this.deriveTokenId(),
            from: zkappUpdate.publicKey,
            to: receiverAddress,
            value: amount
        }));
    }

    /**
     * 
     * @param senderAddress - address of the sender
     * @param receiverAddress 
     * @param amount 
     * @param callback 
     */
    @method
    async approveTransferCallbackWithVesting(
        zkappUpdate: AccountUpdate,
        receiverAddress: PublicKey,
        amount: UInt64,
        vestingParams: VestingParams
    ) {
        await this.approveTransferCallback(zkappUpdate, receiverAddress, amount);

        // increase receiver's token
        const tokenId = this.deriveTokenId();
        let receiverAccountUpdate = AccountUpdate.create(receiverAddress, tokenId);
        this.approve(receiverAccountUpdate);
        receiverAccountUpdate.balance.addInPlace(amount);
        
        AccountUpdate.assertEquals(
            zkappUpdate.body.preconditions.account.state[1],
            vestingParams.hash()
        );
        // vesting receiver's token
        const initialMinimumBalance = amount.sub(1);
        const cliffAmount = UInt64.from(initialMinimumBalance.mul(vestingParams.cliffAmountRate).div(100));
        const vestingIncrement = UInt64.from(initialMinimumBalance.mul(vestingParams.vestingIncrement).div(100));
        receiverAccountUpdate.account.timing.set({
            initialMinimumBalance,
            cliffTime: vestingParams.cliffTime,
            cliffAmount,
            vestingPeriod: vestingParams.vestingPeriod,
            vestingIncrement
        });
        receiverAccountUpdate.requireSignature();
    }

}
