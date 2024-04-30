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

const logger = getLogger('proofResult');

export const proofResult = async function (
  dto: { userAddress: string, targetAddress: string }
): Promise<BaseResponse<string>> {
  const { userAddress, targetAddress } = dto

  let result = '';
  try {
    const connection = getConnection();
    const clientProveTaskRepo = connection.getRepository(ClientProveTask)

    const clientProveTask = await clientProveTaskRepo.findOne({ userAddress, targetAddress, status: 1 });

    result = clientProveTask?.result ?? '';

  } catch (err) {
    logger.error(err);
    console.error(err);

    throw new Error("Internal server error")
  }

  return {
    code: 0,
    data: result,
    msg: ''
  };
}
