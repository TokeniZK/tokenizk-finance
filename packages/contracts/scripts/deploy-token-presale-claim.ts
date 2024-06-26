
import {
    Mina,
    AccountUpdate,
    PrivateKey,
    UInt64,
    TokenId,
    Field,
    Provable,
    UInt32,
    fetchAccount,
    Reducer,
    fetchLastBlock,
    Int64,
} from 'o1js';
import fs from "fs";

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, WHITELIST_TREE_HEIGHT, CONTRIBUTORS_TREE_HEIGHT, ContributorsMembershipMerkleWitness, TokeniZkAirdrop, USER_NULLIFIER_TREE_HEIGHT, UserLowLeafWitnessData, SaleContribution, SaleContributorMembershipWitnessData, SALE_ACTION_BATCH_SIZE, SaleActionBatch, SaleRollupState, TokenTransferEvent } from "../src";
import { getTestContext } from '../src/test_utils';
import { LeafData, PoseidonHasher, StandardIndexedTree, StandardTree, newTree } from '@tokenizk/merkle-tree';
import { Level } from 'level';
import { WhitelistMembershipMerkleWitness } from '../src';
import { MerkleTreeId } from '@tokenizk/types';

// ================
const ctx = getTestContext();
await ctx.initMinaNetwork();
// ================

// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKDrANogDMiondrfdHsCn6tiASsQKjAEezVNHutB2Bn9vJCCVJG2') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();
console.log('feePayer: ', feePayerKey.toBase58());
console.log('feePayerAddress: ', feePayer.toBase58());

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: feePayer });
}

let tokenFactoryZkAppKey = PrivateKey.random() //PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') // Local.testAccounts[1].privateKey;
let tokenFactoryZkAppAddress = tokenFactoryZkAppKey.toPublicKey();

let basicTokenZkAppKey = PrivateKey.random();// (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //feePayerKey //Local.testAccounts[2].privateKey;
let basicTokenZkAppAddress = basicTokenZkAppKey.toPublicKey();

let presaleZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let presaleZkAppAddress = presaleZkAppKey.toPublicKey();

let airdropZkAppKey = PrivateKey.random(); //Local.testAccounts[3].privateKey;
let airdropZkAppAddress = airdropZkAppKey.toPublicKey();

let redeemAccountZkAppKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEFvjSHcyJh95nmp14VcRZZt96EmRmjwzet3iogusSZFqWH59xV') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //Local.testAccounts[5].privateKey;
let redeemAccountZkAppAddress = redeemAccountZkAppKey.toPublicKey();

let redeemAccountZkAppKey2 = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKF2we8KCPGhwHcDUDocrDrcPKkKLjk62rUiqcuorDKFDavvNcmM') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //Local.testAccounts[5].privateKey;
let redeemAccountZkAppAddress2 = redeemAccountZkAppKey2.toPublicKey();

let platfromFeeRecieverKey = PrivateKey.random() //Local.testAccounts[6].privateKey;
let platfromFeeRecieverAddress = platfromFeeRecieverKey.toPublicKey();

console.log('platfromFeeRecieverKey: ', platfromFeeRecieverKey.toBase58());
console.log('platfromFeeRecieverAddress: ', platfromFeeRecieverAddress.toBase58());

console.log('tokenFactoryZkAppKey: ', tokenFactoryZkAppKey.toBase58());
console.log('tokenFactoryZkAppAddress: ', tokenFactoryZkAppAddress.toBase58());

console.log('basicTokenZkAppKey: ', basicTokenZkAppKey.toBase58());
console.log('basicTokenZkAppAddress: ', basicTokenZkAppAddress.toBase58());

console.log('presaleZkAppKey: ', presaleZkAppKey.toBase58());
console.log('presaleZkAppAddress: ', presaleZkAppAddress.toBase58());

console.log('airdropZkAppKey: ', airdropZkAppKey.toBase58());
console.log('airdropZkAppAddress: ', airdropZkAppAddress.toBase58());

console.log('userRedeemZkAppKey: ', redeemAccountZkAppKey.toBase58());
console.log('userRedeemZkAppAddress: ', redeemAccountZkAppAddress.toBase58());

