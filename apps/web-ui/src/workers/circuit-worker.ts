import {
    Mina,
    AccountUpdate,
    PublicKey,
    UInt64,
    TokenId,
    Field,
    Signature,
    fetchAccount,
} from 'o1js';
import {
    UserLowLeafWitnessData, SaleContributorMembershipWitnessData, UserNullifierMerkleWitness,
    TokeniZkFactory, TokeniZkBasicToken, TokeniZkAirdrop,
    SaleRollupProver, TokeniZkPresale, TokeniZkFairSale, TokeniZkPrivateSale,
    LauchpadPlatformParams, SaleParams, PresaleMinaFundHolder,
    SaleContribution, WhitelistMembershipMerkleWitness, RedeemAccount, AirdropParams
} from "@tokenizk/contracts";
import { ClientProofReqType, type ClientProveTaskDto } from '@tokenizk/types';
import { expose } from "comlink";

import tokenizkFactoryKeypairParams from "../../../../packages/contracts/deploy/tokenizk-factory-keypair-params.json";
import TokeniZkBasicTokenVK from "../../../../packages/contracts/deploy/verification-keys/TokeniZkBasicToken-VK.json";
import TokeniZkPresaleVK from "../../../../packages/contracts/deploy/verification-keys/TokeniZkPresale-VK.json";
import PresaleMinaFundHolderVK from "../../../../packages/contracts/deploy/verification-keys/PresaleMinaFundHolder-VK.json";
import TokeniZkFairSaleVK from "../../../../packages/contracts/deploy/verification-keys/TokeniZkFairSale-VK.json";
import TokeniZkPrivateSaleVK from "../../../../packages/contracts/deploy/verification-keys/TokeniZkPrivateSale-VK.json";
import TokeniZkAirdropVK from "../../../../packages/contracts/deploy/verification-keys/TokeniZkAirdrop-VK.json";
import RedeemAccountVK from "../../../../packages/contracts/deploy/verification-keys/RedeemAccount-VK.json";
import { proofReq, checkProofResult } from '@/apis/proof-api';
import { random } from 'nanoid';
import { randomUUID } from 'crypto';
// import SaleRollupProverVK from "../../../../packages/contracts/deploy/verification-keys/SaleRollupProver-VK.json";

// Error.stackTraceLimit = Infinity;

Mina.setActiveInstance(
    Mina.Network({
        mina: import.meta.env.VITE_MINA_GRAPHQL_URL,
        archive: import.meta.env.VITE_MINA_ARCHIVE_URL,
    }));

// set factory address
TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(tokenizkFactoryKeypairParams.value);
// init vk
TokeniZkFactory.basicTokenVk = { data: TokeniZkBasicTokenVK.data, hash: Field(TokeniZkBasicTokenVK.hash) };
TokeniZkFactory.presaleContractVk = { data: TokeniZkPresaleVK.data, hash: Field(TokeniZkPresaleVK.hash) };
TokeniZkFactory.presaleMinaFundHolderVk = { data: PresaleMinaFundHolderVK.data, hash: Field(PresaleMinaFundHolderVK.hash) };
TokeniZkFactory.fairSaleContractVk = { data: TokeniZkFairSaleVK.data, hash: Field(TokeniZkFairSaleVK.hash) };
TokeniZkFactory.privateSaleContractVk = { data: TokeniZkPrivateSaleVK.data, hash: Field(TokeniZkPrivateSaleVK.hash) };
TokeniZkFactory.redeemAccountVk = { data: RedeemAccountVK.data, hash: Field(RedeemAccountVK.hash) };
TokeniZkFactory.airdropVk = { data: TokeniZkAirdropVK.data, hash: Field(TokeniZkAirdropVK.hash) };

let tokeniZkFactoryCompiled = false;
let tokeniZkBasicTokenCompiled = false;
let saleRollupProverCompiled = false;
let tokeniZkPresaleCompiled = false;
let presaleMinaFundHolderCompiled = false;

let tokeniZkFairSaleCompiled = false;
let tokeniZkPrivateSaleCompiled = false;
let tokeniZkAirdropCompiled = false;

let tokeniZkRedeemAccountCompiled = false;

/*
const launchpadParamDto = {
    basicTokenVk: TokeniZkBasicTokenVK.hash,
    basicTokenCreationFee: import.meta.env.VITE_TOKENIZK_BASIC_TOKEN_CREATION_FEE * (10 ** 9),

    presaleContractVk: TokeniZkPresaleVK.hash,
    presaleCreationFee: import.meta.env.VITE_TOKENIZK_PRESALE_CREATION_FEE * (10 ** 9),
    presaleServiceFeeRate: import.meta.env.VITE_TOKENIZK_PRESALE_SERVICE_FEE_RATE * (10 ** 9),
    presaleMinaFundHolderVk: PresaleMinaFundHolderVK.hash,

    fairSaleContractVk: TokeniZkFairSaleVK.hash,
    fairSaleCreationFee: import.meta.env.VITE_TOKENIZK_FAIRSALE_CREATION_FEE * (10 ** 9),
    fairSaleServiceFeeRate: import.meta.env.VITE_TOKENIZK_FAIRSALE_SERVICE_FEE_RATE * (10 ** 9),

    privateSaleContractVk: TokeniZkPrivateSaleVK.hash,
    privateSaleCreationFee: import.meta.env.VITE_TOKENIZK_PRIVATESALE_CREATION_FEE * (10 ** 9),
    privateSaleServiceFeeRate: import.meta.env.VITE_TOKENIZK_PRIVATESALE_SERVICE_FEE_RATE * (10 ** 9),

    redeemAccountVk: RedeemAccountVK.hash
};
*/

