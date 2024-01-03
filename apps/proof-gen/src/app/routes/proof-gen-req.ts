import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, ProofTaskDto, ProofTaskType, ProofTaskDtoSchema } from "@tokenizk/types";
import { parentPort } from "worker_threads";
import process from "process";

/**
* recieve proof-gen req from 'deposit-processor' & 'sequencer'
*/
export const proofGenReqEndpoint: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "POST",
        url: "/proof-gen",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

const handler: RequestHandler<ProofTaskDto<any, any>, null> = async function (
    req,
    res
): Promise<BaseResponse<string>> {
    const { taskType, index, payload } = req.body

    if ([ProofTaskType.PRESALE_BATCH_MERGE, ProofTaskType.PRESALE_CONTRACT_CALL].includes(taskType)) {
        // parentPort?.postMessage(payload);
        (process as any).send(req.body)
    }

    return {
        code: 0,
        data: '',
        msg: ''
    };
}

const schema = {
    description: 'recieve proof-gen req from \'deposit-processor\' & \'sequencer\'',
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

