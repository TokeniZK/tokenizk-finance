import cp from "child_process";
import cluster from "cluster";
// import { activeMinaInstance } from "@tokenizk/util";
// import { ProofTaskDto, ProofTaskType, } from "@tokenizk/types";
import config from "./lib/config";

import { ProofPayload } from "./constant";
import { createSubProcesses, SubProcessCordinator } from "./sub-processes-creator";
// import {
//     SimpleZkApp
// } from "@tokenizk/contracts";
import { getLogger } from "./lib/logUtils";
import { $axiosCoreService } from "./lib";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logger = getLogger('proof-gen');

function bootWebServerThread(subProcessCordinator: SubProcessCordinator) {
    // init worker thread A
    let httpWorker = cp.fork(`${__dirname}/web-server.js`, ['child']);
    httpWorker.on('online', () => {
        logger.info('web-server worker is online...');
    })

    httpWorker.on('exit', (exitCode: number) => {
        console.log('webServer process exit...')
        // create a new worker for http-server
        bootWebServerThread(subProcessCordinator);
    })

    httpWorker.on('message', (proofTaskDto: ProofTaskDto<any, any>) => {
        try {
            const sendResultSeqCallback = async (p: any) => {
                proofTaskDto.payload.data.data = p;
                await $axiosCoreService.post('/proof-result', proofTaskDto).then(value => {
                    console.log('$axiosCoreService.post to /proof-result, response:', value);
                }).catch(reason => {
                    console.log('$axiosCoreService.post to /proof-result, error:', reason);
                });
            }

            // recieve from http-server thread
            switch (proofTaskDto.taskType) {
                case ProofTaskType.LOCKED_TOKEN_CLAIM:
                    {
                        let payload = {
                            isProof: false,
                            payload: proofTaskDto.payload
                        } as ProofPayload<any>;

                        subProcessCordinator.lockedTokenClaim(payload, sendResultSeqCallback);
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            // notice: don't throw error, will make primary process exit!
            logger.error(error);
            console.error(error);
        }
    })
}

const proof_generation_init = async () => {
    // init Mina tool
    await activeMinaInstance();// TODO improve it to configure graphyQL endpoint

    if (cluster.isPrimary) {
        let subProcessCordinator = await createSubProcesses(config.subProcessCnt);
        // start web server in worker thread
        bootWebServerThread(subProcessCordinator);
    }/*  else {// sub processes:
        await initWorker();
    } */
}

await proof_generation_init();

