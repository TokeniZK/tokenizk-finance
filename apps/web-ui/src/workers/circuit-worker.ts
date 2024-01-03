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
    ContributorsMembershipMerkleWitness,
    TokeniZkFactory, TokeniZkBasicToken,
    SaleRollupProver, TokeniZkPresale, TokeniZkFairSale, TokeniZkPrivateSale, LauchpadPlatformParams, SaleParams, PresaleMinaFundHolder, SaleContribution
} from "@tokenizk/contracts";
import { expose } from "comlink";

let tokeniZkFactoryCompiled = false;
let tokeniZkBasicTokenCompiled = false;
let saleRollupProverCompiled = false;
let tokeniZkPresaleCompiled = false;
let presaleMinaFundHolderCompiled = false;

let tokeniZkFairSaleCompiled = false;
let tokeniZkPrivateSaleCompiled = false;

TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(import.meta.env.VITE_TOKENIZK_FACTORY_ADDR);
console.log('TokeniZkFactory.tokeniZkFactoryAddress: ' + TokeniZkFactory.tokeniZkFactoryAddress);

const lauchpadPlatformParams0 = new LauchpadPlatformParams(
    /*
        {
        basicTokenVk: Field(import.meta.env.VITE_TOKENIZK_BASIC_TOKEN_VK),
        basicTokenCreationFee: UInt64.from(import.meta.env.VITE_TOKENIZK_BASIC_TOKEN_CREATION_FEE),

        presaleContractVk: Field(import.meta.env.VITE_TOKENIZK_PRESALE_VK),
        presaleCreationFee: UInt64.from(import.meta.env.VITE_TOKENIZK_PRESALE_CREATION_FEE),
        presaleServiceFeeRate: UInt64.from(import.meta.env.VITE_TOKENIZK_PRESALE_SERVICE_FEE_RATE),
        presaleMinaFundHolderVk: Field(import.meta.env.VITE_TOKENIZK_PRESALE_MINA_FUND_HOLDER_VK),

        fairSaleContractVk: Field(import.meta.env.VITE_TOKENIZK_FAIRSALE_VK),
        fairSaleCreationFee: UInt64.from(import.meta.env.VITE_TOKENIZK_FAIRSALE_CREATION_FEE),
        fairSaleServiceFeeRate: UInt64.from(import.meta.env.VITE_TOKENIZK_FAIRSALE_SERVICE_FEE_RATE),

        privateSaleContractVk: Field(import.meta.env.VITE_TOKENIZK_PRIVATESALE_VK),
        privateSaleCreationFee: UInt64.from(import.meta.env.VITE_TOKENIZK_PRIVATESALE_CREATION_FEE),
        privateSaleServiceFeeRate: UInt64.from(import.meta.env.VITE_TOKENIZK_PRIVATESALE_SERVICE_FEE_RATE),

        redeemAccountVk: Field(import.meta.env.VITE_TOKENIZK_REDEEM_ACCOUNT_VK)
        }
    */
);

