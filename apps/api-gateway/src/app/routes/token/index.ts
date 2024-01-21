import { FastifyPlugin } from "fastify"
import { queryTokenList } from './query-token'
import { createToken } from './submit-token'
import { createUserTokenTransfer } from "./submit-user-token-transfer";

export const tokenEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryTokenList);
  instance.register(createToken);
  instance.register(createUserTokenTransfer);
}
