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
import { SaleRollupProof } from './sale-rollup-prover';
import { SaleContribution, SaleParams, SaleParamsConfigurationEvent, ContributionEvent, RedeemEvent } from './sale-models';
import { WhitelistMembershipMerkleWitness, SaleContributorMembershipWitnessData, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './sale-models';
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
        this.saleParamsHash.set(presaleParams.hash());
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
        configureSaleParams: SaleParamsConfigurationEvent,
        contribute: ContributionEvent,
        claimToken: ClaimTokenEvent,
    }

    /**
     * the hash of configured presale parameters
     */
    @state(Field)
    public saleParamsHash = State<Field>();

    /**
     * the hash of configured presale vesting parameters
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
     * Total distributed tokens
     */
    @state(UInt64)
    public totalDistributed = State<UInt64>();

    /**
     * Total amount of Mina contributed
     */
    @state(UInt64)
    public totalContributedMina = State<UInt64>();

    @method
    configureSaleParams(saleParams0: SaleParams, saleParams1: SaleParams, adminSignature: Signature) {
        // cannot be changed after ('startTime' - 60 * 60 * 1000)
        this.network.timestamp.assertBetween(saleParams0.startTime.sub(60 * 60 * 1000), UInt64.MAXINT());

        // check if presale params is aligned with the existing ones
        const hash0 = saleParams0.hash();
        const hash1 = saleParams1.hash();

        saleParams0.tokenAddress.assertEquals(saleParams1.tokenAddress);
        saleParams0.totalSaleSupply.assertEquals(saleParams1.totalSaleSupply);

        this.network.timestamp.assertBetween(saleParams1.startTime.sub(60 * 60 * 1000), UInt64.MAXINT());

        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        const nonce = this.account.nonce.getAndRequireEquals();
        // verify signature of admin
        adminSignature.verify(this.address, [hash0, hash1, ...nonce.toFields()]);
        // incrementNonce to avoid replay attack of adminSignature
        this.self.body.incrementNonce = Bool(true);

        // TODO With all parameters of Unsigned Integer type, do we still need check if they are greater than 0?

        saleParams1.softCap.mul(4).assertGreaterThanOrEqual(saleParams1.hardCap);
        saleParams1.minimumBuy.assertLessThanOrEqual(saleParams1.maximumBuy);
        saleParams1.startTime.assertLessThan(saleParams1.endTime.sub(5 * 10 * 60 * 1000));
        saleParams1.cliffTime.assertGreaterThanOrEqual(UInt32.from(1));

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
        this.self.account.balance.assertBetween(saleParams1.totalSaleSupply, UInt64.MAXINT());

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
    contribute(saleParams: SaleParams, contributorAddress: PublicKey, minaAmount: UInt64,
        membershipMerkleWitness: WhitelistMembershipMerkleWitness, leafIndex: Field) {
        // check presale params
        this.saleParamsHash.getAndRequireEquals().assertEquals(
            saleParams.hash()
        );
        // check network timestamp
        this.network.timestamp.assertBetween(saleParams.startTime, saleParams.endTime);

        // check [minimumBuy, maximumBuy]
        minaAmount.assertGreaterThanOrEqual(saleParams.minimumBuy);
        minaAmount.assertLessThanOrEqual(saleParams.maximumBuy);

        // check if exceed presale_token_account balance
        const toPurchaseTokenAmount = minaAmount.div(10 ** 9).mul(saleParams.saleRate);
        // TODO do we really need this check ?? or indirectly check it by 'this.balance.subInPlace' ?
        this.account.balance.assertBetween(toPurchaseTokenAmount, UInt64.MAXINT());

        // check whitelist
        const leaf = Provable.if(
            saleParams.whitelistTreeRoot.equals(Field(0n)),
            Field(0),
            Poseidon.hash(contributorAddress.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(saleParams.whitelistTreeRoot);

        const contributorMinaAU = AccountUpdate.createSigned(contributorAddress);
        contributorMinaAU.balance.subInPlace(minaAmount);
        const presaleMinaAU = AccountUpdate.create(this.address);
        presaleMinaAU.balance.addInPlace(minaAmount);

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
            tokenAmount: toPurchaseTokenAmount
        }));
    }

    /**
     * 
     * @param saleParams 
     * @param adminSignature 
     */
    @method
    maintainContributors(saleParams: SaleParams, saleRollupProof: SaleRollupProof) {
        // check if presale params is aligned with the existing ones
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

        ///////////////////////////////////////////////////////
        // transfer partial MINA-fee to TokeniZK platform
        // TODO at next version TODO
        ///////////////////////////////////////////////////////
    }

    /**
     * need go back to 'TokeniZkPrivateSale.approveTransferCallbackWithVesting()' for approval and transfer, which means each address could contribute only once.
     * @param saleParams 
     * @param saleContribution 
     * @param contributorMerkleWitness 
     * @param leafIndex 
     */
    @method
    claimTokens(saleParams: SaleParams,
        saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {
        // check if presale params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        // check endTime
        this.network.timestamp.assertBetween(saleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalMina = this.totalContributedMina.getAndRequireEquals();
        totalMina.assertGreaterThanOrEqual(saleParams.softCap);

        // check contributorMerkleWitness
        saleContributorMembershipWitnessData.checkMembershipAndAssert(this.contributorTreeRoot.getAndRequireEquals());

        const saleContribution = saleContributorMembershipWitnessData.leafData;
        const contributorAddress = saleContribution.contributorAddress;

        this.self.balance.subInPlace(saleContribution.minaAmount.div(10 ** 9).mul(saleParams.saleRate));

        const redeemAccount = new RedeemAccount(contributorAddress);// MINA account
        redeemAccount.updateState(
            saleContribution.hash(),
            lowLeafWitness,
            oldNullWitness
        );

        this.emitEvent('claimToken', new ClaimTokenEvent({
            presaleContribution: saleContribution
        }));
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
    claimRedeemCheck(saleParams: SaleParams,
        saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData) {

        // check if presale params is aligned with the existing ones
        const hash0 = saleParams.hash();
        this.saleParamsHash.getAndRequireEquals().assertEquals(hash0);

        this.network.timestamp.assertBetween(saleParams.endTime, UInt64.MAXINT());

        // check softcap
        const totalContributedMina = this.totalContributedMina.getAndRequireEquals();
        totalContributedMina.assertLessThan(saleParams.softCap); // sub 10 ** -9 MINA, i.e. lessThan softCap

        // check membership in contributor tree
        saleContributorMembershipWitnessData.checkMembershipAndAssert(this.contributorTreeRoot.getAndRequireEquals());
    }
}

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
     * @param saleParams 
     * @param saleContributorMembershipWitnessData 
     * @param lowLeafWitness 
     * @param oldNullWitness 
     */
    @method
    redeem(saleParams: SaleParams,
        saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {

        const saleContract = new TokeniZkPresale(this.address, TokenId.derive(this.tokenContractAddress.getAndRequireEquals()));
        // check if meet redeeming conditions
        saleContract.claimRedeemCheck(saleParams, saleContributorMembershipWitnessData);

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
