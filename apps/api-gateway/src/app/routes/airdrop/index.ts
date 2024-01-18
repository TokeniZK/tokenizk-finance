import { FastifyPlugin } from "fastify"
import { queryAirdropList } from './query-airdrop'
import { queryAirdropListByUser } from './query-airdrop-by-user'
import { queryAirdropDetails } from './query-airdrop-details'
import { claimAirdrop } from './submit-claim'
import { createAirdrop } from './submit-airdrop'
import { queryAirdropMeta } from "./query-airdrop-meta"

export const airdropEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryAirdropMeta);
  instance.register(queryAirdropList);
  instance.register(queryAirdropListByUser);
  instance.register(queryAirdropDetails);
  instance.register(claimAirdrop);
  instance.register(createAirdrop);
}
