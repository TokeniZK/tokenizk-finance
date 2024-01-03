import { FastifyPlugin } from "fastify"
import { maintainSaleContributors   } from "./maintain-sale-contributors";
import { proofCallback   } from "./proof-callback";
import { syncUserNullifier } from "./sync-user-nullifier";
import { queryNonMembershipWitness } from "./query-user-contribution-witness";

export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(maintainSaleContributors);
    instance.register(proofCallback);
    instance.register(syncUserNullifier);
    instance.register(queryNonMembershipWitness);
}