console.log('userRedeemZkAppKey2: ', redeemAccountZkAppKey2.toBase58());
console.log('userRedeemZkAppAddress2: ', redeemAccountZkAppAddress2.toBase58());

console.log('-------------------------------------------');

let tx;

TokeniZkFactory.platfromFeeAddress = platfromFeeRecieverAddress;
TokeniZkFactory.tokeniZkFactoryAddress = tokenFactoryZkAppAddress;

console.time('compile (TokeniZkFactory)');
await TokeniZkFactory.compile();
console.timeEnd('compile (TokeniZkFactory)');

console.time('compile (TokeniZkBasicToken)');
let tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;

console.timeEnd('compile (TokeniZkBasicToken)');
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);

console.time('compile (SaleRollupProver)');
await SaleRollupProver.compile();
console.timeEnd('compile (SaleRollupProver)');

console.time('compile (TokeniZkPresale)');
const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
console.timeEnd('compile (TokeniZkPresale)');

console.time('compile (PresaleMinaFundHolder)');
await PresaleMinaFundHolder.compile();
const presaleMinaFundHolderVK = (await PresaleMinaFundHolder.compile()).verificationKey;
TokeniZkFactory.presaleMinaFundHolderVk = presaleMinaFundHolderVK;
console.timeEnd('compile (PresaleMinaFundHolder)');

console.time('compile (RedeemAccount)');
let redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');

const metaEnv = {
    VITE_MINA_NETWORK: "Berkeley",
    VITE_EXPLORER_URL: "https://minascan.io/devnet/zk-tx/",

    VITE_TOKENIZK_FACTORY_ADDR: tokenFactoryZkAppAddress.toBase58(),

    VITE_TOKENIZK_BASIC_TOKEN_VK: TokeniZkFactory.basicTokenVk.hash.toString(),
    VITE_TOKENIZK_BASIC_TOKEN_CREATION_FEE: 1,

    VITE_TOKENIZK_PRESALE_VK: TokeniZkFactory.presaleContractVk.hash.toString(),
    VITE_TOKENIZK_PRESALE_CREATION_FEE: 1,
    VITE_TOKENIZK_PRESALE_SERVICE_FEE_RATE: 10,
    VITE_TOKENIZK_PRESALE_MINA_FUND_HOLDER_VK: TokeniZkFactory.presaleMinaFundHolderVk.hash.toString(),

    VITE_TOKENIZK_FAIRSALE_VK: "17539417214210625958281318223941001599533520444554323923175772616556602275101",
    VITE_TOKENIZK_FAIRSALE_CREATION_FEE: 1,
    VITE_TOKENIZK_FAIRSALE_SERVICE_FEE_RATE: 10,
    VITE_TOKENIZK_PRIVATESALE_VK: "4336020902171883469746374749320150388196832995966644287313506059985478817805",
    VITE_TOKENIZK_PRIVATESALE_CREATION_FEE: 1,
    VITE_TOKENIZK_PRIVATESALE_SERVICE_FEE_RATE: 10,

    VITE_TOKENIZK_AIRDROP_VK: "20143490128670456148084503281839199030695599865951076260259159743873805669969",
    VITE_TOKENIZK_AIRDROP_CREATION_FEE: 10,

    VITE_TOKENIZK_REDEEM_ACCOUNT_VK: TokeniZkFactory.redeemAccountVk.hash.toString()
};