const lauchpadPlatformParams = LauchpadPlatformParams.fromDto(tokenizkFactoryKeypairParams.lauchpadPlatformParams);
console.log('lauchpadPlatformParams: ' + JSON.stringify(lauchpadPlatformParams));

console.log('lauchpadPlatformParams.hash(): ' + lauchpadPlatformParams.hash());

const compileTokeniZkFactory = async () => {
    try {
        if (!tokeniZkFactoryCompiled) {
            console.log('hi, compile compileTokeniZkFactory.....');
            console.time('compile (TokeniZkFactory)');
            await TokeniZkFactory.compile();
            console.timeEnd('compile (TokeniZkFactory)');
            tokeniZkFactoryCompiled = true;
        }

        return true;
    } catch (error) {
        return false;
    }
}

const compileTokeniZkBasicToken = async () => {
    try {
        await compileTokeniZkFactory();

        if (!tokeniZkBasicTokenCompiled) {
            console.log('hi, compile TokeniZkBasicToken.....');

            console.time('compile (TokeniZkBasicToken)');
            const tokeniZkBasicTokenVK = (await TokeniZkBasicToken.compile()).verificationKey;
            TokeniZkFactory.basicTokenVk = tokeniZkBasicTokenVK;
            console.timeEnd('compile (TokeniZkBasicToken)');
            tokeniZkBasicTokenCompiled = true;
        }

        return true;
    } catch (error) {
        return false;
    }
}

const compileTokeniZkAirdrop = async () => {
    try {
        let flag = await compileTokeniZkBasicToken();

        if (flag && !tokeniZkAirdropCompiled) {
            console.log('hi, compile TokeniZkAirdrop.....');

            console.time('compile (TokeniZkAirdrop)');
            const tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
            TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
            console.timeEnd('compile (TokeniZkAirdrop)');
            tokeniZkAirdropCompiled = true;
            flag = true;
        }

        return flag;
    } catch (error) {
        return false;
    }
}


const compileSaleRollupProver = async () => {
    try {
        if (!saleRollupProverCompiled) {
            console.log('hi, compile SaleRollupProver.....');

            console.time('compile (SaleRollupProver)');
            await SaleRollupProver.compile();
            console.timeEnd('compile (SaleRollupProver)');
            saleRollupProverCompiled = true;
        }
        return true;
    } catch (error) {
        return false;
    }
}

const compileTokeniZkPresale = async () => {
    try {
        await compileSaleRollupProver();

        if (!tokeniZkPresaleCompiled) {
            console.log('hi, compile TokeniZkPresale.....');

            console.time('compile (TokeniZkPresale)');
            const tokeniZkPresaleVK = (await TokeniZkPresale.compile()).verificationKey;
            TokeniZkFactory.presaleContractVk = tokeniZkPresaleVK;
            console.timeEnd('compile (TokeniZkPresale)');
            tokeniZkPresaleCompiled = true;
        }

        return true;
    } catch (error) {
        return false;
    }
}

const compilePresaleMinaFundHolder = async () => {
    try {

        // await compileTokeniZkPresale();

        if (!presaleMinaFundHolderCompiled) {
            console.log('hi, compile PresaleMinaFundHolder.....');

            console.time('compile (PresaleMinaFundHolder)');
            const presaleMinaFundHolderVK = (await PresaleMinaFundHolder.compile()).verificationKey;
            TokeniZkFactory.presaleMinaFundHolderVk = presaleMinaFundHolderVK;
            console.timeEnd('compile (PresaleMinaFundHolder)');

            presaleMinaFundHolderCompiled = true;
        }

        return true;
    } catch (error) {
        return false;
    }
}
const compileTokeniZkFairsale = async () => {
    try {

        await compileSaleRollupProver();

        if (!tokeniZkFairSaleCompiled) {
            console.log('hi, compile TokeniZkFairsale.....');

            console.time('compile (TokeniZkFairSale)');
            const tokeniZkFairsaleVK = (await TokeniZkFairSale.compile()).verificationKey;
            TokeniZkFactory.fairSaleContractVk = tokeniZkFairsaleVK;
            console.timeEnd('compile (TokeniZkFairSale)');
            tokeniZkFairSaleCompiled = true;
        }

        return true;
    } catch (error) {
        return false;
    }
}

const compileTokeniZkPrivatesale = async () => {
    try {

        await compileSaleRollupProver();

        if (!tokeniZkPrivateSaleCompiled) {
            console.log('hi, compile TokeniZkPrivatesale.....');

            console.time('compile (TokeniZkPrivateSale)');
            const tokeniZkPrivateSaleVK = (await TokeniZkPrivateSale.compile()).verificationKey;
            TokeniZkFactory.privateSaleContractVk = tokeniZkPrivateSaleVK;
            console.timeEnd('compile (TokeniZkPrivateSale)');
            tokeniZkPrivateSaleCompiled = true;
        }
        return true;
    } catch (error) {
        return false;
    }
}

