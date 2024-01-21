
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

import { TokeniZkFactory, TokeniZkBasicToken, TokeniZkPresale, PresaleMinaFundHolder, LauchpadPlatformParams, SaleParams, SaleRollupProver, RedeemAccount, STANDARD_TREE_INIT_ROOT_16, UserState, INDEX_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_8, STANDARD_TREE_INIT_ROOT_12, TokeniZkFairSale, TokeniZkPrivateSale, WHITELIST_TREE_HEIGHT, CONTRIBUTORS_TREE_HEIGHT, ContributorsMembershipMerkleWitness, TokeniZkAirdrop, AirdropParams, USER_NULLIFIER_TREE_HEIGHT, UserLowLeafWitnessData, UserNullifierMerkleWitness, AirdropClaim } from "../src";
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
let feePayerKey = process.env.TEST_ON_BERKELEY === 'true' ? PrivateKey.fromBase58('EKF1gs7Ug4bQZkPw4jQJ13R4x9FGHb2ZB1A7LEgx6s46QPsVfrDu') : (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), ''));
let feePayer = feePayerKey.toPublicKey();

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: feePayer });
}

let tokenFactoryZkAppKey = PrivateKey.random() //PrivateKey.fromBase58('EKFTrkQTUwfnzvC27Gp9zxJhHqSZ4h7oFJuj2ckB6GQnMxS9vZyF') // Local.testAccounts[1].privateKey;
let tokenFactoryZkAppAddress = tokenFactoryZkAppKey.toPublicKey();

let basicTokenZkAppKey = PrivateKey.random()// (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //feePayerKey //Local.testAccounts[2].privateKey;
let basicTokenZkAppAddress = basicTokenZkAppKey.toPublicKey();

let airdropZkAppKey = PrivateKey.random() //Local.testAccounts[3].privateKey;
let airdropZkAppAddress = airdropZkAppKey.toPublicKey();

let redeemAccountZkAppKey = (await ctx.getFundedAccountForTest(BigInt(1000 * (10 ** 9)), '')) //Local.testAccounts[5].privateKey;
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

console.log('airdropZkAppKey: ', airdropZkAppKey.toBase58());
console.log('airdropZkAppAddress: ', airdropZkAppAddress.toBase58());

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

console.timeEnd('compile (TokeniZkBasicToken)');
console.log('TokeniZkFactory.basicTokenVk: ' + TokeniZkFactory.basicTokenVk.hash);

console.time('compile (TokeniZkAirdrop)');
let tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
console.timeEnd('compile (TokeniZkAirdrop)');

console.time('compile (RedeemAccount)');
let redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
TokeniZkFactory.redeemAccountVk = redeemAccountVk;
console.timeEnd('compile (RedeemAccount)');

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

    VITE_TOKENIZK_AIRDROP_VK: TokeniZkFactory.airdropVk.hash.toString(),
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

if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: tokenFactoryZkAppAddress });
}


console.log('============= deploy TokeniZkFactory =============');
let tokenFactoryZkApp = new TokeniZkFactory(tokenFactoryZkAppAddress);
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

// console.log('============= deploy TokeniZkBasicToken =============');
// if (process.env.TEST_ON_BERKELEY === 'true') {
//     await fetchAccount({ publicKey: tokenFactoryZkAppAddress });
// }
let basicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
let tokenId = TokenId.derive(basicTokenZkAppAddress);
// tx = await Mina.transaction(
//     {
//         sender: feePayer,
//         fee: ctx.txFee,
//         memo: 'Deploy BasicToken contract',
//     },
//     () => {
//         AccountUpdate.fundNewAccount(feePayer);
//         tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams, basicTokenZkAppAddress, tokeniZkBasicTokenVK, Field(2100 * 10000));
//     }
// );

// await ctx.submitTx(tx, {
//     feePayerKey: feePayerKey,
//     otherSignKeys: [basicTokenZkAppKey],
//     logLabel: 'deploy TokenizkBasicToken contract',
// });

// console.log('============= deploy TokeniZkAirdrop =============');
// if (process.env.TEST_ON_BERKELEY === 'true') {
//     await fetchAccount({ publicKey: basicTokenZkAppAddress });
// }

// // airdrop whitelist
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
const leafIndex = Field(0);
const membershipMerkleWitness: WhitelistMembershipMerkleWitness = await whitelistTree.getSiblingPath(leafIndex.toBigInt(), true);

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
    startTime: UInt64.from(1),

    cliffTime: UInt32.from(1),
    cliffAmountRate: UInt64.from(10),
    vestingPeriod: UInt32.from(1), // 0 is not allowed, default value is 1
    vestingIncrement: UInt64.from(10)
});
const vestingParams = airdropParams.vestingParams();

// tx = await Mina.transaction(
//     {
//         sender: feePayer,
//         fee: ctx.txFee,
//         memo: 'Deploy Airdrop contract',
//     },
//     () => {
//         AccountUpdate.fundNewAccount(feePayer);
//         basicTokenZkApp.createAirdrop(lauchpadPlatformParams, airdropZkAppAddress, TokeniZkFactory.airdropVk, airdropParams);
//     }
// );
// // console.log('generated tx: ' + tx.toJSON());

// await ctx.submitTx(tx, {
//     feePayerKey: feePayerKey,
//     otherSignKeys: [basicTokenZkAppKey, airdropZkAppKey],
//     logLabel: 'deploy Airdrop contract',
// });


if (process.env.TEST_ON_BERKELEY === 'true') {
    await fetchAccount({ publicKey: basicTokenZkAppAddress });
    await fetchAccount({ publicKey: airdropZkAppAddress, tokenId });
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
    () => {
        AccountUpdate.fundNewAccount(feePayer);
        tokenFactoryZkApp.createRedeemAccount(lauchpadPlatformParams, redeemAccountZkAppAddress, TokeniZkFactory.redeemAccountVk);
    }
);
await ctx.submitTx(tx, {
    feePayerKey: feePayerKey,
    otherSignKeys: [redeemAccountZkAppKey],
    logLabel: 'Create Redeem Account',
});
