import { FastifyPlugin } from "fastify"
import { queryTokenList } from './query-token'
import { createSale } from './submit-token'

export const tokenEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryTokenList);
  instance.register(createSale);
}