const compileRedeemAccount = async () => {
    try {
        await compileTokeniZkFactory();

        if (!tokeniZkRedeemAccountCompiled) {
            console.log('hi, compile TokeniZkRedeemAccount.....');

            console.time('compile (TokeniZkRedeemAccount)');
            const tokeniZkRedeemAccountVK = (await RedeemAccount.compile()).verificationKey;
            TokeniZkFactory.redeemAccountVk = tokeniZkRedeemAccountVK;
            console.timeEnd('compile (TokeniZkRedeemAccount)');
            tokeniZkRedeemAccountCompiled = true;
        }
        return true;
    } catch (error) {
        return false;
    }
}

const createBasicToken = async (factoryAddress: string, basicTokenZkAppAddress: string, totalSupply: number,
    feePayerAddress: string, txFee: number) => {
    try {
        await fetchAccount({ publicKey: feePayerAddress });
        await fetchAccount({ publicKey: TokeniZkFactory.tokeniZkFactoryAddress });
        if (await compileTokeniZkFactory()) {


            const feePayer = PublicKey.fromBase58(feePayerAddress);
            const tokenFactoryZkApp = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
            const tx = await Mina.transaction(
                {
                    sender: feePayer,
                    fee: txFee,
                    memo: 'Deploy BasicToken contract',
                },
                async () => {
                    AccountUpdate.fundNewAccount(feePayer);
                    await tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams, PublicKey.fromBase58(basicTokenZkAppAddress), TokeniZkFactory.basicTokenVk, Field(totalSupply));
                }
            );
            await tx.prove();
            const txJson = tx.toJSON();
            console.log('generated tx: ' + txJson);

            return txJson;
        }
    } catch (error) {
        console.error(error);
    }

    return null;
}

const transferToken = async (basicTokenZkAppAddress: string, from: string, to: string, value: number, feePayerAddress: string, txFee: number) => {
    try {
        if (await compileTokeniZkBasicToken()) {
            const feePayer = PublicKey.fromBase58(feePayerAddress);
            const basicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(basicTokenZkAppAddress));

            // check if 'to' has already has a token account
            let toHasAcct = false;
            try {
                const toAccount = await fetchAccount({ publicKey: PublicKey.fromBase58(to), tokenId: TokenId.derive(PublicKey.fromBase58(basicTokenZkAppAddress)) });
                if (toAccount.account) {
                    toHasAcct = true;
                } else if (toAccount.error.statusCode == 404) {
                    toHasAcct = false;
                } else {
                    console.error('fetchAccount error...');
                    return { code: 1, data: undefined, msg: 'fetchAccount error, Please retry later...' }
                }
            } catch (error) {
                console.error('fetchAccount error...');

                return { code: 1, data: undefined, msg: 'fetchAccount error, Please retry later...' }
            }

            const tx = await Mina.transaction(
                {
                    sender: feePayer,
                    fee: txFee,
                    memo: 'Deploy BasicToken contract',
                },
                async () => {
                    if (!toHasAcct) {
                        AccountUpdate.fundNewAccount(feePayer);
                    }
                    await basicTokenZkApp.transferToken(PublicKey.fromBase58(from), PublicKey.fromBase58(to), UInt64.from(value));
                }
            );
            await tx.prove();
            const txJson = tx.toJSON();
            console.log('generated tx: ' + txJson);

            return { code: 0, data: txJson, msg: '' };
        }
    } catch (error) {
        console.error(error);
    }
    return { code: 1, data: undefined, msg: 'fetchAccount error, Please retry later...' }

}

const createSale = async (factoryAddress: string, basicTokenZkAppAddress: string, saleAddress: string, saleParams: {
    tokenAddress: string,
    totalSaleSupply: number,
    saleRate: number,
    whitelistTreeRoot: string,
    softCap: number,
    hardCap: number,
    minimumBuy: number,
    maximumBuy: number,
    startTime: number,
    endTime: number,
    cliffTime: number,
    cliffAmountRate: number,
    vestingPeriod: number, // 0 is not allowed, default value is 1
    vestingIncrement: number
}, feePayerAddress: string, txFee: number) => {
    try {

        // private sale
        if (saleParams.totalSaleSupply == 0 && await compileTokeniZkFactory()) {//PrivateSale
            await fetchAccount({ publicKey: feePayerAddress });
            await fetchAccount({ publicKey: TokeniZkFactory.tokeniZkFactoryAddress });

            const feePayer = PublicKey.fromBase58(feePayerAddress);
            const tokenFactoryZkApp = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);

            const saleParams1 = SaleParams.fromDto(saleParams);
            const tx = await Mina.transaction(
                {
                    sender: feePayer,
                    fee: txFee,
                    memo: 'Deploy PrivateSale contract',
                },
                async () => {
                    AccountUpdate.fundNewAccount(feePayer, 1);
                    await tokenFactoryZkApp.createPrivateSale(lauchpadPlatformParams, saleParams1, PublicKey.fromBase58(saleParams.tokenAddress), PublicKey.fromBase58(saleAddress), TokeniZkFactory.privateSaleContractVk);
                }
            );

            await tx.prove();

            const txJson = tx.toJSON();
            console.log('generated tx: ' + txJson);

            return txJson;
        }

        // belows are presale & fairsale
        if (await compileTokeniZkBasicToken()) {
            await fetchAccount({ publicKey: feePayerAddress });
            await fetchAccount({ publicKey: TokeniZkFactory.tokeniZkFactoryAddress });
            await fetchAccount({ publicKey: basicTokenZkAppAddress });

            const feePayer = PublicKey.fromBase58(feePayerAddress);

            const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(basicTokenZkAppAddress));
            const saleParams1 = SaleParams.fromDto(saleParams);

            const tokenFactoryZkApp = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);

            let tx: any;
            if (saleParams.softCap == 0) {// Fairsale
                tx = await Mina.transaction(
                    {
                        sender: feePayer,
                        fee: txFee,
                        memo: 'Deploy Fairsale contract',
                    },
                    async () => {
                        AccountUpdate.fundNewAccount(feePayer, 1);
                        await tokeniZkBasicTokenZkApp.createFairSale(lauchpadPlatformParams, PublicKey.fromBase58(saleAddress), TokeniZkFactory.fairSaleContractVk, saleParams1);
                    }
                );

            } else {// presale
                tx = await Mina.transaction(
                    {
                        sender: feePayer,
                        fee: txFee,
                        memo: 'Deploy Presale contract',
                    },
                    async () => {
                        AccountUpdate.fundNewAccount(feePayer, 2);
                        await tokeniZkBasicTokenZkApp.createPresale(lauchpadPlatformParams, PublicKey.fromBase58(saleAddress), TokeniZkFactory.presaleContractVk, saleParams1, TokeniZkFactory.presaleMinaFundHolderVk);
                    }
                );
            }

            await tx.prove();

            const txJson = tx.toJSON();
            console.log('generated tx: ' + txJson);

            return txJson;
        }
    } catch (error) {
        console.error(error);
    }
}

