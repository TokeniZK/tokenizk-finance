import { FastifyPlugin } from "fastify"
import { health } from '../plugins'

export const routes: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.register(health)
}
