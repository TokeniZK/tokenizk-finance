
import { type Remote, wrap } from "comlink";

type CircuitController = {
    compileTokeniZkFactory:  () => Promise<boolean>,
    compileTokeniZkBasicToken:  () => Promise<boolean>,
    compileSaleRollupProver:  () => Promise<boolean>,
    compileTokeniZkPresale:  () => Promise<boolean>,
    compilePresaleMinaFundHolder:  () => Promise<boolean>,
    compileTokeniZkFairsale:  () => Promise<boolean>,
    compileTokeniZkPrivatesale:  () => Promise<boolean>,
    compileTokeniZkAirdrop:  () => Promise<boolean>,
    compileRedeemAccount:  () => Promise<boolean>,

    createBasicToken: (factoryAddress: string, basicTokenZkAppAddress: string, totalSupply: number, feePayerAddress: string, txFee: number) => Promise<string | null>,
    transferToken: (basicTokenZkAppAddress: string, from: string, to: string, value: number, feePayerAddress: string, txFee: number) => Promise<{
        code: number;
        data: undefined;
        msg: string;
    } | {
        code: number;
        data: string;
        msg: string;
    }>,

    createSale: (factoryAddress: string, basicTokenZkAppAddress: string, saleAddress: string, saleParams: {
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
    }, feePayerAddress: string, txFee: number) => Promise<any>,

    configureSaleParamsPresale: (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: {
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
    }, adminSignature: string, feePayerAddress: string, txFee: number) => Promise<string | null>,
    
    contributeSale: (basicTokenZkAppAddress: string, saleAddress: string, saleParams0: {
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
        feePayerAddress: string, txFee: number) => Promise<string | null>,
    redeemFunds: (
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
    ) => Promise<string | null>,
    
    claimTokensSale: (
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
        txFee: number) => Promise<string | null>,

    createAirdrop: (factoryAddress: string, basicTokenZkAppAddress: string, airdropAddress: string, airdropParams: {
        tokenAddress: string,
        totalAirdropSupply: number,
        totalMembersNumber: number,
        whitelistTreeRoot: string,
        startTime: number,
        cliffTime: number,
        cliffAmountRate: number,
        vestingPeriod: number, // 0 is not allowed, default value is 1
        vestingIncrement: number
    }, feePayerAddress: string, txFee: number) => Promise<string | null>,

    claimTokensAirdrop: (
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
    ) => Promise<string | null>,

    deployRedeemAccount:(feePayer: string, txFee: number) => Promise<string | null>
}


export const CircuitControllerState = {
    remoteController: null as Remote<CircuitController> | null,
    controllerWorker: null as Worker | null,
};

export const createRemoteCircuitController = async () => {
    console.log("create remote CircuitController...");
    if (CircuitControllerState.controllerWorker !== null) {
        CircuitControllerState.controllerWorker.terminate();
    }

    CircuitControllerState.controllerWorker = new Worker(
        new URL("../workers/circuit-worker.ts", import.meta.url),
        {
            type: "module",
        },
    );
    CircuitControllerState.remoteController = wrap<CircuitController>(CircuitControllerState.controllerWorker);
    console.log("remote CircuitController create success");
};