const configureSaleParamsPresale = async (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: {
    tokenAddress: string,
    totalSaleSupply: number,
    saleRate: number,
    whitelistTreeRoot: string,
    softCap: number,
    hardCap: number,
    minimumBuy: number,
    maximumBuy: number,
    startTime: number,
    endTime: number,
    cliffTime: number,
    cliffAmountRate: number,
    vestingPeriod: number, // 0 is not allowed, default value is 1
    vestingIncrement: number
}, saleParams1: {
    tokenAddress: string,
    totalSaleSupply: number,
    saleRate: number,
    whitelistTreeRoot: string,
    softCap: number,
    hardCap: number,
    minimumBuy: number,
    maximumBuy: number,
    startTime: number,
    endTime: number,
    cliffTime: number,
    cliffAmountRate: number,
    vestingPeriod: number, // 0 is not allowed, default value is 1
    vestingIncrement: number
}, adminSignature: string, feePayerAddress: string, txFee: number) => {
    if ((await compileTokeniZkBasicToken()) && (await compileTokeniZkPresale())) {
        const feePayer = PublicKey.fromBase58(feePayerAddress);
        const adminSignature1 = Signature.fromJSON(JSON.parse(adminSignature));

        const tokeniZkPresaleZkApp = new TokeniZkPresale(PublicKey.fromBase58(saleAddress), TokenId.derive(PublicKey.fromBase58(basicTokenZkAppAddress)));
        const saleParams0_1 = new SaleParams(
            /* // saleParams0
            {
                tokenAddress: basicTokenZkAppAddress,
                totalSaleSupply: UInt64.from(100 * 10000),
                saleRate: UInt64.from(0),
                whitelistTreeRoot: STANDARD_TREE_INIT_ROOT_12,
                softCap: UInt64.from(0),
                hardCap: UInt64.from(0),
                minimumBuy: UInt64.from(10),
                maximumBuy: UInt64.from(50),
                startTime: UInt64.from(new Date().getTime()),
                endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
                cliffTime: UInt32.from(1),// slot
                cliffAmountRate: UInt64.from(0),
                vestingPeriod: UInt32.from(1), // default value is 1
                vestingIncrement: UInt64.from(0)
            }
            */
        );
        const saleParams1_1 = new SaleParams(
            /* // saleParams1
            {
                tokenAddress: basicTokenZkAppAddress,
                totalSaleSupply: UInt64.from(100 * 10000),
                saleRate: UInt64.from(0),
                whitelistTreeRoot: STANDARD_TREE_INIT_ROOT_12,
                softCap: UInt64.from(0),
                hardCap: UInt64.from(0),
                minimumBuy: UInt64.from(10),
                maximumBuy: UInt64.from(50),
                startTime: UInt64.from(new Date().getTime()),
                endTime: UInt64.from(new Date().getTime() + 20 * 5 * 60 * 1000),
                cliffTime: UInt32.from(1),// slot
                cliffAmountRate: UInt64.from(0),
                vestingPeriod: UInt32.from(1), // default value is 1
                vestingIncrement: UInt64.from(0)
            }
            */
        );
        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: 'Presale.configureSaleParams',
            },
            async () => {
                await tokeniZkPresaleZkApp.configureSaleParams(saleParams0_1, saleParams1_1, adminSignature1);
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
    }
    return null;
}

