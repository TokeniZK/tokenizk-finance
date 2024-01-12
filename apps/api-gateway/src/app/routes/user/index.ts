import { FastifyPlugin } from "fastify"
import { queryTokenByUser } from './query-token-by-user'

export const userEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryTokenByUser);
}
