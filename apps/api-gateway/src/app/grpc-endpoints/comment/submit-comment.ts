import httpCodes from "@inip/http-codes"
import { FastifyPlugin } from "fastify"
import { BaseResponse, ClientProveTaskDto, ClientProveTaskDtoSchema, ProofTaskDto, ProofTaskType } from '@tokenizk/types'
import { RequestHandler } from '@/lib/types'
import fs from 'fs'
import { getConnection } from "typeorm"
import { getLogger } from "@/lib/logUtils"
import { ClientProveTask, UserTokenAirdrop, Comment, Airdrop, Sale } from "@tokenizk/entities"
import { $axiosCore, $axiosProofGen } from "@/lib/api"
import { ClientProofReqType, CommentDto, CommentDtoSchema } from "@tokenizk/types"
import { Signature, PublicKey, Field } from 'o1js';
import { createHash } from "crypto";

const logger = getLogger('submitCommentsByAddr');

export const submitComment = async function (dto: CommentDto): Promise<BaseResponse<number>> {
    // check signature to avoid evil submit
    /* 
        const target = createHash('SHA256').update(dto.projectAddress.concat(dto.comment)).digest('hex');
        const rs = Signature.fromBase58(dto.signature).verify(PublicKey.fromBase58(dto.fromId), [Field(target)]);
    
        if(!rs){
            return {
                code: 1,
                data: '',
                msg: 'signature not valid'
            }
        }
     */
    try {
        const connection = getConnection();
        const commentRepo = connection.getRepository(Comment);

        // check if parent comment existed
        if (dto.parentCommentId) {
            const parentComment = await commentRepo.findOne({
                where: {
                    id: dto.parentCommentId
                }
            });

            if (parentComment) {
                // submit comment
                let comment = new Comment();
                Object.assign(comment, dto);
                comment = await commentRepo.save(comment);
                return {
                    code: 0,
                    data: comment.id,
                    msg: ''
                }
            }
            return {
                code: 1,
                data: 0,
                msg: 'parent comment not found'
            }
        }

        dto.parentCommentId = -1;
        // check if project exited
        if (dto.projectType === 4) {// airdrop
            const airdropRepo = connection.getRepository(Airdrop)
            const airdrop = await airdropRepo.findOne({
                where: {
                    airdropAddress: dto.projectAddress,
                    status: 1
                }
            })
            if (!airdrop) {
                return {
                    code: 1,
                    data: 0,
                    msg: 'project not found'
                }
            }
        } else {//sale
            const saleRepo = connection.getRepository(Sale)
            const sale = await saleRepo.findOne({
                where: {
                    saleAddress: dto.projectAddress,
                    status: 1
                }
            })
            if (!sale) {
                return {
                    code: 1,
                    data: 0,
                    msg: 'project not found'
                }
            }
        }

        // submit comment
        let comment = new Comment();
        Object.assign(comment, dto);
        console.log('comment: ' + JSON.stringify(comment));
        comment = await commentRepo.save(comment);
        return {
            code: 0,
            data: comment.id,
            msg: ''
        }

    } catch (err) {
        logger.error(err);
        console.error(err);
    }
    return {
        code: 1,
        data: 0,
        msg: ''
    }
}
