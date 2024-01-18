
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
    Bool,
    UInt32,
    Experimental,
    Int64,
} from 'o1js';
import { SaleParams } from './sale-models';
import { CONTRIBUTORS_TREE_ROOT, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { AirdropParams } from './TokeniZkAirdrop';


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

    airdropVk: Field,
    airdropCreationFee: UInt64,

    redeemAccountVk: Field
}) {

    hash() {
        return Poseidon.hash([
            this.basicTokenVk,
            ...this.basicTokenCreationFee.toFields(),

            this.presaleContractVk,
            ...this.presaleCreationFee.toFields(),
            ...this.presaleServiceFeeRate.toFields(),
            ...this.presaleMinaFundHolderVk.toFields(),

            this.fairSaleContractVk,
            ... this.fairSaleCreationFee.toFields(),
            ... this.fairSaleServiceFeeRate.toFields(),

            this.privateSaleContractVk,
            ... this.privateSaleCreationFee.toFields(),
            ...this.privateSaleServiceFeeRate.toFields(),

            this.airdropVk,
            ...this.airdropCreationFee.toFields(),

            this.redeemAccountVk
        ]);
    }

    static fromDto(dto: {
        basicTokenVk: string,
        basicTokenCreationFee: number,

        presaleContractVk: string,
        presaleCreationFee: number,
        presaleServiceFeeRate: number,
        presaleMinaFundHolderVk: string,

        fairSaleContractVk: string,
        fairSaleCreationFee: number,
        fairSaleServiceFeeRate: number,

        privateSaleContractVk: string,
        privateSaleCreationFee: number,
        privateSaleServiceFeeRate: number,

        airdropVk: string,
        airdropCreationFee: number,

        redeemAccountVk: string
    }) {
        return new LauchpadPlatformParams(
            {
                basicTokenVk: Field(dto.basicTokenVk),
                basicTokenCreationFee: UInt64.from(dto.basicTokenCreationFee),

                presaleContractVk: Field(dto.presaleContractVk),
                presaleCreationFee: UInt64.from(dto.presaleCreationFee),
                presaleServiceFeeRate: UInt64.from(dto.presaleServiceFeeRate),
                presaleMinaFundHolderVk: Field(dto.presaleMinaFundHolderVk),

                fairSaleContractVk: Field(dto.fairSaleContractVk),
                fairSaleCreationFee: UInt64.from(dto.fairSaleCreationFee),
                fairSaleServiceFeeRate: UInt64.from(dto.fairSaleServiceFeeRate),

                privateSaleContractVk: Field(dto.privateSaleContractVk),
                privateSaleCreationFee: UInt64.from(dto.privateSaleCreationFee),
                privateSaleServiceFeeRate: UInt64.from(dto.privateSaleServiceFeeRate),

                airdropVk: Field(dto.airdropVk),
                airdropCreationFee: UInt64.from(dto.airdropCreationFee),

                redeemAccountVk: Field(dto.redeemAccountVk)
            }
        );
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
    totalSupply: Field,

    fee: UInt64
}) { }

export class CreateSaleEvent extends Struct({
    basicTokenAddress: PublicKey,
    saleContractAddress: PublicKey,
    fee: UInt64,
    saleParams: SaleParams
}) { }

