import { FastifyPlugin } from "fastify"
import { queryLastBlock } from './query-last-block'

export const networkEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryLastBlock);
}
