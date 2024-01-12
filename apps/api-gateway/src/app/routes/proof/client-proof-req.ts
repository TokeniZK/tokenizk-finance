import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, ClientProveTaskDto, ClientProveTaskDtoSchema, ProofTaskDto, ProofTaskType } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import fs from 'fs'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { ClientProveTask, UserTokenAirdrop } from "@tokenizk/entities"
import { $axiosCore, $axiosProofGen } from "@/lib/api"
import { ClientProofReqType } from "@tokenizk/types"

const logger = getLogger('proofReq');

export const proofReq: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/proof-req",
        schema,
        handler
    })
}

const handler: RequestHandler<ClientProveTaskDto, null> = async function (
    req,
    res
): Promise<BaseResponse<number>> {
    const clientProveTaskDto = req.body

    try {
        const connection = getConnection();
        const clientProveTaskRepo = connection.getRepository(ClientProveTask)

        let clientProveTask = new ClientProveTask();
        Object.assign(clientProveTask, clientProveTaskDto);

        clientProveTask.status = 0;
        clientProveTask.createdAt = new Date();
        clientProveTask.updatedAt = new Date();
        clientProveTask = await clientProveTaskRepo.save(clientProveTask);


        const txParams = JSON.parse(clientProveTask.params);
        let methodParams = {};
        let proofTaskType = 0;
        if (clientProveTaskDto.type == ClientProofReqType.AIRDROP_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_AIRDROP_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRESALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_PRESALE_CONTRIBUTE_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRESALE_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_PRESALE_CLAIM_TOKEN_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.FAIRSALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_FAIRSALE_CONTRIBUTE_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.FAIRSALE_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_FAIRSALE_CLAIM_TOKEN_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRIVATESALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_PRIVATESALE_CONTRIBUTE_PROOF_REQ;

        }

        try {
            const proofTaskDto = {
                taskType: proofTaskType,
                index: {
                    id: clientProveTask.id,
                },
                payload: {
                    ...txParams
                }
            } as ProofTaskDto<any, any>;

            const fileName = `./${ProofTaskType[proofTaskType]}_proofTaskDto_proofReq_${clientProveTask.id}}.json`;
            fs.writeFileSync(fileName, JSON.stringify(proofTaskDto));

            await $axiosProofGen.post<BaseResponse<string>>('/proof-gen', proofTaskDto).then(r => {
                if (r.data.code == 1) {
                    throw new Error(r.data.msg);
                }
            });
        } catch (error) {
            logger.error(error);
        }

        return {
            code: 0,
            data: clientProveTask.id,
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);

        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'Client proof req',
    tags: ["Proof"],
    body: {
        type: ClientProveTaskDtoSchema.type,
        properties: ClientProveTaskDtoSchema.properties
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'number'
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
