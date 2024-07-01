import { PublicKey, Mina, TokenId, Field, AccountUpdate, UInt64 } from 'o1js';

import { SaleRollupProver, TokeniZkFairSale, SaleRollupProof, SaleParams, TokeniZkBasicToken, TokeniZkFactory, TokeniZkAirdrop, RedeemAccount, AirdropParams, UserLowLeafWitnessData, UserNullifierMerkleWitness, WhitelistMembershipMerkleWitness, SaleContributorMembershipWitnessData, PresaleMinaFundHolder } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo, syncNetworkStatus } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";
import config from '@/lib/config';
import { ProofTaskType } from '@tokenizk/types';

const logger = getLogger(`pWorker-TokeniZkFairSale`);

export { initWorker };

// set factory address
TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(config.tokenizkFactoryKeypairParams.value);
// init vk
TokeniZkFactory.basicTokenVk = { data: config.TokeniZkBasicTokenVK.data, hash: Field(config.TokeniZkBasicTokenVK.hash) };
TokeniZkFactory.presaleContractVk = { data: config.TokeniZkFairSaleVK.data, hash: Field(config.TokeniZkFairSaleVK.hash) };
TokeniZkFactory.presaleMinaFundHolderVk = { data: config.PresaleMinaFundHolderVK.data, hash: Field(config.PresaleMinaFundHolderVK.hash) };
TokeniZkFactory.fairSaleContractVk = { data: config.TokeniZkFairSaleVK.data, hash: Field(config.TokeniZkFairSaleVK.hash) };
TokeniZkFactory.privateSaleContractVk = { data: config.TokeniZkPrivateSaleVK.data, hash: Field(config.TokeniZkPrivateSaleVK.hash) };
TokeniZkFactory.redeemAccountVk = { data: config.RedeemAccountVK.data, hash: Field(config.RedeemAccountVK.hash) };
TokeniZkFactory.airdropVk = { data: config.TokeniZkAirdropVK.data, hash: Field(config.TokeniZkAirdropVK.hash) };

let contractCallTimes = 0;

function processMsgFromMaster() {
    process.on('message', async (message: { type: ProofTaskType; payload: any }) => {

        logger.info(`[WORKER ${process.pid}] running ${message.type}`);

        switch (message.type) {

            case ProofTaskType.CLIENT_FAIRSALE_CONTRIBUTE_PROOF_REQ:
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

                    const tokenId = TokenId.derive(params.tokenAddress);
                    await syncNetworkStatus();
                    await syncAcctInfo(params.feePayer);
                    if (params.feePayer.equals(params.methodParams.contributorAddress).not().toBoolean()) {
                        await syncAcctInfo(params.methodParams.contributorAddress);
                    }
                    await syncAcctInfo(params.tokenAddress);// fetch account.
                    await syncAcctInfo(params.contractAddress, tokenId);// fetch account.
                    let contractMinaAccount;
                    try {
                        contractMinaAccount = await syncAcctInfo(params.contractAddress);// fetch account.
                    } catch (error) {
                        logger.info(`params.contractAddress[${params.contractAddress.toBase58()}] does not exist.`);
                    }

                    const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(params.tokenAddress);
                    const tokeniZkSaleZkApp = new TokeniZkFairSale(params.contractAddress, tokenId);
<<<<<<< HEAD
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee}, async () => {
=======
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
>>>>>>> main

                        if (!contractMinaAccount) {
                            AccountUpdate.fundNewAccount(params.feePayer);
                        }

                        await tokeniZkSaleZkApp.contribute(params.methodParams.saleParams,
                            params.methodParams.contributorAddress,
                            params.methodParams.minaAmount,
                            params.methodParams.membershipMerkleWitness,
                            params.methodParams.leafIndex);
                        await tokeniZkBasicTokenZkApp.approveAccountUpdate(tokeniZkSaleZkApp.self);

                    });
                    await tx.prove();

                    return tx;
                });
                break;

            case ProofTaskType.FAIRSALE_CONTRACT_MAINTAIN_CONTRIBUTORS:
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

                    const tokenId = TokenId.derive(params.tokenAddress);
                    await syncAcctInfo(params.tokenAddress);// fetch account.
                    await syncAcctInfo(params.contractAddress, tokenId);// fetch account.

                    let tokenZkApp = new TokeniZkBasicToken(params.methodParams.saleParams.tokenAddress);
                    const saleContract = new TokeniZkFairSale(params.contractAddress, tokenId);

<<<<<<< HEAD
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee, memo:'FAIRSALE_MAINTAIN_CONTRIBUTOR' }, async () => {
=======
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee, memo: 'FAIRSALE_MAINTAIN_CONTRIBUTOR' }, async () => {
>>>>>>> main
                        await saleContract.maintainContributors(params.methodParams.saleParams, params.methodParams.saleRollupProof);
                        await tokenZkApp.approveAccountUpdate(saleContract.self);
                    });
                    await tx.prove();

                    return tx;
                });
                break;

            case ProofTaskType.CLIENT_FAIRSALE_CLAIM_TOKEN_PROOF_REQ:
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

                    const tokenId = TokenId.derive(params.tokenAddress);
                    await syncNetworkStatus();
                    await syncAcctInfo(params.feePayer);
                    await syncAcctInfo(params.tokenAddress);// fetch account.
                    await syncAcctInfo(params.contractAddress, tokenId);// fetch account.
                    let holderAccount;
                    try {
                        holderAccount = await syncAcctInfo(params.feePayer, tokenId);// fetch account.
                    } catch (error) {
                        logger.info(`cannot fetchAccount of (${params.feePayer.toBase58()}, ${tokenId})`);
                    }

                    const redeemAccount = params.feePayer;
                    const saleContribution = params.methodParams.saleContributorMembershipWitnessData.leafData;
                    const minaAmount = saleContribution.minaAmount.mul(params.methodParams.saleParams.saleRate);
                    const vestingParams = params.methodParams.saleParams.vestingParams();
                    const tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(params.tokenAddress);
                    const tokeniZkSaleZkApp = new TokeniZkFairSale(params.contractAddress, tokenId);
                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
                        if (!holderAccount) {
                            AccountUpdate.fundNewAccount(params.feePayer);
                        }

                        await tokeniZkSaleZkApp.claimTokens(
                            params.methodParams.saleParams,
                            params.methodParams.saleContributorMembershipWitnessData,
                            params.methodParams.lowLeafWitness,
                            params.methodParams.oldNullWitness);
                        await tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkSaleZkApp.self,
                            redeemAccount,
                            minaAmount,
                            vestingParams);

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

    console.time('compile (TokeniZkFactory)');
    await TokeniZkFactory.compile();
    console.timeEnd('compile (TokeniZkFactory)');

    console.time('TokeniZkBasicToken.compile');
    await TokeniZkBasicToken.compile();
    console.timeEnd('TokeniZkBasicToken.compile');

    console.time('SaleRollupProver.compile');
    await SaleRollupProver.compile();
    console.timeEnd('SaleRollupProver.compile');

    console.time('RedeemAccount.compile');
    await RedeemAccount.compile();
    console.timeEnd('RedeemAccount.compile');

    console.time('TokeniZkFairSale.compile');
    await TokeniZkFairSale.compile();
    console.timeEnd('TokeniZkFairSale.compile');

    // recieve message from main process...
    processMsgFromMaster();

    process.send!({
        type: 'isReady',
    });
    logger.info(`[WORKER ${process.pid}] new worker ready`);
};

await initWorker();
