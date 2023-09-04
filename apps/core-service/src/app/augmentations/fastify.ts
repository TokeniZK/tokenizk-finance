import fastify from "fastify"
import { FastifyRequest, FastifyReply } from "fastify"

declare module 'fastify' {

    interface FastifyInstance {
        authGuard(request: FastifyRequest, reply: FastifyReply): void
        adminGuard(request: FastifyRequest, reply: FastifyReply): void
    }

    interface FastifyRequest {
        throwError<T = unknown>(statusCode: number, message: T, thrownError?: Error): void
    }

}