const contributeSale = async (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: {
    tokenAddress: string,
    totalSaleSupply: number,
    saleRate: number,
    whitelistTreeRoot: string,
    softCap: number,
    hardCap: number,
    minimumBuy: number,
    maximumBuy: number,
    startTime: number,
    endTime: number,
    cliffTime: number,
    cliffAmountRate: number,
    vestingPeriod: number, // 0 is not allowed, default value is 1
    vestingIncrement: number
},
    contributorAddress: string, minaAmount: number,
    membershipMerkleWitness0: string[], leafIndex: string,
    feePayerAddress: string, txFee: number) => {

    let saleType = 0;
    let saleTag = '';
    if (saleParams0.totalSaleSupply == 0) {
        // flag = flag && (await compileTokeniZkPresale());
        saleTag = 'Privatesale'
        saleType = ClientProofReqType.PRIVATESALE_CONTRIBUTE;

    } else if (saleParams0.softCap == 0) {
        // flag = flag && (await compileTokeniZkFairsale());
        saleTag = 'Fairsale'
        saleType = ClientProofReqType.FAIRSALE_CONTRIBUTE;

    } else {
        // flag = flag && (await compileTokeniZkPrivatesale());
        saleTag = 'Presale'
        saleType = ClientProofReqType.PRESALE_CONTRIBUTE;

    }

    const contributeTxParams = {
        feePayer: feePayerAddress,
        fee: txFee,
        tokenAddress: saleParams0.tokenAddress,
        contractAddress: saleAddress,

        methodParams: {
            saleParams: saleParams0,
            membershipMerkleWitness: membershipMerkleWitness0,
            leafIndex,
            contributorAddress,
            minaAmount
        }
    }

    let sessionId = Math.random().toString(36).slice(2)
    const clientProveTaskDto: ClientProveTaskDto = {
        id: 0,
        sessionId,
        type: saleType,
        params: JSON.stringify(contributeTxParams),
        result: '',
        userAddress: feePayerAddress,
        targetAddress: saleAddress,
        tokenAddress: basicTokenZkAppAddress,
        txHash: '',
        status: 0,
        updatedAt: 0,
        createdAt: 0
    };
    const rs = await proofReq(clientProveTaskDto);
    if (rs > 0) {
        try {
            // setInterval to fetch result back
            //
            //
            //
            return await checkProofResult({ userAddress: feePayerAddress, targetAddress: saleAddress, sessionId });
        } catch (error) {
            console.error(error);
        }
    }

    let flag = true;
    if (flag) {
        const feePayer = PublicKey.fromBase58(feePayerAddress);
        await fetchAccount({ publicKey: feePayer });

        const saleAddress1 = PublicKey.fromBase58(saleAddress);
        const tokenId = TokenId.derive(PublicKey.fromBase58(basicTokenZkAppAddress));
        await fetchAccount({ publicKey: saleAddress1, tokenId });

        let tokeniZkSaleZkApp: any = null;
        if (saleParams0.totalSaleSupply == 0) {
            tokeniZkSaleZkApp = new TokeniZkPrivateSale(saleAddress1, tokenId);
        } else if (saleParams0.softCap == 0) {
            tokeniZkSaleZkApp = new TokeniZkFairSale(saleAddress1, tokenId);
        } else {
            tokeniZkSaleZkApp = new TokeniZkPresale(saleAddress1, tokenId);
        }

        const saleParams = SaleParams.fromDto(saleParams0);
        const membershipMerkleWitness = new WhitelistMembershipMerkleWitness(membershipMerkleWitness0.map(x => Field(x)));
        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: `${saleTag}.contribute`,
            },
            async () => {
                await tokeniZkSaleZkApp.contribute(saleParams,
                    PublicKey.fromBase58(contributorAddress),
                    UInt64.from(minaAmount),
                    membershipMerkleWitness, Field(leafIndex));
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
    }
    return null;
}

