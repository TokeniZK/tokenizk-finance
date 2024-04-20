import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { getConnection } from 'typeorm';
import { RequestHandler } from '@/lib/types'
import { BaseResponse, ProofTaskDto, ProofTaskType, ProofTaskDtoSchema, SaleType } from "@tokenizk/types";
import { Mina, PrivateKey, PublicKey } from "o1js";
import fs from "fs";
import { getLogger } from "@/lib/logUtils";
import config from "@/lib/config";
import { ClientProveTask, Sale } from "@tokenizk/entities";
import { $axiosProofGenerator } from "@/lib";
import { getDateString } from "@/lib/timeUtils";

const logger = getLogger('proofCallback');


export const proofCallback = async function (dto: ProofTaskDto) {
    const { taskType, index, payload: payload0 } = dto
    const payload = payload0.data;

    const connection = getConnection();
    const presaleRepo = connection.getRepository(Sale);

    const saleId = index.id;
    // query presaleParams
    const presale = (await presaleRepo.findOne(saleId))!;

    let taskTypes = 0;
    const saleType = presale.saleType;
    switch (saleType) {
        case SaleType.PRESALE:
            taskTypes = ProofTaskType.PRESALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
            break;
        case SaleType.FAIRSALE:
            taskTypes = ProofTaskType.FAIRSALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
            break;
        case SaleType.PRIVATESALE:
            taskTypes = ProofTaskType.PRIVATESALE_CONTRACT_MAINTAIN_CONTRIBUTORS;
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
}
