import $httpInstance from "./http";
import type { BaseResponse } from "@tokenizk/types";
import BigNumber from "bignumber.js";

export const checkTx = async (
    txId: string,
    options?: { maxAttempts?: number; interval?: number },
) => {
    const { checkZkappTransaction, Mina } = await import('o1js');
    const Blockchain = Mina.Network(import.meta.env.VITE_MINA_GRAPHQL_URL);
    Mina.setActiveInstance(Blockchain);
    const maxAttempts = options?.maxAttempts ?? 500;
    const interval = options?.interval ?? 60 * 1000;
    let attempts = 0;
    const executePoll = async (
        resolve: () => void,
        reject: (err: Error) => void | Error,
    ) => {
        let res;
        try {
            res = await checkZkappTransaction(txId);
        } catch (error) {
            return reject(error as Error);
        }
        attempts++;
        if (res.success) {
            return resolve();
        } else if (res.failureReason) {
            return reject(
                new Error(
                    `Transaction failed.\nTransactionId: ${txId}\nAttempts: ${attempts}\nfailureReason(s): ${res.failureReason}`,
                ),
            );
        } else if (maxAttempts && attempts === maxAttempts) {
            return reject(
                new Error(
                    `Exceeded max attempts.\nTransactionId: ${txId}\nAttempts: ${attempts}\nLast received status: ${res}`,
                ),
            );
        } else {
            setTimeout(executePoll, interval, resolve, reject);
        }
    };

    // @ts-ignore
    return new Promise(executePoll);
}

export const syncLatestBlock = async () => {
    let block;
    try {
        block = await $httpInstance.get<BaseResponse<{ blockchainLength: number }>>('/query-last-block').then(r => {
            return r.data.data
        });

    } catch (error) {
        console.error(error);
    }

    try {
        /*
        if (!block || block?.blockchainLength == 0) {
            block = (await fetchLastBlock()) as any;
        }
        */

        if (block) {
            return {
                blockchainLength: Number(block.blockchainLength.toString())
            }
        }

        return {
            blockchainLength: 0
        }
    } catch (error) {
        console.error(error);
    }

}

/**
 * convertToMinaUnit 
 * @param nanomina 
 * @returns 
 */
const convertToMinaUnit = (
    nanomina: string | number | bigint | null | undefined,
) => {
    if (nanomina === undefined || nanomina === null) {
        return null;
    }
    let tempValue: string;
    if (typeof nanomina === "bigint") {
        if (nanomina === 0n) {
            return new BigNumber(0);
        }
        tempValue = nanomina.toString();
    } else if (typeof nanomina === "number") {
        if (nanomina === 0) {
            return new BigNumber(0);
        }
        tempValue = nanomina.toString();
    } else {
        tempValue = nanomina;
    }

    const x = new BigNumber(tempValue);
    let result = x.dividedBy(MINA);
    return result;
};

/**
 * convertToNanoMinaUnit
 * @param mina 
 * @returns 
 */
const convertToNanoMinaUnit = (
    mina: string | number | bigint | null | undefined,
) => {
    if (mina === undefined || mina === null) {
        return null;
    }
    let tempValue: string;
    if (typeof mina === "bigint") {
        if (mina === 0n) {
            return new BigNumber(0);
        }
        tempValue = mina.toString();
    } else if (typeof mina === "number") {
        if (mina === 0) {
            return new BigNumber(0);
        }
        tempValue = mina.toString();
    } else {
        tempValue = mina;
    }

    const x = new BigNumber(tempValue);
    let result = x.multipliedBy(MINA);
    return result;
};
