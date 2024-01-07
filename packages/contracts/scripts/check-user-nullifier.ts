
import {
    isReady,
    method,
    Mina,
    AccountUpdate,
    PrivateKey,
    SmartContract,
    PublicKey,
    UInt64,
    Int64,
    Experimental,
    Permissions,
    DeployArgs,
    VerificationKey,
    TokenId,
    state,
    State,
    Field,
    Bool,
    Provable,
    UInt32,
    fetchAccount,
} from 'o1js';

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, STANDARD_TREE_INIT_ROOT_16, UserState, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_12, TokeniZkFairSale, TokeniZkPrivateSale, WHITELIST_TREE_HEIGHT, CONTRIBUTORS_TREE_HEIGHT, ContributorsMembershipMerkleWitness, TokeniZkAirdrop, AirdropParams, USER_NULLIFIER_TREE_HEIGHT, UserLowLeafWitnessData, UserNullifierMerkleWitness, AirdropClaim, updateNullifierRootAndNullStartIndex } from "../src";
import { getTestContext } from '../src/test_utils';
import { LeafData, PoseidonHasher, StandardIndexedTree, StandardTree, newTree } from '@tokenizk/merkle-tree';
import { Level } from 'level';
import { WhitelistMembershipMerkleWitness } from '../src';
import { MerkleTreeId } from '@tokenizk/types';

let basicTokenZkAppKey = PrivateKey.random()// (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //feePayerKey //Local.testAccounts[2].privateKey;
let basicTokenZkAppAddress = basicTokenZkAppKey.toPublicKey();

let airdropZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let airdropZkAppAddress = airdropZkAppKey.toPublicKey();

let redeemAccountZkAppKey = PrivateKey.random();
let redeemAccountZkAppAddress = redeemAccountZkAppKey.toPublicKey();

let whitelistDB = new Level<string, Buffer>('whitelist-db', { valueEncoding: 'buffer' });
const poseidonHasher = new PoseidonHasher();
const whitelistTree = await newTree(StandardTree,
    whitelistDB,
    poseidonHasher,
    `WHITELIST_TREE`,
    WHITELIST_TREE_HEIGHT);

await whitelistTree.appendLeaves([poseidonHasher.compressInputs(redeemAccountZkAppAddress.toFields())])
const whitelistTreeRoot = await whitelistTree.getRoot(true);
await whitelistTree.commit();

const airdropParams = new AirdropParams({
    tokenAddress: basicTokenZkAppAddress,

    totalAirdropSupply: UInt64.from(1000),

    totalMembersNumber: UInt64.from(3),

    /**
     * Whitelist Tree Root: default empty merkle tree root
     */
    whitelistTreeRoot,

    /** 
     * Start time stamp
     */
    startTime: UInt64.from(new Date().getTime()),

    cliffTime: UInt32.from(1),
    cliffAmountRate: UInt64.from(10),
    vestingPeriod: UInt32.from(1), // 0 is not allowed, default value is 1
    vestingIncrement: UInt64.from(10)
});
let userAssetDB = new Level<string, Buffer>('user-asset-db', { valueEncoding: 'buffer' });
const nullifierTree = await newTree(StandardIndexedTree,
    userAssetDB,
    poseidonHasher,
    `${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${redeemAccountZkAppAddress.toBase58()}`,
    USER_NULLIFIER_TREE_HEIGHT);

const tokenAmount = airdropParams.totalAirdropSupply.div(airdropParams.totalMembersNumber);
const airdropClaim = new AirdropClaim({
    tokenAddress: airdropParams.tokenAddress,
    tokenId: TokenId.derive(airdropParams.tokenAddress),
    airdropContractAddress: airdropZkAppAddress,
    claimerAddress: redeemAccountZkAppAddress,
    tokenAmount
});
console.log('airdropClaim.tokenAmount: ' + tokenAmount.toString());

console.log(`airdropClaim.hash(): ${airdropClaim.hash()}`);

console.log(`nullifierTree init root: ${await nullifierTree.getRoot(true)}`);
const targetIndx = nullifierTree.getNumLeaves(false);

const { index: predecessorIndex, alreadyPresent } = await nullifierTree.findIndexOfPreviousValue(airdropClaim.hash().toBigInt(), true);
const predecessorLeafData0 = await nullifierTree.getLatestLeafDataCopy(predecessorIndex, true)!;
const siblingPath = await nullifierTree.getSiblingPath(BigInt(predecessorIndex), true);
const lowLeafWitness = UserLowLeafWitnessData.fromJSON({
    index: `${predecessorIndex}`,
    siblingPath,
    leafData: {
        value: predecessorLeafData0.value.toString(),
        nextIndex: predecessorLeafData0.nextIndex.toString(),
        nextValue: predecessorLeafData0.nextValue.toString()
    }
}) as UserLowLeafWitnessData;

const predecessorLeafData = lowLeafWitness.leafData;
const predecessorIdx = lowLeafWitness.index;

console.info(`predecessor's index: ${predecessorIdx}`);
console.info(`predecessor: {value:${predecessorLeafData?.value}, nextValue:${predecessorLeafData?.nextValue}, nextIndex:${predecessorLeafData?.nextIndex}}`);

console.info(`before modify predecessor, nullifierTree Root: ${await nullifierTree.getRoot(true)}`);

const modifiedPredecessorLeafDataTmp: LeafData = {
    value: predecessorLeafData.value.toBigInt(),
    nextValue: airdropClaim.hash().toBigInt(),
    nextIndex: targetIndx
};
await nullifierTree.updateLeafWithNoValueCheck(modifiedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
console.info(`after modify predecessor, nullifierTree Root: ${await nullifierTree.getRoot(true)}`);

// obtain oldNullWitness
const oldNullWitness = await nullifierTree.getSiblingPath(BigInt(targetIndx), true);
console.info('obtain oldNullWitness: ' + JSON.stringify(oldNullWitness));

const revertedPredecessorLeafDataTmp: LeafData = {
    value: predecessorLeafData.value.toBigInt(),
    nextValue: predecessorLeafData.nextValue.toBigInt(),
    nextIndex: predecessorLeafData.nextIndex.toBigInt()
};
await nullifierTree.updateLeafWithNoValueCheck(revertedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
console.info(`after revert predecessor, nullifierTree Root: ${await nullifierTree.getRoot(true)}`);


const nullifierRoot = INDEX_TREE_INIT_ROOT_8;
const nullStartIndex = Field(targetIndx);
const nullifier = airdropClaim.hash();

updateNullifierRootAndNullStartIndex(nullifierRoot, nullStartIndex, nullifier, lowLeafWitness, oldNullWitness);
