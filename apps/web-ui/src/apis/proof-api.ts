import { $httpInstance } from "@/utils"
import type { BaseResponse, TokenDto } from "@tokenizk/types";

export async function proofReq(proofParams: any) {
    let rs = -1;
    try {
        // request sequencer for the result.
        rs = await $httpInstance.post<BaseResponse<number>>(`/proof-req`, proofParams).then(r => {
            return r.data.data!
        });
    } catch (error) {
        console.error(error);
    }
    return rs;
}

export async function proofResult(proofParams: { userAddress: string, targetAddress: string }) {
    let rs = null;
    try {
        // request sequencer for the result.
        rs = await $httpInstance.post<BaseResponse<string>>(`/proof-result`, proofParams).then(r => {
            return r.data.data
        });
    } catch (error) {
        console.error(error);
    }
    return rs;
}


export const checkProofResult = async (
    proofParams: { userAddress: string, targetAddress: string },
    options?: { maxAttempts?: number; interval?: number },
) => {
    const maxAttempts = options?.maxAttempts ?? 500;
    const interval = options?.interval ?? 20 * 1000;
    let attempts = 0;
    const executePoll = async (
        resolve: (res: string) => string,
        reject: (err: Error) => void | Error,
    ) => {
        let res;
        try {
            res = await proofResult(proofParams);
        } catch (error) {
            return reject(error as Error);
        }
        attempts++;
        if (res) {
            return resolve(res);
        } else if (maxAttempts && attempts === maxAttempts) {
            return reject(
                new Error(
                    `Exceeded max attempts to fetch proof result.`,
                ),
            );
        } else {
            setTimeout(executePoll, interval, resolve, reject);
        }
    };

    // @ts-ignore
    return new Promise(executePoll);
}