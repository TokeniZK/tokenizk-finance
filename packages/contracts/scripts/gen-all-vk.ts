import fs from "fs";
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

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, STANDARD_TREE_INIT_ROOT_16, UserState, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_12, TokeniZkFairSale, TokeniZkPrivateSale, WHITELIST_TREE_HEIGHT, CONTRIBUTORS_TREE_HEIGHT, ContributorsMembershipMerkleWitness, TokeniZkAirdrop } from "../src";
import { getTestContext } from '../src/test_utils';
import { PoseidonHasher, StandardTree, newTree } from '@tokenizk/merkle-tree';
import { Level } from 'level';
import { WhitelistMembershipMerkleWitness } from '../src';

// ================
const ctx = getTestContext();
await ctx.initMinaNetwork();
// ================

// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEDgneTyC6VimEUWF4jrreDaR4ntSvJdjw6ckfDQCtMG5aJtMGP') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();
if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: feePayer });
}

let tokenFactoryZkAppKey = PrivateKey.random()//PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') //Local.testAccounts[1].privateKey;
let tokenFactoryZkAppAddress = tokenFactoryZkAppKey.toPublicKey();

let basicTokenZkAppKey = PrivateKey.random() //Local.testAccounts[2].privateKey;
let basicTokenZkAppAddress = basicTokenZkAppKey.toPublicKey();

let presaleZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let presaleZkAppAddress = presaleZkAppKey.toPublicKey();

let fairsaleZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let fairsaleZkAppAddress = fairsaleZkAppKey.toPublicKey();

let privatesaleZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let privatesaleZkAppAddress = privatesaleZkAppKey.toPublicKey();

let redeemAccountZkAppKey = PrivateKey.random() //Local.testAccounts[5].privateKey;
let redeemAccountZkAppAddress = redeemAccountZkAppKey.toPublicKey();

let platfromFeeRecieverKey = PrivateKey.random() //Local.testAccounts[6].privateKey;
let platfromFeeRecieverAddress = platfromFeeRecieverKey.toPublicKey();

console.log('feePayer: ', feePayerKey.toBase58());
console.log('feePayerAddress: ', feePayer.toBase58());

console.log('platfromFeeRecieverKey: ', platfromFeeRecieverKey.toBase58());
console.log('platfromFeeRecieverAddress: ', platfromFeeRecieverAddress.toBase58());

console.log('tokenFactoryZkAppKey: ', tokenFactoryZkAppKey.toBase58());
console.log('tokenFactoryZkAppAddress: ', tokenFactoryZkAppAddress.toBase58());

console.log('basicTokenZkAppKey: ', basicTokenZkAppKey.toBase58());
console.log('basicTokenZkAppAddress: ', basicTokenZkAppAddress.toBase58());

console.log('presaleZkAppKey: ', presaleZkAppKey.toBase58());
console.log('presaleZkAppAddress: ', presaleZkAppAddress.toBase58());

console.log('fairsaleZkAppKey: ', fairsaleZkAppKey.toBase58());
console.log('fairsaleZkAppAddress: ', fairsaleZkAppAddress.toBase58());

console.log('privatesaleZkAppKey: ', privatesaleZkAppKey.toBase58());
console.log('privatesaleZkAppAddress: ', privatesaleZkAppAddress.toBase58());

console.log('userRedeemZkAppKey: ', redeemAccountZkAppKey.toBase58());
console.log('userRedeemZkAppAddress: ', redeemAccountZkAppAddress.toBase58());

console.log('-------------------------------------------');

let tx;

TokeniZkFactory.platfromFeeAddress = platfromFeeRecieverAddress;
TokeniZkFactory.tokeniZkFactoryAddress = tokenFactoryZkAppAddress;

console.time('compile (TokeniZkFactory)');
const factoryVK = (await TokeniZkFactory.compile()).verificationKey;
console.timeEnd('compile (TokeniZkFactory)');
console.log(`factoryVK.hash: ${factoryVK.hash}`)
fs.writeFileSync('./deploy/verification-keys/TokeniZkFactory-VK.json', JSON.stringify(factoryVK));

console.time('compile (TokeniZkBasicToken)');
const tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);
console.timeEnd('compile (TokeniZkBasicToken)');
fs.writeFileSync('./deploy/verification-keys/TokeniZkBasicToken-VK.json', JSON.stringify(tokeniZkBasicTokenVK));


let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);

let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = basicTokenZkApp.token.id;

console.time('compile (SaleRollupProver)');
const saleRollupProverVK = (await SaleRollupProver.compile()).verificationKey;
console.timeEnd('compile (SaleRollupProver)');
fs.writeFileSync('./deploy/verification-keys/SaleRollupProver-VK.json', JSON.stringify(saleRollupProverVK));

console.time('compile (TokeniZkPresale)');
const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
console.log('TokeniZkFactory.presaleContractVk: ' + TokeniZkFactory.presaleContractVk.hash);
console.timeEnd('compile (TokeniZkPresale)');
fs.writeFileSync('./deploy/verification-keys/TokeniZkPresale-VK.json', JSON.stringify(tokeniZkPresaleVK));