const compileTokeniZkBasicToken = async () => {
    console.log('hi, compile TokeniZkBasicToken.....');
    try {
        if (!tokeniZkFactoryCompiled) {
            console.time('compile (TokeniZkFactory)');
            await TokeniZkFactory.compile();
            console.timeEnd('compile (TokeniZkFactory)');
            tokeniZkFactoryCompiled = true;
        }

        if (!tokeniZkBasicTokenCompiled) {
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

const compileSaleRollupProver = async () => {
    console.log('hi, compile SaleRollupProver.....');

    try {
        if (!saleRollupProverCompiled) {
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

        console.log('hi, compile TokeniZkPresale.....');

        if (!tokeniZkPresaleCompiled) {
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

        await compileTokeniZkPresale();

        if (!presaleMinaFundHolderCompiled) {

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

const createBasicToken = async (factoryAddress: string, basicTokenZkAppAddress: string, totalSupply: number,
    feePayerAddress: string, txFee: number) => {
    if (await compileTokeniZkBasicToken()) {
        const feePayer = new PublicKey(feePayerAddress);
        const tokenFactoryZkApp = new TokeniZkFactory(PublicKey.fromBase58(factoryAddress));
        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: 'Deploy BasicToken contract',
            },
            () => {
                AccountUpdate.fundNewAccount(feePayer);
                tokenFactoryZkApp.createBasicToken(lauchpadPlatformParams0, PublicKey.fromBase58(basicTokenZkAppAddress), TokeniZkFactory.basicTokenVk, Field(totalSupply));
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const transferToken = async (basicTokenZkAppAddress: string, from: string, to: string, value: number, feePayerAddress: string, txFee: number) => {
    if (await compileTokeniZkBasicToken()) {
        const feePayer = new PublicKey(feePayerAddress);
        const basicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(basicTokenZkAppAddress));

        // check if 'to' has already has a token account
        let toHasAcct = false;
        try {
            const toAccount = await fetchAccount({ publicKey: PublicKey.fromBase58(to), tokenId: TokenId.derive(PublicKey.fromBase58(basicTokenZkAppAddress)) });
            if (toAccount.account) {
                toHasAcct = true;
            } else if (toAccount.error) {
                console.error('fetchAccount error...');
            }
        } catch (error) {
            console.error('fetchAccount error...');
        }

        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: 'Deploy BasicToken contract',
            },
            () => {
                if (!toHasAcct) {
                    AccountUpdate.fundNewAccount(feePayer);
                }
                basicTokenZkApp.transferToken(PublicKey.fromBase58(from), PublicKey.fromBase58(to), UInt64.from(value));
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const createPresale = async (factoryAddress: string, basicTokenZkAppAddress: string, saleAddress: string, saleParams: any, feePayerAddress: string, txFee: number) => {
    if ((await compileTokeniZkBasicToken()) && (await compileTokeniZkPresale())) {
        const feePayer = new PublicKey(feePayerAddress);
        // const tokenFactoryZkApp = new TokeniZkFactory(PublicKey.fromBase58(factoryAddress));
        // TODO !! to handle 'TokeniZkFactory.tokeniZkFactoryAddress' within createPresale !! 
        //
        const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(basicTokenZkAppAddress));
        const saleParams1 = new SaleParams(
            /*
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
                memo: 'Deploy Presale contract',
            },
            () => {
                AccountUpdate.fundNewAccount(feePayer, 2);
                tokeniZkBasicTokenZkApp.createPresale(lauchpadPlatformParams0, PublicKey.fromBase58(saleAddress), TokeniZkFactory.presaleContractVk, saleParams1, TokeniZkFactory.presaleMinaFundHolderVk);
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const configureSaleParams = async (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: any, saleParams1: any, adminSignature: string, feePayerAddress: string, txFee: number) => {
    if ((await compileTokeniZkBasicToken()) && (await compileTokeniZkPresale())) {
        const feePayer = new PublicKey(feePayerAddress);
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
            () => {
                tokeniZkPresaleZkApp.configureSaleParams(saleParams0_1, saleParams1_1, adminSignature1);
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const contributePresale = async (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: any,
    contributorAddress: string, minaAmount: number,
    membershipMerkleWitness0: string[], leafIndex: string,
    feePayerAddress: string, txFee: number) => {
    if ((await compileTokeniZkBasicToken()) && (await compileTokeniZkPresale())) {
        const feePayer = new PublicKey(feePayerAddress);

        const tokeniZkPresaleZkApp = new TokeniZkPresale(PublicKey.fromBase58(saleAddress), TokenId.derive(PublicKey.fromBase58(basicTokenZkAppAddress)));
        const saleParams = new SaleParams(
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
        const membershipMerkleWitness = new ContributorsMembershipMerkleWitness(membershipMerkleWitness0.map(x => Field(x)));
        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: 'Presale.contribute',
            },
            () => {
                tokeniZkPresaleZkApp.contribute(saleParams,
                    PublicKey.fromBase58(contributorAddress),
                    UInt64.from(minaAmount),
                    membershipMerkleWitness, Field(leafIndex));
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const claimTokens = async (
    saleParams0: any,
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
    feePayerAddress: string, txFee: number) => {

    if ((await compileTokeniZkBasicToken()) && (await compileTokeniZkPresale())) {
        const feePayer = new PublicKey(feePayerAddress);

        const saleContribution0 = saleContributorMembershipWitnessData0.leafData;
        const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(PublicKey.fromBase58(saleContribution0.tokenAddress));
        const tokeniZkPresaleZkApp = new TokeniZkPresale(PublicKey.fromBase58(saleContribution0.saleContractAddress), TokenId.derive(PublicKey.fromBase58(saleContribution0.tokenAddress)));
        const saleParams = new SaleParams(
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

        /* 
        const saleContribution = new SaleContribution(
            // saleContribution0
            {
                tokenAddress: basicTokenZkAppAddress,
                tokenId: UInt64.from(1),
                saleContractAddress: saleAddress,
                contributorAddress: contributorAddress,
                minaAmount: UInt64.from(10000)
            }
        );
        */
        const saleContribution = SaleContribution.fromJson({
            tokenAddress: PublicKey.empty(),
            tokenId: UInt64.from(1),
            saleContractAddress: PublicKey.empty(),
            contributorAddress: PublicKey.empty(),
            minaAmount: UInt64.from(10000)
        });

        const saleContributorMembershipWitnessData = SaleContributorMembershipWitnessData.fromDTO(saleContributorMembershipWitnessData0);

        const lowLeafWitness = UserLowLeafWitnessData.fromDTO(lowLeafWitness0);

        const oldNullWitness = new UserNullifierMerkleWitness(oldNullWitness0.map(o => Field(0)));

        const tx = await Mina.transaction(
            {
                sender: feePayer,
                fee: txFee,
                memo: 'Presale.claimTokens',
            },
            () => {
                tokeniZkPresaleZkApp.claimTokens(saleParams, saleContributorMembershipWitnessData, lowLeafWitness, oldNullWitness);

                tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkPresaleZkApp.self,
                    saleContribution.contributorAddress, UInt64.from(saleContribution.minaAmount), saleParams.vestingParams());
            }
        );
        await tx.prove();
        console.log('generated tx: ' + tx.toJSON());

        return tx.toJSON();
    }
    return null;
}

const redeemTokens = async (
    saleParams0: any,
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
    feePayerAddress: string, txFee: number) => {
    //
}

const circuitController = {
    compileTokeniZkBasicToken,
    compileSaleRollupProver,
    compileTokeniZkPresale,
    compilePresaleMinaFundHolder,
    compileTokeniZkFairsale,
    compileTokeniZkPrivatesale,

    createBasicToken,
    transferToken,
    createPresale,
    configureSaleParams,
    contributePresale,
    redeemTokens,
    claimTokens
}

await circuitController.compileTokeniZkPresale();

expose(circuitController);

export type CircuitController = typeof circuitController;

