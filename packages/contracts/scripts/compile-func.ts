
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
} from 'o1js';

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, STANDARD_TREE_INIT_ROOT_16, UserState, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_12 } from "../src";
import { getTestContext } from './test_utils';

const ctx = getTestContext();
await ctx.initMinaNetwork();

// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = PrivateKey.fromBase58('EKDzUnQJhC8Fsojn7ndQrbCfT5VogS7BfK98Lt34UV424sySrG5N');
let feePayer = feePayerKey.toPublicKey();

let tokenFactoryZkAppKey = PrivateKey.random() //Local.testAccounts[1].privateKey;
let tokenFactoryZkAppAddress = tokenFactoryZkAppKey.toPublicKey();

let basicTokenZkAppKey = PrivateKey.random() //Local.testAccounts[2].privateKey;
let basicTokenZkAppAddress = basicTokenZkAppKey.toPublicKey();

let presaleZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let presaleZkAppAddress = presaleZkAppKey.toPublicKey();

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

console.log('userRedeemZkAppKey: ', redeemAccountZkAppKey.toBase58());
console.log('userRedeemZkAppAddress: ', redeemAccountZkAppAddress.toBase58());

console.log('-------------------------------------------');

let tx;

TokeniZkFactory.platfromFeeAddress = platfromFeeRecieverAddress;
TokeniZkFactory.tokeniZkFactoryAddress = tokenFactoryZkAppAddress;

console.time('compile (TokeniZkFactory)');
await TokeniZkFactory.compile();
console.timeEnd('compile (TokeniZkFactory)');

console.time('compile (TokeniZkBasicToken)');
const tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;
console.timeEnd('compile (TokeniZkBasicToken)');

console.time('compile (PresaleRollupProver)');
await SaleRollupProver.compile();
console.timeEnd('compile (PresaleRollupProver)');

console.time('compile (TokeniZkPresale)');
await TokeniZkPresale.compile();
const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
console.timeEnd('compile (TokeniZkPresale)');

console.time('compile (RedeemAccount)');
await RedeemAccount.compile();
const redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');

console.time('compile (PresaleMinaFundHolder)');
await PresaleMinaFundHolder.compile();
const presaleMinaFundHolderVK = (await PresaleMinaFundHolder.compile()).verificationKey;
TokeniZkFactory.presaleMinaFundHolderVk = presaleMinaFundHolderVK;
console.timeEnd('compile (PresaleMinaFundHolder)');


// ================================================
let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);

let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = basicTokenZkApp.token.id;

let presaleZkApp = new TokeniZkPresale(presaleZkAppAddress, tokenId);

let presaleMinaFundHolderZkApp = new PresaleMinaFundHolder(presaleZkAppAddress);

let redeemAccountZkApp = new RedeemAccount(presaleZkAppAddress);
// ================================================


console.log('-------------------------------------------');


console.log('deploy TokeniZkFactory');
const lauchpadPlatformParams0 = new LauchpadPlatformParams({
    basicTokenVk: TokeniZkFactory.basicTokenVk.hash, // TODO 
    basicTokenCreationFee: UInt64.from(20 * (10 ** 9)),

    presaleContractVk: TokeniZkFactory.presaleContractVk.hash, // TODO 
    presaleCreationFee: UInt64.from(100 * (10 ** 9)),
    presaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),
    presaleMinaFundHolderVk: TokeniZkFactory.presaleMinaFundHolderVk.hash, // TODO 

    fairSaleContractVk: Field(0),// TokeniZkFactory.fairSaleContractVk.hash,// TODO 
    fairSaleCreationFee: UInt64.from(200 * (10 ** 9)),
    fairSaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),

    privateSaleContractVk: Field(0),// TokeniZkFactory.privateSaleContractVk.hash, // TODO 
    privateSaleCreationFee: UInt64.from(200 * (10 ** 9)),
    privateSaleServiceFeeRate: UInt64.from(10 * (10 ** 9)),

    redeemAccountVk: TokeniZkFactory.redeemAccountVk.hash,
});

/*
tx = await Mina.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    tokenFactoryZkApp.deployZkApp(lauchpadPlatformParams0);
});
tx.sign([feePayerKey, tokenFactoryZkAppKey]);
await tx.send();
*/

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy tokenFactory contract',
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
/*
tx = await Mina.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams0, basicTokenZkAppAddress, tokeniZkBasicTokenVK, Field(2100 * 10000));
});
await tx.prove();
tx.sign([feePayerKey, basicTokenZkAppKey]);
await tx.send();
*/

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
    whitelistTreeRoot: STANDARD_TREE_INIT_ROOT_12,
    softCap: UInt64.from(100),
    hardCap: UInt64.from(350),
    minimumBuy: UInt64.from(10),
    maximumBuy: UInt64.from(50),
    startTime: UInt64.from(new Date().getTime()),
    endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
    cliffTime: UInt32.from(1),// slot
    cliffAmountRate: UInt64.from(0),
    vestingPeriod: UInt32.from(1), // default value is 1
    vestingIncrement: UInt64.from(0)
});

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

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [presaleZkAppKey],
    logLabel: 'deploy Tokenizk Presale contract',
});


console.log('deploy RedeemAccount');
const userState = new UserState({
    nullifierRoot: INDEX_TREE_INIT_ROOT_8,
    nullStartIndex: Field(0),
});
/*
tx = await Mina.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    redeemAccountZkApp.deployZkApp(userState);
});
tx.sign([feePayerKey, redeemAccountZkAppKey]);
await tx.send();
*/

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
