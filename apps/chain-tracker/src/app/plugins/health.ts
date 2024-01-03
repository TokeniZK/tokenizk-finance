import { FastifyPlugin } from "fastify"
import { IncomingMessage, Server } from 'http';

import { RequestHandler } from '@/lib/types';

export const health: FastifyPlugin = async function (
    instance,
    options,
    done
): Promise<void> {
    instance.route({
        method: "GET",
        url: "/health",
        handler
    })
}

const handler: RequestHandler = async function (
    req,
    reply
): Promise<void> {
    reply.send("alive")
}
