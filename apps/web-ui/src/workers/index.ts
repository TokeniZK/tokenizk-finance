import { FastifyPlugin } from "fastify"
import { proofReq } from './client-proof-req'

export const proofReqEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(proofReq);

}
