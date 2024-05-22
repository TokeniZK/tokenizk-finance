
import {
    Mina,
    PrivateKey,
    Field,
    fetchAccount,
} from 'o1js';

import { TokeniZkFactory, TokeniZkBasicToken, LauchpadPlatformParams } from "../src";
import { getTestContext } from '../src/test_utils';

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
console.log('-----------------@@--------');

let tokenFactoryZkAppKey = PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') // PrivateKey.random() //Local.testAccounts[1].privateKey;
let tokenFactoryZkAppAddress = tokenFactoryZkAppKey.toPublicKey();

let basicTokenZkAppKey = PrivateKey.random()// (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //feePayerKey //Local.testAccounts[2].privateKey;
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
let tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;

let tokeniZkBasicTokenVKX = {data: tokeniZkBasicTokenVK.data, hash: tokeniZkBasicTokenVK.hash};

console.timeEnd('compile (TokeniZkBasicToken)');
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);


const metaEnv = {
    VITE_MINA_NETWORK: "Berkeley",
    VITE_EXPLORER_URL: "https://minascan.io/berkeley/zk-tx/",
    VITE_TOKENIZK_FACTORY_ADDR: tokenFactoryZkAppAddress.toBase58(),
    VITE_TOKENIZK_BASIC_TOKEN_VK: TokeniZkFactory.basicTokenVk.hash.toString(),
    VITE_TOKENIZK_BASIC_TOKEN_CREATION_FEE: 1,
    VITE_TOKENIZK_PRESALE_VK: "15309700443613518013321781280202426578741640759933594394989564888065348322182",
    VITE_TOKENIZK_PRESALE_CREATION_FEE: 1,
    VITE_TOKENIZK_PRESALE_SERVICE_FEE_RATE: 10,
    VITE_TOKENIZK_PRESALE_MINA_FUND_HOLDER_VK: "10834642396518716654357482399071904252915141492776366293957318722154584995445",
    VITE_TOKENIZK_FAIRSALE_VK: "5711107540178421197243482233532083938508251491438902584293724442780141074845",
    VITE_TOKENIZK_FAIRSALE_CREATION_FEE: 1,
    VITE_TOKENIZK_FAIRSALE_SERVICE_FEE_RATE: 10,
    VITE_TOKENIZK_PRIVATESALE_VK: "27497478064496651044002647918087358394468556579612291364828180282252508727928",
    VITE_TOKENIZK_PRIVATESALE_CREATION_FEE: 1,
    VITE_TOKENIZK_PRIVATESALE_SERVICE_FEE_RATE: 10,

    VITE_TOKENIZK_AIRDROP_VK: "27497478064496651044002647918087358394468556579612291364828180282252508727928",
    VITE_TOKENIZK_AIRDROP_CREATION_FEE: 1,

    VITE_TOKENIZK_REDEEM_ACCOUNT_VK: "22456366380626091581517851034637112730686788007069781219102593169156230141231",
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

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: tokenFactoryZkAppAddress });
}

let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);

/*
console.log('deploy TokeniZkFactory');
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy tokenFactory contract',
    },
    () => {
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
 */
console.log('deploy TokeniZkBasicToken');

let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = basicTokenZkApp.deriveTokenId();
tx = await Mina.transaction(
    {
        sender: feePayer,
        fee: ctx.txFee,
        memo: 'Deploy BasicToken contract',
    },
    async () => {
        // AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams, basicTokenZkAppAddress, tokeniZkBasicTokenVKX, Field(2100 * 10000));
    }
);
// console.log('generated tx: ' + tx.toJSON());

await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [basicTokenZkAppKey],
    logLabel: 'deploy TokenizkBasicToken contract',
});
