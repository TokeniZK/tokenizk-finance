import { FastifyPlugin } from "fastify"
import { health } from '../plugins'
import { airdropEndpoint } from "./airdrop";
import { saleEndpoint } from "./sale";
import { tokenEndpoint } from "./token";
import { userEndpoint } from "./user";
import { witnessEndpoint } from "./witness";
import { proofReqEndpoint } from "./proof";
import { networkEndpoint } from "./network";

export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(health);
    instance.register(tokenEndpoint);
    instance.register(witnessEndpoint);
    instance.register(userEndpoint);
    instance.register(saleEndpoint);
    instance.register(airdropEndpoint);
    instance.register(proofReqEndpoint);
    instance.register(networkEndpoint);
}
