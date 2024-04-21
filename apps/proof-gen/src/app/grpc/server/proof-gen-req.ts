import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse, ProofTaskDto, ProofTaskType, ProofTaskDtoSchema } from "@tokenizk/types";
import { parentPort } from "worker_threads";
import process from "process";

/**
* recieve proof-gen req from 'deposit-processor' & 'sequencer'
*/
export const proofGen = async function (
    req,
    res
){
    const { taskType, index, payload } = req.body;

    (process as any).send({
        taskType,
        index,
        payload: req.body.payload.data
    });

    return {
        code: 0,
        data: '',
        msg: ''
    };
}