const launchpadParamDto = {
    basicTokenVk: metaEnv.VITE_TOKENIZK_BASIC_TOKEN_VK,
    basicTokenCreationFee: metaEnv.VITE_TOKENIZK_BASIC_TOKEN_CREATION_FEE * (10 ** 9),

    presaleContractVk: metaEnv.VITE_TOKENIZK_PRESALE_VK,
    presaleCreationFee: metaEnv.VITE_TOKENIZK_PRESALE_CREATION_FEE * (10 ** 9),
    presaleServiceFeeRate: metaEnv.VITE_TOKENIZK_PRESALE_SERVICE_FEE_RATE * (10 ** 9),
    presaleMinaFundHolderVk: metaEnv.VITE_TOKENIZK_PRESALE_MINA_FUND_HOLDER_VK,

    fairSaleContractVk: metaEnv.VITE_TOKENIZK_FAIRSALE_VK,
    fairSaleCreationFee: metaEnv.VITE_TOKENIZK_FAIRSALE_CREATION_FEE * (10 ** 9),
    fairSaleServiceFeeRate: metaEnv.VITE_TOKENIZK_FAIRSALE_SERVICE_FEE_RATE * (10 ** 9),

    privateSaleContractVk: metaEnv.VITE_TOKENIZK_PRIVATESALE_VK,
    privateSaleCreationFee: metaEnv.VITE_TOKENIZK_PRIVATESALE_CREATION_FEE * (10 ** 9),
    privateSaleServiceFeeRate: metaEnv.VITE_TOKENIZK_PRIVATESALE_SERVICE_FEE_RATE * (10 ** 9),

    airdropVk: metaEnv.VITE_TOKENIZK_AIRDROP_VK,
    airdropCreationFee: metaEnv.VITE_TOKENIZK_AIRDROP_CREATION_FEE * (10 ** 9),

    redeemAccountVk: metaEnv.VITE_TOKENIZK_REDEEM_ACCOUNT_VK
};
const lauchpadPlatformParams = LauchpadPlatformParams.fromDto(launchpadParamDto);
console.log('lauchpadPlatformParams.hash(): ', lauchpadPlatformParams.hash());

console.log('============= deploy TokeniZkFactory =============');
let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy tokenFactory contract',
    },
    async () => {
        AccountUpdate.fundNewAccount(feePayer);
        await tokenFactoryZkApp.deployZkApp(lauchpadPlatformParams);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    contractKeys: [tokenFactoryZkAppKey],
    otherSignKeys: [tokenFactoryZkAppKey],
    logLabel: 'deploy Tokenizk tokenFactory contract',
});

console.log('============= deploy TokeniZkBasicToken =============');
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: tokenFactoryZkAppAddress });
}
let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = TokenId.derive(basicTokenZkAppAddress);
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy BasicToken contract',
    },
    async () => {
        AccountUpdate.fundNewAccount(feePayer);
        await tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams, basicTokenZkAppAddress, tokeniZkBasicTokenVK, Field(2100 * 10000 * (10 ** 9)));
    }
);

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [basicTokenZkAppKey],
    logLabel: 'deploy TokenizkBasicToken contract',
});

// airdrop whitelist
let whitelistDB = new Level<string, Buffer>('whitelist-db', { valueEncoding: 'buffer' });
const poseidonHasher = new PoseidonHasher();
const whitelistTree = await newTree(StandardTree,
    whitelistDB,
    poseidonHasher,
    `WHITELIST_TREE`,
    WHITELIST_TREE_HEIGHT);

await whitelistTree.appendLeaves([poseidonHasher.compressInputs(redeemAccountZkAppAddress.toFields()), poseidonHasher.compressInputs(redeemAccountZkAppAddress2.toFields())])
const whitelistTreeRoot = await whitelistTree.getRoot(true);
await whitelistTree.commit();

console.log('============= deploy TokeniZkPresale =============');
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: basicTokenZkAppAddress });
    await fetchLastBlock();
    console.log('sync Berkeley Network status: done!');
}
console.log('current network state: ', JSON.stringify(Mina.activeInstance.getNetworkState()));

const presaleParams = new SaleParams({
    tokenAddress: basicTokenZkAppAddress,
    totalSaleSupply: UInt64.from(100 * (10 ** 9)),
    saleRate: UInt64.from(10),
    whitelistTreeRoot: whitelistTreeRoot,
    softCap: UInt64.from(3 * (10 ** 9)),
    hardCap: UInt64.from(9 * (10 ** 9)),
    minimumBuy: UInt64.from(1 * (10 ** 9)),
    maximumBuy: UInt64.from(3 * (10 ** 9)),
    startTime: UInt64.from(Date.now()),
    endTime: UInt64.from(Date.now() + 11 * 3 * 60 * 1000),
    cliffTime: UInt32.from(1),// slot
    cliffAmountRate: UInt64.from(10),
    vestingPeriod: UInt32.from(5), // default value is 1
    vestingIncrement: UInt64.from(10)
});

