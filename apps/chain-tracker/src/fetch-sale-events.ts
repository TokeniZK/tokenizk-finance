import { PublicKey, UInt32, TokenId } from 'o1js';
import { getConnection } from 'typeorm';
import { Sale, SaleEventFetchRecord, UserTokenSale } from '@tokenizk/entities';
import { ClaimTokenEvent, ContributionEvent, PresaleMinaFundHolder, RedeemEvent, SaleParamsConfigurationEvent, TokeniZkFairSale, TokeniZkPresale, TokeniZkPrivateSale } from '@tokenizk/contracts';
import { EventsStandardResponse, SaleType, SaleStatus } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";
import { $axiosCore } from './lib/api';
import { activeMinaInstance } from '@tokenizk/util';

const logger = getLogger('standardFetchSaleEvents');
await activeMinaInstance();
await initORM();


const periodRange = 1.5 * 60 * 1000

await standardFetchSaleEvents();
setInterval(standardFetchSaleEvents, periodRange); // exec/1.5mins

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
        const presaleList = (await presaleRepo.find({
            status: SaleStatus.CONFIRMED,
        })) ?? [];
        for (let i = 0; i < presaleList.length; i++) {
            const sale = presaleList[i];
            logger.info(`saleId: ${sale.id}, saleType: ${SaleType[sale.saleType]}, saleAddress: ${sale.saleAddress}`);

            const queryRunner = connection.createQueryRunner();
            try {
                await queryRunner.startTransaction();

                let saleEventFetchRecord = await queryRunner.manager.findOne(SaleEventFetchRecord, { saleId: sale.id });

                let startBlock = 0;
                if (saleEventFetchRecord) {
                    startBlock = saleEventFetchRecord.blockHeight + 1;
                } else {
                    saleEventFetchRecord = new SaleEventFetchRecord();
                    saleEventFetchRecord.type = sale.saleType;
                    saleEventFetchRecord.saleId = sale.id;
                    saleEventFetchRecord.tokenAddress = sale.tokenAddress;
                    saleEventFetchRecord.saleAddress = sale.saleAddress;
                    saleEventFetchRecord.blockHeight = 0;
                }
                logger.info(`start from blockHeight: ${startBlock}`);

                let tokenzkSaleContract: TokeniZkPresale | TokeniZkFairSale | TokeniZkPrivateSale;
                let presaleMinaFundHolderContract: PresaleMinaFundHolder;
                if (sale.saleType == SaleType.PRESALE) {
                    tokenzkSaleContract = new TokeniZkPresale(PublicKey.fromBase58(sale.saleAddress), TokenId.derive(PublicKey.fromBase58(sale.tokenAddress)));
                    presaleMinaFundHolderContract = new PresaleMinaFundHolder(PublicKey.fromBase58(sale.saleAddress));
                } else if (sale.saleType == SaleType.FAIRSALE) {
                    tokenzkSaleContract = new TokeniZkFairSale(PublicKey.fromBase58(sale.saleAddress), TokenId.derive(PublicKey.fromBase58(sale.tokenAddress)));
                } else if (sale.saleType == SaleType.PRIVATESALE) {
                    tokenzkSaleContract = new TokeniZkPrivateSale(PublicKey.fromBase58(sale.saleAddress), TokenId.default);
                }
                // fetch events
                const eventList: EventsStandardResponse[] = await tokenzkSaleContract!.fetchEvents(new UInt32(startBlock));
                if (sale.saleType == SaleType.PRESALE) {
                    eventList.push(...(await presaleMinaFundHolderContract!.fetchEvents(new UInt32(startBlock))) ?? []);
                }
                eventList.sort((a, b) => (a.blockHeight as any as number) - (b.blockHeight as any as number));

                for (let i = 0; i < eventList.length; i++) {
                    const e = eventList[i];
                    logger.info(`e.type: ${e.type}`);

                    const blockHeight = Number(e.blockHeight.toBigint());
                    const txHash = e.event.transactionInfo.transactionHash;

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

                        const userSale = await queryRunner.manager.findOne(UserTokenSale, {
                            saleAddress: sale.saleAddress,
                            tokenAddress: sale.tokenAddress,
                            contributorAddress: contributionEvent.contributorAddress.toBase58(),
                        });

                        const userSale1 = userSale ?? new UserTokenSale();
                        userSale1.saleId = sale.id;
                        userSale1.saleAddress = sale.saleAddress;
                        userSale1.tokenAddress = sale.tokenAddress;
                        userSale1.tokenId = contributionEvent.tokenId.toString();
                        userSale1.contributeTxHash = txHash;
                        userSale1.contributorAddress = contributionEvent.contributorAddress.toBase58();
                        userSale1.contributeBlockHeight = blockHeight;
                        userSale1.contributeCurrencyAmount = contributionEvent.minaAmount.toString();
                        await queryRunner.manager.save(userSale1);

                    } else if (e.type == 'claimToken') {
                        const claimTokenEvent: ClaimTokenEvent = e.event.data;

                        const user = (await queryRunner.manager.findOne(UserTokenSale, {
                            tokenAddress: sale.tokenAddress,
                            saleAddress: sale.saleAddress,
                            contributorAddress: claimTokenEvent.saleContribution.contributorAddress.toBase58()
                        }))!;
                        user.claimTxHash = txHash;
                        user.redeemOrClaimBlockHeight = blockHeight;
                        user.claimAmount = claimTokenEvent.saleContribution.minaAmount.mul(sale.saleRate).toString();

                        await queryRunner.manager.save(user);

                        ifNotifySyncNullifier = true;

                    } else if (e.type == 'redeem') {
                        const redeemTokenEvent: RedeemEvent = e.event.data;

                        const user = (await queryRunner.manager.findOne(UserTokenSale, {
                            tokenAddress: sale.tokenAddress,
                            saleAddress: sale.saleAddress,
                            contributorAddress: redeemTokenEvent.saleContribution.contributorAddress.toBase58()
                        }))!;
                        user.redeemTxHash = txHash;
                        user.redeemOrClaimBlockHeight = blockHeight;
                        await queryRunner.manager.save(user);

                        ifNotifySyncNullifier = true;
                    } else if (e.type == 'maintainContributors') {
                        sale.contributorsMaintainFlag = 1;
                        sale.contributorsMaintainTxHash = txHash;
                    }
                }

                if (eventList.length > 0) {
                    saleEventFetchRecord.blockHeight = Number(eventList[eventList.length - 1].blockHeight.toBigint());
                }
                await queryRunner.manager.save(saleEventFetchRecord);

                await queryRunner.commitTransaction();
            } catch (err) {
                console.error(err);
                logger.error(err);
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
