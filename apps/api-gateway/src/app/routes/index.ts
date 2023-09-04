import { FastifyPlugin } from "fastify"

import { networkEndpoint } from "./network";


export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(networkEndpoint)
}
