
import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { BaseResponse } from "@anomix/types";
import { parentPort } from "worker_threads";

/**
 * when recieving a high-fee L2tx at 'sequencer', notify 'coordinator' to trigger seq
 */
export const highFeeTxExist: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/tx/high-fee-exist",
        //preHandler: [instance.authGuard],
        schema,
        handler
    })
}

export const handler: RequestHandler<null, null> = async function (
    req,
    res
): Promise<BaseResponse<string>> {
    try {
        // notify worker to seq.
        (process.send as any)({// when it's a subProcess 
            type: 'seq',
            data: ''
        });
        parentPort?.postMessage({// when it's a subThread
            type: 'seq',
            data: ''
        });
        return { code: 0, data: '', msg: '' };
    } catch (err) {
        throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
}

const schema = {
    description: 'when recieving a high-fee L2tx at sequencer, notify coordinator to trigger seq',
    tags: ['L2TX'],
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'string',
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