console.time('compile (TokeniZkFairSale)');
const tokeniZkFairsaleVK = (await TokeniZkFairSale.compile()).verificationKey;
TokeniZkFactory.fairSaleContractVk = tokeniZkFairsaleVK;
console.timeEnd('compile (TokeniZkFairSale)');
fs.writeFileSync('./deploy/verification-keys/TokeniZkFairSale-VK.json', JSON.stringify(tokeniZkFairsaleVK));

console.time('compile (TokeniZkPrivateSale)');
const tokeniZkPrivatesaleVK = (await TokeniZkPrivateSale.compile()).verificationKey;
TokeniZkFactory.privateSaleContractVk = tokeniZkPrivatesaleVK;
console.timeEnd('compile (TokeniZkPrivateSale)');
fs.writeFileSync('./deploy/verification-keys/TokeniZkPrivateSale-VK.json', JSON.stringify(tokeniZkPrivatesaleVK));

console.time('compile (TokeniZkAirdrop)');
const tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
console.timeEnd('compile (TokeniZkAirdrop)');
fs.writeFileSync('./deploy/verification-keys/TokeniZkAirdrop-VK.json', JSON.stringify(tokeniZkAirdropVK));

console.time('compile (RedeemAccount)');
await RedeemAccount.compile();
const redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');
fs.writeFileSync('./deploy/verification-keys/RedeemAccount-VK.json', JSON.stringify(redeemAccountVk));

console.time('compile (PresaleMinaFundHolder)');
await PresaleMinaFundHolder.compile();
const presaleMinaFundHolderVK = (await PresaleMinaFundHolder.compile()).verificationKey;
TokeniZkFactory.presaleMinaFundHolderVk = presaleMinaFundHolderVK;
console.timeEnd('compile (PresaleMinaFundHolder)');
fs.writeFileSync('./deploy/verification-keys/PresaleMinaFundHolder-VK.json', JSON.stringify(presaleMinaFundHolderVK));

console.log('-------------------------------------------');
// log vk hash
console.log(`basicTokenVk.hash: ${TokeniZkFactory.basicTokenVk.hash}`);
console.log(`presaleContractVk.hash: ${TokeniZkFactory.presaleContractVk.hash}`);
console.log(`presaleMinaFundHolderVk.hash: ${TokeniZkFactory.presaleMinaFundHolderVk.hash}`);
console.log(`airdropVk.hash: ${TokeniZkFactory.airdropVk.hash}`);
console.log(`redeemAccountVk.hash: ${TokeniZkFactory.redeemAccountVk.hash}`);
console.log(`fairSaleContractVk.hash: ${TokeniZkFactory.fairSaleContractVk.hash}`);
console.log(`privateSaleContractVk.hash: ${TokeniZkFactory.privateSaleContractVk.hash}`);
console.log('-------------------------------------------');


console.log('deploy TokeniZkFactory');
const lauchpadPlatformParams0 = new LauchpadPlatformParams({
    basicTokenVk: TokeniZkFactory.basicTokenVk.hash, // TODO 
    basicTokenCreationFee: UInt64.from(1 * (10 ** 9)),

    presaleContractVk: TokeniZkFactory.presaleContractVk.hash, // TODO 
    presaleCreationFee: UInt64.from(1 * (10 ** 9)),
    presaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),
    presaleMinaFundHolderVk: TokeniZkFactory.presaleMinaFundHolderVk.hash, // TODO 

    fairSaleContractVk: TokeniZkFactory.fairSaleContractVk.hash,// TODO 
    fairSaleCreationFee: UInt64.from(1 * (10 ** 9)),
    fairSaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),

    privateSaleContractVk: TokeniZkFactory.privateSaleContractVk.hash, // TODO 
    privateSaleCreationFee: UInt64.from(1 * (10 ** 9)),
    privateSaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),


    airdropVk: TokeniZkFactory.airdropVk.hash,
    airdropCreationFee: UInt64.from(10 * (10 ** 9)),

    redeemAccountVk: TokeniZkFactory.redeemAccountVk.hash,
});
console.log('lauchpadPlatformParams0: ' + JSON.stringify(lauchpadPlatformParams0));
fs.writeFileSync('./deploy/tokenizk-factory-keypair-params.json',
    JSON.stringify({
        key: tokenFactoryZkAppKey.toBase58(),
        value: tokenFactoryZkAppAddress.toBase58(),
        lauchpadPlatformParams: {
            basicTokenVk: TokeniZkFactory.basicTokenVk.hash, // TODO 
            basicTokenCreationFee: 1 * (10 ** 9),

            presaleContractVk: TokeniZkFactory.presaleContractVk.hash, // TODO 
            presaleCreationFee: 1 * (10 ** 9),
            presaleServiceFeeRate: 10 * (10 ** 9),
            presaleMinaFundHolderVk: TokeniZkFactory.presaleMinaFundHolderVk.hash, // TODO 

            fairSaleContractVk: TokeniZkFactory.fairSaleContractVk.hash,// TODO 
            fairSaleCreationFee: 1 * (10 ** 9),
            fairSaleServiceFeeRate: 10 * (10 ** 9),

            privateSaleContractVk: TokeniZkFactory.privateSaleContractVk.hash, // TODO 
            privateSaleCreationFee: 1 * (10 ** 9),
            privateSaleServiceFeeRate: 10 * (10 ** 9),

            airdropVk: TokeniZkFactory.airdropVk.hash,
            airdropCreationFee: 1 * (10 ** 9),

            redeemAccountVk: TokeniZkFactory.redeemAccountVk.hash,
        }
    }))

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenFactory contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.deployZkApp(lauchpadPlatformParams0);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    contractKeys: [tokenFactoryZkAppKey],
    otherSignKeys: [tokenFactoryZkAppKey],
    logLabel: 'deploy Tokenizk tokenFactory contract',
});


