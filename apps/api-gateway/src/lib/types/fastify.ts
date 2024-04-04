import {
    FastifyRequest,
    FastifyReply,
    RequestParamsDefault,
    RequestBodyDefault,
    RequestQuerystringDefault,
    RequestHeadersDefault
} from 'fastify';

export type RequestHandler<
    Body = RequestBodyDefault,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = RequestHeadersDefault
> = (
    req: FastifyRequest<{
        Body: Body,
        Params: Params,
        Querystring: Querystring,
        Headers: Headers
    }>,
    res: FastifyReply
) => any
