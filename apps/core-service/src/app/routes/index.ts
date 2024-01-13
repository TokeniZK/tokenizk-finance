import { FastifyPlugin } from "fastify"
import { maintainSaleContributors } from "./maintain-sale-contributors";
import { proofCallback } from "./proof-callback";
import { syncUserSaleNullifier } from "./sync-user-sale-nullifier";
import { syncUserAirdropNullifier } from "./sync-user-airdrop-nullifier";
import { queryUserContributionWitness } from "./query-user-contribution-witness";
import { queryUserAirdropWitness } from "./query-user-airdrop-witness";
export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(maintainSaleContributors);
    instance.register(proofCallback);

    instance.register(queryUserContributionWitness);
    instance.register(queryUserAirdropWitness);

    instance.register(syncUserAirdropNullifier);
    instance.register(syncUserSaleNullifier);

}
