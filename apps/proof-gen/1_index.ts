import cp from "child_process";
import cluster from "cluster";
import { activeMinaInstance } from "@tokenizk/util";
import { ProofTaskDto, ProofTaskType } from "@tokenizk/types";
import config from "./lib/config";
import { ProofPayload } from "./constant";
import { createSubProcesses, SubProcessCordinator } from "./create-sub-processes";
import { getLogger } from "./lib/logUtils";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { $axiosCoreService, saveProofTaskDtoFile } from "./lib";
import { saleRollupBatchAndMerge } from "./provers/sale-rollup-handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logger = getLogger('proof-generator');

function bootWebServerThread(subProcessCordinator: SubProcessCordinator, port: string | number) {
    // init worker thread A
    let httpWorker = cp.fork(`${__dirname}/web-server.js`, ['webserver', port.toString()]);
    httpWorker.on('online', () => {
        logger.info(`web-server[port:${port}] worker is online...`);
    })

    httpWorker.on('exit', (exitCode: number) => {
        logger.error(`webServer${port} process exit...`)
        // create a new worker for http-server
        bootWebServerThread(subProcessCordinator, port);
    })

    httpWorker.on('message', (proofTaskDto: ProofTaskDto<any, any>) => {
        try {
            const sendResultCoreServiceCallback = async (p: any) => {
                proofTaskDto.payload = { data: p };
                saveProofTaskDtoFile(proofTaskDto, '.');// save to file for test

                await $axiosCoreService.post('/proof-result', proofTaskDto).then(value => {
                    logger.info('$axiosDeposit.post to /proof-result, response:' + JSON.stringify(value.data));
                }).catch(reason => {
                    logger.error('$axiosDeposit.post to /proof-result, error:' + JSON.stringify(reason));
                });
            }

            // recieve from http-server thread
            switch (proofTaskDto.taskType) {
                case ProofTaskType.SALE_BATCH_MERGE:
                    { // { state: SaleRollupState, actionBatch: SaleActionBatch }[]
                        let payloads = (proofTaskDto.payload as (any[])).map(d => {
                            return {
                                isProof: false,
                                payload: d
                            } as ProofPayload<any>;
                        });

                        saleRollupBatchAndMerge(subProcessCordinator, payloads, sendResultCoreServiceCallback);
                    }
                    break;

                /*
                case ProofTaskType.PRESALE_CONTRACT_CALL:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.index.tokenAddress,
                                saleAddress: proofTaskDto.index.saleAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                saleRollupProof: proofTaskDto.payload.saleRollupProof
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.presaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;
                */

                case ProofTaskType.FAIRSALE_CONTRACT_CALL:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.index.tokenAddress,
                                saleAddress: proofTaskDto.index.saleAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                saleRollupProof: proofTaskDto.payload.saleRollupProof
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.fairSaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.PRIVATESALE_CONTRACT_CALL:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.index.tokenAddress,
                                saleAddress: proofTaskDto.index.saleAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                saleRollupProof: proofTaskDto.payload.saleRollupProof
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.privateSaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.CLIENT_AIRDROP_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.payload.tokenAddress,
                                contractAddress: proofTaskDto.payload.contractAddress,

                                airdropParams: proofTaskDto.payload.airdropParams,
                                membershipMerkleWitness: proofTaskDto.payload.membershipMerkleWitness,
                                leafIndex: proofTaskDto.payload.leafIndex,
                                lowLeafWitness: proofTaskDto.payload.lowLeafWitness,
                                oldNullWitness: proofTaskDto.payload.oldNullWitness
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientAirDropContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.PRESALE_CONTRACT_CALL:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                type: proofTaskDto.taskType,
                                ...proofTaskDto.payload
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientPresaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.CLIENT_PRESALE_CONTRIBUTE_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                type: proofTaskDto.taskType,
                                ...proofTaskDto.payload
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientPresaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;
                case ProofTaskType.CLIENT_PRESALE_CLAIM_TOKEN_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                type: proofTaskDto.taskType,
                                ...proofTaskDto.payload
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientPresaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.CLIENT_PRESALE_REDEEM_FUND_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                type: proofTaskDto.taskType,
                                ...proofTaskDto.payload
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientPresaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.CLIENT_FAIRSALE_CONTRIBUTE_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.payload.saleParams.tokenAddress,
                                contractAddress: proofTaskDto.payload.contractAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                membershipMerkleWitness: proofTaskDto.payload.membershipMerkleWitness,
                                leafIndex: proofTaskDto.payload.leafIndex,
                                contributorAddress: proofTaskDto.payload.contributorAddress,
                                minaAmount: proofTaskDto.payload.minaAmount
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientFairsaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;
                case ProofTaskType.CLIENT_FAIRSALE_CLAIM_TOKEN_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                type: ProofTaskType.CLIENT_FAIRSALE_CLAIM_TOKEN_PROOF_REQ,

                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.payload.saleParams.tokenAddress,
                                contractAddress: proofTaskDto.payload.contractAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                saleContributorMembershipWitnessData: proofTaskDto.payload.saleContributorMembershipWitnessData,
                                lowLeafWitness: proofTaskDto.payload.lowLeafWitness,
                                oldNullWitness: proofTaskDto.payload.oldNullWitness,
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientFairsaleContractCall(payload, sendResultCoreServiceCallback);
                    }
                    break;

                case ProofTaskType.CLIENT_PRIVATESALE_CONTRIBUTE_PROOF_REQ:
                    {
                        let payload = {
                            isProof: false,
                            payload: {
                                feePayer: proofTaskDto.payload.feePayer,
                                fee: proofTaskDto.payload.fee,
                                tokenAddress: proofTaskDto.payload.saleParams.tokenAddress,
                                contractAddress: proofTaskDto.payload.contractAddress,

                                saleParams: proofTaskDto.payload.saleParams,
                                membershipMerkleWitness: proofTaskDto.payload.membershipMerkleWitness,
                                leafIndex: proofTaskDto.payload.leafIndex,
                                contributorAddress: proofTaskDto.payload.contributorAddress,
                                minaAmount: proofTaskDto.payload.minaAmount
                            }
                        } as ProofPayload<any>;

                        subProcessCordinator.clientPrivatesaleContractCall(payload, sendResultCoreServiceCallback);
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
        let subProcessCordinator = await createSubProcesses();
        // start web server in childProcessors
        bootWebServerThread(subProcessCordinator, config.port);
    }
}

await proof_generation_init();

