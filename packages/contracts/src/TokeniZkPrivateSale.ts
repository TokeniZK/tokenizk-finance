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
import { MembershipMerkleWitness } from '@tokenizk/types';
import { STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { SaleRollupProof } from './sale-rollup-prover';
import { SaleContribution, SaleParams } from './sale-models';

import { SaleContributorMembershipWitnessData, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './merkle_witness';
import { RedeemAccount } from './TokeniZkUser';


export class PrivateSaleParamsConfigurationEvent extends Struct(SaleParams) { }


export class TokeniZkPrivateSale extends SmartContract {

    init() {
        super.init();

        this.privateSaleParamsHash.set(new SaleParams({
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
            vestingPeriod: UInt32.from(0), // 0 is not allowed, default value is 1
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
        privateSaleContribution: SaleContribution,
        configurePrivateSaleParams: PrivateSaleParamsConfigurationEvent
    }

    /**
     * the hash of configured privateSale parameters
     */
    @state(Field)
    public privateSaleParamsHash = State<Field>();

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
    configurePrivateSaleParams(privateSaleParams0: SaleParams, privateSaleParams1: SaleParams, adminSignature: Signature) {
        // check if privateSale params is aligned with the existing ones
        const hash0 = privateSaleParams0.hash();
        const hash1 = privateSaleParams1.hash();

        this.privateSaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce = Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?

        privateSaleParams1.minimumBuy.assertLessThanOrEqual(privateSaleParams1.maximumBuy);
        privateSaleParams1.startTime.assertLessThan(privateSaleParams1.endTime);
        privateSaleParams1.softCap.assertGreaterThanOrEqual(privateSaleParams1.hardCap.div(4));

        this.privateSaleParamsHash.set(hash1);

        this.emitEvent('configurePrivateSaleParams', new PrivateSaleParamsConfigurationEvent(privateSaleParams1));
    }

    /**
     * for user contribution
     * @param contributorAddress receiver address
     * @param minaAmount MINA amount
     */
    @method
    contribute(privateSaleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64, membershipMerkleWitness: MembershipMerkleWitness, leafIndex: Field) {
        // check privateSale params
        this.privateSaleParamsHash.getAndRequireEquals().assertEquals(
            privateSaleParams.hash()
        );

        // check network timestamp
        this.network.timestamp.assertBetween(privateSaleParams.startTime, privateSaleParams.endTime);

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(privateSaleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(privateSaleParams.maximumBuy);

        // check whitelist
        const leaf = Provable.if(
            privateSaleParams.whitelistTreeRoot.equals(Field(0n)),
            Field(0n),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(privateSaleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const privateSaleMinaAU = AccountUpdate.create(this.address);
        privateSaleMinaAU.balance.addInPlace(minaAmount);

        // emit actions
        const privateSaleContribution = new SaleContribution({
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            minaAmount: minaAmount,
            tokenId: TokenId.default
        });
        this.reducer.dispatch(privateSaleContribution);

        // emit events
        this.emitEvent('privateSaleContribution', privateSaleContribution);
    }

    /**
     * 
     * @param privateSaleParams 
     * @param adminSignature 
     */
    @method
    maintainContributors(privateSaleParams: SaleParams, privateSaleRollupProof: SaleRollupProof) {
        // check if privateSale params is aligned with the existing ones
        const hash0 = privateSaleParams.hash();
        this.privateSaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(privateSaleParams.endTime, UInt64.MAXINT());

        // check softCap
        privateSaleRollupProof.publicOutput.target.currentMinaAmount.assertGreaterThanOrEqual(privateSaleParams.softCap);

        // check actionState
        this.account.actionState.assertEquals(
            privateSaleRollupProof.publicOutput.target.currentActionsHash
        );

        // check proof
        privateSaleRollupProof.verify();

        // check source is aligned with zkApp onchain states
        privateSaleRollupProof.publicOutput.source.currentActionsHash.assertEquals(this.fromActionState.getAndRequireEquals());
        privateSaleRollupProof.publicOutput.source.membershipTreeRoot.assertEquals(this.contributorTreeRoot.getAndRequireEquals());
        privateSaleRollupProof.publicOutput.source.currentMinaAmount.assertEquals(this.totalContributedMina.getAndRequireEquals());

        this.fromActionState.set(privateSaleRollupProof.publicOutput.target.currentActionsHash);
        this.contributorTreeRoot.set(privateSaleRollupProof.publicOutput.target.membershipTreeRoot);
        this.totalContributedMina.set(privateSaleRollupProof.publicOutput.target.currentMinaAmount);

        // vesting project team's MINA
        const initialMinimumBalance = privateSaleRollupProof.publicOutput.target.currentMinaAmount;
        const cliffAmount = UInt64.from(initialMinimumBalance.div(privateSaleParams.cliffAmountRate));
        this.self.account.timing.set({
            initialMinimumBalance,
            cliffTime: privateSaleParams.cliffTime,
            cliffAmount,
            vestingPeriod: privateSaleParams.vestingPeriod,
            vestingIncrement: privateSaleParams.vestingIncrement
        });

        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
    }

    /**
     * if the contributed MINA amount is less than softcap.
     * @param privateSaleParams 
     * @param contributorAddress 
     * @param minaAmount 
     * @param contributorMerkleWitness witness based on the 'contributor' tree root
     * @param leafIndex 
     */
    @method
    redeem(privateSaleParams: SaleParams,
        privateSaleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {
        // check if privateSale params is aligned with the existing ones
        const hash0 = privateSaleParams.hash();
        this.privateSaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(privateSaleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalMina = this.totalContributedMina.getAndRequireEquals();
        totalMina.assertLessThan(privateSaleParams.softCap); // sub 10 ** -9 MINA, i.e. lessThan softCap

        // check membership in contributor tree
        privateSaleContributorMembershipWitnessData.checkMembershipAndAssert(this.contributorTreeRoot.getAndRequireEquals());

        const presaleContribution = privateSaleContributorMembershipWitnessData.leafData;
        const contributorAddress = presaleContribution.contributorAddress;
        const minaAmount = presaleContribution.minaAmount;

        const redeemAccount = new RedeemAccount(contributorAddress);// MINA account
        redeemAccount.updateState(
            presaleContribution.hash(),
            lowLeafWitness,
            oldNullWitness
        );

        this.send({ to: contributorAddress, amount: minaAmount });
    }
}
