
import { PublicKey, UInt32, TokenId } from 'o1js';
import { getConnection } from 'typeorm';
import { Sale, SaleEventFetchRecord, UserTokenSale } from '@tokenizk/entities';
import { ClaimTokenEvent, ContributionEvent, PresaleMinaFundHolder, RedeemEvent, SaleParamsConfigurationEvent, TokeniZkFairSale, TokeniZkPresale, TokeniZkPrivateSale } from '@tokenizk/contracts';
import { EventsStandardResponse, SaleType } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";
import { $axiosCore } from './lib/api';

const logger = getLogger('standardFetchSaleEvents');

await initORM();
// Task:

// 1) fetch the sales that are ongoing
// i.e. endTime >= current && endTime <= current + 1month

// 2) fetch events : 
//    TokeniZkSale: ['configureSaleParams', 'contribute', 'claimTokens'],
//    SaleMinaFundHolder: ['redeem']

// 2.1) event: configureSaleParams
// update the presale params in the db

// 2.2) event: contribute && claimTokens
// insert user-presale in the db
export async function standardFetchSaleEvents() {
    logger.info('start standardFetchSaleEvents by Standard...');

    try {
        let ifNotifySyncNullifier = false;

        const connection = getConnection();

        const presaleRepo = connection.getRepository(Sale);
        const presaleList = (await presaleRepo.find()) ?? [];
        for (let i = 0; i < presaleList.length; i++) {
            const sale = presaleList[i];

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();

                let saleEventFetchRecord = await queryRunner.manager.findOne(SaleEventFetchRecord, { saleId: sale.id });

                let startBlock = 0;
                if (saleEventFetchRecord) {
                    startBlock = saleEventFetchRecord.blockHeight + 1;
                } else {
                    saleEventFetchRecord = new SaleEventFetchRecord();
                    saleEventFetchRecord.tokenAddress = sale.tokenAddress;
                    saleEventFetchRecord.saleAddress = sale.saleAddress;
                }

                let tokenzkSaleContract: TokeniZkPresale | TokeniZkFairSale | TokeniZkPrivateSale;
                let presaleMinaFundHolderContract: PresaleMinaFundHolder;
                if (sale.saleType == SaleType.PRESALE) {
                    tokenzkSaleContract = new TokeniZkPresale(PublicKey.fromBase58(sale.saleAddress), TokenId.derive(PublicKey.fromBase58(sale.tokenAddress)));
                    presaleMinaFundHolderContract = new PresaleMinaFundHolder(PublicKey.fromBase58(sale.saleAddress));
                } else if (sale.saleType == SaleType.FAIRSALE) {
                    tokenzkSaleContract = new TokeniZkFairSale(PublicKey.fromBase58(sale.saleAddress), TokenId.derive(PublicKey.fromBase58(sale.tokenAddress)));
                } else if (sale.saleType == SaleType.PRIVATESALE) {
                    tokenzkSaleContract = new TokeniZkPrivateSale(PublicKey.fromBase58(sale.saleAddress), TokenId.derive(PublicKey.fromBase58(sale.tokenAddress)));
                }
                // fetch events
                const eventList: EventsStandardResponse[] = await tokenzkSaleContract!.fetchEvents(new UInt32(startBlock));
                if (sale.saleType == SaleType.PRESALE) {
                    eventList.push(... await presaleMinaFundHolderContract!.fetchEvents(new UInt32(startBlock)));
                }

                for (let i = 0; i < eventList.length; i++) {
                    const e = eventList[i];
                    const blockHeight = Number(e.blockHeight.toBigint());

                    if (e.type == 'configureSaleParams') {
                        const saleParamsConfigurationEvent: SaleParamsConfigurationEvent = e.event.data;
                        const saleParams = saleParamsConfigurationEvent.saleParams;

                        sale.tokenAddress = saleParams.tokenAddress.toBase58();
                        sale.totalSaleSupply = Number(saleParams.totalSaleSupply.toString());
                        sale.saleRate = Number(saleParams.saleRate.toString());
                        sale.whitelistTreeRoot = saleParams.whitelistTreeRoot.toString();
                        sale.softCap = Number(saleParams.softCap.toString());
                        sale.hardCap = Number(saleParams.hardCap.toString());
                        sale.minimumBuy = Number(saleParams.hardCap.toString());
                        sale.maximumBuy = Number(saleParams.hardCap.toString());
                        sale.startTimestamp = Number(saleParams.startTime.toString());
                        sale.endTimestamp = Number(saleParams.endTime.toString());
                        sale.cliffTime = Number(saleParams.cliffTime.toString());
                        sale.cliffAmountRate = Number(saleParams.cliffAmountRate.toString());
                        sale.vestingPeriod = Number(saleParams.vestingPeriod.toString());
                        sale.vestingIncrement = Number(saleParams.vestingIncrement.toString());

                        await queryRunner.manager.save(sale);

                    } else if (e.type == 'contribute') {
                        const contributionEvent: ContributionEvent = e.event.data;

                        const user = new UserTokenSale();
                        user.contributeTxHash = e.event.transactionInfo.transactionHash;
                        user.contributorAddress = contributionEvent.contributorAddress.toBase58();
                        user.saleId = sale.id;
                        user.saleAddress = sale.saleAddress;
                        user.tokenAddress = sale.tokenAddress;
                        user.tokenId = contributionEvent.tokenId.toString();
                        user.contributeBlockHeight = blockHeight;
                        user.contributeCurrencyAmount = contributionEvent.minaAmount.toString();

                        await queryRunner.manager.save(user);

                    } else if (e.type == 'claimToken') {
                        const claimTokenEvent: ClaimTokenEvent = e.event.data;

                        const user = (await queryRunner.manager.find(UserTokenSale, {
                            tokenAddress: sale.tokenAddress,
                            saleAddress: sale.saleAddress,
                            contributorAddress: claimTokenEvent.presaleContribution.contributorAddress.toBase58()
                        }))![0];
                        user.claimTxHash = e.event.transactionInfo.transactionHash;
                        user.claimBlockHeight = blockHeight;
                        user.claimAmount = claimTokenEvent.presaleContribution.minaAmount.toString();

                        await queryRunner.manager.save(user);

                        ifNotifySyncNullifier = true;

                    } else if (e.type == 'redeem') {
                        const redeemTokenEvent: RedeemEvent = e.event.data;

                        const user = (await queryRunner.manager.find(UserTokenSale, {
                            tokenAddress: sale.tokenAddress,
                            saleAddress: sale.saleAddress,
                            contributorAddress: redeemTokenEvent.presaleContribution.contributorAddress.toBase58()
                        }))![0];
                        user.redeemTxHash = e.event.transactionInfo.transactionHash;
                        user.redeemBlockHeight = blockHeight;
                        await queryRunner.manager.save(user);

                        ifNotifySyncNullifier = true;
                    }

                    // save to saleEventFetchRecord
                    saleEventFetchRecord.blockHeight = blockHeight;
                    await queryRunner.manager.save(saleEventFetchRecord);
                }

                if (eventList.length > 0) {
                    saleEventFetchRecord.blockHeight = Number(eventList[eventList.length - 1].blockHeight.toBigint());
                }
                await queryRunner.manager.save(saleEventFetchRecord);

                await queryRunner.commitTransaction();
            } catch (err) {
                await queryRunner.rollbackTransaction();
            } finally {
                await queryRunner.release();
            }
        }

        // sync nullifier
        if (ifNotifySyncNullifier) {
            try {
                $axiosCore.get('/sync-nullifier');
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



