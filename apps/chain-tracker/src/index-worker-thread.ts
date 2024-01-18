import { Worker } from "worker_threads";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FastifyCore } from './app'
import { activeMinaInstance } from "@tokenizk/util";
import { getLogger } from "./lib/logUtils";
import { initORM } from "./lib/orm";

const logger = getLogger('chain-tracker');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerMap = new Map<string, Worker>();

function bootFactoryEventFetchThread() {
    // init worker thread A
    const worker = new Worker(`${__dirname}/fetch-factory-events.js`, { argv: ['fetch-factory-events'] });// TODO
    worker.on('online', () => {
        logger.info('fetch-factory-events is online...');
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootFactoryEventFetchThread();
    })

    workerMap.set('FactoryEventFetch', worker);
}

function bootSaleEventFetchThread() {
    // init worker thread A
    const worker = new Worker(`${__dirname}/fetch-sale-events.js`);// TODO
    worker.on('online', () => {
        logger.info('fetch-sale-events is online...');
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootSaleEventFetchThread();
    })

    workerMap.set('SaleEventFetch', worker);
}


function bootSaleContributorActionsFetchThread() {
    // init worker thread A
    const worker = new Worker(`${__dirname}/fetch-sale-contributor-actions.js`);// TODO
    worker.on('online', () => {
        logger.info('fetch-sale-contributor-actions is online...');
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootSaleContributorActionsFetchThread();
    })

    workerMap.set('SaleContributorActionsFetch', worker);
}

function bootTokenEventsFetchThread() {
    // init worker thread A
    const worker = new Worker(`${__dirname}/fetch-token-events.js`);// TODO
    worker.on('online', () => {
        logger.info('fetch-token-events is online...');
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootTokenEventsFetchThread();
    })

    workerMap.set('TokenEventsFetch', worker);
}

// await initORM();
// init Mina tool
await activeMinaInstance();// TODO improve it to configure graphyQL endpoint

bootSaleContributorActionsFetchThread();

bootFactoryEventFetchThread();

bootSaleEventFetchThread();

// bootTokenEventsFetchThread();

const app = new FastifyCore();
app.server.decorate('workerMap', workerMap);
await app.listen();
