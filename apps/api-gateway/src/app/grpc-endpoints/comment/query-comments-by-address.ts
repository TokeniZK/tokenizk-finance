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

export const queryCommentsByAddr = async function (dto: { address: string }): Promise<BaseResponse<Array<CommentDto>>> {
    const { address } = dto;
    console.log('address: '+ address);
    try {
        const connection = getConnection();
        const commentRepo = connection.getRepository(Comment);

        const comments = await commentRepo.find({
            where: {
                projectAddress: address
            },
            order: {
                createdAt: 'ASC'
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
