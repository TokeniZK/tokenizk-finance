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

export const proofResult: FastifyPlugin = async function (
  instance,
  options,
  done
): Promise<void> {
  instance.route({
    method: "POST",
    url: "/proof-result",
    schema,
    handler
  })
}

const handler: RequestHandler<{ userAddress: string, targetAddress: string }, null> = async function (
  req,
  res
): Promise<BaseResponse<string>> {
  const { userAddress, targetAddress } = req.body

  let result = '';
  try {
    const connection = getConnection();
    const clientProveTaskRepo = connection.getRepository(ClientProveTask)

    const clientProveTask = await clientProveTaskRepo.findOne({ userAddress, targetAddress, status: 1 });

    result = clientProveTask?.result ?? '';

  } catch (err) {
    logger.error(err);
    console.error(err);

    throw req.throwError(httpCodes.INTERNAL_SERVER_ERROR, "Internal server error")
  }

  return {
    code: 0,
    data: result,
    msg: ''
  };
}

const schema = {
  description: 'Client proof result',
  tags: ["Proof"],
  body: {
    userAddress: {
      type: 'string'
    },
    targetAddress: {
      type: 'string'
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
          type: 'string'
        },
        msg: {
          type: 'string'
        }
      }
    }
  }
}