export class CreateAirdropEvent extends Struct({
    basicTokenAddress: PublicKey,
    airdropContractAddress: PublicKey,
    fee: UInt64,
    airdropParams: AirdropParams
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

    static airdropVk: VerificationKey;// TODO 

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
        createPresale: CreateSaleEvent,
        createFairsale: CreateSaleEvent,
        createPrivateSale: CreateSaleEvent,
        createRedeemAccount: CreateRedeemAccount,
        createAirdrop: CreateAirdropEvent
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
        // const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();

        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        // Provable.log('lauchpadPlatformParamsHash: ', lauchpadPlatformParamsHash);
        const newParamsHash = newParams.hash();
        // Provable.log('newParamsHash: ', newParamsHash);
        lauchpadPlatformParamsHash.assertEquals(newParamsHash, 'newParamsHash is not equaled to existing lauchpadPlatformParamsHash');

        newParams.basicTokenVk.assertEquals(basicTokenVk.hash, 'new basicTokenVk.hash is not equaled to existing basicTokenVk.hash');

        let zkapp = AccountUpdate.createSigned(tokenAddr);
        // zkapp.account.isNew.requireEquals(Bool(true));
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
            access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(basicTokenVk);
        AccountUpdate.setValue(zkapp.body.update.appState[0], totalSupply);//totalSupply
        AccountUpdate.setValue(zkapp.body.update.appState[1], Field(0));//totalAmountInCirculation

        const feePayer = AccountUpdate.createSigned(this.sender);
        // const feeReceiverAU = AccountUpdate.create(platfromFeeAddress);
        const feeReceiverAU = AccountUpdate.create(this.address);
        feePayer.send({ to: feeReceiverAU, amount: newParams.basicTokenCreationFee });

        this.emitEvent('createBasicToken', new CreateBasicTokenEvent({
            basicTokenAddress: tokenAddr,
            totalSupply,
            fee: newParams.basicTokenCreationFee
        }));
    }

    @method
    public createPresale(newParams: LauchpadPlatformParams, saleParams: SaleParams, tokenAddr: PublicKey, presaleAddress: PublicKey, presaleVk: VerificationKey, presaleMinaFundHolderVk: VerificationKey) {
        // const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();
        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        newParams.hash().assertEquals(lauchpadPlatformParamsHash);
        newParams.presaleContractVk.assertEquals(presaleVk.hash);
        newParams.presaleMinaFundHolderVk.assertEquals(presaleMinaFundHolderVk.hash);

        // deploy PrivateSaleMinaFundHolder
        const presaleMinaFundHolderAU = AccountUpdate.createSigned(presaleAddress);
        presaleMinaFundHolderAU.account.isNew.requireEquals(Bool(true));

        AccountUpdate.setValue(presaleMinaFundHolderAU.body.update.appState[0], tokenAddr.toFields()[0]);// TODO check if it's right
        AccountUpdate.setValue(presaleMinaFundHolderAU.body.update.appState[1], tokenAddr.toFields()[1]);// TODO check if it's right
        presaleMinaFundHolderAU.account.verificationKey.set(presaleMinaFundHolderVk);
        presaleMinaFundHolderAU.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
        });

        const feePayer = AccountUpdate.createSigned(this.sender);
        // const feeReceiverAU = AccountUpdate.create(platfromFeeAddress);
        const feeReceiverAU = AccountUpdate.create(this.address);
        feePayer.send({ to: feeReceiverAU, amount: newParams.presaleCreationFee });

        this.emitEvent('createPresale', new CreateSaleEvent({
            basicTokenAddress: tokenAddr,
            saleContractAddress: presaleAddress,
            fee: newParams.presaleCreationFee,
            saleParams
        }));
    }

    @method
    public createFairSale(lauchpadPlatformParams: LauchpadPlatformParams, saleParams: SaleParams, tokenAddr: PublicKey, fairsaleAddress: PublicKey, verificationKey: VerificationKey) {
        // const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();
        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        lauchpadPlatformParams.hash().assertEquals(lauchpadPlatformParamsHash);
        lauchpadPlatformParams.fairSaleContractVk.assertEquals(verificationKey.hash);

        const feePayer = AccountUpdate.createSigned(this.sender);
        // const feeReceiverAU = AccountUpdate.create(platfromFeeAddress);
        const feeReceiverAU = AccountUpdate.create(this.address);
        feePayer.send({ to: feeReceiverAU, amount: lauchpadPlatformParams.fairSaleCreationFee });

        this.emitEvent('createFairsale', new CreateSaleEvent({
            basicTokenAddress: tokenAddr,
            saleContractAddress: fairsaleAddress,
            fee: lauchpadPlatformParams.fairSaleCreationFee,
            saleParams
        }));
    }

    @method
    public createAirdrop(lauchpadPlatformParams: LauchpadPlatformParams, airdropParams: AirdropParams, tokenAddr: PublicKey, airdropAddress: PublicKey, verificationKey: VerificationKey) {
        // const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();
        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        lauchpadPlatformParams.hash().assertEquals(lauchpadPlatformParamsHash);
        lauchpadPlatformParams.airdropVk.assertEquals(verificationKey.hash);

        const feePayer = AccountUpdate.createSigned(this.sender);
        const feeReceiverAU = AccountUpdate.create(this.address);
        feePayer.send({ to: feeReceiverAU, amount: lauchpadPlatformParams.fairSaleCreationFee });

        this.emitEvent('createAirdrop', new CreateAirdropEvent({
            basicTokenAddress: tokenAddr,
            airdropContractAddress: airdropAddress,
            fee: lauchpadPlatformParams.airdropCreationFee,
            airdropParams
        }));
    }

    @method
    public createPrivateSale(lauchpadPlatformParams: LauchpadPlatformParams, saleParams: SaleParams, tokenAddr: PublicKey, saleAddress: PublicKey, privateSaleVk: VerificationKey) {
        // const platfromFeeAddress = this.platfromFeeAddress.getAndRequireEquals();
        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        lauchpadPlatformParams.hash().assertEquals(lauchpadPlatformParamsHash);
        lauchpadPlatformParams.privateSaleContractVk.assertEquals(privateSaleVk.hash);

        let zkapp = AccountUpdate.createSigned(saleAddress);

        // saleParams.tokenAddress.assertEquals(PublicKey.empty());// no need at private sale
        saleParams.totalSaleSupply.assertEquals(UInt64.from(0));// no need at private sale
        saleParams.saleRate.assertEquals(UInt64.from(0));// no need at private sale
        saleParams.hardCap.assertLessThanOrEqual(saleParams.softCap.mul(4));
        saleParams.minimumBuy.assertLessThanOrEqual(saleParams.maximumBuy);
        saleParams.startTime.assertLessThan(saleParams.endTime);
        saleParams.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));
        // saleParams.whitelistTreeRoot.equals(0).or(saleParams.whitelistTreeRoot.equals(STANDARD_TREE_INIT_ROOT_12)).assertEquals(true);

        AccountUpdate.setValue(zkapp.body.update.appState[0], saleParams.hash());//  privateSaleParamsHash
        AccountUpdate.setValue(zkapp.body.update.appState[1], CONTRIBUTORS_TREE_ROOT);// contributorTreeRoot
        AccountUpdate.setValue(zkapp.body.update.appState[2], Reducer.initialActionState);// fromActionState
        AccountUpdate.setValue(zkapp.body.update.appState[3], Field(0));// totalContributedMina TODO ‘UInt64.from(0).toFields()[0]’ check if UInt64 is composed of only one Field !!!

        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            // receive: Permissions.proof(),
            // access: Permissions.proofOrSignature(),
        });
        zkapp.account.verificationKey.set(privateSaleVk);
        zkapp.requireSignature();

        const feePayer = AccountUpdate.createSigned(this.sender);
        // const feeReceiverAU = AccountUpdate.create(platfromFeeAddress);
        const feeReceiverAU = AccountUpdate.create(this.address);
        feePayer.send({ to: feeReceiverAU, amount: lauchpadPlatformParams.privateSaleCreationFee });

        this.emitEvent('createPrivateSale', new CreateSaleEvent({
            basicTokenAddress: tokenAddr,// no token at private sale
            saleContractAddress: saleAddress,
            fee: lauchpadPlatformParams.privateSaleCreationFee,
            saleParams
        }));

    }

    /**
     * createRedeemAccount
     * @param lauchpadPlatformParams 
     * @param redeemAccountAddress 
     * @param redeemAccountVk 
     */
    @method
    public createRedeemAccount(lauchpadPlatformParams: LauchpadPlatformParams, redeemAccountAddress: PublicKey, redeemAccountVk: VerificationKey) {
        const lauchpadPlatformParamsHash = this.lauchpadPlatformParamsHash.getAndRequireEquals();
        lauchpadPlatformParams.hash().assertEquals(lauchpadPlatformParamsHash);
        lauchpadPlatformParams.redeemAccountVk.assertEquals(redeemAccountVk.hash);

        /*
        let tokenId = this.token.id;
        const zkapp = Experimental.createChildAccountUpdate(
            this.self,
            redeemAccountAddress,
            tokenId
        );
        zkapp.account.isNew.assertEquals(Bool(true));
        zkapp.requireSignature();
        */
        let zkapp = AccountUpdate.createSigned(redeemAccountAddress);

        AccountUpdate.setValue(zkapp.body.update.appState[0], INDEX_TREE_INIT_ROOT_8);//nullifierRoot
        AccountUpdate.setValue(zkapp.body.update.appState[1], Field(1));//nullStartIndex
        zkapp.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.signature()
        });
        zkapp.account.verificationKey.set(redeemAccountVk);

        this.emitEvent('createRedeemAccount', new CreateRedeemAccount({
            redeemAccountAddress,
            nullifierRoot: INDEX_TREE_INIT_ROOT_8
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
    approveAnyAccountUpdate(zkappUpdate: AccountUpdate) {
        let layout = AccountUpdate.Layout.AnyChildren; // TODO Allow only 1 accountUpdate with no children
        let senderAccountUpdate = this.approve(zkappUpdate, layout);

        let negativeAmount = Int64.fromObject(
            senderAccountUpdate.body.balanceChange
        );
        negativeAmount.assertEquals(0);

        let tokenId = this.token.id;
        senderAccountUpdate.body.tokenId.assertEquals(tokenId);
    }
}
