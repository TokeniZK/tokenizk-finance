import { AccountUpdate, Field, PublicKey, Reducer, fetchAccount, TokenId, fetchLastBlock, Token } from 'o1js';
import { IsNull, LessThan, getConnection } from 'typeorm';
import { Sale, UserTokenSale } from '@tokenizk/entities';
import { activeMinaInstance, syncActions } from "@tokenizk/util";
import { getLogger } from "@/lib/logUtils";
import { coreClient } from "./grpcUtil";
import { SaleStatus } from '@tokenizk/types';
import { initORM } from './lib/orm';
import { SaleContribution } from '@tokenizk/contracts';


const logger = getLogger('fetch-sale-contributor-actions');
// init 
await activeMinaInstance();
await initORM();

const periodRange = 1.5 * 60 * 1000

await fetchSaleContributorActions();
setInterval(fetchSaleContributorActions, periodRange); // exec/1.5mins
// Task:
// 1) fetch the sales that are end && not maintained yet
// 2) fetch actions: TokeniZkSale, and store them(the contributors) into db.
// 3) notify core-service to construct Contributor Merkle Tree
// 3.1) construct params for proof-gen
// 4) and send to proof-gen for Batch&Merge, and trigger SaleContract 
// 5) then proof-gen sends back the result to core-service and sign and broadcast it.
export async function fetchSaleContributorActions() {
    logger.info('start fetchSaleContributorActions ...');

    const lastBlockInfo = await fetchLastBlock()
    try {
        const connection = getConnection();

        const saleRepo = connection.getRepository(Sale);
        const saleList = (await saleRepo.find({
            where: {
                status: SaleStatus.CONFIRMED,
                endTimestamp: LessThan(Number(lastBlockInfo.blockchainLength.toString())),// must guarantee this is later than fetch-events
                contributorsFetchFlag: 0 // has NOT fetch actions
            }
        })) ?? [];
        if (saleList.length === 0) {
            logger.info('no sale to maintain');
            return;
        }

        let ifNotifyCoreService = false;

        for (let i = 0; i < saleList.length; i++) {
            const sale = saleList[i];

            const tokenAddr = PublicKey.fromBase58(sale.tokenAddress);
            const saleAddr = PublicKey.fromBase58(sale.saleAddress);
            const startActionHash = Reducer.initialActionState;// only fetch actions once for each sale.

            const tokenId = sale.saleType == 2 ? TokenId.default : await TokenId.derive(tokenAddr);
            // fetch onchain action state
            const zkAppActionStateArray = (await fetchAccount({ publicKey: saleAddr, tokenId })).account?.zkapp?.actionState;
            logger.info('onchainActionStateArray: ' + zkAppActionStateArray);

            // fetch Action List
            const newActionList: { actions: Array<string>[], hash: string }[] = await syncActions(saleAddr,
                startActionHash, tokenId);
            logger.info(`original response-newActionList: ${JSON.stringify(newActionList)}`);

            if (newActionList == undefined || newActionList == null || newActionList.length == 0) {
                logger.error("no new actions...");
                continue;
            }

            if (newActionList[newActionList.length - 1].hash != zkAppActionStateArray![0].toString()) {
                logger.error(`the hash attached to latest action is NOT aligned with onchainActionStateArray[0]`);
                continue;
            }
            logger.info(`the hash attached to latest action is aligned with onchainActionStateArray[0]`);

            logger.info(`start reducing actions locally for double check...`);
            logger.info(`current actionsHash: ${startActionHash.toString()} `);
            const calcActionHash = newActionList.reduce((p, c) => {
                p = AccountUpdate.Actions.updateSequenceState(
                    p,
                    AccountUpdate.Actions.hash(c.actions.map(x => x.map(a => Field(a)))) // TODO !!!!!!
                );
                logger.info('calc actionsHash:' + p.toString());
                return p;
            }, startActionHash);
            if (calcActionHash.toString() != zkAppActionStateArray![0].toString()) {
                logger.error('calcActionHash is NOT aligned with onchainActionStateArray[0]');
                continue;
            }

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();

                let totalContributions = sale.totalContributedMina??0;
                for (let i = 0; i < newActionList.length; i++) {
                    const item = newActionList[i];
                    const saleContribution = SaleContribution.fromFields(item.actions[0].map(a => Field(a)));

                    const contributorAddress = saleContribution.contributorAddress.toBase58();

                    const userTokenSale = (await queryRunner.manager.findOne(UserTokenSale, {
                        where: {
                            saleAddress: sale.saleAddress,
                            contributorAddress,
                            tokenAddress: sale.tokenAddress
                        }
                    }));

                    if (!userTokenSale) {
                        logger.error('userTokenSale cannot be found! mail sent to administrator.');
                        throw new Error("userTokenSale cannot be found!");
                    }

                    userTokenSale.contributeActionIndex = i;
                    await queryRunner.manager.save(userTokenSale);

                    totalContributions += Number(userTokenSale.contributeCurrencyAmount);
                }

                sale.totalContributedMina = totalContributions;
                sale.contributorsFetchFlag = 1;
                await queryRunner.manager.save(sale);

                await queryRunner.commitTransaction();

                ifNotifyCoreService = true;
            } catch (error) {
                logger.error(error);
                await queryRunner.rollbackTransaction();
            } finally {
                await queryRunner.release();
            }
        }

        // sync nullifier
        if (ifNotifyCoreService) {
            try {
                // $axiosCore.get('/sale-contributors-maintain');
                await coreClient.maintainSaleContributors();
            } catch (error) {
                console.error(error);
                logger.error(error);
            }
        }

        return true;
    } catch (error) {
        console.error(error);
        logger.error(error);

        return false;
    } finally {
        logger.info('end.');
    }

}