console.log('deploy TokeniZkBasicToken');

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy BasicToken contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams0, basicTokenZkAppAddress, tokeniZkBasicTokenVK, Field(2100 * 10000));
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [basicTokenZkAppKey],
    logLabel: 'deploy TokenizkBasicToken contract',
});

console.log('deploy TokeniZkPresale');
const presaleParams = new SaleParams({
    tokenAddress: basicTokenZkAppAddress,
    totalSaleSupply: UInt64.from(100 * 10000),
    saleRate: UInt64.from(100),
    whitelistTreeRoot: Field(0), // no whitelist here
    softCap: UInt64.from(100 * (10 ** 9)),
    hardCap: UInt64.from(350 * (10 ** 9)),
    minimumBuy: UInt64.from(10 * (10 ** 9)),
    maximumBuy: UInt64.from(50 * (10 ** 9)),
    startTime: UInt64.from(new Date().getTime()),
    endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
    cliffTime: UInt32.from(1),// slot
    cliffAmountRate: UInt64.from(0),
    vestingPeriod: UInt32.from(1), // default value is 1
    vestingIncrement: UInt64.from(0)
});

console.log('feePayerBalance: ' + Mina.getBalance(feePayer).toString());

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy Presale contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer, 2);
        basicTokenZkApp.createPresale(lauchpadPlatformParams0, presaleZkAppAddress, tokeniZkPresaleVK, presaleParams, presaleMinaFundHolderVK);
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [presaleZkAppKey, basicTokenZkAppKey],
    logLabel: 'deploy Tokenizk Presale contract',
});

let user0Key = await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '');
let user0Addr = user0Key.toPublicKey();

let user1Key = await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '');
let user1Addr = user1Key.toPublicKey();

let user2Key = await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '');
let user2Addr = user2Key.toPublicKey();

// construct whitelist tree
let whitelistDB = new Level<string, Buffer>('whitelist-db', { valueEncoding: 'buffer' });
const poseidonHasher = new PoseidonHasher();
const whitelistTree = await newTree(StandardTree,
    whitelistDB,
    poseidonHasher,
    `WHITELIST_TREE`,
    WHITELIST_TREE_HEIGHT);
const leafIndex = Field(0);
const membershipMerkleWitness: WhitelistMembershipMerkleWitness = await whitelistTree.getSiblingPath(leafIndex.toBigInt(), true);

// contribute
console.log('contribute Tokenizk Presale...');

let presaleZkApp = new TokeniZkPresale(presaleZkAppAddress, tokenId);
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy Presale contract',
    },
    () => {
        presaleZkApp.contribute(presaleParams, user0Addr, UInt64.from(1 * (10 ** 9)), membershipMerkleWitness, leafIndex);
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [presaleZkAppKey, basicTokenZkAppKey],
    logLabel: 'contribute Tokenizk Presale',
});

/*
// maintain contributor tree
// construct whitelist tree
let contributorDB = new Level<string, Buffer>('contributor-db', { valueEncoding: 'buffer' });
const contributorTree = await newTree(StandardTree,
    whitelistDB,
    poseidonHasher,
    `CONTRIBUTOR_TREE`,
    CONTRIBUTORS_TREE_HEIGHT);

const leafIndex = Field(0);
const membershipMerkleWitness: ContributorsMembershipMerkleWitness = await whitelistTree.getSiblingPath(leafIndex.toBigInt(), true);
*/

console.log('deploy RedeemAccount');
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy RedeemAccount contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.createRedeemAccount(lauchpadPlatformParams0, redeemAccountZkAppAddress, redeemAccountVk);
    }
);

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [redeemAccountZkAppKey],
    logLabel: 'deploy Tokenizk RedeemAccount contract',
});

let presaleMinaFundHolderZkApp = new PresaleMinaFundHolder(presaleZkAppAddress);

let redeemAccountZkApp = new RedeemAccount(presaleZkAppAddress);

// claim tokens


// redeem tokens
