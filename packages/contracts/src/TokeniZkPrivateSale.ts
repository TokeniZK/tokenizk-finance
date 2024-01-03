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
    TokenId,
} from 'o1js';
import { STANDARD_TREE_INIT_ROOT_12, STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { SaleRollupProof } from './sale-rollup-prover';
import { ContributionEvent, SaleContribution, SaleParams, SaleParamsConfigurationEvent } from './sale-models';
import { ContributorsMembershipMerkleWitness, SaleContributorMembershipWitnessData, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './sale-models';
import { RedeemAccount } from './TokeniZkUser';
import { RedeemEvent } from './sale-models';

export class TokeniZkPrivateSale extends SmartContract {

    init() {
        super.init();

        this.saleParamsHash.set(new SaleParams({
            tokenAddress: PublicKey.empty(),// no need at private sale
            totalSaleSupply: UInt64.from(0),// no need at private sale
            saleRate: UInt64.from(0),// no need at private sale
            whitelistTreeRoot: STANDARD_TREE_INIT_ROOT_12,
            softCap: UInt64.from(0),// no need at private sale
            hardCap: UInt64.from(0),// no need at private sale
            minimumBuy: UInt64.from(10),
            maximumBuy: UInt64.from(50),
            startTime: UInt64.from(new Date().getTime()),
            endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
            cliffTime: UInt32.from(1),// // !!vest project team on recieved MINA!!
            cliffAmountRate: UInt64.from(0),
            vestingPeriod: UInt32.from(1), // default value is 1
            vestingIncrement: UInt64.from(0)
        }).hash());

        this.fromActionState.set(Reducer.initialActionState);
        this.contributorTreeRoot.set(STANDARD_TREE_INIT_ROOT_16);
        this.totalContributedMina.set(UInt64.from(0));

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            receive: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
    }

    reducer = Reducer({ actionType: SaleContribution });

    events = {
        configureSaleParams: SaleParamsConfigurationEvent,
        contribute: ContributionEvent,
        redeem: RedeemEvent
    }

    /**
     * the hash of configured privateSale parameters
     */
    @state(Field)
    public saleParamsHash = State<Field>();

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
    configureSaleParams(saleParams0: SaleParams, saleParams1: SaleParams, adminSignature: Signature) {
        // cannot be changed after ('startTime' - 60 * 60 * 1000)
        this.network.timestamp.assertBetween(saleParams0.startTime.sub(60 * 60 * 1000), UInt64.MAXINT());

        // check if privateSale params is aligned with the existing ones
        const hash0 = saleParams0.hash();
        const hash1 = saleParams1.hash();

        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce = Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?
        saleParams1.tokenAddress.assertEquals(PublicKey.empty());// no need at private sale
        saleParams1.totalSaleSupply.assertEquals(UInt64.from(0));// no need at private sale
        saleParams1.saleRate.assertEquals(UInt64.from(0));// no need at private sale
        saleParams1.hardCap.assertLessThanOrEqual(saleParams1.softCap.mul(4));
        saleParams1.minimumBuy.assertLessThanOrEqual(saleParams1.maximumBuy);
        saleParams1.startTime.assertLessThan(saleParams1.endTime);
        saleParams1.vestingPeriod.assertGreaterThanOrEqual(UInt32.from(1));

        this.saleParamsHash.set(hash1);

        this.emitEvent('configureSaleParams', new SaleParamsConfigurationEvent({
            saleParams: saleParams1,
            tokenId: TokenId.default
        }));
    }

    /**
     * for user contribution
     * @param contributorAddress receiver address
     * @param minaAmount MINA amount
     */
    @method
    contribute(saleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64, membershipMerkleWitness: ContributorsMembershipMerkleWitness, leafIndex: Field) {
        // check privateSale params
        this.saleParamsHash.getAndRequireEquals().assertEquals(
            saleParams.hash()
        );

        // check startTime
        this.network.timestamp.assertBetween(saleParams.startTime, saleParams.endTime);

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(saleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(saleParams.maximumBuy);

        // check whitelist
        const leaf = Provable.if(
            saleParams.whitelistTreeRoot.equals(Field(0n)),
            Field(0n),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(saleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const privateSaleMinaAU = AccountUpdate.create(this.address);
        privateSaleMinaAU.balance.addInPlace(minaAmount);

        // emit actions
        const saleContribution = new SaleContribution({
            tokenAddress: saleParams.tokenAddress,
            tokenId: TokenId.default,
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            minaAmount: minaAmount,
        });
        this.reducer.dispatch(saleContribution);

        // emit events
        this.emitEvent('contribute', new ContributionEvent({
            tokenAddress: saleParams.tokenAddress,
            tokenId: TokenId.default,
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
    maintainContributors(saleParams: SaleParams, saleRollupProof: SaleRollupProof) {
        // check if privateSale params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(saleParams.endTime, UInt64.MAXINT());

        // check actionState
        this.account.actionState.assertEquals(
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

        // vesting project team's MINA
        const initialMinimumBalance = saleRollupProof.publicOutput.target.currentMinaAmount;
        const cliffAmount = UInt64.from(initialMinimumBalance.div(saleParams.cliffAmountRate));
        this.self.account.timing.set({
            initialMinimumBalance,
            cliffTime: saleParams.cliffTime,
            cliffAmount,
            vestingPeriod: saleParams.vestingPeriod,
            vestingIncrement: saleParams.vestingIncrement
        });

        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
    }

    /**
     * if the contributed MINA amount is less than softcap.
     * @param saleParams 
     * @param contributorAddress 
     * @param minaAmount 
     * @param contributorMerkleWitness witness based on the 'contributor' tree root
     * @param leafIndex 
     */
    @method
    redeem(saleParams: SaleParams,
        saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {
        // check if privateSale params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(saleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalMina = this.totalContributedMina.getAndRequireEquals();
        totalMina.assertLessThan(saleParams.softCap); // sub 10 ** -9 MINA, i.e. lessThan softCap

        // check membership in contributor tree
        saleContributorMembershipWitnessData.checkMembershipAndAssert(this.contributorTreeRoot.getAndRequireEquals());

        const presaleContribution = saleContributorMembershipWitnessData.leafData;
        const contributorAddress = presaleContribution.contributorAddress;
        const minaAmount = presaleContribution.minaAmount;

        const redeemAccount = new RedeemAccount(contributorAddress);// MINA account
        redeemAccount.updateState(
            presaleContribution.hash(),
            lowLeafWitness,
            oldNullWitness
        );

        this.send({ to: contributorAddress, amount: minaAmount });

        this.emitEvent('redeem', new RedeemEvent({
            saleContribution: presaleContribution
        }));
    }
}