const claimTokensSale = async (
    saleParams0: {
        tokenAddress: string,
        totalSaleSupply: number,
        saleRate: number,
        whitelistTreeRoot: string,
        softCap: number,
        hardCap: number,
        minimumBuy: number,
        maximumBuy: number,
        startTime: number,
        endTime: number,
        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    },
    saleContributorMembershipWitnessData0: {
        leafData: {
            tokenAddress: string,
            tokenId: string,
            saleContractAddress: string,
            contributorAddress: string,
            minaAmount: string
        },
        siblingPath: string[],
        index: string
    },
    lowLeafWitness0: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string,
        },
        siblingPath: string[],
        index: string,
    },
    oldNullWitness0: string[],
    feePayerAddress: string,
    txFee: number) => {

    let flag = true; // await compileTokeniZkBasicToken();
    //flag = flag && (await compileRedeemAccount());
    let saleType = 0;
    let saleTag = '';
    if (saleParams0.softCap == 0) {
        // flag = flag && (await compileTokeniZkPresale());
        saleTag = 'Fairsale'
        saleType = ClientProofReqType.FAIRSALE_CLAIM_TOKEN;
    } else {
        // flag = flag && (await compileTokeniZkPrivatesale());
        saleTag = 'Presale'
        saleType = ClientProofReqType.PRESALE_CLAIM_TOKEN;
    }

    const saleContribution0 = saleContributorMembershipWitnessData0.leafData;
    const saleAddress = saleContribution0.saleContractAddress;
    const tokenAddress = saleContribution0.tokenAddress;

    const lowLeafWitness = lowLeafWitness0;
    const oldNullWitness = oldNullWitness0;
    const contributeTxParams = {
        feePayer: feePayerAddress,
        fee: txFee,
        tokenAddress: saleParams0.tokenAddress,
        contractAddress: saleAddress,

        methodParams: {
            saleParams: saleParams0,
            saleContributorMembershipWitnessData: saleContributorMembershipWitnessData0,
            lowLeafWitness,
            oldNullWitness
        }
    }

    let sessionId = Math.random().toString(36).slice(2)
    const clientProveTaskDto: ClientProveTaskDto = {
        id: undefined as any as number,
        type: saleType,
        sessionId,
        params: JSON.stringify(contributeTxParams),
        result: undefined as any as string,
        userAddress: feePayerAddress,
        targetAddress: saleAddress,
        tokenAddress,
        txHash: '',
        status: 0,
        updatedAt: 0,
        createdAt: 0
    };
    const rs = 1;// await proofReq(clientProveTaskDto);
    if (rs > 0) {
        try {
            // setInterval to fetch result back
            //
            //
            //
            return await checkProofResult({ userAddress: feePayerAddress, targetAddress: saleAddress, sessionId });
        } catch (error) {
            console.error(error);
        }
    }

    if (flag) {
        const feePayer = PublicKey.fromBase58(feePayerAddress);
        await fetchAccount({ publicKey: feePayer });

        const saleContribution0 = saleContributorMembershipWitnessData0.leafData;
        await fetchAccount({ publicKey: saleContribution0.tokenAddress });
        await fetchAccount({ publicKey: saleContribution0.saleContractAddress, tokenId: Field(saleContribution0.tokenId) });

        const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(saleContribution0.tokenAddress));

        let tokeniZkSaleZkApp: any = null;
        if (saleParams0.softCap == 0) {
            tokeniZkSaleZkApp = new TokeniZkPresale(PublicKey.fromBase58(saleContribution0.saleContractAddress), Field(saleContribution0.tokenId));
        } else {
            tokeniZkSaleZkApp = new TokeniZkFairSale(PublicKey.fromBase58(saleContribution0.saleContractAddress), Field(saleContribution0.tokenId));
        }

        const saleParams = SaleParams.fromDto(saleParams0)

        const saleContribution = SaleContribution.fromJSON({
            tokenAddress: saleContribution0.tokenAddress,
            tokenId: saleContribution0.tokenId,
            saleContractAddress: saleContribution0.saleContractAddress,
            contributorAddress: saleContribution0.contributorAddress,
            minaAmount: saleContribution0.minaAmount
        });

        const saleContributorMembershipWitnessData = SaleContributorMembershipWitnessData.fromDTO(saleContributorMembershipWitnessData0);
        const lowLeafWitness = UserLowLeafWitnessData.fromDTO(lowLeafWitness0);
        const oldNullWitness = new UserNullifierMerkleWitness(oldNullWitness0.map(o => Field(o)));

        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: `${saleTag}.claimTokens`,
            },
            async () => {
                await tokeniZkSaleZkApp.claimTokens(saleParams, saleContributorMembershipWitnessData, lowLeafWitness, oldNullWitness);

                await tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkSaleZkApp.self,
                    saleContribution.contributorAddress, saleContribution.minaAmount, saleParams.vestingParams());
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
    }
    return null;
}

