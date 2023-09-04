import * as dotenv from "dotenv"
dotenv.config({ path: '../../.env' })

const config = {
    port: <number>Number(<string>process.env.PROOF_GENERATOR_PORT ?? 8081),
    logger: {
        prettyPrint: <boolean>(process.env.LOGGING_PRETTY_PRINT === 'true' || true), // change if .env
        level: process.env.LOGGING_LEVEL || 'info',
    },
    auth: {
        jwtSecret: <string>process.env.JWT_SECRET || "gtrpohgkeropk12k3k124oi23j4oifefe",
        jwtExpires: <string>process.env.JWT_EXPIRES || "1d"
    },
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [`'self'`],
                styleSrc: [`'self'`, `'unsafe-inline'`],
                imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
                scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
            }
        }
    },
    swagger: {
        info: {
            title: "TokeniZK Finance - proof-gen api documentation",
            version: "0.0.1"
        },
        host: <string>process.env.SWAGGER_HOST ? (<string>process.env.SWAGGER_HOST).concat(':').concat(<string>process.env.PROOF_GENERATOR_PORT) : 'localhost:'.concat(<string>process.env.PROOF_GENERATOR_PORT),
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
            bearer: {
                type: "http",
                scheme: "bearer",
                name: "Authorization token",
                bearerFormat: "JWT"
            }
        }
    },
    coreServiceHost: <string>process.env.CORE_SERVICE_HOST || '127.0.0.1',
    coreServicePort: <number>Number(<string>process.env.CORE_SERVICE_PORT) || 8080,

    pinoLogFilePath: <string>process.env.PINO_LOG_FILE_PATH || '/var/tokenizk/logs/proof-gen/',

    httpProtocol: <string>process.env.HTTP_PROTOCOL || 'http'

    subProcessCnt: <number>Number(<string>process.env.SUB_PROCESS_CNT ?? 8080),
}

export default config
