import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'

interface IResponseLog {
    statusCode: number
}

interface IRequestLog {
    method?: string
    url?: string
    headers: IncomingHttpHeaders
}

export function responseSerializer(res: ServerResponse): IResponseLog {
    return {
        statusCode: res.statusCode,
    }
}

export function requestSerializer(req: IncomingMessage): IRequestLog {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers,
    }
}