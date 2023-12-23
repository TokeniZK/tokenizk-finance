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
    TokenId,
    Bool,
} from 'o1js';
import { MembershipMerkleWitness } from '@tokenizk/types';

import { STANDARD_TREE_INIT_ROOT_16 } from './constants';
import { SaleRollupProof } from './sale-rollup-prover';
import { SaleContribution,SaleParams, SaleParamsConfigurationEvent, ContributionEvent } from './sale-models';
import { SaleContributorMembershipWitnessData, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './merkle_witness';
import { RedeemAccount } from './TokeniZkUser';



export class ClaimTokenEvent extends Struct({
    presaleContribution: SaleContribution
}) { }


export class TokeniZkPresale extends SmartContract {

    deployZkApp(presaleParams: SaleParams, contributorTreeRoot: Field) {
        super.deploy();

        /*
        const presaleParams = new PresaleParams({
            tokeniZkBasicTokenAddress: PublicKey.empty(),
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
            vestingPeriod: UInt32.from(0), // 0 is not allowed, default value is 1
            vestingIncrement: UInt64.from(0)
        });
        */
        this.presaleParamsHash.set(presaleParams.hash());
        this.vestingParamsHash.set(presaleParams.vestingParamsHash());
        this.fromActionState.set(Reducer.initialActionState);
        // this.contributorTreeRoot.set(STANDARD_TREE_INIT_ROOT_16);
        this.contributorTreeRoot.set(contributorTreeRoot);

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            access: Permissions.proofOrSignature(),
            setVerificationKey: Permissions.proof()
        });
    }

    reducer = Reducer({ actionType: SaleContribution });

    events = {
        contribute: ContributionEvent,
        configureSaleParams: SaleParamsConfigurationEvent,
        claimToken: ClaimTokenEvent,
    }

    /**
     * the hash of configured presale parameters
     */
    @state(Field)
    public presaleParamsHash = State<Field>();

    /**
     * the hash of configured presale vesting parameters
     */
    @state(Field)
    public vestingParamsHash = State<Field>();

    /**
     * Total distributed tokens
     */
    @state(UInt64)
    public totalDistributed = State<UInt64>();

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
    configureSaleParams(presaleParams0: SaleParams, presaleParams1: SaleParams, adminSignature: Signature) {
        // cannot be changed after ('startTime' - 60 * 60 * 1000)
        this.network.timestamp.assertBetween(presaleParams0.startTime.sub(60 * 60 * 1000), UInt64.MAXINT());

        // check if presale params is aligned with the existing ones
        const hash0 = presaleParams0.hash();
        const hash1 = presaleParams1.hash();

        presaleParams0.tokenAddress.assertEquals(presaleParams1.tokenAddress);
        presaleParams0.totalSaleSupply.assertEquals(presaleParams1.totalSaleSupply);

        this.network.timestamp.assertBetween(presaleParams1.startTime.sub(60 * 60 * 1000), UInt64.MAXINT());

        this.presaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce = Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?

        presaleParams1.softCap.mul(4).assertGreaterThanOrEqual(presaleParams1.hardCap);
        presaleParams1.minimumBuy.assertLessThanOrEqual(presaleParams1.maximumBuy);
        presaleParams1.startTime.assertLessThan(presaleParams1.endTime.sub(5 * 10 * 60 * 1000));
        presaleParams1.cliffTime.assertGreaterThanOrEqual(UInt32.from(1));

        // check totalPresaleSupply is always lessThan Or EqualTo the balance of 'token account'
        /*
        const valueChange = Provable.if(presaleParams1.totalPresaleSupply.greaterThan(presaleParams0.totalPresaleSupply),
            presaleParams1.totalPresaleSupply.sub(presaleParams0.totalPresaleSupply),
            presaleParams0.totalPresaleSupply.sub(presaleParams1.totalPresaleSupply));
        const valueChange1 = valueChange.mul(2);
        const valueChangeX = Provable.if(presaleParams1.totalPresaleSupply.greaterThan(presaleParams0.totalPresaleSupply), valueChange1, valueChange);
        const valueChangeY = Provable.if(presaleParams1.totalPresaleSupply.lessThan(presaleParams0.totalPresaleSupply), valueChange1, valueChange);
        this.self.balance.addInPlace(valueChangeX);// TODO for simplify, check if this method could accept negative value?
        this.self.balance.subInPlace(valueChangeY);
        */
        this.self.account.balance.assertBetween(presaleParams1.totalSaleSupply, UInt64.MAXINT());

        this.presaleParamsHash.set(hash1);
        this.vestingParamsHash.set(presaleParams1.vestingParamsHash());

        this.emitEvent('configureSaleParams', new SaleParamsConfigurationEvent({
            saleParams: presaleParams1,
            tokenId: this.tokenId
        }));
    }

    /**
     * for user contribution
     * @param contributorAddress receiver address
     * @param minaAmount MINA amount
     */
    @method
    contribute(presaleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64, membershipMerkleWitness: MembershipMerkleWitness, leafIndex: Field) {
        // check presale params
        this.presaleParamsHash.getAndRequireEquals().assertEquals(
            presaleParams.hash()
        );
        // check network timestamp
        this.network.timestamp.assertBetween(presaleParams.startTime, presaleParams.endTime);

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(presaleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(presaleParams.maximumBuy);

        // check if exceed presale_token_account balance
        const toPurchaseTokenAmount = minaAmount.mul(presaleParams.saleRate);
        // TODO do we really need this check ?? or indirectly check it by 'this.balance.subInPlace' ?
        this.account.balance.assertBetween(toPurchaseTokenAmount, UInt64.MAXINT());

        // check whitelist
        const leaf = Provable.if(
            presaleParams.whitelistTreeRoot.equals(Field(0n)),
            Field(0),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(presaleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const presaleMinaAU = AccountUpdate.create(this.address);
        presaleMinaAU.balance.addInPlace(minaAmount);

        // emit actions
        const privateSaleContribution = new SaleContribution({
            saleContractAddress: this.address,
            contributorAddress: contributorAddress,
            tokenId: this.tokenId,
            minaAmount: minaAmount
        });
        this.reducer.dispatch(privateSaleContribution);

        // emit events
        this.emitEvent('contribute', new ContributionEvent({
            address: contributorAddress,
            tokenId: this.tokenId,
            minaAmount: minaAmount,
            tokenAmount: toPurchaseTokenAmount
        }));
    }

    /**
     * 
     * @param presaleParams 
     * @param adminSignature 
     */
    @method
    maintainContributors(presaleParams: SaleParams, presaleRollupProof: SaleRollupProof) {
        // check if presale params is aligned with the existing ones
        const hash0 = presaleParams.hash();
        this.presaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(presaleParams.endTime, UInt64.MAXINT());

        // check actionState
        this.account.actionState.assertEquals(
            presaleRollupProof.publicOutput.target.currentActionsHash
        );

        // check softCap
        presaleRollupProof.publicOutput.target.currentMinaAmount.assertGreaterThanOrEqual(presaleParams.softCap);

        // check proof
        presaleRollupProof.verify();

        // check source is aligned with zkApp onchain states
        presaleRollupProof.publicOutput.source.currentActionsHash.assertEquals(this.fromActionState.getAndRequireEquals());
        presaleRollupProof.publicOutput.source.membershipTreeRoot.assertEquals(this.contributorTreeRoot.getAndRequireEquals());
        presaleRollupProof.publicOutput.source.currentMinaAmount.assertEquals(this.totalContributedMina.getAndRequireEquals());

        this.fromActionState.set(presaleRollupProof.publicOutput.target.currentActionsHash);
        this.contributorTreeRoot.set(presaleRollupProof.publicOutput.target.membershipTreeRoot);
        this.totalContributedMina.set(presaleRollupProof.publicOutput.target.currentMinaAmount);

        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
    }

    /**
     * need go back to 'TokeniZkPrivateSale.approveTransferCallbackWithVesting()' for approval and transfer, which means each address could contribute only once.
     * @param presaleParams 
     * @param presaleContribution 
     * @param contributorMerkleWitness 
     * @param leafIndex 
     */
    @method
    claimTokens(presaleParams: SaleParams, presaleContribution: SaleContribution, contributorMerkleWitness: MembershipMerkleWitness, leafIndex: Field) {
        // check if presale params is aligned with the existing ones
        const hash0 = presaleParams.hash();
        this.presaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(presaleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalMina = this.totalContributedMina.getAndRequireEquals();
        totalMina.assertGreaterThanOrEqual(presaleParams.softCap);

        // check contributorMerkleWitness
        const hash = presaleContribution.hash();
        const root = contributorMerkleWitness.calculateRoot(hash, leafIndex);
        this.contributorTreeRoot.getAndRequireEquals().assertEquals(root);

        this.self.balance.subInPlace(presaleContribution.minaAmount.mul(presaleParams.saleRate));

        this.emitEvent('claimToken', new ClaimTokenEvent({
            presaleContribution: presaleContribution
        }));
    }

    /**
     * if the contributed MINA amount is less than softcap.
     * @param presaleParams 
     * @param contributorAddress 
     * @param minaAmount 
     * @param contributorMerkleWitness witness based on the 'contributor' tree root
     * @param leafIndex 
     */
    @method
    redeemCheck(presaleParams: SaleParams,
        presaleContributorMembershipWitnessData: SaleContributorMembershipWitnessData) {

        // check if presale params is aligned with the existing ones
        const hash0 = presaleParams.hash();
        this.presaleParamsHash.getAndRequireEquals().assertEquals(hash0);

        this.network.timestamp.assertBetween(presaleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalContributedMina = this.totalContributedMina.getAndRequireEquals();
        totalContributedMina.assertLessThan(presaleParams.softCap); // sub 10 ** -9 MINA, i.e. lessThan softCap

        // check whitelist
        presaleContributorMembershipWitnessData.checkMembershipAndAssert(presaleParams.whitelistTreeRoot);
    }
}

export class RedeemEvent extends Struct({
    presaleContribution: SaleContribution
}) { }

export class PresaleMinaFundHolder extends SmartContract {

    deployZkApp(tokenContractAddress: PublicKey) {
        super.deploy();

        this.tokenContractAddress.set(tokenContractAddress);

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            access: Permissions.proofOrSignature(),
        });
    }

    events = {
        redeem: RedeemEvent
    }

    @state(PublicKey)
    public tokenContractAddress = State<PublicKey>();

    /**
     * redeem MINA back from sale contract account
     * @param presaleParams 
     * @param presaleContributorMembershipWitnessData 
     * @param lowLeafWitness 
     * @param oldNullWitness 
     */
    @method
    redeem(presaleParams: SaleParams,
        presaleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {

        const saleContract = new TokeniZkPresale(this.address, TokenId.derive(this.tokenContractAddress.getAndRequireEquals()));
        // check if meet redeeming conditions
        saleContract.redeemCheck(presaleParams, presaleContributorMembershipWitnessData);

        const presaleContribution = presaleContributorMembershipWitnessData.leafData;
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
            presaleContribution
        }));
    }
}
