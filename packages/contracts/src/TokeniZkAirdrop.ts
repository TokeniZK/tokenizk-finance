import {
    State,
    state,
    UInt64,
    SmartContract,
    method,
    PublicKey,
    Permissions,
    Field,
    Struct,
    UInt32,
    Poseidon,
    TokenId,
    Provable,
} from 'o1js';
import { VestingParams, WhitelistMembershipMerkleWitness, UserLowLeafWitnessData, UserNullifierMerkleWitness } from './sale-models';
import { RedeemAccount } from './TokeniZkUser';
import { TokeniZkFactory } from './TokeniZkFactory';
import { WHITELIST_TREE_ROOT } from './constants';


export class AirdropParams extends Struct({
    tokenAddress: PublicKey,

    totalAirdropSupply: UInt64,

    totalMembersNumber: UInt64,

    /**
     * Whitelist Tree Root: default empty merkle tree root
     */
    whitelistTreeRoot: Field,

    /** 
     * Start time stamp
     */
    startTime: UInt64,

    cliffTime: UInt32,
    cliffAmountRate: UInt64,
    vestingPeriod: UInt32, // 0 is not allowed, default value is 1
    vestingIncrement: UInt64
}) {
    hash() {
        return Poseidon.hash([
            ...this.tokenAddress.toFields(),
            ...this.totalAirdropSupply.toFields(),
            ...this.totalMembersNumber.toFields(),
            this.whitelistTreeRoot,
            ...this.startTime.toFields(),
            ...this.cliffTime.toFields(),
            ...this.cliffAmountRate.toFields(),
            ...this.vestingPeriod.toFields(),
            ...this.vestingIncrement.toFields(),
        ]
        );
    }

    vestingParamsHash() {
        return this.vestingParams().hash();
    }

    vestingParams() {
        return new VestingParams({
            cliffTime: this.cliffTime,
            cliffAmountRate: this.cliffAmountRate,
            vestingPeriod: this.vestingPeriod,
            vestingIncrement: this.vestingIncrement
        });
    }

    static fromDto(dto: {
        tokenAddress: string,
        totalAirdropSupply: number,
        totalMembersNumber: number,
        whitelistTreeRoot: string,

        startTime: number,

        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    }) {
        return new AirdropParams({
            tokenAddress: PublicKey.fromBase58(dto.tokenAddress),
            totalAirdropSupply: UInt64.from(dto.totalAirdropSupply),
            totalMembersNumber: UInt64.from(dto.totalMembersNumber),

            whitelistTreeRoot: Field(dto.whitelistTreeRoot),

            startTime: UInt64.from(dto.startTime),

            cliffTime: UInt32.from(dto.cliffTime),
            cliffAmountRate: UInt64.from(dto.cliffAmountRate),
            vestingPeriod: UInt32.from(dto.vestingPeriod), // 0 is not allowed, default value is 1
            vestingIncrement: UInt64.from(dto.vestingIncrement)
        });
    }
}

export class AirdropClaim extends Struct({
    tokenAddress: PublicKey,
    tokenId: TokenId,
    airdropContractAddress: PublicKey,
    claimerAddress: PublicKey,
    tokenAmount: UInt64,
}) {
    hash() {
        return Poseidon.hash([
            ...this.tokenAddress.toFields(),
            ...this.tokenId.toFields(),
            ...this.airdropContractAddress.toFields(),
            ...this.claimerAddress.toFields(),
            ...this.tokenAmount.toFields(),
        ]
        );
    }

    static fromDto(dto: {
        tokenAddress: string,
        tokenId: string,
        airdropContractAddress: string,
        claimerAddress: string,
        tokenAmount: number,
    }) {
        return new AirdropClaim({
            tokenAddress: PublicKey.fromBase58(dto.tokenAddress),
            tokenId: Field(dto.tokenId),
            airdropContractAddress: PublicKey.fromBase58(dto.airdropContractAddress),
            claimerAddress: PublicKey.fromBase58(dto.claimerAddress),
            tokenAmount: UInt64.from(dto.tokenAmount),
        });
    }
}

export class AirdropClaimTokenEvent extends Struct({
    airdropClaim: AirdropClaim
}) { }

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
            setVerificationKey: Permissions.proof()
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
    claimTokens(airdropParams: AirdropParams,
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
        this.network.timestamp.requireBetween(airdropParams.startTime, UInt64.MAXINT());

        // check whitelist
        const leaf = Provable.if(
            airdropParams.whitelistTreeRoot.equals(WHITELIST_TREE_ROOT),
            Field(0),
            Poseidon.hash(this.sender.toFields()))
        membershipMerkleWitness.calculateRoot(leaf, leafIndex).assertEquals(airdropParams.whitelistTreeRoot);

        const tokenAmount = airdropParams.totalAirdropSupply.div(airdropParams.totalMembersNumber);
        Provable.log('airdropClaim.tokenAmount: ', tokenAmount);
        const airdropClaim = new AirdropClaim({
            tokenAddress: airdropParams.tokenAddress,
            tokenId: TokenId.derive(airdropParams.tokenAddress),
            airdropContractAddress: this.address,
            claimerAddress: this.sender,
            tokenAmount
        });
        const redeemAccount = new RedeemAccount(this.sender);// MINA account
        redeemAccount.updateState(
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

