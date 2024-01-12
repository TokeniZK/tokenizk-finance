import { FastifyPlugin } from "fastify"
import { queryUserContributionWitness } from './query-user-contribution-witness.js'
import { queryUserAirdropWitness } from "./query-user-airdrop-witness.js";
export const witnessEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryUserContributionWitness);
  instance.register(queryUserAirdropWitness);
}
