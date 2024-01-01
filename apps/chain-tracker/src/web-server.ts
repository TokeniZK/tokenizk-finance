import { parentPort } from 'worker_threads';
import { FastifyCore } from './app'
import { getLogger } from "./lib/logUtils";

const logger = getLogger('web-server');
logger.info('hi, I am web-server!');

if (process.send) {
    (process.send as any)({// when it's a primary process, process.send == undefined. 
        type: 'status',
        data: 'online'
    });
}
parentPort?.postMessage({// when it's not a subThread, parentPort == null. 
    type: 'status',
    data: 'online'
});

const app = new FastifyCore();
if (process.send) {
    (process.send as any)({// if it's a subProcess
        type: 'status',
        data: 'isReady'
    });
}
parentPort?.postMessage({// if it's a subThread
    type: 'status',
    data: 'isReady'
});


await app.listen();
