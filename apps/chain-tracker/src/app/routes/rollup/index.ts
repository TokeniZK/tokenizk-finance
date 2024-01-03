import { FastifyPlugin } from "fastify"
import { proofNotify } from "./proof-notify";

export const rollupEndpoints: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {

    instance.register(proofNotify)

}
