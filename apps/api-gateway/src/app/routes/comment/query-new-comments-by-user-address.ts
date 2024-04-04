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

const logger = getLogger('queryNewCommentsByUserAddr');

export const queryNewCommentsByUserAddr: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/query-new-comments-by-user-address",
        schema,
        handler
    })
}

const handler: RequestHandler<null, null, {address: string}, null> = async function (
    req,
    res
): Promise<BaseResponse<Array<CommentDto>>> {
    const address = req.query.address;

    try {
        const connection = getConnection();
        const commentRepo = connection.getRepository(Comment);

        const comments = await commentRepo.find({
            where: {
                toId: address
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
        data: [] as CommentDto[],
        msg: ''
    };
}

const schema = {
    description: 'query new comments by user address',
    tags: ["Comments"],
    querystring: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'user address'
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
