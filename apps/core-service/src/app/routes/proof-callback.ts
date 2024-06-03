
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { getConnection } from 'typeorm';
import { RequestHandler } from '@/lib/types'
import { BaseResponse, ProofTaskDto, ProofTaskType, ProofTaskDtoSchema, SaleType } from "@tokenizk/types";
import { Mina, PrivateKey, PublicKey, Transaction } from "o1js";
import fs from "fs";
import { getLogger } from "@/lib/logUtils";
import config from "@/lib/config";
import { ClientProveTask, Sale } from "@tokenizk/entities";
import { $axiosProofGenerator } from "@/lib";
import { getDateString } from "@/lib/timeUtils";

const logger = getLogger('proofCallback');

/**
* recieve proof result from proof-generator
*/
export const proofCallback: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/proof-result",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<ProofTaskDto<any, any>, null> = async function (
    req,
    res
): Promise<BaseResponse<string>> {
    const { taskType, index, payload: payload0 } = req.body
    const payload = payload0.data;

    const connection = getConnection();
    const presaleRepo = connection.getRepository(Sale);

    if (taskType == ProofTaskType.SALE_BATCH_MERGE) {
        const saleId = index.id;
        // query presaleParams
        const presale = (await presaleRepo.findOne(saleId))!;

        let taskType = 0;
        const saleType = presale.saleType;
        switch (saleType) {
            case SaleType.PRESALE:
                taskType = ProofTaskType.PRESALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
                break;
            case SaleType.FAIRSALE:
                taskType = ProofTaskType.FAIRSALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
                break;
            case SaleType.PRIVATESALE:
                taskType = ProofTaskType.PRIVATESALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
                break;
            default:
                break;
        }

        const presaleParams = presale.generateSaleParam();

        // resend to proof-gen for PRESALE_CONTRACT_MAINTAIN_CONTRIBUTORS. if fail, proof-watcher will trigger again later.
        try {
            const proofTaskDto = {
                taskType,
                index: {
                    id: presale.id,
                    tokenAddress: presale.tokenAddress,
                    saleAddress: presale.saleAddress
                },
                payload: {
                    data: {
                        feePayer: PrivateKey.fromBase58(config.txFeePayerPrivateKey).toPublicKey().toBase58(),
                        fee: config.l1TxFee,
                        tokenAddress: presale.tokenAddress,
                        contractAddress: presale.saleAddress,

                        methodParams: {
                            saleParams: presaleParams,
                            saleRollupProof: payload
                        }
                    }
                }
            } as ProofTaskDto<any, any>;

            const fileName = `./${ProofTaskType[taskType]}_proofTaskDto_proofReq_${getDateString()}.json`;
            fs.writeFileSync(fileName, JSON.stringify(proofTaskDto));

            await $axiosProofGenerator.post<BaseResponse<string>>('/proof-gen', proofTaskDto).then(r => {
                if (r.data.code == 1) {
                    throw new Error(r.data.msg);
                }
            });
        } catch (error) {
            logger.error(error);
        }

    } else if (taskType == ProofTaskType.PRESALE_CONTRACT_MAINTAIN_CONTRIBUTORS
        || taskType == ProofTaskType.FAIRSALE_CONTRACT_MAINTAIN_CONTRIBUTORS
        || taskType == ProofTaskType.PRIVATESALE_CONTRACT_MAINTAIN_CONTRIBUTORS) {
        // sign and broadcast it.
        const l1Tx = Mina.Transaction.fromJSON(payload);
        l1Tx.transaction.feePayer.lazyAuthorization = { kind: 'lazy-signature' };
        await l1Tx.sign([PrivateKey.fromBase58(config.txFeePayerPrivateKey)]);

        await l1Tx.send().then(async pendingTx => {// TODO what if it fails currently!
            try {
                const includedTx = await pendingTx.wait();
                logger.info('tx is confirmed, hash: '+ includedTx.hash);
                // insert L1 tx into db, underlying 
                const connection = getConnection();
                const queryRunner = connection.createQueryRunner();
                await queryRunner.startTransaction();
                try {
                    const presale = (await queryRunner.manager.find(Sale, {}) ?? [])[0];
    
                    presale.contributorsMaintainFlag = 1;
                    presale.contributorsMaintainTxHash = includedTx.hash;
    
                    await queryRunner.manager.save(presale);
    
                    await queryRunner.commitTransaction();
                } catch (error) {
                    logger.error(error);
                    await queryRunner.rollbackTransaction();
                } finally {
                    await queryRunner.release();
                }
            } catch (error) {
                logger.warn('error: broadcast tokenizkRollupContract\'s l1Tx failed!!!');
                    return;
            }           

        }).catch(reason => {
            // TODO log it
            logger.info('whenL1TxComeback failed!', 'reason: ', JSON.stringify(reason));
        });
    } else {
        const clientProveTaskRepo = connection.getRepository(ClientProveTask)

        const clientProveTask = (await clientProveTaskRepo.findByIds([index.id]))[0];
        clientProveTask.result = JSON.stringify(payload);
        clientProveTask.status = 1;
        await clientProveTaskRepo.save(clientProveTask);
    }
    return {
        code: 0,
        data: '',
        msg: 'in queue'
    };
}

const schema = {
    description: 'recieve proof result from proof-gen',
    tags: ["Proof"],
    body: {
        type: "object",
        properties: (ProofTaskDtoSchema as any).properties,
    },
    response: {
        200: {
            type: "object",
            properties: {
                code: {
                    type: 'number',
                    description: '0: success, 1: failure.'
                },
                data: {
                    type: 'string'
                },
                msg: {
                    type: 'string',
                    description: 'the reason or msg related to \'code\''
                }
            },
        }
    }
}

