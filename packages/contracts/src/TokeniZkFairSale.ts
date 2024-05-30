import {
    State,
    state,
    UInt64,
    SmartContract,
    AccountUpdate,
    method,
    PublicKey,
    Permissions,
    Field,
    UInt32,
    Poseidon,
    Provable,
    Signature,
    Reducer,
    Bool,
    TransactionVersion,
} from 'o1js';
import { STANDARD_TREE_INIT_ROOT_16, WHITELIST_TREE_ROOT } from './constants';
import { SaleRollupProof } from './sale-rollup-prover';
import {
    ContributionEvent, SaleContribution,
    SaleParams, SaleParamsConfigurationEvent, SaleContributorMembershipWitnessData,
    UserLowLeafWitnessData, UserNullifierMerkleWitness, WhitelistMembershipMerkleWitness,
    ClaimTokenEvent, MaintainContributorsEvent
} from './sale-models';
import { RedeemAccount } from './TokeniZkUser';


export class TokeniZkFairSale extends SmartContract {

    init() {
        super.init();

        const fairsaleParams = new SaleParams({
            tokenAddress: PublicKey.empty(),
            totalSaleSupply: UInt64.from(0),
            saleRate: UInt64.from(0),// ignored at fair sale
            whitelistTreeRoot: Field(0),
            softCap: UInt64.from(0),// ignored at fair sale
            hardCap: UInt64.from(0),// ignored at fair sale
            minimumBuy: UInt64.from(0),
            maximumBuy: UInt64.from(0),
            startTime: UInt64.from(0),
            endTime: UInt64.from(0),
            cliffTime: UInt32.from(0),
            cliffAmountRate: UInt64.from(0),
            vestingPeriod: UInt32.from(0),
            vestingIncrement: UInt64.from(0)
        });
        this.saleParamsHash.set(fairsaleParams.hash());
        this.vestingParamsHash.set(fairsaleParams.vestingParamsHash());
        this.fromActionState.set(Reducer.initialActionState);
        this.contributorTreeRoot.set(STANDARD_TREE_INIT_ROOT_16);
        this.totalContributedMina.set(UInt64.from(0));

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            receive: Permissions.proof(),
            access: Permissions.proofOrSignature(),
            setVerificationKey: {auth: Permissions.proof(), txnVersion: TransactionVersion.current()}
        });
    }

    reducer = Reducer({ actionType: SaleContribution });

    events = {
        configureSaleParams: SaleParamsConfigurationEvent,
        contribute: ContributionEvent,
        claimToken: ClaimTokenEvent,
        maintainContributors: MaintainContributorsEvent,
    }

    /**
     * the hash of configured fairsale parameters
     */
    @state(Field)
    public saleParamsHash = State<Field>();

    /**
     * the hash of configured fairsale vesting parameters
     */
    @state(Field)
    public vestingParamsHash = State<Field>();

    /**
     * contributors Tree Root: default empty merkle tree root
     */
    @state(Field)
    public contributorTreeRoot = State<Field>();

    /**
     * The state of the previously processed actions
     */
    @state(Field)
    public fromActionState = State<Field>();

    /**
     * Total amount of Mina contributed
     */
    @state(UInt64)
    public totalContributedMina = State<UInt64>();

    @method
    async configureSaleParams(saleParams0: SaleParams, saleParams1: SaleParams, adminSignature: Signature) {
        // cannot be changed after ('startTime' - 60 * 60 * 1000)
        // ~this.network.blockchainLength.requireBetween(saleParams0.startTime.sub(10), UInt32.MAXINT());~
        // this.network.timestamp.requireBetween(saleParams0.startTime.sub(10 * 3 * 60 * 1000), UInt64.MAXINT());TODO this.network.timestamp causes "the permutation was not constructed correctly: final value" error

        // check if  params is aligned with the existing ones
        const hash0 = saleParams0.hash();
        const hash1 = saleParams1.hash();

        saleParams0.tokenAddress.assertEquals(saleParams1.tokenAddress);
        saleParams0.totalSaleSupply.assertEquals(saleParams1.totalSaleSupply);

        // ~this.network.blockchainLength.requireBetween(saleParams1.startTime.sub(10), UInt32.MAXINT());~
        // this.network.timestamp.requireBetween(saleParams1.startTime.sub(10 * 3 * 60 * 1000), UInt64.MAXINT());TODO this.network.timestamp causes "the permutation was not constructed correctly: final value" error

        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce = Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?

        saleParams1.minimumBuy.assertLessThanOrEqual(saleParams1.maximumBuy);
        saleParams1.startTime.assertLessThan(saleParams1.endTime.sub(10 * 3 * 60 * 1000));
        saleParams1.saleRate.assertEquals(UInt64.from(0));// !
        saleParams1.softCap.assertEquals(UInt64.from(0));// !
        saleParams1.hardCap.assertEquals(UInt64.from(0));// !

        this.self.account.balance.requireBetween(saleParams1.totalSaleSupply, UInt64.MAXINT());

        this.saleParamsHash.set(hash1);
        this.vestingParamsHash.set(saleParams1.vestingParamsHash());

        this.emitEvent('configureSaleParams', new SaleParamsConfigurationEvent({
            saleParams: saleParams1,
            tokenId: this.tokenId
        }));
    }

    /**
     * for user contribution
     * @param contributorAddress receiver address
     * @param minaAmount MINA amount
     */
    @method
    async contribute(saleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64,
        membershipMerkleWitness: WhitelistMembershipMerkleWitness, leafIndex: Field) {
        // check  params
        this.saleParamsHash.getAndRequireEquals().assertEquals(
            saleParams.hash()
        );

        // check network timestamp
        // ~this.network.blockchainLength.requireBetween(saleParams.startTime, saleParams.endTime);~
        // this.network.timestamp.requireBetween(saleParams.startTime, saleParams.endTime);TODO this.network.timestamp causes "the permutation was not constructed correctly: final value" error

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(saleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(saleParams.maximumBuy);

        // check whitelist
        const leaf = Provable.if(
            saleParams.whitelistTreeRoot.equals(WHITELIST_TREE_ROOT),
            Field(0),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(saleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const MinaAU = AccountUpdate.create(this.address);
        MinaAU.balance.addInPlace(minaAmount);

        // emit actions
        const saleContribution = new SaleContribution({
            tokenAddress: saleParams.tokenAddress,
            tokenId: this.tokenId,
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            minaAmount: minaAmount
        });
        this.reducer.dispatch(saleContribution);

        // emit events
        this.emitEvent('contribute', new ContributionEvent({
            tokenAddress: saleParams.tokenAddress,
            tokenId: this.tokenId,
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            minaAmount: minaAmount,
            tokenAmount: UInt64.from(0)
        }));
    }

    /**
     * 
     * @param saleParams 
     * @param adminSignature 
     */
    @method
    async maintainContributors(saleParams: SaleParams, saleRollupProof: SaleRollupProof) {
        // check if  params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        // ~this.network.blockchainLength.requireBetween(saleParams.endTime, UInt32.MAXINT());TODO need uncomment here~
        // this.network.timestamp.requireBetween(saleParams.endTime, UInt64.MAXINT());

        // check actionState
        this.account.actionState.requireEquals(
            saleRollupProof.publicOutput.target.currentActionsHash
        );
        // check proof
        saleRollupProof.verify();

        // check source is aligned with zkApp onchain states
        saleRollupProof.publicOutput.source.currentActionsHash.assertEquals(this.fromActionState.getAndRequireEquals());
        saleRollupProof.publicOutput.source.membershipTreeRoot.assertEquals(this.contributorTreeRoot.getAndRequireEquals());
        saleRollupProof.publicOutput.source.currentMinaAmount.assertEquals(this.totalContributedMina.getAndRequireEquals());

        this.fromActionState.set(saleRollupProof.publicOutput.target.currentActionsHash);
        this.contributorTreeRoot.set(saleRollupProof.publicOutput.target.membershipTreeRoot);
        this.totalContributedMina.set(saleRollupProof.publicOutput.target.currentMinaAmount);

        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
        this.emitEvent('maintainContributors', new MaintainContributorsEvent({
            fromActionState0: saleRollupProof.publicOutput.source.currentActionsHash,
            contributorTreeRoot0: saleRollupProof.publicOutput.source.membershipTreeRoot,
            totalContributedMina0: saleRollupProof.publicOutput.source.currentMinaAmount,

            fromActionState1: saleRollupProof.publicOutput.target.currentActionsHash,
            contributorTreeRoot1: saleRollupProof.publicOutput.target.membershipTreeRoot,
            totalContributedMina1: saleRollupProof.publicOutput.target.currentMinaAmount
        }));
    }

    /**
     * need go back to 'TokeniZkPrivateSale.approveTransferCallbackWithVesting()' for approval and transfer, which means each address could contribute only once.
     * @param saleParams 
     * @param saleContribution 
     * @param contributorMerkleWitness 
     * @param leafIndex 
     */
    @method
    async claimTokens(saleParams: SaleParams,
        saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {
        // check if presale params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        // ~this.network.blockchainLength.requireBetween(saleParams.endTime, UInt32.MAXINT());TODO need uncomment here~
        // this.network.timestamp.requireBetween(saleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalMina = this.totalContributedMina.getAndRequireEquals();
        totalMina.assertGreaterThanOrEqual(saleParams.softCap);

        // check contributorMerkleWitness
        saleContributorMembershipWitnessData.checkMembershipAndAssert(this.contributorTreeRoot.getAndRequireEquals());

        const saleContribution = saleContributorMembershipWitnessData.leafData;
        const contributorAddress = saleContribution.contributorAddress;

        this.self.balance.subInPlace(saleContribution.minaAmount.div(10 ** 9).mul(saleParams.saleRate));

        const redeemAccount = new RedeemAccount(contributorAddress);// MINA account
        await redeemAccount.updateState(
            saleContribution.hash(),
            lowLeafWitness,
            oldNullWitness
        );

        this.emitEvent('claimToken', new ClaimTokenEvent({
            saleContribution: saleContribution
        }));
    }

}

