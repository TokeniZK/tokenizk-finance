import cp, { ChildProcess as Worker } from "child_process";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FastifyCore } from './app'
import { activeMinaInstance } from "@tokenizk/util";
import { getLogger } from "./lib/logUtils";

const logger = getLogger('coordinator-primary-process');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerMap = new Map<string, Worker>();

function bootTaskTracerThread() {
    // init worker thread A
    const worker = cp.fork(`${__dirname}/task-tracer-by-db-query.js`, ['task-tracer']);// TODO

    worker.on('message', (msg: { type: any, data: any }) => {
        if (msg.type == 'online') {
            logger.info('task-tracer is online...');
        } else if (msg.type == 'isReady') {
            logger.info('task-tracer is isReady...');
        }
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootTaskTracerThread();
    })

    workerMap.set('TaskTracer', worker);
}

function bootMempoolWatcherThread() {
    // init worker thread A
    const worker = cp.fork(`${__dirname}/mempool-watcher-deposit-first.js`, ['mempool-watcher-deposit-first']);// TODO

    worker.on('message', (msg: { type: any, data: any }) => {
        if (msg.type == 'online') {
            logger.info('mempool-watcher is online...');
        } else if (msg.type == 'isReady') {
            logger.info('mempool-watcher is isReady...');
        }
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootMempoolWatcherThread();
    })

    workerMap.set('MempoolWatcher', worker);
}

function bootProofTriggerThread() {
    // init worker thread A
    const worker = cp.fork(`${__dirname}/proof-trigger-deposit-first.js`, ['proof-trigger-deposit-first']);// TODO

    worker.on('message', (msg: { type: any, data: any }) => {
        if (msg.type == 'online') {
            logger.info('proof-trigger is online...');
        } else if (msg.type == 'isReady') {
            logger.info('proof-trigger is isReady...');
        }
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for http-server
        bootProofTriggerThread();
    })

    workerMap.set('ProofTrigger', worker);
}

function bootWebServerThread() {
    const worker = cp.fork(`${__dirname}/web-server.js`, ['web-server']);// TODO

    worker.on('message', (msg: { type: any, data: any }) => {
        if (msg.type == 'online') {
            logger.info('web-server is online...');
        } else if (msg.type == 'isReady') {
            logger.info('web-server is isReady...');
        } else if (msg.type == 'seq') {
            workerMap.get('MempoolWatcher')?.send('');
        }
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for web-server
        bootWebServerThread();
    })

    workerMap.set('WebServer', worker);
}


function bootFetchWithdrawEventThread() {
    const worker = cp.fork(`${__dirname}/fetch-withdrawal-events.js`, ['fetch-withdrawal-events']);// TODO

    worker.on('message', (msg: { type: any, data: any }) => {
        if (msg.type == 'online') {
            logger.info('FetchWithdrawEvent is online...');
        } else if (msg.type == 'isReady') {
            logger.info('FetchWithdrawEvent is isReady...');
        }
    })

    worker.on('exit', (exitCode: number) => {
        // create a new worker for FetchWithdrawEvent
        bootFetchWithdrawEventThread();
    })

    workerMap.set('FetchWithdrawEvent', worker);
}

// init Mina tool
await activeMinaInstance();// TODO improve it to configure graphyQL endpoint

bootTaskTracerThread();

bootProofTriggerThread();

bootMempoolWatcherThread();

bootWebServerThread();

bootFetchWithdrawEventThread();

logger.info('all workers are created...');
