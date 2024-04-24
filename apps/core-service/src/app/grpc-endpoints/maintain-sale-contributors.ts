import { FastifyPlugin } from "fastify"
import { RequestHandler } from '@/lib/types'
import { getConnection, IsNull, LessThan } from "typeorm";
import { PublicKey, Field, Reducer, UInt64, TokenId, Provable, AccountUpdate } from "o1js";
import { getLogger } from "@/lib/logUtils";
import { Sale, SaleRollupProverParam, UserTokenSale } from "@tokenizk/entities";
import { SALE_ACTION_BATCH_SIZE, SaleActionBatch, SaleContribution, SaleRollupState, ContributorsMembershipMerkleWitness } from "@tokenizk/contracts";
import { $axiosProofGenerator } from "@/lib";
import { pgClient } from ".";
import { ProofTaskDto, ProofTaskType, BaseResponse, MerkleTreeId } from "@tokenizk/types";
import { getDateString } from "@/lib/timeUtils";
import  * as StateDB from "@/app/grpc-endpoints/state-util"
import fs from "fs";

const logger = getLogger('maintainSaleContributors');

/**
 * maintain Sale Contributors
 */
export const maintainSaleContributors = async function () {
    logger.info(`a new round to sync withdrawed notes inside WithdrawEventFetchRecord...`);

    const connection = getConnection();

    const saleRepo = connection.getRepository(Sale);
    const saleList = (await saleRepo.find({
        where: {
            contributorsFetchFlag: 1,// has fetch actions
            contributorsTreeRoot: IsNull()
        }
    })) ?? [];

    // TODO need check if just sent TX but not confirm yet!!!
    //
    //
    //
    //

    if (saleList.length == 0) {
        logger.warn(`no new NOT_SYNC sale, end.`);

        return { code: 0, data: 0, msg: '' }
    }

    logger.info(`NOT_SYNC saleList: ${JSON.stringify(saleList.map(r => r.id))}`);

    for (let i = 0; i < saleList.length; i++) {
        const sale = saleList[i];
        logger.info(`start processing sale[${sale.id}...]`);

        let sendProofGenFlag = false;
        const processActionsInBatchParamList: { state: SaleRollupState, actionBatch: SaleActionBatch }[] = [];
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {

            let saleProofParam = await queryRunner.manager.findOne(SaleRollupProverParam, { saleId: sale.id });

            const hasTree = await StateDB.indexDB.get(`${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}: ${sale.tokenAddress}: ${sale.saleAddress}`);
            if (!hasTree) {
                await StateDB.saleContributorsDB.initTree(PublicKey.fromBase58(sale.tokenAddress), PublicKey.fromBase58(sale.saleAddress));
                await StateDB.indexDB.put(`${MerkleTreeId[MerkleTreeId.CONTRIBUTORS_TREE]}: ${sale.tokenAddress}: ${sale.saleAddress}`, '1');
            } else if (saleProofParam) {
                logger.info('already maintain in contributor-tree!');
                continue;
            } else {
                await StateDB.saleContributorsDB.loadTree(PublicKey.fromBase58(sale.tokenAddress), PublicKey.fromBase58(sale.saleAddress));
            }

            const saleContributionList = ((await queryRunner.manager.find(UserTokenSale, {
                where: {
                    saleAddress: sale.saleAddress,
                    tokenAddress: sale.tokenAddress
                }
            })) ?? [])
                .sort((a, b) => a.contributeActionIndex - b.contributeActionIndex) // sort as action index
                .map(e => new SaleContribution({
                    tokenAddress: PublicKey.fromBase58(e.tokenAddress),
                    tokenId: TokenId.derive(PublicKey.fromBase58(e.tokenAddress)),
                    saleContractAddress: PublicKey.fromBase58(e.saleAddress),
                    contributorAddress: PublicKey.fromBase58(e.contributorAddress),
                    minaAmount: UInt64.from(e.contributeCurrencyAmount),
                }));

            const batchSize = Number(SALE_ACTION_BATCH_SIZE.toString());
            const gap = saleContributionList.length % batchSize;
            let appendDummySize = batchSize - gap;
            while (appendDummySize > 0) {
                saleContributionList.push(SaleContribution.dummy());
                appendDummySize--;
            }

            let currentIndex = Field(0);
            let currentActionsHash = Reducer.initialActionState;
            let currentMinaAmount = UInt64.from(0);
            for (let i = 0, len = saleContributionList.length / batchSize; i < len; i++) {

                const saleRollupState = new SaleRollupState({
                    membershipTreeRoot: StateDB.saleContributorsDB.getRoot(true),
                    currentIndex,
                    currentActionsHash,
                    currentMinaAmount,
                });

                const actions: SaleContribution[] = [];
                const merkleWitnesses: ContributorsMembershipMerkleWitness[] = [];
                for (let j = 0; j < batchSize; j++) {
                    const saleContribution = saleContributionList[i * batchSize + j];
                    actions.push(saleContribution);

                    const witness = await StateDB.saleContributorsDB.getSiblingPath(currentIndex.toBigInt(), true);
                    merkleWitnesses.push(witness);

                    const isDummyData = Provable.equal(saleContribution, SaleContribution.dummy()).toBoolean();
                    if (!isDummyData) {
                        await StateDB.saleContributorsDB.appendLeaf(saleContribution.hash());
                        currentIndex = currentIndex.add(1);

                        const contributionHash = AccountUpdate.Actions.hash([saleContribution.toFields()]);
                        currentActionsHash = AccountUpdate.Actions.updateSequenceState(
                            currentActionsHash,
                            contributionHash
                        )

                        currentMinaAmount = currentMinaAmount.add(saleContribution.minaAmount);
                    }
                }

                // compose params
                processActionsInBatchParamList.push({
                    state: saleRollupState,
                    actionBatch: new SaleActionBatch({
                        actions,
                        merkleWitnesses,
                    })
                });
            }

            saleProofParam = new SaleRollupProverParam();
            saleProofParam.type = sale.saleType;
            saleProofParam.saleId = sale.id;
            saleProofParam.saleAddress = sale.saleAddress;
            saleProofParam.tokenAddress = sale.tokenAddress;
            saleProofParam.param = JSON.stringify(processActionsInBatchParamList);// stringfy
            await queryRunner.manager.save(saleProofParam);

            sale.contributorsTreeRoot = (await StateDB.saleContributorsDB.getRoot(true)).toString();
            sale.contributorsMaintainFlag = 1;
            await queryRunner.manager.save(sale);

            await queryRunner.commitTransaction();

            // if crash here, the worker thread will spot in time and recover the tree quickly!
            // commit the tree
            await StateDB.saleContributorsDB.commit();

            sendProofGenFlag = true;
        } catch (err) {
            logger.error(err);
            console.error(err);

            await StateDB.saleContributorsDB.rollback();

            await queryRunner.rollbackTransaction();

            return { code: 1, data: 0, msg: '' };
        } finally {
            await queryRunner.release();

            logger.info(`process record[${sale.id}, done.]`);

            StateDB.saleContributorsDB.reset();// MUST reset !
        }

        if (!sendProofGenFlag) {
            continue;
        }

        // try to send to proof-generator for exec 'SaleRollupProver.processActionsInBatch(*)'
        // if fail, proof-watcher will trigger again later.
        try {
            const proofTaskDto = {
                taskType: ProofTaskType.SALE_BATCH_MERGE,
                index: {
                    id: sale.id,
                    tokenAddress: sale.tokenAddress,
                    saleAddress: sale.saleAddress
                },
                payload: { data: processActionsInBatchParamList }
            } as ProofTaskDto<any, { data: { state: SaleRollupState, actionBatch: SaleActionBatch }[] }>;

            const fileName = `./${ProofTaskType[ProofTaskType.SALE_BATCH_MERGE]}_proofTaskDto_proofReq_${sale.id}_${getDateString()}.json`;
            fs.writeFileSync(fileName, JSON.stringify(proofTaskDto));

            await pgClient.proofGen(proofTaskDto).then(r => {
                if (r.data.code == 1) {
                    throw new Error(r.data.msg);
                }
            });

        } catch (error) {
            logger.error(error);
        }
    }
    logger.info(`this round end.`);

    return { code: 0, data: 1, msg: '' };
}
