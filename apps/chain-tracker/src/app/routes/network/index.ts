import { FastifyPlugin } from "fastify"

import { health } from "../health";

export const networkEndpoint: FastifyPlugin = async (
    instance,
    options,
    // done
    done
): Promise<void> => {
    instance.register(health);

}
