import {
    VerificationKey,

} from 'o1js';
import { JoinSplitProof } from "@anomix/circuits"
import * as dotenv from "dotenv"
import fs from "fs";

const KeyConfig = JSON.parse(fs.readFileSync('../../packages/circuits/scripts/keys-private.json', 'utf8'));


dotenv.config({ path: '../../.env' })

const config = {
    port: <number>Number(<string>process.env.COORDINATOR_PORT) || 8083,
    logger: {
        prettyPrint: <boolean>(process.env.LOGGING_PRETTY_PRINT === 'true' || true), // change if .env
        level: process.env.LOGGING_LEVEL || 'info',
    },
    typeOrmMysql: {
        type: <string>process.env.TYPE_ORM_CONNECTION || "mysql",
        host: <string>process.env.TYPE_ORM_HOST || "localhost", // "localhost" | "mysql" ~ docker,
        port: <number>Number(<string>process.env.TYPE_ORM_PORT) || 3060, // 3060 | 5432 ~ docker
        username: <string>process.env.TYPE_ORM_USERNAME || "mysql",
        password: <string>process.env.TYPE_ORM_PASSWORD || "deger",
        database: <string>process.env.TYPE_ORM_DATABASE || "unknown_db",
        //synchronize: <boolean>(process.env.TYPE_ORM_SYNCHRONIZE === "true" || true), // change if .env
        logging: <boolean>(process.env.TYPE_ORM_LOGGING === "true" || true), // change if .env
    },
    typeOrmPg: {
        type: <string>process.env.TYPE_ORM_CONNECTION_PG || "postgres",
        host: <string>process.env.TYPE_ORM_HOST_PG || "localhost", // "localhost" | "mysql" ~ docker,
        port: <number>Number(<string>process.env.TYPE_ORM_PORT_PG) || 5432, // 5432 |  ~ docker
        username: <string>process.env.TYPE_ORM_USERNAME_PG || "postgres",
        password: <string>process.env.TYPE_ORM_PASSWORD_PG || "postgres",
        database: <string>process.env.TYPE_ORM_DATABASE_PG || "archive",
        //synchronize: <boolean>(process.env.TYPE_ORM_SYNCHRONIZE_PG === "true" || true), // change if .env
        logging: <boolean>(process.env.TYPE_ORM_LOGGING_PG === "true" || true), // change if .env
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
            title: "Anomix Network - rollup-sequencer api documentation",
            version: "0.1.0"
        },
        host: ((<string>process.env.SWAGGER_HOST) ?? 'localhost').concat(':').concat(<string>process.env.COORDINATOR_PORT),
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
    sequencerHost: <string>process.env.ROLLUP_SEQUENCER_HOST || '127.0.0.1',
    sequencerPort: <number>Number(<string>process.env.ROLLUP_SEQUENCER_PORT ?? 8080),
    depositProcessorHost: <string>process.env.DEPOSIT_PROCESSOR_HOST || '127.0.0.1',
    depositProcessorPort: <number>Number(<string>process.env.DEPOSIT_PROCESSOR_PORT ?? 8082),
    proofGeneratorHost: <string>process.env.PROOF_GENERATOR_HOST || '127.0.0.1',
    proofGeneratorPort: <number>Number(<string>process.env.PROOF_GENERATOR_PORT ?? 8081),

    innerRollup: {
        txCount: <number>Number(<string>process.env.InnerRollupTxCount) || 2,
    },
    outRollup: {
        innerBatchesCount: <number>Number(<string>process.env.OuterRollupInnerBatchesCount) || 12,
    },

    operatorPrivateKey: <string>process.env.OPERATOR_PRIVATE_KEY,

    networkInit: <number>Number(<string>process.env.NETWORK_INIT) || 1,
    worldStateDBPath: <string>process.env.LEVELDB_WORLDSTATE_DB_PATH || '/var/leveldb/anomix_world_state_db',
    indexedDBPath: <string>process.env.LEVELDB_INDEX_DB_PATH || '/var/leveldb/anomix_index_db',
    withdrawDBPath: <string>process.env.LEVELDB_WITHDRAW_DB_PATH || '/var/leveldb/anomix_withdraw_db',

    pinoLogFilePath: <string>process.env.PINO_LOG_FILE_PATH || '/var/anomix/logs/',

    vaultContractAddress: <string>KeyConfig.vaultContract.publicKey,
    entryContractAddress: <string>KeyConfig.entryContract.publicKey,
    rollupContractAddress: <string>KeyConfig.rollupContract.publicKey,

    // criterion to trigger seq
    maxMpTxCnt: <number>Number(<string>process.env.MAX_MP_TX_CNT) || 50,
    maxMpTxFeeSUM: <number>Number(<string>process.env.MAX_MP_TX_FEE_SUM) || 5 * 1000_000_000,
    maxBlockInterval: <number>Number(<string>process.env.MAX_BLOCK_INTERVAL) || 1.5 * 60 * 1000,

    // L2Tx Fee suggestion
    minMpTxFeeToGenBlock: <number>Number(<string>process.env.MIN_MP_TX_FEE_TO_GEN_BLOCK) || 0.09 * 1000_000_000,
    floorMpTxFee: <number>Number(<string>process.env.FLOOR_MP_TX_FEE) || 0.03 * 1000_000_000,

    httpProtocol: <string>process.env.HTTP_PROTOCOL || 'http',

    garethCustomMinaEndpoint: <string>process.env.HTTP_GARETH_CUSTOM_MINAEXPLORER || 'https://berkeley.graphql.minaexplorer.com/',

    proxyMinaEndpoint: <string>process.env.PROXY_MINA_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',
    graphqlArchiveEndpoint: <string>process.env.GRAPHQL_ARCHIVE_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',

}

export default config
