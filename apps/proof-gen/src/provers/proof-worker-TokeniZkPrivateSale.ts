import { PublicKey, Mina, TokenId } from 'o1js';
import config from "../lib/config";

import { SaleRollupProver, TokeniZkPrivateSale, SaleRollupProof, SaleParams } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";

const logger = getLogger(`pWorker-TokeniZkPrivateSale`);

export { initWorker };

let privateSaleContractCallTimes = 0;

function processMsgFromMaster() {
    
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

    console.time('TokeniZkPrivateSale.compile');
    await TokeniZkPrivateSale.compile();
    console.timeEnd('TokeniZkPrivateSale.compile');

    // recieve message from main process...
    processMsgFromMaster();

    process.send!({
        type: 'isReady',
    });
    logger.info(`[WORKER ${process.pid}] new worker ready`);
};

await initWorker();
