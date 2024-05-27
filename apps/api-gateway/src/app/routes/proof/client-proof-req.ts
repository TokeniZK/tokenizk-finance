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
import { PublicKey } from "o1js";

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

        let clientProveTask = await clientProveTaskRepo.findOne({
            where: {
                tokenAddress: clientProveTaskDto.tokenAddress,
                targetAddress: clientProveTaskDto.targetAddress,
                userAddress: clientProveTaskDto.userAddress,
                sessionId: clientProveTaskDto.sessionId
            }
        });

        if (!clientProveTask) {
            try {
                PublicKey.fromBase58(clientProveTaskDto.tokenAddress);
            } catch (error) {
                logger.error(`tokenAddress: ${clientProveTaskDto.tokenAddress} is invalid`);

                throw req.throwError(httpCodes.BAD_REQUEST, "tokenAddress is invalid")
            }

            try {
                PublicKey.fromBase58(clientProveTaskDto.targetAddress);
            } catch (error) {
                logger.error(`targetAddress: ${clientProveTaskDto.targetAddress} is invalid`);

                throw req.throwError(httpCodes.BAD_REQUEST, "targetAddress is invalid")
            }

            try {
                PublicKey.fromBase58(clientProveTaskDto.userAddress);
            } catch (error) {
                logger.error(`userAddress: ${clientProveTaskDto.userAddress} is invalid`);

                throw req.throwError(httpCodes.BAD_REQUEST, "userAddress is invalid")
            }
        }

        clientProveTask = clientProveTask ?? new ClientProveTask();
        Object.assign(clientProveTask, clientProveTaskDto);

        clientProveTask.status = 0;
        clientProveTask.createdAt = new Date();
        clientProveTask.updatedAt = new Date();
        clientProveTask = await clientProveTaskRepo.save(clientProveTask);


        const txParams = JSON.parse(clientProveTask.params);
        let proofTaskType = 0;
        if (clientProveTaskDto.type == ClientProofReqType.AIRDROP_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_AIRDROP_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRESALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_PRESALE_CONTRIBUTE_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRESALE_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_PRESALE_CLAIM_TOKEN_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRESALE_REDEEM_FUND) {
            proofTaskType = ProofTaskType.CLIENT_PRESALE_REDEEM_FUND_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.FAIRSALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_FAIRSALE_CONTRIBUTE_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.FAIRSALE_CLAIM_TOKEN) {
            proofTaskType = ProofTaskType.CLIENT_FAIRSALE_CLAIM_TOKEN_PROOF_REQ;

        } else if (clientProveTaskDto.type == ClientProofReqType.PRIVATESALE_CONTRIBUTE) {
            proofTaskType = ProofTaskType.CLIENT_PRIVATESALE_CONTRIBUTE_PROOF_REQ;
        } else if (clientProveTaskDto.type == ClientProofReqType.PRIVATESALE_REDEEM_FUND) {
            proofTaskType = ProofTaskType.CLIENT_PRIVATESALE_REDEEM_FUND_PROOF_REQ;
        }

        try {
            const proofTaskDto = {
                taskType: proofTaskType,
                index: {
                    id: clientProveTask.id,
                },
                payload: {
                    data: {
                        ...txParams
                    }
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
