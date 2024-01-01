import * as dotenv from "dotenv"
dotenv.config({ path: '../../.env' })

const config = {
    httpProtocol: <string>process.env.HTTP_PROTOCOL || 'http',
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
            title: "Anomix Network - proof-generators api documentation",
            version: "0.1.0"
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
    coreServiceHost: <string>process.env.DEPOSIT_PROCESSOR_HOST || '127.0.0.1',
    coreServicePort: <number>Number(<string>process.env.DEPOSIT_PROCESSOR_PORT ?? 8082),

    pinoLogFilePath: <string>process.env.PINO_LOG_FILE_PATH || './',

    subProcessCnt: <number>Number(<string>process.env.PROOR_GENERATOR_SUB_PROCESSOR_COUNT ?? 1),

    cnt_SaleRollupProver: <number>Number(<string>process.env.CNT_DepositRollupProver ?? 1),
    cnt_TokeniZkPresale: <number>Number(<string>process.env.CNT_AnomixEntryContract ?? 1),
    cnt_TokeniZkFairSale: <number>Number(<string>process.env.CNT_JoinSplitProver ?? 1),
    cnt_TokeniZkPrivateSale: <number>Number(<string>process.env.CNT_InnerRollupProver ?? 1),

    proxyMinaEndpoint: <string>process.env.PROXY_MINA_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',
    graphqlArchiveEndpoint: <string>process.env.GRAPHQL_ARCHIVE_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',

}

export default config
