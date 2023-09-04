import { FastifyPlugin } from "fastify"

import { health } from './health'
import { proofGenReqEndpoint } from "./proof-gen-req";

export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(health)
    instance.register(proofGenReqEndpoint)
}
