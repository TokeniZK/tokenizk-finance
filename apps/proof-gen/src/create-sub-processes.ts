import os from 'os';
import cp, { ChildProcess as Worker } from "child_process";
import { PublicKey } from "o1js";
import { ProofPayload } from './constant';
import { getLogger } from "./lib/logUtils";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './lib/config';
import { SaleRollupProof } from '@tokenizk/contracts';
import { SaleRollupState, SaleActionBatch } from '@tokenizk/contracts';


const logger = getLogger('create-sub-processes');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type SubProcessCordinator = {
    workerMap: Map<string, { worker: Worker; status: WorkerStatus; type: string }[]>,

    saleContributorsBatch: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

    saleContributorsMerge: (proofPayload1: ProofPayload<any>, proofPayload2: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

    presaleContractCall: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

    fairSaleContractCall: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

    privateSaleContractCall: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

    clientAirDropContractCall: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

};

type WorkerStatus = 'IsReady' | 'Busy';

const CircuitName_SaleRollupProver = 'SaleRollupProver';
const CircuitName_TokeniZkPresale = 'TokeniZkPresale';
const CircuitName_TokeniZkFairSale = 'TokeniZkFairSale';
const CircuitName_TokeniZkPrivateSale = 'TokeniZkPrivateSale';
const CircuitName_Client_TokeniZkAirdrop = 'Client_TokeniZkAirdrop';

const cnt_SaleRollupProver = config.cnt_SaleRollupProver;
const cnt_TokeniZkPresale = config.cnt_TokeniZkPresale;
const cnt_TokeniZkFairSale = config.cnt_TokeniZkFairSale;
const cnt_TokeniZkPrivateSale = config.cnt_TokeniZkPrivateSale;
const cnt_Client_TokeniZkAirdrop = config.cnt_Client_TokeniZkAirdrop;

let fairSaleContractCallTimes = 0;
let preSaleContractCallTimes = 0;
let privateSaleContractCallTimes = 0;
let clientAirdropContractCallTimes = 0;

export const createSubProcesses = async () => {
    let cores = os.cpus().length - 2;
    logger.info(`Number of CPUs is ${cores}`);
    logger.info(`Master ${process.pid} is running`);

    let workerMap = new Map<string, { worker: Worker, status: WorkerStatus, type: string }[]>([
        [CircuitName_SaleRollupProver, []],
        [CircuitName_TokeniZkPresale, []],
        [CircuitName_TokeniZkFairSale, []],
        [CircuitName_TokeniZkPrivateSale, []],
        [CircuitName_Client_TokeniZkAirdrop, []]
    ]);

    const createCircuitProcessor = (proverCnt: number, circuitName: string) => {
        const createFn = (proverCnt: number, circuitName: string, index: number) => {
            let worker = cp.fork(__dirname.concat('/provers/proof-worker-').concat(circuitName).concat('.js'), [circuitName]);

            let workerEntity: { worker: Worker, status: WorkerStatus, type: string } = { worker, status: 'Busy', type: circuitName };
            worker.on('message', (message: { type: string }) => {// change to 'IsReady'
                message = JSON.parse(JSON.stringify(message));
                switch (message.type) {
                    case 'online':
                        workerMap.get(circuitName)![index] = workerEntity;
                        break;
                    case 'isReady':
                        workerEntity.status = 'IsReady';
                        break;
                    default:
                        break;
                }
            });
            worker.on('exit', (exitCode: number) => {
                logger.info(`${circuitName} worker exited, exitCode:${exitCode}`);

                const index = workerMap.get(circuitName)!.findIndex((t, i) => {
                    return t.worker == worker;
                });
                // workerMap.get(circuitName)!.splice(index, 1);
                // create a new one again at the same position
                createFn(proverCnt, circuitName, index);
            });

            worker.on('error', (exitCode: number) => {
                logger.info(`${circuitName} worker error!`);
            });
        }

        for (let index = 0; index < proverCnt; index++) {
            createFn(proverCnt, circuitName, index);
        }
    }

    createCircuitProcessor(cnt_SaleRollupProver, CircuitName_SaleRollupProver);

    createCircuitProcessor(cnt_TokeniZkPresale, CircuitName_TokeniZkPresale);

    createCircuitProcessor(cnt_TokeniZkFairSale, CircuitName_TokeniZkFairSale);

    createCircuitProcessor(cnt_TokeniZkPrivateSale, CircuitName_TokeniZkPrivateSale);

    createCircuitProcessor(cnt_Client_TokeniZkAirdrop, CircuitName_Client_TokeniZkAirdrop);


    await waitForAllWorkersReady(workerMap);

    return {
        workerMap,

        saleContributorsBatch: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {
                    const msg = {
                        type: `ROLLUP_BATCH`,
                        payload: { saleRollupState: proofPayload.payload.state, saleActionBatch: proofPayload.payload.actionBatch } as {
                            saleRollupState: SaleRollupState,
                            saleActionBatch: SaleActionBatch
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return SaleRollupProof.fromJSON(proofJson);
                    }

                    generateProof(workerMap.get(CircuitName_SaleRollupProver)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            );
        },

        saleContributorsMerge: async (x: ProofPayload<any>, y: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {

                    const msg = {
                        type: `ROLLUP_MERGE`,
                        payload: { saleRollupProof1: x.payload, saleRollupProof2: y.payload } as {
                            saleRollupProof1: SaleRollupProof,
                            saleRollupProof2: SaleRollupProof
                        },
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return SaleRollupProof.fromJSON(proofJson);
                    }

                    generateProof(workerMap.get(CircuitName_SaleRollupProver)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            );
        },

        presaleContractCall: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {
                    const msg = {
                        type: proofPayload.payload.type,
                        index: {

                        },
                        payload: {
                            ...proofPayload.payload
                            /*
                            feePayer: proofPayload.payload.feePayer,
                            fee: proofPayload.payload.fee,
                            tokenAddress: proofPayload.payload.tokenAddress,
                            contractAddress: proofPayload.payload.contractAddress,
                            methodParams: {
                                saleParams: proofPayload.payload.saleParams,
                                membershipMerkleWitness: proofPayload.payload.membershipMerkleWitness,
                                leafIndex: proofPayload.payload.leafIndex,
                                contributorAddress: proofPayload.payload.contributorAddress,
                                minaAmount: proofPayload.payload.minaAmount
                               
                            }
                            */
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return proofJson;
                    }

                    generateProof(workerMap.get(CircuitName_TokeniZkPresale)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            ).catch(e => {
                console.error(e);
            });
        },

        fairSaleContractCall: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {
                    const msg = {
                        type: proofPayload.payload.type,
                        index: {

                        },
                        payload: {
                            ...proofPayload.payload
                            /*
                            feePayer: proofPayload.payload.feePayer,
                            fee: proofPayload.payload.fee,
                            tokenAddress: proofPayload.payload.tokenAddress,
                            contractAddress: proofPayload.payload.contractAddress,
                            methodParams: {
                                saleParams: proofPayload.payload.saleParams,
                                membershipMerkleWitness: proofPayload.payload.membershipMerkleWitness,
                                leafIndex: proofPayload.payload.leafIndex,
                                contributorAddress: proofPayload.payload.contributorAddress,
                                minaAmount: proofPayload.payload.minaAmount
                               
                            }
                            */
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return proofJson;
                    }

                    generateProof(workerMap.get(CircuitName_TokeniZkFairSale)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            ).catch(e => {
                console.error(e);
            });
        },

        privateSaleContractCall: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {
                    const msg = {
                        type: proofPayload.payload.type,
                        index: {},
                        payload: {
                            ...proofPayload.payload
                            /*
                            feePayer: proofPayload.payload.feePayer,
                            fee: proofPayload.payload.fee,
                            tokenAddress: proofPayload.payload.tokenAddress,
                            contractAddress: proofPayload.payload.contractAddress,
                            methodParams: {
                                saleParams: proofPayload.payload.saleParams,
                                membershipMerkleWitness: proofPayload.payload.membershipMerkleWitness,
                                leafIndex: proofPayload.payload.leafIndex,
                                contributorAddress: proofPayload.payload.contributorAddress,
                                minaAmount: proofPayload.payload.minaAmount
                            }
                            */
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return proofJson;
                    }

                    generateProof(workerMap.get(CircuitName_TokeniZkPrivateSale)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            ).catch(e => {
                console.error(e);
            });
        },

        clientAirDropContractCall: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {
                    const msg = {
                        type: `CONTRACT_CALL`,
                        index: {

                        },
                        payload: {
                            ...proofPayload.payload
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return proofJson;
                    }

                    generateProof(workerMap.get(CircuitName_Client_TokeniZkAirdrop)!, msg, fromJsonFn, resolve, reject, sendCallBack);
                }
            ).catch(e => {
                console.error(e);
            });
        },

    } as SubProcessCordinator;
};

const waitForAllWorkersReady = async (
    workerMap: Map<string, { worker: Worker; status: WorkerStatus; type: string }[]>
): Promise<void> => {
    let allReady = true;
    const executePoll = async (
        resolve: () => void,
        reject: (err: Error) => void | Error
    ) => {
        workerMap.forEach((arrValue, key) => {
            allReady = allReady && !arrValue.some(w => {
                return w.status == 'Busy';
            });
        });

        if (allReady) {
            console.log('all workers are ready!')
            return resolve();
        }
        console.log('wait for all workers ready...')
        setTimeout(executePoll, 60 * 1000, resolve, reject);
    };
    return new Promise(executePoll);
};

function generateProof(
    workers: { worker: Worker, status: WorkerStatus, type: string }[],
    msg: { type: string, payload: any },
    fromJsonFn,
    resolve,
    reject: (err: any) => any | any,
    sendCallBack?: any) {

    return new Promise((s, j) => {

        getFreeWorker(workers, s, j);

    }).then(workerEntity => {

        let workerE = workerEntity as { worker: Worker, status: WorkerStatus, type: string };

        const handler = (message: any) => {
            if (message.type == 'error') {// when meet errors (it's wasm32memory issue at great probability), defaultly restart the childProcess
                workerE.status = 'IsReady';
                return;
            }

            if (message.type == 'done') {
                workerE.status = 'IsReady';
                try {
                    let proofJson = message.payload.payload;
                    if (sendCallBack) {
                        sendCallBack((typeof proofJson == 'string') ? JSON.parse(proofJson) : proofJson);
                    }

                    let proof = fromJsonFn(proofJson);
                    resolve({
                        isProof: true,
                        payload: proof,
                    });
                } catch (error) {
                    reject(error);
                }
            }

            workerE.worker!.removeListener('message', handler);// must rm it here to avoid listener accumulation.

        }
        workerE.worker!.on('message', handler);

        // async exec
        workerE.worker!.send(msg);
    });
}

function getFreeWorker(
    workers: { worker: Worker, status: WorkerStatus, type: string }[],
    resolve,
    reject: (err: any) => any | any
) {
    let worker: { worker: Worker, status: string, type: string } | undefined = undefined;

    worker = workers.find((w) => w.status == 'IsReady');

    if (worker === undefined) {
        console.log('no free worker currently, will ask it again 1mins later...')
        setTimeout(getFreeWorker, 2 * 60 * 1000, workers, resolve, reject);
    } else {
        if (worker.type == CircuitName_TokeniZkPresale) {
            // by return, due to the last process need time to release memory(about wasm32, don't know why, but occurs), or else it will fail!

            logger.info(`worker.type: ${worker.type}, preSaleContractCallTimes:${preSaleContractCallTimes}, workerIndex: ${preSaleContractCallTimes % workers.length}`);

            worker = workers.at(preSaleContractCallTimes % workers.length);
            preSaleContractCallTimes++;

        } else if (worker.type == CircuitName_TokeniZkFairSale) {
            // by return, due to the last process need time to release memory(about wasm32, don't know why, but occurs), or else it will fail!
            logger.info(`worker.type: ${worker.type}, fairSaleContractCallTimes:${fairSaleContractCallTimes}, workerIndex: ${fairSaleContractCallTimes % workers.length}`);

            worker = workers.at(fairSaleContractCallTimes % workers.length);
            fairSaleContractCallTimes++;

        } else if (worker.type == CircuitName_TokeniZkPrivateSale) {
            // by return, due to the last process need time to release memory(about wasm32, don't know why, but occurs), or else it will fail!
            logger.info(`worker.type: ${worker.type}, privateSaleContractCallTimes:${privateSaleContractCallTimes}, workerIndex: ${privateSaleContractCallTimes % workers.length}`);

            worker = workers.at(privateSaleContractCallTimes % workers.length);
            privateSaleContractCallTimes++;

        } else if (worker.type == CircuitName_Client_TokeniZkAirdrop) {
            // by return, due to the last process need time to release memory(about wasm32, don't know why, but occurs), or else it will fail!
            logger.info(`worker.type: ${worker.type}, clientAirdropContractCallTimes:${clientAirdropContractCallTimes}, workerIndex: ${clientAirdropContractCallTimes % workers.length}`);

            worker = workers.at(clientAirdropContractCallTimes % workers.length);
            clientAirdropContractCallTimes++;
        }

        worker!.status = 'Busy';
        return resolve(worker);
    }
}
