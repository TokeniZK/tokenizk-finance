
import { SaleRollupProver, SaleActionBatch, SaleRollupState, SaleRollupProof } from "@tokenizk/contracts";
import { activeMinaInstance } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";
import { processActionsInBatch, mergeStates } from "./circuits/pg_sale_rollup_prover";
import fs from "fs";

const logger = getLogger('pWorker-SaleRollupProver');

export { initWorker };

function processMsgFromMaster() {
    process.on('message', async (message: { type: string; payload: any }) => {

        logger.info(`[WORKER ${process.pid}] running ${message.type}`);

        switch (message.type) {

            case `ROLLUP_BATCH`:
                await execCircuit(message, async () => {
                    let params = {
                        saleRollupState: SaleRollupState.fromJSON(message.payload.saleRollupState),
                        saleActionBatch: SaleActionBatch.fromDto(message.payload.saleActionBatch)
                    } as { saleRollupState: SaleRollupState, saleActionBatch: SaleActionBatch };

                    logger.info(`currently process [params.saleRollupState.currentActionsHash: ${params.saleRollupState.currentActionsHash}, params.saleRollupState.currentIndex: ${params.saleRollupState.currentIndex}]`);
                    logger.info(`currently processActionsInBatch [params.saleActionBatch.actions: ${JSON.stringify(params.saleActionBatch.actions)}]`);

                    // for test before
                    processActionsInBatch(params.saleRollupState, params.saleActionBatch)

                    logger.info(`exec 'processActionsInBatch' outside circuit smoothly`);

                    const proof = await SaleRollupProver.processActionsInBatch(params.saleRollupState, params.saleActionBatch);
                    logger.info(`exec 'processActionsInBatch' inside circuit: done`);

                    return proof;
                });
                break;

            case `ROLLUP_MERGE`:
                await execCircuit(message, async () => {
                    let params = {
                        saleRollupProof1: await SaleRollupProof.fromJSON(message.payload.saleRollupProof1),
                        saleRollupProof2: await SaleRollupProof.fromJSON(message.payload.saleRollupProof2)
                    }

                    const saleRollupProof1 = params.saleRollupProof1;
                    const saleRollupProof2 = params.saleRollupProof2;

                    logger.info(`currently process [saleRollupProof1.publicOutput.source: {currentActionsHash: ${saleRollupProof1.publicOutput.source.currentActionsHash}, currentIndex: ${saleRollupProof1.publicOutput.source.currentIndex}}]`);
                    logger.info(`currently process [saleRollupProof1.publicOutput.target: {currentActionsHash: ${saleRollupProof1.publicOutput.target.currentActionsHash}, currentIndex: ${saleRollupProof1.publicOutput.target.currentIndex}}]`);

                    logger.info(`currently process [saleRollupProof2.publicOutput.source: {currentActionsHash: ${saleRollupProof2.publicOutput.source.currentActionsHash}, currentIndex: ${saleRollupProof2.publicOutput.source.currentIndex}}]`);
                    logger.info(`currently process [saleRollupProof2.publicOutput.target: {currentActionsHash: ${saleRollupProof2.publicOutput.target.currentActionsHash}, currentIndex: ${saleRollupProof2.publicOutput.target.currentIndex}}]`);

                    await mergeStates(saleRollupProof1, saleRollupProof2);
                    logger.info(`exec 'merge' outside circuit smoothly`);

                    const proof = await SaleRollupProver.mergeStates(saleRollupProof1, saleRollupProof2);
                    logger.info(`exec 'merge' inside circuit: done`);

                    return proof;
                });
                break;

            default:
                throw Error(`Unknown message ${message}`);
        }
        logger.info(`[WORKER ${process.pid}] completed ${message.type}`);
    });
}

const execCircuit = async (message: any, func: () => Promise<any>) => {
    try {
        console.time(`${message.type} exec`);

        // exec circuit...
        let proof = await func();

        console.timeEnd(`${message.type} exec`);

        logger.info(JSON.stringify(proof.toJSON()));

        fs.writeFileSync(`./${message.type}_proofJson_${new Date().getTime()}.txt`, JSON.stringify(proof.toJSON()));

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

        process.send!({// must notify main process to change worker's status to 'isReady'
            type: 'error',
            messageType: message.type,
            id: process.pid,
            payload: {},
        });

        // when meet errors, probably it's about out of wasm32 memory, so restart the process
        process.exit(0);
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

    // recieve message from main process...
    processMsgFromMaster();

    process.send!({
        type: 'isReady',
    });
    logger.info(`[WORKER ${process.pid}] new worker ready`);
};

await initWorker();
