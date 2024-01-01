import fs from "fs";

const KeyConfig = JSON.parse(fs.readFileSync('../../packages/circuits/scripts/keys-private.json', 'utf8'));

const JoinsplitProofDummyTx: string = fs.readFileSync('./circuit-JoinsplitProofDummyTx.string', 'utf8');

const config = {
    port: <number>Number(<string>process.env.ROLLUP_SEQUENCER_PORT) || 8080,
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
            title: "Anomix Network - rollup-sequencer api documentation",
            version: "0.1.0"
        },
        host: ((<string>process.env.SWAGGER_HOST) ?? 'localhost').concat(':').concat(<string>process.env.ROLLUP_SEQUENCER_PORT),
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

    joinsplitProofDummyTx: JoinSplitProof.fromJSON(JSON.parse(<string>process.env.JoinsplitProofDummyTx ?? JoinsplitProofDummyTx)),// TODO

    innerRollup: {
        txCount: <number>Number(<string>process.env.InnerRollupTxCount ?? 2),
    },
    outRollup: {
        innerBatchesCount: <number>Number(<string>process.env.OuterRollupInnerBatchesCount ?? 12),
    },
    l1TxFee: <number>Number(<string>process.env.L1_TX_FEE ?? 200_000_000),
    networkInit: <number>Number(<string>process.env.NETWORK_INIT ?? 1),
    saleContributorsDBPath: <string>process.env.LEVELDB_WORLDSTATE_DB_PATH || '/var/leveldb/anomix_world_state_db',
    worldStateDBLazyPath: <string>process.env.LEVELDB_WORLDSTATE_DB_LAZY_PATH || '/var/leveldb/anomix_world_state_db_lazy',
    worldStateDBSnapshotPath: <string>process.env.LEVELDB_TREES_SNAPSHOT_PATH || '/var/leveldb/anomix_world_state_db_lazy',
    indexedDBPath: <string>process.env.LEVELDB_INDEX_DB_PATH || '/var/leveldb/anomix_index_db',
    userNullifierDBPath: <string>process.env.LEVELDB_WITHDRAW_DB_PATH || '/var/leveldb/anomix_withdraw_db',
    pinoLogFilePath: <string>process.env.PINO_LOG_FILE_PATH || '/var/anomix/logs/',

    txFeePayerPrivateKey: <string>KeyConfig.feePayer.privateKey,
    operatorPrivateKey: <string>KeyConfig.operator.privateKey,
    vaultContractAddress: <string>KeyConfig.vaultContract.publicKey,
    entryContractAddress: <string>KeyConfig.entryContract.publicKey,
    rollupContractAddress: <string>KeyConfig.rollupContract.publicKey,

    coordinatorHost: <string>process.env.COORDINATOR_HOST || '127.0.0.1',
    coordinatorPort: <number>Number(<string>process.env.COORDINATOR_PORT ?? 8083),

    proofSchedulerWorkerNum: <number>Number(<string>process.env.PROOF_SCHEDULER_WORKER_NUM ?? 3),
    httpProtocol: <string>process.env.HTTP_PROTOCOL || 'http',
    networkStatus: <string>process.env.NETWORK_STATUS || 'SIMULATING_PRODUCTION',

    proxyMinaEndpoint: <string>process.env.PROXY_MINA_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',
    graphqlArchiveEndpoint: <string>process.env.GRAPHQL_ARCHIVE_ENDPOINT || 'https://berkeley.graphql.minaexplorer.com/',

}

export default config
