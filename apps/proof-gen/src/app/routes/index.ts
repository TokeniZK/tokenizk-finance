import { FastifyPlugin } from "fastify"
import { health } from '../plugins'
import { proofGenReqEndpoint } from "./proof-gen-req";
export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(health)
    instance.register(proofGenReqEndpoint)

}