const vestingParams = presaleParams.vestingParams();

console.log('feePayerBalance: ' + Mina.getBalance(feePayer).toString());

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy Presale contract',
    },
    async () => {
        AccountUpdate.fundNewAccount(feePayer, 2);
        await basicTokenZkApp.createPresale(lauchpadPlatformParams, presaleZkAppAddress, tokeniZkPresaleVK, presaleParams, presaleMinaFundHolderVK);
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [presaleZkAppKey, basicTokenZkAppKey],
    logLabel: 'deploy Tokenizk Presale contract',
});

const tokeniZkPresaleZkapp = new TokeniZkPresale(presaleZkAppAddress, tokenId);

console.log('================= user1 contribute presale ================');
const whitelistLeafIndex = Field(0);
const whitelistMembershipMerkleWitness: WhitelistMembershipMerkleWitness = await whitelistTree.getSiblingPath(whitelistLeafIndex.toBigInt(), true);

const contributeMinaAmount = UInt64.from(1 * (10 ** 9));
tx = await Mina.transaction(
    {
        sender: redeemAccountZkAppAddress, //feePayer,
        fee: ctx.txFee,
        memo: 'user1 contribute',
    },
    async () => {
        await tokeniZkPresaleZkapp.contribute(presaleParams, redeemAccountZkAppAddress, contributeMinaAmount, whitelistMembershipMerkleWitness, whitelistLeafIndex);
        await basicTokenZkApp.approveAccountUpdate(tokeniZkPresaleZkapp.self);
    }
);
fs.writeFileSync('contribute-Presale-tx-pre-sign.json', tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: redeemAccountZkAppKey,// feePayerKey,
    // otherSignKeys: [redeemAccountZkAppKey],
    logLabel: 'contribute Presale',
});

fs.writeFileSync('contribute-Presale-tx-after-sign.json', tx.toJSON());

console.log('================= user2 contribute presale ================');
const whitelistLeafIndex2 = Field(1);
const whitelistMembershipMerkleWitness2: WhitelistMembershipMerkleWitness = await whitelistTree.getSiblingPath(whitelistLeafIndex2.toBigInt(), true);

const contributeMinaAmount2 = UInt64.from(2 * (10 ** 9));
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'user2 contribute',
    },
    async () => {
        await tokeniZkPresaleZkapp.contribute(presaleParams, redeemAccountZkAppAddress2, contributeMinaAmount2, whitelistMembershipMerkleWitness2, whitelistLeafIndex2);
        await basicTokenZkApp.approveAccountUpdate(tokeniZkPresaleZkapp.self);

    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [redeemAccountZkAppKey2],
    logLabel: 'user2 contribute Presale',
});


console.log('================= Rollup Contributors =============');

// contributors list
let contributorsDB = new Level<string, Buffer>('contributors-db', { valueEncoding: 'buffer' });
const contributorsTree = await newTree(StandardTree,
    contributorsDB,
    poseidonHasher,
    `CONTRIBUTORS_TREE`,
    CONTRIBUTORS_TREE_HEIGHT);

const saleContribution = new SaleContribution({
    tokenAddress: presaleParams.tokenAddress,
    tokenId: TokenId.derive(presaleParams.tokenAddress),
    saleContractAddress: presaleZkAppAddress,
    contributorAddress: redeemAccountZkAppAddress,
    minaAmount: contributeMinaAmount
});
const saleContribution2 = new SaleContribution({
    tokenAddress: presaleParams.tokenAddress,
    tokenId: TokenId.derive(presaleParams.tokenAddress),
    saleContractAddress: presaleZkAppAddress,
    contributorAddress: redeemAccountZkAppAddress2,
    minaAmount: contributeMinaAmount2
});

const processActionsInBatchParamList: { state: SaleRollupState, actionBatch: SaleActionBatch }[] = [];

const saleContributionList = [saleContribution, saleContribution2];

// append dummy
const batchSize = Number(SALE_ACTION_BATCH_SIZE.toString());
let appendDummySize = saleContributionList.length - saleContributionList.length % batchSize;
while (appendDummySize > 0) {
    saleContributionList.push(SaleContribution.dummy());
    appendDummySize--;
}

