
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

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, STANDARD_TREE_INIT_ROOT_16, UserState, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_12, TokeniZkFairSale, TokeniZkPrivateSale } from "../src";
import { getTestContext } from '../src/test_utils';

const ctx = getTestContext();
await ctx.initMinaNetwork();

// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEm81DLyU44Gpu4egbX9g1zgrVS7NnGCcbNZYGrKiG4XRQacKRK') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();

let tokenFactoryZkAppKey = PrivateKey.random() //Local.testAccounts[1].privateKey;
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
await TokeniZkFactory.compile();
console.timeEnd('compile (TokeniZkFactory)');

console.time('compile (TokeniZkBasicToken)');
const tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;
console.timeEnd('compile (TokeniZkBasicToken)');


let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);

let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = basicTokenZkApp.token.id;

console.time('compile (SaleRollupProver)');
await SaleRollupProver.compile();
console.timeEnd('compile (SaleRollupProver)');

console.time('compile (TokeniZkPresale)');
const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
console.timeEnd('compile (TokeniZkPresale)');

console.time('compile (TokeniZkFairSale)');
const tokeniZkFairsaleVK = (await TokeniZkFairSale.compile()).verificationKey;
TokeniZkFactory.fairSaleContractVk = tokeniZkFairsaleVK;
console.timeEnd('compile (TokeniZkFairSale)');

console.time('compile (TokeniZkPrivateSale)');
const tokeniZkPrivatesaleVK = (await TokeniZkPrivateSale.compile()).verificationKey;
TokeniZkFactory.privateSaleContractVk = tokeniZkPrivatesaleVK;
console.timeEnd('compile (TokeniZkPrivateSale)');

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

console.log('-------------------------------------------');
// log vk hash
console.log(`basicTokenVk.hash: ${TokeniZkFactory.basicTokenVk.hash}`);
console.log(`presaleContractVk.hash: ${TokeniZkFactory.presaleContractVk.hash}`);
console.log(`presaleMinaFundHolderVk.hash: ${TokeniZkFactory.presaleMinaFundHolderVk.hash}`);
console.log(`redeemAccountVk.hash: ${TokeniZkFactory.redeemAccountVk.hash}`);
console.log(`fairSaleContractVk.hash: ${TokeniZkFactory.fairSaleContractVk.hash}`);
console.log(`privateSaleContractVk.hash: ${TokeniZkFactory.privateSaleContractVk.hash}`);

let presaleZkApp = new TokeniZkPresale(presaleZkAppAddress, tokenId);

let presaleMinaFundHolderZkApp = new PresaleMinaFundHolder(presaleZkAppAddress);

let redeemAccountZkApp = new RedeemAccount(presaleZkAppAddress);

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

console.log('deploy TokeniZkFairSale =======================');
const fairsaleParams = new SaleParams({
    tokenAddress: basicTokenZkAppAddress,
    totalSaleSupply: UInt64.from(100 * 10000),
    saleRate: UInt64.from(0),
    whitelistTreeRoot: Field(0),
    softCap: UInt64.from(0),
    hardCap: UInt64.from(0),
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
        memo: 'Deploy Fairsale contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer, 1);
        basicTokenZkApp.createFairSale(lauchpadPlatformParams0, fairsaleZkAppAddress, tokeniZkFairsaleVK, fairsaleParams);
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [fairsaleZkAppKey, basicTokenZkAppKey],
    logLabel: 'deploy Tokenizk Fairsale contract',
});


console.log('deploy TokeniZkPrivateSale =======================');
const privateSaleParams = new SaleParams({
    tokenAddress: PublicKey.empty(),// no need at private sale
    totalSaleSupply: UInt64.from(0),// no need at private sale
    saleRate: UInt64.from(0),// no need at private sale
    whitelistTreeRoot: Field(0),
    softCap: UInt64.from(0),// no need at private sale
    hardCap: UInt64.from(0),// no need at private sale
    minimumBuy: UInt64.from(10 * (10 ** 9)),
    maximumBuy: UInt64.from(50 * (10 ** 9)),
    startTime: UInt64.from(new Date().getTime()),
    endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
    cliffTime: UInt32.from(1),// // !!vest project team on recieved MINA!!
    cliffAmountRate: UInt64.from(0),
    vestingPeriod: UInt32.from(1), // default value is 1
    vestingIncrement: UInt64.from(0)
});

console.log('feePayerBalance: ' + Mina.getBalance(feePayer).toString());

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy PrivateSale contract',
    },
    () => {
        AccountUpdate.fundNewAccount(feePayer, 1);
        tokenFactoryZkApp.createPrivateSale(lauchpadPlatformParams0, privatesaleZkAppAddress, tokeniZkPrivatesaleVK, privateSaleParams);
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [privatesaleZkAppKey],
    logLabel: 'deploy Tokenizk PrivateSale contract',
});

console.log('deploy TokeniZkPresale');
const presaleParams = new SaleParams({
    tokenAddress: basicTokenZkAppAddress,
    totalSaleSupply: UInt64.from(100 * 10000),
    saleRate: UInt64.from(100),
    whitelistTreeRoot: Field(0),
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