const redeemFunds = async (
    saleParams0: {
        tokenAddress: string,
        totalSaleSupply: number,
        saleRate: number,
        whitelistTreeRoot: string,
        softCap: number,
        hardCap: number,
        minimumBuy: number,
        maximumBuy: number,
        startTime: number,
        endTime: number,
        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    },
    saleContributorMembershipWitnessData0: {
        leafData: {
            tokenAddress: string,
            tokenId: string,
            saleContractAddress: string,
            contributorAddress: string,
            minaAmount: string
        },
        siblingPath: string[],
        index: string
    },
    lowLeafWitness0: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string,
        },
        siblingPath: string[],
        index: string,
    },
    oldNullWitness0: string[],
    feePayerAddress: string,
    txFee: number
) => {
    const saleAddressX = PublicKey.fromBase58(saleContributorMembershipWitnessData0.leafData.saleContractAddress);
    let totalContributedMina = Field(0);
    let contributorTreeRoot = Field(0);

    let saleType = 0;
    let saleTag = '';
    let flag = true; //await compileRedeemAccount();
    if (saleParams0.totalSaleSupply == 0) {
        // flag = flag && (await compileTokeniZkPrivatesale());
        saleTag = 'Privatesale'
        saleType = ClientProofReqType.PRIVATESALE_REDEEM_FUND;

    } else {
        // flag = flag && (await compilePresaleMinaFundHolder());
        saleTag = 'Presale'
        saleType = ClientProofReqType.PRESALE_REDEEM_FUND;

        const saleAccountInfo = await fetchAccount({ publicKey: saleAddressX, tokenId: Field(saleContributorMembershipWitnessData0.leafData.tokenId) });

        if (saleAccountInfo.error) {
            return null;
        }

        totalContributedMina = saleAccountInfo.account.zkapp?.appState[5]!;
        contributorTreeRoot = saleAccountInfo.account.zkapp?.appState[2]!;
    }

    const saleContribution0 = saleContributorMembershipWitnessData0.leafData;
    const saleAddress = saleContribution0.saleContractAddress;
    const tokenAddress = saleContribution0.tokenAddress;

    const lowLeafWitness = lowLeafWitness0;
    const oldNullWitness = oldNullWitness0;
    const contributeTxParams = {
        feePayer: feePayerAddress,
        fee: txFee,
        tokenAddress: saleParams0.tokenAddress,
        contractAddress: saleAddress,

        methodParams: {
            saleParams: saleParams0,
            totalContributedMina: totalContributedMina.toString(),
            contributorTreeRoot: contributorTreeRoot.toString(),
            saleContributorMembershipWitnessData: saleContributorMembershipWitnessData0,
            lowLeafWitness,
            oldNullWitness
        }
    }

    let sessionId = Math.random().toString(36).slice(2)
    const clientProveTaskDto: ClientProveTaskDto = {
        id: undefined as any as number,
        type: saleType,
        sessionId,
        params: JSON.stringify(contributeTxParams),
        result: undefined as any as string,
        userAddress: feePayerAddress,
        targetAddress: saleAddress,
        tokenAddress,
        txHash: '',
        status: 0,
        updatedAt: 0,
        createdAt: 0
    };
    const rs = 1; //await proofReq(clientProveTaskDto);
    if (rs > 0) {
        try {
            // setInterval to fetch result back
            //
            //
            //
            return await checkProofResult({ userAddress: feePayerAddress, targetAddress: saleAddress, sessionId });
        } catch (error) {
            console.error(error);
        }
    }



    ////////////////////////////
    if (flag) {
        const feePayer = PublicKey.fromBase58(feePayerAddress);
        const redeemAccounAddress = feePayer;
        await fetchAccount({ publicKey: feePayer });

        const saleContribution0 = saleContributorMembershipWitnessData0.leafData;
        const saleAddress = PublicKey.fromBase58(saleContribution0.saleContractAddress);
        await fetchAccount({ publicKey: saleAddress });
        await fetchAccount({ publicKey: saleAddress, tokenId: Field(saleContribution0.tokenId) });

        const saleParams = SaleParams.fromDto(saleParams0)

        const saleContributorMembershipWitnessData = SaleContributorMembershipWitnessData.fromDTO(saleContributorMembershipWitnessData0);
        const lowLeafWitness = UserLowLeafWitnessData.fromDTO(lowLeafWitness0);
        const oldNullWitness = new UserNullifierMerkleWitness(oldNullWitness0.map(o => Field(o)));

        let fundZkApp: any;
        if (saleParams0.totalSaleSupply == 0) {
            fundZkApp = new TokeniZkPrivateSale(saleAddress);
        } else {
            fundZkApp = new PresaleMinaFundHolder(saleAddress);
        }

        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: `${saleTag}.redeemFunds`,
            },
            async () => {
                await fundZkApp.redeem(saleParams, saleContributorMembershipWitnessData, lowLeafWitness, oldNullWitness);
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
    }
    return null;
}

type ClaimTokensAirdropParams = {
    airdropAddress0: string,
    airdropParams0: {
        tokenAddress: string,
        totalAirdropSupply: number,
        totalMembersNumber: number,
        whitelistTreeRoot: string,
        startTime: number,
        endTime: number,
        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    },
    membershipMerkleWitness0: string[],
    leafIndex0: string,
    lowLeafWitness0: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string,
        },
        siblingPath: string[],
        index: string,
    },
    oldNullWitness0: string[],
    feePayerAddress: string,
    txFee: number
}

const claimTokensAirdrop = async (
    airdropAddress0: string,
    airdropParams0: {
        tokenAddress: string,
        totalAirdropSupply: number,
        totalMembersNumber: number,
        whitelistTreeRoot: string,
        startTime: number,
        endTime: number,
        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    },
    membershipMerkleWitness0: string[],
    leafIndex0: string,
    lowLeafWitness0: {
        leafData: {
            value: string,
            nextValue: string,
            nextIndex: string,
        },
        siblingPath: string[],
        index: string,
    },
    oldNullWitness0: string[],
    feePayerAddress: string,
    txFee: number
) => {
    const claimTokensAirdropParams = {
        feePayer: feePayerAddress,
        fee: txFee,
        tokenAddress: airdropParams0.tokenAddress,
        contractAddress: airdropAddress0,

        methodParams: {
            airdropParams: airdropParams0,
            membershipMerkleWitness: membershipMerkleWitness0,
            leafIndex: leafIndex0,
            lowLeafWitness: lowLeafWitness0,
            oldNullWitness: oldNullWitness0,
        }
    }

    console.log("claimTokensAirdropParams:" + JSON.stringify(claimTokensAirdropParams));

    let sessionId = Math.random().toString(36).slice(2);
    const clientProveTaskDto: ClientProveTaskDto = {
        id: 0,
        type: ClientProofReqType.AIRDROP_CLAIM_TOKEN,
        sessionId,
        params: JSON.stringify(claimTokensAirdropParams),
        result: '',
        userAddress: feePayerAddress,
        targetAddress: airdropAddress0,
        tokenAddress: airdropParams0.tokenAddress,
        txHash: '',
        status: 0,
        updatedAt: 0,
        createdAt: 0
    };
    const rs = await proofReq(clientProveTaskDto);
    if (rs > 0) {
        // setInterval to fetch result back
        //
        //
        //
        return await checkProofResult({ userAddress: feePayerAddress, targetAddress: airdropAddress0, sessionId });
    }

    const saleTag = 'Airdrop';
    let flag = await compileTokeniZkBasicToken();
    flag = flag && (await compileRedeemAccount());
    flag = flag && (await compileTokeniZkAirdrop());

    if (flag) {
        // try {
        const basicTokenZkAppAddress = PublicKey.fromBase58(airdropParams0.tokenAddress);
        const airdropAddress = PublicKey.fromBase58(airdropAddress0);
        const feePayer = PublicKey.fromBase58(feePayerAddress);

        const tokenId = TokenId.derive(basicTokenZkAppAddress);
        await fetchAccount({ publicKey: feePayer });
        await fetchAccount({ publicKey: basicTokenZkAppAddress });
        await fetchAccount({ publicKey: airdropAddress, tokenId });

        const airdropParams = AirdropParams.fromDto(airdropParams0);
        const membershipMerkleWitness = WhitelistMembershipMerkleWitness.fromJSON({ path: membershipMerkleWitness0.map(m => Field(m)) });
        const leafIndex = Field(leafIndex0);
        const lowLeafWitness = UserLowLeafWitnessData.fromDTO(lowLeafWitness0);
        const oldNullWitness = new UserNullifierMerkleWitness(oldNullWitness0.map(o => Field(o)));

        const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(basicTokenZkAppAddress);
        const tokeniZkAirdropZkApp = new TokeniZkAirdrop(airdropAddress, tokenId);

        const tokenAmount = Math.floor(airdropParams0.totalAirdropSupply / airdropParams0.totalMembersNumber);
        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: `${saleTag}.claimTokens`,
            },
            async () => {
                AccountUpdate.fundNewAccount(feePayer);

                await tokeniZkAirdropZkApp.claimTokens(airdropParams, membershipMerkleWitness, leafIndex, lowLeafWitness, oldNullWitness);

                await tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkAirdropZkApp.self, feePayer, UInt64.from(tokenAmount), airdropParams.vestingParams());
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
        /*
       } catch (e) {
           console.error(e);
       } */

    }
    return null;
}