let currentIndex = Field(0);
let currentActionsHash = Reducer.initialActionState;
let currentMinaAmount = UInt64.from(0);
for (let i = 0, len = saleContributionList.length / batchSize; i < len; i++) {

    const saleRollupState = new SaleRollupState({
        membershipTreeRoot: contributorsTree.getRoot(true),
        currentIndex,
        currentActionsHash,
        currentMinaAmount,
    });

    const actions: SaleContribution[] = [];
    const merkleWitnesses: ContributorsMembershipMerkleWitness[] = [];
    for (let j = 0; j < batchSize; j++) {
        const saleContribution = saleContributionList[i * batchSize + j];
        actions.push(saleContribution);

        const witness = await contributorsTree.getSiblingPath(currentIndex.toBigInt(), true);
        merkleWitnesses.push(witness);

        const isDummyData = Provable.equal(saleContribution, SaleContribution.dummy()).toBoolean();
        if (!isDummyData) {
            await contributorsTree.appendLeaves([saleContribution.hash()]);
            currentIndex = currentIndex.add(1);

            const contributionHash = AccountUpdate.Actions.hash([saleContribution.toFields()]);
            currentActionsHash = AccountUpdate.Actions.updateSequenceState(
                currentActionsHash,
                contributionHash
            )

            currentMinaAmount = currentMinaAmount.add(saleContribution.minaAmount);
        }
    }

    // compose params
    processActionsInBatchParamList.push({
        state: saleRollupState,
        actionBatch: new SaleActionBatch({
            actions,
            merkleWitnesses,
        })
    });
}

console.log('processActionsInBatchParamList: ' + JSON.stringify(processActionsInBatchParamList));

console.log('================= exec processActionsInBatch =============');
const batchParam0 = processActionsInBatchParamList[0];
const saleRollupProof = await SaleRollupProver.processActionsInBatch(batchParam0.state, batchParam0.actionBatch);
console.info(`exec 'processActionsInBatch' inside circuit: done`);

console.log('================= presale.maintainContributors =============');
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'maintain contributors',
    },
    async () => {
        await tokeniZkPresaleZkapp.maintainContributors(presaleParams, saleRollupProof);
        await basicTokenZkApp.approveAccountUpdate(tokeniZkPresaleZkapp.self);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    logLabel: 'maintain contributors',
});


if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: basicTokenZkAppAddress });
    await fetchAccount({ publicKey: presaleZkAppAddress, tokenId });
    await fetchAccount({ publicKey: redeemAccountZkAppAddress });
}

console.log('================= Create Redeem Account =============');
// Redeem account deploy
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Create Redeem Account',
    },
    async () => {
        // AccountUpdate.fundNewAccount(feePayer);
        await tokenFactoryZkApp.createRedeemAccount(lauchpadPlatformParams, redeemAccountZkAppAddress, TokeniZkFactory.redeemAccountVk);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [redeemAccountZkAppKey],
    logLabel: 'Create Redeem Account',
});


console.log('============= claim token from TokeniZkPresale =============');
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: basicTokenZkAppAddress });
    await fetchAccount({ publicKey: presaleZkAppAddress, tokenId });
    await fetchAccount({ publicKey: redeemAccountZkAppAddress });
} else {
    try {
        console.log(`basicTokenZkAppAddress account: `);
        console.log(JSON.stringify(Mina.getAccount(basicTokenZkAppAddress)));
        console.log();

        console.log(`presaleZkAppAddress(tokenId) account: `);
        console.log(JSON.stringify(Mina.getAccount(presaleZkAppAddress, tokenId)));
        console.log();

        console.log(`redeemAccountZkAppAddress account: `);
        console.log(JSON.stringify(Mina.getAccount(redeemAccountZkAppAddress)));
        console.log();
    } catch (error) {
        console.error(error);
    }
}

let userAssetDB = new Level<string, Buffer>('user-asset-db', { valueEncoding: 'buffer' });
const nullifierTree = await newTree(StandardIndexedTree,
    userAssetDB,
    poseidonHasher,
    `${MerkleTreeId[MerkleTreeId.USER_NULLIFIER_TREE]}:${redeemAccountZkAppAddress.toBase58()}`,
    USER_NULLIFIER_TREE_HEIGHT);

