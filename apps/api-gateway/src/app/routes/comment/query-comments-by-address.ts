import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, ClientProveTaskDto, ClientProveTaskDtoSchema, ProofTaskDto, ProofTaskType } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import fs from 'fs'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { ClientProveTask, UserTokenAirdrop, Comment } from "@tokenizk/entities"
import { $axiosCore, $axiosProofGen } from "@/lib/api"
import { ClientProofReqType, CommentDto, CommentDtoSchema } from "@tokenizk/types"
import { fetchLastBlock } from 'o1js';

const logger = getLogger('queryCommentsByAddr');

export const queryCommentsByAddr: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/query-comments-by-address",
        schema,
        handler
    })
}

const handler: RequestHandler<null, {address: string}> = async function (
    req,
    res
): Promise<BaseResponse<Array<CommentDto>>> {
    const address = req.params.address;

    try {
        const connection = getConnection();
        const commentRepo = connection.getRepository(Comment);

        const comments = await commentRepo.find({
            where: {
                projectAddress: address
            },
            order: {
                createdAt: 'DESC'
            }
        });
        return {
            code: 0,
            data: comments as any as CommentDto[],
            msg: ''
        };
    } catch (err) {
        logger.error(err);
        console.error(err);
    }
    return {
        code: 1,
        data: [],
        msg: ''
    };

}

const schema = {
    description: 'query comments by project address',
    tags: ["Comments"],
    params: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'project address'
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                code: {
                    type: 'number',
                },
                data: {
                    type: 'array',
                    items: {
                        type: CommentDtoSchema.type,
                        properties: CommentDtoSchema.properties
                    }
                },
                msg: {
                    type: 'string'
                }
            }
        }
    }
}
