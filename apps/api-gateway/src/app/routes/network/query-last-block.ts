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
import { fetchLastBlock } from 'o1js';

const logger = getLogger('queryLastBlock');

export const queryLastBlock: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/query-last-block",
        schema,
        handler
    })
}

let fetchLastBlockTs = 0;
let currentBlockHeight = 0;

const handler: RequestHandler<ClientProveTaskDto, null> = async function (
    req,
    res
): Promise<BaseResponse<{ blockchainLength: number }>> {

    try {
        if (Date.now() - fetchLastBlockTs >= 1.5 * 60 * 1000) {
            currentBlockHeight = Number((await fetchLastBlock()).blockchainLength.toString());
        }
    } catch (err) {
        logger.error(err);
        console.error(err);
    }
    return {
        code: 0,
        data: { blockchainLength: currentBlockHeight },
        msg: ''
    };

}

const schema = {
    description: 'Network Block Info',
    tags: ["Network"],
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'object',
                    properties: {
                        blockchainLength: {
                            type: 'number'
                        }
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
