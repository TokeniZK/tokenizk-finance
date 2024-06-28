import { PublicKey, Mina, TokenId, UInt64, Field, Signature, AccountUpdate } from 'o1js';
import config from "../lib/config";

import { SaleRollupProver, TokeniZkPrivateSale, SaleRollupProof, SaleParams, WhitelistMembershipMerkleWitness, SaleContributorMembershipWitnessData, PresaleMinaFundHolder, UserLowLeafWitnessData, UserNullifierMerkleWitness, RedeemAccount } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo, syncNetworkStatus } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";
import { ProofTaskType } from '@tokenizk/types';

const logger = getLogger(`pWorker-TokeniZkPrivateSale`);

export { initWorker };

let contractCallTimes = 0;

function processMsgFromMaster() {
    process.on('message', async (message: { type: ProofTaskType; payload: any }) => {

        logger.info(`[WORKER ${process.pid}] running ${message.type}`);

        switch (message.type) {

            case ProofTaskType.CLIENT_PRIVATESALE_CONTRIBUTE_PROOF_REQ:
                await execCircuit(message, async () => {
                    const params = {
                        feePayer: PublicKey.fromBase58(message.payload.feePayer),
                        fee: message.payload.fee,
                        tokenAddress: PublicKey.fromBase58(message.payload.tokenAddress),
                        contractAddress: PublicKey.fromBase58(message.payload.contractAddress),
                        methodParams: {
                            saleParams: SaleParams.fromDto(message.payload.methodParams.saleParams),
                            membershipMerkleWitness: WhitelistMembershipMerkleWitness.fromJSON({ path: message.payload.methodParams.membershipMerkleWitness.map(m => Field(m)) }),
                            leafIndex: Field(message.payload.methodParams.leafIndex),
                            contributorAddress: PublicKey.fromBase58(message.payload.methodParams.contributorAddress),
                            minaAmount: UInt64.from(message.payload.methodParams.minaAmount),
                        }
                    }

                    await syncNetworkStatus();
                    await syncAcctInfo(params.feePayer);
                    if (params.feePayer.equals(params.methodParams.contributorAddress).not().toBoolean()) {
                        await syncAcctInfo(params.methodParams.contributorAddress);
                    }
                    await syncAcctInfo(params.contractAddress);// fetch account.

                    const tokeniZkSaleZkApp = new TokeniZkPrivateSale(params.contractAddress);
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
                        await tokeniZkSaleZkApp.contribute(params.methodParams.saleParams,
                            params.methodParams.contributorAddress,
                            params.methodParams.minaAmount,
                            params.methodParams.membershipMerkleWitness,
                            params.methodParams.leafIndex);
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            case ProofTaskType.PRIVATESALE_CONTRACT_MAINTAIN_CONTRIBUTORS:
                await execCircuit(message, async () => {
                    const params = {
                        feePayer: PublicKey.fromBase58(message.payload.feePayer),
                        fee: message.payload.fee,
                        tokenAddress: PublicKey.fromBase58(message.payload.tokenAddress),
                        contractAddress: PublicKey.fromBase58(message.payload.contractAddress),
                        methodParams: {
                            saleParams: SaleParams.fromJSON(message.payload.methodParams.saleParams) as SaleParams,//??? rm 'as SaleParams'?
                            saleRollupProof: await SaleRollupProof.fromJSON(message.payload.methodParams.saleRollupProof)
                        }
                    }

                    logger.info(`currentActionsHash0: ${params.methodParams.saleRollupProof.publicOutput.source.currentActionsHash}`);
                    logger.info(`currentIndex0: ${params.methodParams.saleRollupProof.publicOutput.source.currentIndex}`);
                    logger.info(`depositRoot0: ${params.methodParams.saleRollupProof.publicOutput.source.membershipTreeRoot}`);

                    logger.info(`currentActionsHash1: ${params.methodParams.saleRollupProof.publicOutput.target.currentActionsHash}`);
                    logger.info(`currentIndex1: ${params.methodParams.saleRollupProof.publicOutput.target.currentIndex}`);
                    logger.info(`depositRoot1: ${params.methodParams.saleRollupProof.publicOutput.target.membershipTreeRoot}`);

                    await syncAcctInfo(params.feePayer);
                    await syncAcctInfo(params.contractAddress);// fetch account.

                    const saleContract = new TokeniZkPrivateSale(params.contractAddress);

                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee, memo: 'PRISALE_MAINTAIN_CONTRIBUTORS' }, async () => {
                        await saleContract.maintainContributors(params.methodParams.saleParams, params.methodParams.saleRollupProof);
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            case ProofTaskType.CLIENT_PRIVATESALE_CLAIM_PROOF_REQ:
                await execCircuit(message, async () => {
                    const params = {
                        feePayer: PublicKey.fromBase58(message.payload.feePayer),
                        fee: message.payload.fee,
                        tokenAddress: PublicKey.fromBase58(message.payload.tokenAddress),
                        contractAddress: PublicKey.fromBase58(message.payload.contractAddress),
                        methodParams: {
                            saleParams: SaleParams.fromDto(message.payload.methodParams.saleParams),
                            receiverAddress: PublicKey.fromBase58(message.payload.methodParams.receiverAddress),
                            signature: Signature.fromBase58(message.payload.methodParams.signature),
                        }
                    }

                    await syncNetworkStatus();
                    await syncAcctInfo(params.feePayer);
                    await syncAcctInfo(params.contractAddress);// fetch account.
                    const holderAccount = await syncAcctInfo(params.methodParams.receiverAddress);// fetch account.

                    const tokeniZkSaleZkApp = new TokeniZkPrivateSale(params.contractAddress);
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
                        if (!holderAccount) {
                            AccountUpdate.fundNewAccount(params.feePayer);
                        }
                        await tokeniZkSaleZkApp.claim(
                            params.methodParams.saleParams,
                            params.methodParams.receiverAddress,
                            params.methodParams.signature);
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            case ProofTaskType.CLIENT_PRIVATESALE_REDEEM_FUND_PROOF_REQ:
                await execCircuit(message, async () => {
                    const params = {
                        feePayer: PublicKey.fromBase58(message.payload.feePayer),
                        fee: message.payload.fee,
                        tokenAddress: PublicKey.fromBase58(message.payload.tokenAddress),
                        contractAddress: PublicKey.fromBase58(message.payload.contractAddress),
                        methodParams: {
                            saleParams: SaleParams.fromDto(message.payload.methodParams.saleParams),
                            saleContributorMembershipWitnessData: SaleContributorMembershipWitnessData.fromDTO(message.payload.methodParams.saleContributorMembershipWitnessData),
                            lowLeafWitness: UserLowLeafWitnessData.fromDTO(message.payload.methodParams.lowLeafWitness),
                            oldNullWitness: UserNullifierMerkleWitness.fromJSON({ path: message.payload.methodParams.oldNullWitness }),
                        }
                    }

                    await syncNetworkStatus();
                    await syncAcctInfo(params.feePayer);
                    await syncAcctInfo(params.contractAddress);// fetch account.

                    const tokeniZkSaleZkApp = new TokeniZkPrivateSale(params.contractAddress);
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
                        await tokeniZkSaleZkApp.redeem(
                            params.methodParams.saleParams,
                            params.methodParams.saleContributorMembershipWitnessData,
                            params.methodParams.lowLeafWitness,
                            params.methodParams.oldNullWitness
                        );
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            default:
                throw Error(`Unknown message ${message}`);
        }
        logger.info(`[WORKER ${process.pid}] completed ${message.type}`);

        if (++contractCallTimes > 6) {// TODO set 6 temporarily
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

    console.time('RedeemAccount.compile');
    await RedeemAccount.compile();
    console.timeEnd('RedeemAccount.compile');

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
