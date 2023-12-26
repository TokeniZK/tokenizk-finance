import { PublicKey, Mina, TokenId } from 'o1js';

import { SaleRollupProver, TokeniZkPresale, SaleRollupProof, SaleParams } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";

const logger = getLogger(`pWorker-TokeniZkPresale`);

export { initWorker };

let preSaleContractCallTimes = 0;

function processMsgFromMaster() {
    process.on('message', async (message: { type: string; payload: any }) => {


    });
}

const execCircuit = async (message: any, func: () => Promise<any>) => {
    try {
        console.time(`${message.type} exec`);

        // exec circuit...
        let proof = await func();

        console.timeEnd(`${message.type} exec`);

        logger.info(JSON.stringify(proof.toJSON()));

        process.send!({
            type: 'done',
            messageType: message.type,
            id: process.pid,
            payload: {
                isProof: true,
                payload: proof.toJSON(),
            },
        });
    } catch (error) {
        logger.error(error);

        console.error(error);

        process.send!({
            type: 'error',
            messageType: message.type,
            id: process.pid,
            payload: {},
        });
    }
}

const initWorker = async () => {
    // init 
    await activeMinaInstance();

    process.send!({
        type: 'online',
    });

    logger.info(`[WORKER ${process.pid}] new worker forked`);

    console.time('SaleRollupProver.compile');
    await SaleRollupProver.compile();
    console.timeEnd('SaleRollupProver.compile');

    console.time('TokeniZkPresale.compile');
    await TokeniZkPresale.compile();
    console.timeEnd('TokeniZkPresale.compile');

    // recieve message from main process...
    processMsgFromMaster();

    process.send!({
        type: 'isReady',
    });
    logger.info(`[WORKER ${process.pid}] new worker ready`);
};

await initWorker();
