import { PublicKey, Mina, TokenId } from 'o1js';

import { SaleRollupProver, TokeniZkPresale, SaleRollupProof, SaleParams } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";

const logger = getLogger(`pWorker-TokeniZkPresale`);

export { initWorker };

let preSaleContractCallTimes = 0;

function processMsgFromMaster() {
    process.on('message', async (message: { type: string; payload: any }) => {

        logger.info(`[WORKER ${process.pid}] running ${message.type}`);

        switch (message.type) {

            case `CONTRACT_CALL`:
                await execCircuit(message, async () => {
                    const params = {
                        feePayer: PublicKey.fromBase58(message.payload.feePayer),
                        fee: message.payload.fee,
                        tokenAddress: PublicKey.fromBase58(message.payload.tokenAddress),
                        contractAddress: PublicKey.fromBase58(message.payload.contractAddress),
                        methodParams: {
                            saleParams: SaleParams.fromJSON(message.payload.methodParams.presaleParams) as SaleParams,//??? rm 'as SaleParams'?
                            saleRollupProof: SaleRollupProof.fromJSON(message.payload.methodParams.presaleRollupProof)
                        }
                    }

                    logger.info(`currentActionsHash0: ${params.methodParams.saleRollupProof.publicOutput.source.currentActionsHash}`);
                    logger.info(`currentIndex0: ${params.methodParams.saleRollupProof.publicOutput.source.currentIndex}`);
                    logger.info(`depositRoot0: ${params.methodParams.saleRollupProof.publicOutput.source.membershipTreeRoot}`);

                    logger.info(`currentActionsHash1: ${params.methodParams.saleRollupProof.publicOutput.target.currentActionsHash}`);
                    logger.info(`currentIndex1: ${params.methodParams.saleRollupProof.publicOutput.target.currentIndex}`);
                    logger.info(`depositRoot1: ${params.methodParams.saleRollupProof.publicOutput.target.membershipTreeRoot}`);

                    await syncAcctInfo(params.contractAddress);// fetch account.
                    const presaleContract = new TokeniZkPresale(params.contractAddress, TokenId.derive(params.tokenAddress));

                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, () => {
                        presaleContract.maintainContributors(params.methodParams.saleParams, params.methodParams.saleRollupProof);
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            default:
                throw Error(`Unknown message ${message}`);
        }
        logger.info(`[WORKER ${process.pid}] completed ${message.type}`);

        if (++preSaleContractCallTimes > 6) {// TODO set 6 temporarily
            process.exit(0);
        }

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
