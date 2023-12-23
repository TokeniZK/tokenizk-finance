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
    Struct,
    UInt32,
    Poseidon,
    Provable,
    Signature,
    Reducer,
    Bool,
} from 'o1js';
import { MembershipMerkleWitness } from '@tokenizk/types';
import { STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { SaleRollupProof } from './sale-rollup-prover';
import { ContributionEvent, SaleContribution, SaleParams,SaleParamsConfigurationEvent } from './sale-models';


export class TokeniZkFairSale extends SmartContract {

    init() {
        super.init();

        const fairsaleParams = new SaleParams({
            tokenAddress: PublicKey.empty(),
            totalSaleSupply: UInt64.from(0),
            saleRate: UInt64.from(0),
            whitelistTreeRoot: Field(0),
            softCap: UInt64.from(0),
            hardCap: UInt64.from(0),
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
            setVerificationKey: Permissions.proof()
        });
    }

    reducer = Reducer({ actionType: SaleContribution });

    events = {
        contribute: ContributionEvent,
        configureSaleParams: SaleParamsConfigurationEvent
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
     * Total amount of Mina contributed
     */
    @state(UInt64)
    public totalContributedMina = State<UInt64>();

    /**
     * The state of the previously processed actions
     */
    @state(Field)
    public fromActionState = State<Field>();

    @method
    configureSaleParams(fairsaleParams0: SaleParams, fairsaleParams1: SaleParams, adminSignature: Signature) {
        // check if  params is aligned with the existing ones
        const hash0 = fairsaleParams0.hash();
        const hash1 = fairsaleParams1.hash();

        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce= Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?

        fairsaleParams1.minimumBuy.assertLessThanOrEqual(fairsaleParams1.maximumBuy);
        fairsaleParams1.startTime.assertLessThan(fairsaleParams1.endTime);

        this.self.account.balance.assertBetween(fairsaleParams1.totalSaleSupply, UInt64.MAXINT());

        this.saleParamsHash.set(hash1);
        this.vestingParamsHash.set(fairsaleParams1.vestingParamsHash());

        this.emitEvent('configureSaleParams', new SaleParamsConfigurationEvent({
            saleParams: fairsaleParams1,
            tokenId: this.tokenId
        }));
    }

    /**
     * for user contribution
     * @param contributorAddress receiver address
     * @param minaAmount MINA amount
     */
    @method
    contribute(fairsaleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64, membershipMerkleWitness: MembershipMerkleWitness, leafIndex: Field) {
        // check  params
        this.saleParamsHash.getAndRequireEquals().assertEquals(
            fairsaleParams.hash()
        );

        // check network timestamp
        this.network.timestamp.assertBetween(fairsaleParams.startTime, fairsaleParams.endTime);

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(fairsaleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(fairsaleParams.maximumBuy);

        // check whitelist
        const leaf = Provable.if(
            fairsaleParams.whitelistTreeRoot.equals(Field(0n)),
            Field(0),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(fairsaleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const MinaAU = AccountUpdate.create(this.address);
        MinaAU.balance.addInPlace(minaAmount);

        // emit actions
        const fairSaleContribution = new SaleContribution({
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            tokenId: this.tokenId,
            minaAmount: minaAmount
        });
        this.reducer.dispatch(fairSaleContribution);

        // emit events
        this.emitEvent('contribute', fairSaleContribution);
    }

    /**
     * 
     * @param fairsaleParams 
     * @param adminSignature 
     */
    @method
    maintainContributors(fairsaleParams: SaleParams, fairSaleRollupProof: SaleRollupProof) {
        // check if  params is aligned with the existing ones
        const hash0 = fairsaleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        this.network.timestamp.assertBetween(fairsaleParams.endTime, UInt64.MAXINT());

        this.account.actionState.assertEquals(
            fairSaleRollupProof.publicOutput.target.currentActionsHash
        );

        fairSaleRollupProof.verify();
        fairSaleRollupProof.publicOutput.source.currentActionsHash.assertEquals(this.fromActionState.getAndRequireEquals());
        fairSaleRollupProof.publicOutput.source.membershipTreeRoot.assertEquals(this.contributorTreeRoot.getAndRequireEquals());
        fairSaleRollupProof.publicOutput.source.currentMinaAmount.assertEquals(this.totalContributedMina.getAndRequireEquals());

        this.fromActionState.set(fairSaleRollupProof.publicOutput.target.currentActionsHash);
        this.contributorTreeRoot.set(fairSaleRollupProof.publicOutput.target.membershipTreeRoot);
        this.totalContributedMina.set(fairSaleRollupProof.publicOutput.target.currentMinaAmount);


        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
    }

    /**
     * need go back to 'TokeniZkPrivateSale.approveTransferCallbackWithVesting()' for approval and transfer
     * @param fairsaleParams 
     * @param fairSaleContribution 
     * @param membershipMerkleWitness 
     * @param leafIndex 
     */
    @method
    claimTokens(fairsaleParams: SaleParams, fairSaleContribution: SaleContribution, membershipMerkleWitness: MembershipMerkleWitness, leafIndex: Field) {
        // check if  params is aligned with the existing ones
        const hash0 = fairsaleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        this.network.timestamp.assertBetween(fairsaleParams.endTime, UInt64.MAXINT());

        const hash = fairSaleContribution.hash();
        const root = membershipMerkleWitness.calculateRoot(hash, leafIndex);
        this.contributorTreeRoot.getAndRequireEquals().assertEquals(root);

        const totalMina = this.totalContributedMina.getAndRequireEquals();
        const totalSupply = fairsaleParams.totalSaleSupply;

        this.self.balance.subInPlace(totalSupply.div(totalMina).mul(fairSaleContribution.minaAmount));
    }
}