const deployRedeemAccount = async (feePayer: string, txFee: number) => {
    let flag = false;
    if (await compileRedeemAccount()) {
        flag = true;
    }

    if (flag) {
        const tokenFactoryZkApp = new TokeniZkFactory(TokeniZkFactory.tokeniZkFactoryAddress);
        const redeemAccountZkAppAddress = PublicKey.fromBase58(feePayer);
        const tx = await Mina.transaction(
            {
                sender: redeemAccountZkAppAddress,
                fee: txFee,
                memo: 'deploy Redeem Account',
            },
            async () => {
                // AccountUpdate.fundNewAccount(redeemAccountZkAppAddress);
                await tokenFactoryZkApp.createRedeemAccount(lauchpadPlatformParams, redeemAccountZkAppAddress, TokeniZkFactory.redeemAccountVk);
            }
        );
        await tx.prove();
        const txJson = tx.toJSON();
        console.log('generated tx: ' + txJson);

        return txJson;
    }
    return null;
}

const createAirdrop = async (factoryAddress: string, basicTokenZkAppAddress: string, airdropAddress: string, airdropParams: {
    tokenAddress: string,
    totalAirdropSupply: number,
    totalMembersNumber: number,
    whitelistTreeRoot: string,
    startTime: number,
    cliffTime: number,
    cliffAmountRate: number,
    vestingPeriod: number, // 0 is not allowed, default value is 1
    vestingIncrement: number
}, feePayerAddress: string, txFee: number) => {

    const flag = await compileTokeniZkBasicToken();

    if (flag) {
        try {
            await fetchAccount({ publicKey: feePayerAddress });
            await fetchAccount({ publicKey: TokeniZkFactory.tokeniZkFactoryAddress });
            await fetchAccount({ publicKey: basicTokenZkAppAddress });

            const feePayer = PublicKey.fromBase58(feePayerAddress);

            const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(basicTokenZkAppAddress));
            const airdropParam1 = AirdropParams.fromDto(airdropParams);

            const tx = await Mina.transaction(
                {
                    sender: feePayer,
                    fee: txFee,
                    memo: 'Deploy Airdrop contract',
                },
                async () => {
                    AccountUpdate.fundNewAccount(feePayer, 1);
                    await tokeniZkBasicTokenZkApp.createAirdrop(lauchpadPlatformParams, PublicKey.fromBase58(airdropAddress), TokeniZkFactory.airdropVk, airdropParam1);
                }
            );
            await tx.prove();

            const txJson = tx.toJSON();
            console.log('generated tx: ' + txJson);

            return txJson;
        } catch (error) {
            console.error(error);
        }
    }
}

const circuitController = {
    compileTokeniZkFactory,
    compileTokeniZkBasicToken,
    compileSaleRollupProver,
    compileTokeniZkPresale,
    compilePresaleMinaFundHolder,
    compileTokeniZkFairsale,
    compileTokeniZkPrivatesale,
    compileTokeniZkAirdrop,
    compileRedeemAccount,

    createBasicToken,
    transferToken,

    createSale,
    configureSaleParamsPresale,
    contributeSale,
    redeemFunds,
    claimTokensSale,

    createAirdrop,
    claimTokensAirdrop,

    deployRedeemAccount
}

// await circuitController.compileTokeniZkPresale();

expose(circuitController);

export type CircuitController = typeof circuitController;

