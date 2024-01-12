import { FastifyPlugin } from "fastify"
import { proofReq } from './client-proof-req'
import { proofResult } from './client-proof-result'

export const proofReqEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(proofReq);
  instance.register(proofResult);
}
