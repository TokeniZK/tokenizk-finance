import {
    State,
    state,
    UInt64,
    SmartContract,
    method,
    Permissions,
    Field,
    Poseidon,
    TokenId,
    Provable,
    TransactionVersion,
} from 'o1js';
import { AirdropClaim, AirdropParams, WhitelistMembershipMerkleWitness, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './sale-models';
import { RedeemAccount } from './TokeniZkUser';
import { WHITELIST_TREE_ROOT } from './constants';


export class TokeniZkAirdrop extends SmartContract {

    /*
    events = {
        claimToken: AirdropClaimTokenEvent
    }
    */

    deployZkApp(airdropParams: AirdropParams) {
        super.deploy();

        this.airdropParamsHash.set(airdropParams.hash());
        this.vestingParamsHash.set(airdropParams.vestingParamsHash());

        this.account.permissions.set({
            ...Permissions.default(),
            editState: Permissions.proof(),
            send: Permissions.proof(),
            access: Permissions.proofOrSignature(),
            setVerificationKey: { auth: Permissions.proof(), txnVersion: TransactionVersion.current() }
        });
    }


    /**
     * the hash of configured airdrop parameters
     */
    @state(Field)
    public airdropParamsHash = State<Field>();

    /**
     * the hash of configured airdrop vesting parameters
     */
    @state(Field)
    public vestingParamsHash = State<Field>();

    /**
     * need go back to 'TokeniZkPrivateSale.approveTransferCallbackWithVesting()' for approval and transfer, which means each address could contribute only once.
     * @param airdropParams 
     * @param saleContribution 
     * @param contributorMerkleWitness 
     * @param leafIndex 
     */
    @method
    async claimTokens(airdropParams: AirdropParams,
        membershipMerkleWitness: WhitelistMembershipMerkleWitness, leafIndex: Field,
        lowLeafWitness: UserLowLeafWitnessData,
        oldNullWitness: UserNullifierMerkleWitness) {

        // check if airdrop params is aligned with the existing ones
        const existingHash = this.airdropParamsHash.getAndRequireEquals();
        const hash0 = airdropParams.hash();
        Provable.log('existingHash: ', existingHash);
        Provable.log('airdropParams.hash(): ', hash0);
        existingHash.assertEquals(hash0);

        // check startTime
        // ~this.network.blockchainLength.requireBetween(airdropParams.startTime, UInt32.MAXINT());
        // this.network.timestamp.requireBetween(airdropParams.startTime, UInt64.MAXINT());TODO this.network.timestamp causes "the permutation was not constructed correctly: final value" error

        // check whitelist
        const leaf = Provable.if(
            airdropParams.whitelistTreeRoot.equals(WHITELIST_TREE_ROOT),
            Field(0),
            Poseidon.hash(this.sender.getUnconstrained().toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(airdropParams.whitelistTreeRoot);

        const tokenAmount = airdropParams.totalAirdropSupply.div(airdropParams.totalMembersNumber);
        Provable.log('airdropClaim.tokenAmount: ', tokenAmount);
        const airdropClaim = new AirdropClaim({
            tokenAddress: airdropParams.tokenAddress,
            tokenId: TokenId.derive(airdropParams.tokenAddress),
            airdropContractAddress: this.address,
            claimerAddress: this.sender.getUnconstrained(),
            tokenAmount
        });
        const redeemAccount = new RedeemAccount(this.sender.getUnconstrained());// MINA account
        await redeemAccount.updateState(
            airdropClaim.hash(),
            lowLeafWitness,
            oldNullWitness
        );

        this.self.balance.subInPlace(airdropParams.totalAirdropSupply.div(airdropParams.totalMembersNumber));

        /*
        this.emitEvent('claimToken', new AirdropClaimTokenEvent({
            airdropClaim
        }));
        */
    }
}

