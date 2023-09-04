/* eslint-disable @typescript-eslint/no-var-requires */
import "./augmentations/fastify"
import fastify, { FastifyInstance } from "fastify"
import fastifyCors from "fastify-cors"
import helmet from "fastify-helmet"
import config from '../lib/config'
import ws from "fastify-websocket"
import { IncomingMessage, Server, ServerResponse } from 'http'

import { requestSerializer, responseSerializer } from './serializers'
import { throwError } from './decorators'
import { routes } from './routes'
import { getLogger } from "../lib/logUtils";

const logger = getLogger('web-server');

export class FastifyCore {

    readonly server: FastifyInstance<Server, IncomingMessage, ServerResponse>

    constructor() {

        this.server = fastify({
            logger: {
                level: config.logger.level,
                prettyPrint: config.logger.prettyPrint,
                redact: ["req.headers.authorization"],
                serializers: {
                    res: responseSerializer,
                    req: requestSerializer,
                },
            } as any
        })

        // Core plugins
        this.server.register(helmet, config.helmet)
        this.server.register(fastifyCors)
        this.server.register(ws)

        // Documentation
        this.server.register(import("fastify-swagger"), {
            routePrefix: "/doc",
            swagger: config.swagger,
            exposeRoute: true
        })

        // Custom plugins
        // this.server.register(bearer)

        // Decorators
        this.server.decorateRequest("throwError", throwError)

        // Routes
        this.server.register(routes)

        this.server.ready(() => {
            logger.info(this.server.printRoutes())
        })

    }

    async listen(): Promise<unknown> {
        try {
            return this.server.listen(config.port, "0.0.0.0")
        } catch (err) {
            this.server.log.error(err)
            process.exit(1)
        }
    }

}
