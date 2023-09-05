import os from 'os';
import cluster from 'cluster';
import { PublicKey, Signature, VerificationKey, Field } from 'snarkyjs';
import cp, { ChildProcess, ChildProcess as Worker } from "child_process";

import { ProofPayload } from './constant';
import {
    SimpleZkApp
} from "@tokenizk/contracts";
import { ProofTaskType } from '@tokenizk/types';
import { getLogger } from "./lib/logUtils";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const logger = getLogger('create-sub-processes');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type SubProcessCordinator = {
    workerMap: Map<string, { worker: Worker; status: WorkerStatus; type: string }[]>,

    lockedTokenClaim: (proofPayload: ProofPayload<any>, sendCallBack?: (x: any) => void) => Promise<ProofPayload<any>>,

};

type WorkerStatus = 'IsReady' | 'Busy';

export const createSubProcesses = async (n: number) => {
    let cores = os.cpus().length - 2;
    logger.info(`Number of CPUs is ${cores}`);
    logger.info(`Master ${process.pid} is running`);
    if (cores <= n) {
        throw Error(
            `You have ${cores} cores available, but you are trying to spin up ${n} processes. Please give your CPU some room to breathe!`
        );
    }

    const CircuitName_SimpleZkApp = 'SimpleZkApp';

    let workerMap = new Map<string, { worker: Worker, status: WorkerStatus, type: string }[]>([
        [CircuitName_SimpleZkApp, []],

    ]);
    const cnt_SimpleZkApp = 1;

    const createCircuitProcessor = (proverCnt: number, circuitName: string) => {
        const createFn = (proverCnt: number, circuitName: string) => {
            let worker = cp.fork(__dirname.concat('/provers/proof-worker-').concat(circuitName).concat('.js'), [circuitName]);

            let workerEntity: { worker: Worker, status: WorkerStatus, type: string } = { worker, status: 'Busy', type: circuitName };
            worker.on('message', (message: { type: string }) => {// change to 'IsReady'
                message = JSON.parse(JSON.stringify(message));
                switch (message.type) {
                    case 'online':
                        workerMap.get(circuitName)!.push(workerEntity);
                        break;
                    case 'isReady':
                        workerEntity.status = 'IsReady';
                        break;
                    default:
                        break;
                }
            });
            worker.on('exit', (exitCode: number) => {
                logger.info(`${circuitName} worker exited`);

                const index = workerMap.get(circuitName)!.findIndex((t, i) => {
                    return t.worker == worker;
                });
                workerMap.get(circuitName)!.splice(index, 1);

                // create a new one again
                createFn(proverCnt, circuitName);
            });

        }

        for (let index = 0; index < proverCnt; index++) {
            createFn(proverCnt, circuitName);
        }
    }

    createCircuitProcessor(cnt_SimpleZkApp, CircuitName_SimpleZkApp);

    await waitForAllWorkersReady(workerMap);

    return {
        workerMap,

        lockedTokenClaim: async (proofPayload: ProofPayload<any>, sendCallBack?: any) => {
            return await new Promise(
                (
                    resolve: (payload: ProofPayload<any>) => any,
                    reject: (err: any) => any | any
                ) => {

                    const msg = {
                        type: `${ProofTaskType[ProofTaskType.LOCK_TOKEN_CLAIM]}`,
                        payload: {
                            feePayer: proofPayload.payload.feePayer, verificationKey: proofPayload.payload.verificationKey,
                            withdrawNoteWitnessData: proofPayload.payload.withdrawNoteWitnessData,
                            oldNullWitness: proofPayload.payload.oldNullWitness
                        } as {
                            feePayer: PublicKey,
                            verificationKey: VerificationKey,
                            /*                             
                            withdrawNoteWitnessData: WithdrawNoteWitnessData,
                            lowLeafWitness: LowLeafWitnessData,
                            oldNullWitness: NullifierMerkleWitness 
                            */
                        }
                    };

                    const fromJsonFn = (proofJson: any) => {
                        return proofJson;
                    }

                    generateProof(workerMap.get(CircuitName_SimpleZkApp)!, msg, fromJsonFn, resolve, reject, sendCallBack);

                }
            );
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
        let worker = workerEntity as { worker: Worker, status: WorkerStatus, type: string };
        worker.worker!.on('message', (message: any) => {
            workers.find(
                //(w) => w.worker.process.pid == worker!.worker.process.pid
                (w) => w.worker.pid == worker!.worker.pid
            )!.status = 'IsReady';

            if (message.type == 'done') {
                try {
                    let proofJson = message.payload.payload;
                    if (sendCallBack) {
                        sendCallBack(proofJson);
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
        });

        // async exec
        worker.worker!.send(msg);
    });
}

function getFreeWorker(
    workers: { worker: Worker, status: WorkerStatus, type: string }[],
    resolve,
    reject: (err: any) => any | any
) {
    let worker: { worker: Worker, status: string } | undefined = undefined;

    worker = workers.find((w) => w.status == 'IsReady');

    if (worker === undefined) {
        console.log('no free worker currently, will ask it again 1mins later...')
        setTimeout(getFreeWorker, 2 * 60 * 1000, workers, resolve, reject);
    } else {
        worker!.status = 'Busy';
        return resolve(worker);
    }
}