console.log(`nullifierTree init root: ${await nullifierTree.getRoot(true)}`);
const targetIndx = nullifierTree.getNumLeaves(false);

const { index: predecessorIndex, alreadyPresent } = await nullifierTree.findIndexOfPreviousValue(saleContribution.hash().toBigInt(), true);
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
    nextValue: saleContribution.hash().toBigInt(),
    nextIndex: targetIndx
};
await nullifierTree.updateLeafWithNoValueCheck(modifiedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
console.info(`after modify predecessor, nullifierTree Root: ${await nullifierTree.getRoot(true)}`);

// obtain oldNullWitness
const oldNullWitness = await nullifierTree.getSiblingPath(BigInt(targetIndx), true);
console.info('obtain oldNullWitness done.');

const revertedPredecessorLeafDataTmp: LeafData = {
    value: predecessorLeafData.value.toBigInt(),
    nextValue: predecessorLeafData.nextValue.toBigInt(),
    nextIndex: predecessorLeafData.nextIndex.toBigInt()
};
await nullifierTree.updateLeafWithNoValueCheck(revertedPredecessorLeafDataTmp, predecessorIdx.toBigInt());
console.info(`after revert predecessor, nullifierTree Root: ${await nullifierTree.getRoot(true)}`);

const contributorLeafIndex = 0n;
const contributorsMembershipMerkleWitness = await contributorsTree.getSiblingPath(contributorLeafIndex, true);
const saleContributorMembershipWitnessData = new SaleContributorMembershipWitnessData({
    leafData: saleContribution,
    siblingPath: contributorsMembershipMerkleWitness,
    index: Field(contributorLeafIndex)
});
try {
    console.log(`presale contract token balance before claim: ${Mina.getBalance(presaleZkAppAddress, tokenId)}`);
    console.log(`redeemAccountZkAppAddress token balance before claim: 0`);
} catch (error) {
    console.error(error);
}

tx = await Mina.transaction(
    {
        sender: redeemAccountZkAppAddress,
        fee: ctx.txFee,
        memo: 'claim tokens',
    },
    async () => {
        AccountUpdate.fundNewAccount(redeemAccountZkAppAddress, 1);
        await tokeniZkPresaleZkapp.claimTokens(
            presaleParams,
            saleContributorMembershipWitnessData,
            lowLeafWitness,
            oldNullWitness
        );
        await basicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkPresaleZkapp.self, redeemAccountZkAppAddress,
            saleContribution.minaAmount.mul(presaleParams.saleRate), vestingParams);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: redeemAccountZkAppKey,
    logLabel: 'claim tokens',
});
console.log(`airdrop contract balance after redeem: ${Mina.getBalance(presaleZkAppAddress, tokenId)}`);
console.log(`redeemAccountZkAppAddress balance after redeem: ${Mina.getBalance(redeemAccountZkAppAddress, tokenId)}`);

console.log('============= transfer tokens =============');
const toKey = PrivateKey.random();// new address
const to = toKey.toPublicKey();
console.log('toKey: ' + toKey.toBase58());
console.log('to: ' + to.toBase58());

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: basicTokenZkAppAddress, tokenId });
    await fetchAccount({ publicKey: redeemAccountZkAppAddress, tokenId });
}
tx = await Mina.transaction(
    {
        sender: redeemAccountZkAppAddress,
        fee: ctx.txFee,
        memo: 'transfer tokens',
    },
    async () => {
        AccountUpdate.fundNewAccount(redeemAccountZkAppAddress, 1);

        await basicTokenZkApp.transferToken(redeemAccountZkAppAddress, to, UInt64.from(1));

    }
);
await ctx.submitTx(tx, {
    feePayerKey: redeemAccountZkAppKey,
    logLabel: 'transfer tokens',
});

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: to, tokenId });
    await fetchAccount({ publicKey: redeemAccountZkAppAddress, tokenId });
}

console.log(`after transfer, balance of redeemAccountZkAppAddress: ${Mina.getBalance(redeemAccountZkAppAddress, tokenId)}`);
console.log(`after transfer, balance of to: ${Mina.getBalance(to, tokenId)}`);
