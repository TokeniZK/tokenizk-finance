import { PublicKey, Mina, TokenId, Field, AccountUpdate } from 'o1js';

import { SaleRollupProver, TokeniZkPresale, SaleRollupProof, SaleParams, TokeniZkBasicToken, TokeniZkFactory, TokeniZkAirdrop, RedeemAccount, AirdropParams, UserLowLeafWitnessData, UserNullifierMerkleWitness, WhitelistMembershipMerkleWitness } from "@tokenizk/contracts";
import { activeMinaInstance, syncAcctInfo } from '@tokenizk/util';
import { getLogger } from "../lib/logUtils";
import config from '@/lib/config';

const logger = getLogger(`pWorker-Client_TokeniZkAirdrop`);

export { initWorker };

let contractCallTimes = 0;

// set factory address
TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(config.tokenizkFactoryKeypairParams.value);
// init vk
TokeniZkFactory.basicTokenVk = { data: config.TokeniZkBasicTokenVK.data, hash: Field(config.TokeniZkBasicTokenVK.hash) };
TokeniZkFactory.presaleContractVk = { data: config.TokeniZkPresaleVK.data, hash: Field(config.TokeniZkPresaleVK.hash) };
TokeniZkFactory.presaleMinaFundHolderVk = { data: config.PresaleMinaFundHolderVK.data, hash: Field(config.PresaleMinaFundHolderVK.hash) };
TokeniZkFactory.fairSaleContractVk = { data: config.TokeniZkFairSaleVK.data, hash: Field(config.TokeniZkFairSaleVK.hash) };
TokeniZkFactory.privateSaleContractVk = { data: config.TokeniZkPrivateSaleVK.data, hash: Field(config.TokeniZkPrivateSaleVK.hash) };
TokeniZkFactory.redeemAccountVk = { data: config.RedeemAccountVK.data, hash: Field(config.RedeemAccountVK.hash) };
TokeniZkFactory.airdropVk = { data: config.TokeniZkAirdropVK.data, hash: Field(config.TokeniZkAirdropVK.hash) };

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
                            airdropParams: AirdropParams.fromDto(message.payload.methodParams.airdropParams),
                            membershipMerkleWitness: WhitelistMembershipMerkleWitness.fromJSON({ path: message.payload.methodParams.membershipMerkleWitness.map(m => Field(m)) }),
                            leafIndex: Field(message.payload.methodParams.leafIndex),
                            lowLeafWitness: UserLowLeafWitnessData.fromDTO(message.payload.methodParams.lowLeafWitness),
                            oldNullWitness: new UserNullifierMerkleWitness(message.payload.methodParams.oldNullWitness.map(o => Field(o)))
                        }
                    }

                    const tokenId = TokenId.derive(params.tokenAddress);
                    await syncAcctInfo(params.feePayer);
                    const holderAccount = await syncAcctInfo(params.feePayer, tokenId);
                    await syncAcctInfo(params.tokenAddress);// fetch account.
                    await syncAcctInfo(params.contractAddress, tokenId);// fetch account.

                    let tokeniZkBasicTokenZkApp = new TokeniZkBasicToken(params.tokenAddress);
                    const tokeniZkAirdropZkApp = new TokeniZkAirdrop(params.contractAddress, tokenId);

                    const tokenAmount = params.methodParams.airdropParams.totalAirdropSupply.div(params.methodParams.airdropParams.totalMembersNumber);

                    let tx = await Mina.transaction({ sender: params.feePayer, fee: params.fee }, async () => {
                        if (!holderAccount) {
                            AccountUpdate.fundNewAccount(params.feePayer);
                        }

                        await tokeniZkAirdropZkApp.claimTokens(params.methodParams.airdropParams, params.methodParams.membershipMerkleWitness, params.methodParams.leafIndex, params.methodParams.lowLeafWitness, params.methodParams.oldNullWitness);

                        await tokeniZkBasicTokenZkApp.approveTransferCallbackWithVesting(tokeniZkAirdropZkApp.self, params.feePayer, tokenAmount, params.methodParams.airdropParams.vestingParams());

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

    TokeniZkFactory.tokeniZkFactoryAddress = PublicKey.fromBase58(config.tokenizkFactoryAddress);// IMPORTANT!!
    console.time('TokeniZkBasicToken.compile');
    await TokeniZkBasicToken.compile();
    console.timeEnd('TokeniZkBasicToken.compile');

    console.time('compile (TokeniZkAirdrop)');
    let tokeniZkAirdropVK = (await TokeniZkAirdrop.compile()).verificationKey;
    TokeniZkFactory.airdropVk = tokeniZkAirdropVK;
    console.timeEnd('compile (TokeniZkAirdrop)');

    console.time('compile (RedeemAccount)');
    let redeemAccountVk = (await RedeemAccount.compile()).verificationKey;
    TokeniZkFactory.redeemAccountVk = redeemAccountVk;
    console.timeEnd('compile (RedeemAccount)');

    // recieve message from main process...
    processMsgFromMaster();

    process.send!({
        type: 'isReady',
    });
    logger.info(`[WORKER ${process.pid}] new worker ready`);
};

await initWorker();
