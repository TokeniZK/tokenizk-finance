import fs from "fs";
import * as dotenv from "dotenv"

dotenv.config({ path: '../../.env' })
const tokenizkFactoryKeypairParams: { key: string, value: string, lauchpadPlatformParams: any } = JSON.parse(fs.readFileSync("../../packages/contracts/deploy/tokenizk-factory-keypair-params.json").toString());

const config = {
    port: <number>Number(<string>process.env.CORE_SERVICE_PORT) || 8080,
    logger: {
        prettyPrint: <boolean>(process.env.LOGGING_PRETTY_PRINT === 'true' || true), // change if .env
        level: process.env.LOGGING_LEVEL || 'info',
    },
    typeORM: {
        type: <string>process.env.TYPE_ORM_CONNECTION || "mysql",
        host: <string>process.env.TYPE_ORM_HOST || "localhost", // "localhost" | "mysql" ~ docker,
        port: <number>Number(<string>process.env.TYPE_ORM_PORT) || 3060, // 3060 | 5432 ~ docker
        username: <string>process.env.TYPE_ORM_USERNAME || "mysql",
        password: <string>process.env.TYPE_ORM_PASSWORD || "deger",
        database: <string>process.env.TYPE_ORM_DATABASE || "unknown_db",
        //synchronize: <boolean>(process.env.TYPE_ORM_SYNCHRONIZE === "true" || true), // change if .env
        logging: <boolean>(process.env.TYPE_ORM_LOGGING === "true" || true), // change if .env
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
            title: "TokeniZK Finance - openAPI api documentation",
            version: "0.1.0"
        },
        host: ((<string>process.env.SWAGGER_HOST) ?? 'localhost') == 'localhost' ? 'localhost'.concat(':').concat(<string>process.env.CORE_SERVICE_PORT) : (<string>process.env.SWAGGER_HOST),
        schemes: [<string>process.env.SWAGGER_SCHEME ?? 'http'],
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
    pinoLogFilePath: <string>process.env.PINO_LOG_FILE_PATH || '/var/tokenizk/logs/',

    indexedDBPath: <string>process.env.INDEXED_DB_PATH || '/var/tokenizk/db/',
    saleContributorsDBPath: <string>process.env.SALE_CONTRIBUTORS_DB_PATH || '/var/tokenizk/db/',
    userNullifierDBPath: <string>process.env.USER_NULLIFIER_DB_PATH || '/var/tokenizk/db/',

    proofGenHost: <string>process.env.PROOF_GENERATOR_HOST || '127.0.0.1',
    proofGenPort: <number>Number(<string>process.env.PROOF_GENERATOR_PORT ?? 8081),

    txFeePayerPrivateKey: <string>process.env.TX_FEE_PAYER_KEY || tokenizkFactoryKeypairParams.key,
    l1TxFee: <number>Number(<string>process.env.L1_TX_FEE) || 0.21 * (10 ** 9),

    // L2Tx Fee suggestion
    httpProtocol: <string>process.env.HTTP_PROTOCOL || 'http',

    proxyMinaEndpoint: <string>process.env.PROXY_MINA_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',
    graphqlArchiveEndpoint: <string>process.env.GRAPHQL_ARCHIVE_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',

}

export default config
