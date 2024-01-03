import { FastifyPlugin } from "fastify"
import { health } from '../plugins'
import { txEndpoints } from "./tx";
import { rollupEndpoints } from "./rollup";

export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(health)
    instance.register(txEndpoints)
    instance.register(rollupEndpoints)
}
