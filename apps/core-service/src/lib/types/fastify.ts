import {
    FastifyRequest,
    FastifyReply,
    RequestParamsDefault,
    RequestBodyDefault,
    FastifyInstance
} from 'fastify';

export type RequestHandler<
    Body = RequestBodyDefault,
    Params = RequestParamsDefault
> = (
    this: FastifyInstance,
    req: FastifyRequest<{
        Body: Body,
        Params: Params
    }>,
    res: FastifyReply
) => any
