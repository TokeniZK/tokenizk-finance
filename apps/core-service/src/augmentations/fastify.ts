import { IndexDB, PlatformDB, SaleContributorsDB, UserNullifierDB } from "@/worldstate"
import { FastifyReply } from "fastify"


declare module 'fastify' {

    interface FastifyInstance {
        authGuard(request: FastifyRequest, reply: FastifyReply): void
        adminGuard(request: FastifyRequest, reply: FastifyReply): void
        
        platformDB:PlatformDB,
        saleContributorsDB: SaleContributorsDB,
        userNullifierDB: UserNullifierDB,
        indexDB: IndexDB
    }

    interface FastifyRequest {
        throwError<T = unknown>(statusCode: number, message: T, thrownError?: Error): void
    }

}
