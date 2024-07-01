import fs from "fs";
import {
    Mina,
    AccountUpdate,
    PrivateKey,
    UInt64,
    Field,
    fetchAccount,
} from 'o1js';

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleRollupProver, RedeemAccount, TokeniZkFairSale, TokeniZkPrivateSale, TokeniZkAirdrop } from "../src";
import { getTestContext } from '../src/test_utils';

// ================
const ctx = getTestContext();
await ctx.initMinaNetwork();
// ================

// let feePayerKey = Local.testAccounts[0].privateKey;
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKEN6uX7e5219b1eMdLqyvPveU6iB7AmdrHEGmuPZGdkH7Kj5GHz') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();
if (process.env.TEST_ON_BERKELEY === 'true') {
    const feePayerAcctInfo = await fetchAccount({ publicKey: feePayer });
    console.log(JSON.stringify(feePayerAcctInfo));
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
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkFactory-VK.json', JSON.stringify(factoryVK));

console.time('compile (TokeniZkBasicToken)');
const tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);
console.timeEnd('compile (TokeniZkBasicToken)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkBasicToken-VK.json', JSON.stringify(tokeniZkBasicTokenVK));


let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);

let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = basicTokenZkApp.deriveTokenId();

console.time('compile (SaleRollupProver)');
const saleRollupProverVK = (await SaleRollupProver.compile()).verificationKey;
console.timeEnd('compile (SaleRollupProver)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/SaleRollupProver-VK.json', JSON.stringify(saleRollupProverVK));

console.time('compile (TokeniZkPresale)');
const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
console.log('TokeniZkFactory.presaleContractVk: ' + TokeniZkFactory.presaleContractVk.hash);
console.timeEnd('compile (TokeniZkPresale)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkPresale-VK.json', JSON.stringify(tokeniZkPresaleVK));


console.time('compile (TokeniZkFairSale)');
const tokeniZkFairsaleVK = (await TokeniZkFairSale.compile()).verificationKey;
TokeniZkFactory.fairSaleContractVk = tokeniZkFairsaleVK;
console.timeEnd('compile (TokeniZkFairSale)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkFairSale-VK.json', JSON.stringify(tokeniZkFairsaleVK));

console.time('compile (TokeniZkPrivateSale)');
const tokeniZkPrivatesaleVK = (await TokeniZkPrivateSale.compile()).verificationKey;
TokeniZkFactory.privateSaleContractVk = tokeniZkPrivatesaleVK;
console.timeEnd('compile (TokeniZkPrivateSale)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkPrivateSale-VK.json', JSON.stringify(tokeniZkPrivatesaleVK));

console.time('compile (TokeniZkAirdrop)');
const tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
console.timeEnd('compile (TokeniZkAirdrop)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/TokeniZkAirdrop-VK.json', JSON.stringify(tokeniZkAirdropVK));

console.time('compile (RedeemAccount)');
await RedeemAccount.compile();
const redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/RedeemAccount-VK.json', JSON.stringify(redeemAccountVk));

console.time('compile (PresaleMinaFundHolder)');
await PresaleMinaFundHolder.compile();
const presaleMinaFundHolderVK = (await PresaleMinaFundHolder.compile()).verificationKey;
TokeniZkFactory.presaleMinaFundHolderVk = presaleMinaFundHolderVK;
console.timeEnd('compile (PresaleMinaFundHolder)');
fs.writeFileSync('./deploy/TestWorld/verification-keys/PresaleMinaFundHolder-VK.json', JSON.stringify(presaleMinaFundHolderVK));

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
const lauchpadPlatformParams = new LauchpadPlatformParams({
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
console.log('lauchpadPlatformParams: ' + JSON.stringify(lauchpadPlatformParams));
console.log('lauchpadPlatformParams.hash(): ' + lauchpadPlatformParams.hash());


fs.writeFileSync('./deploy/TestWorld/tokenizk-factory-keypair-params.json',
    JSON.stringify({
        key: tokenFactoryZkAppKey.toBase58(),
        value: tokenFactoryZkAppAddress.toBase58(),
        lauchpadPlatformParams: {
            basicTokenVk: TokeniZkFactory.basicTokenVk.hash, // TODO 
            basicTokenCreationFee: Number(lauchpadPlatformParams.basicTokenCreationFee.toString()),

            presaleContractVk: TokeniZkFactory.presaleContractVk.hash, // TODO 
            presaleCreationFee: Number(lauchpadPlatformParams.presaleCreationFee.toString()),
            presaleServiceFeeRate: Number(lauchpadPlatformParams.presaleServiceFeeRate.toString()),
            presaleMinaFundHolderVk: TokeniZkFactory.presaleMinaFundHolderVk.hash, // TODO 

            fairSaleContractVk: TokeniZkFactory.fairSaleContractVk.hash,// TODO 
            fairSaleCreationFee: Number(lauchpadPlatformParams.fairSaleCreationFee.toString()),
            fairSaleServiceFeeRate: Number(lauchpadPlatformParams.fairSaleServiceFeeRate.toString()),

            privateSaleContractVk: TokeniZkFactory.privateSaleContractVk.hash, // TODO 
            privateSaleCreationFee: Number(lauchpadPlatformParams.privateSaleCreationFee.toString()),
            privateSaleServiceFeeRate: Number(lauchpadPlatformParams.privateSaleServiceFeeRate.toString()),

            airdropVk: TokeniZkFactory.airdropVk.hash,
            airdropCreationFee: Number(lauchpadPlatformParams.airdropCreationFee.toString()),

            redeemAccountVk: TokeniZkFactory.redeemAccountVk.hash,
        }
    }))

tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy TokenFactory contract',
    },
    async () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.deployZkApp(lauchpadPlatformParams);
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
    async () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams, basicTokenZkAppAddress, tokeniZkBasicTokenVK, Field(2100 * 10000));
    }
);
console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [basicTokenZkAppKey],
    logLabel: 'deploy TokenizkBasicToken contract',
});
