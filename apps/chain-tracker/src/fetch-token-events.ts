import { PublicKey, UInt32, TokenId } from 'o1js';
import { getConnection } from 'typeorm';
import { BasiceToken, Sale, TokenEventFetchRecord, UserTokenSale, UserTokenTransfer } from '@tokenizk/entities';
import { ClaimTokenEvent, ContributionEvent, PresaleMinaFundHolder, RedeemEvent, SaleParamsConfigurationEvent, TokenTransferEvent, TokeniZkBasicToken, TokeniZkFairSale, TokeniZkPresale, TokeniZkPrivateSale } from '@tokenizk/contracts';
import { EventsStandardResponse, SaleType, SaleStatus } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";
import { $axiosCore } from './lib/api';

const logger = getLogger('standardFetchTokenEvents');

await initORM();


const periodRange = 1.5 * 60 * 1000

await standardFetchTokenEvents();
setInterval(standardFetchTokenEvents, periodRange); // exec/1.5mins
// Task:

// 1) fetch the tokens that are ongoing

// 2) fetch events : 
//    TokeniZkSale: ['tokenTransferEvent'],

// 2.1) event: tokenTransferEvent
// insert into DB

export async function standardFetchTokenEvents() {
    logger.info('start standardFetchTokenEvents by Standard...');

    try {
        const connection = getConnection();

        const tokenRepo = connection.getRepository(BasiceToken);

        const tokenList = (await tokenRepo.find({
            status: SaleStatus.CONFIRMED,
        })) ?? [];
        for (let i = 0; i < tokenList.length; i++) {
            const token = tokenList[i];
            logger.info(`tokenId: ${token.id}, tokenAddress: ${token.address}`);

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();

                let tokenEventFetchRecord = await queryRunner.manager.findOne(TokenEventFetchRecord, { tokenId: token.id });

                let startBlock = 0;
                if (tokenEventFetchRecord) {
                    startBlock = tokenEventFetchRecord.blockHeight + 1;
                } else {
                    tokenEventFetchRecord = new TokenEventFetchRecord();
                    tokenEventFetchRecord.tokenAddress = token.address;
                    tokenEventFetchRecord.blockHeight = 0;
                }

                logger.info(`start from blockHeight: ${startBlock}`);

                const tokenzkTokenContract = new TokeniZkBasicToken(PublicKey.fromBase58(token.address));
                // fetch events
                const eventList: EventsStandardResponse[] = await tokenzkTokenContract!.fetchEvents(new UInt32(startBlock));
                eventList.sort((a, b) => (a.blockHeight as any as number) - (b.blockHeight as any as number));

                for (let i = 0; i < eventList.length; i++) {
                    const e = eventList[i];
                    logger.info(`e.type: ${e.type}`);

                    const blockHeight = Number(e.blockHeight.toBigint());
                    const txHash = e.event.transactionInfo.transactionHash;

                    if (e.type == 'tokenTransferEvent') {
                        const saleParamsConfigurationEvent: TokenTransferEvent = e.event.data;
                        const from = saleParamsConfigurationEvent.from;
                        const to = saleParamsConfigurationEvent.to;
                        const amount = saleParamsConfigurationEvent.value;
                        const tokenId = saleParamsConfigurationEvent.tokenId;

                        const userTokenTransfer = new UserTokenTransfer();
                        userTokenTransfer.tokenAddress = token.address;
                        userTokenTransfer.tokenId = tokenId.toString();
                        userTokenTransfer.amount = amount.toString();
                        userTokenTransfer.from = from.toBase58();
                        userTokenTransfer.to = to.toBase58();
                        userTokenTransfer.blockHeight = Number(e.blockHeight.toString());
                        userTokenTransfer.txHash = txHash;

                        // 修改related的 status，

                        await queryRunner.manager.save(userTokenTransfer);

                    }
                    // save to tokenEventFetchRecord
                    tokenEventFetchRecord.blockHeight = blockHeight;
                    await queryRunner.manager.save(tokenEventFetchRecord);
                }

                if (eventList.length > 0) {
                    tokenEventFetchRecord.blockHeight = Number(eventList[eventList.length - 1].blockHeight.toBigint());
                }
                await queryRunner.manager.save(tokenEventFetchRecord);

                await queryRunner.commitTransaction();
            } catch (err) {
                await queryRunner.rollbackTransaction();
            } finally {
                await queryRunner.release();
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

