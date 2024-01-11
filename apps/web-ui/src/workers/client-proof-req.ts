import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, ClientProveTaskDto, ClientProveTaskDtoSchema, ProofTaskDto, ProofTaskType } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import fs from 'fs'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { ClientProveTask, UserTokenAirdrop } from "@tokenizk/entities"
import { $axiosCore, $axiosProofGen } from "@/lib/api"

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

        clientProveTask = await clientProveTaskRepo.save(clientProveTask);

        // try to send to proof-generator for exec 'SaleRollupProver.processActionsInBatch(*)'
        // if fail, proof-watcher will trigger again later.
        try {
            const proofTaskDto = {
                taskType: ProofTaskType.CLIENT_PROOF_REQ,
                index: {
                    id: clientProveTask.id
                },
                payload: clientProveTaskDto
            } as ProofTaskDto<any, any>;

            const fileName = `./${ProofTaskType[ProofTaskType.CLIENT_PROOF_REQ]}_proofTaskDto_proofReq_${clientProveTask.id}}.json`;
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
