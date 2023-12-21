import config from './lib/config';
import { AccountUpdate, Field, PublicKey, UInt32, Reducer, fetchAccount, TokenId } from 'o1js';
import { Column, MoreThan, getConnection } from 'typeorm';
import { Presale, SaleEventFetchRecord, User, UserTokenPresale } from '@tokenizk/entities';
import { ClaimTokenEvent, ContributionEvent, PresaleParamsConfigurationEvent, TokeniZkPresale } from '@tokenizk/contracts';
import { activeMinaInstance, syncActions, syncNetworkStatus } from "@tokenizk/util";
import { EventsStandardResponse } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";
import { $axiosCore } from './lib/api';

const logger = getLogger('standardFetchPresaleEvents');

// Task:

// 1) fetch the sales that are ongoing
// i.e. endTime >= current && endTime <= current + 1month

// 2) fetch events : 
//    TokeniZkPresale: ['configurePresaleParams', 'contribute', 'claimTokens'],
//    PresaleMinaFundHolder: ['redeem']

// 2.1) event: configurePresaleParams
// update the presale params in the db

// 2.2) event: contribute && claimTokens
// insert user-presale in the db
export async function standardFetchPresaleEvents() {
    logger.info('start standardFetchPresaleEvents by Standard...');

try {
        let ifNotifySyncNullifier = false;

        const connection = getConnection();

        const presaleRepo = connection.getRepository(Presale);
        const presaleList = (await presaleRepo.find()) ?? [];
        
		
		//
		for (let i = 0; i < presaleList.length; i++) {
            const presale = presaleList[i];

            const queryRunner = connection.createQueryRunner();



                let saleEventFetchRecord = await queryRunner.manager.findOne(SaleEventFetchRecord, { address: presale.saleAddress });

                let startBlock = 0;
                if (saleEventFetchRecord) {
                    startBlock = saleEventFetchRecord.blockHeight + 1;
                } else {
                    saleEventFetchRecord = new SaleEventFetchRecord();
                    saleEventFetchRecord.address = presale.saleAddress;
                }

                // fetch events
                const tokenizkPresale = new TokeniZkPresale(PublicKey.fromBase58(presale.saleAddress), TokenId.derive(PublicKey.fromBase58(presale.tokenAddress)));
                const eventList: EventsStandardResponse[] = await tokenizkPresale.fetchEvents(new UInt32(startBlock));

                for (let i = 0; i < eventList.length; i++) {
                    const e = eventList[i];
                    const blockHeight = Number(e.blockHeight.toBigint());

                    if (e.type == 'configurePresaleParams') {
                        const presaleParamsConfigurationEvent: PresaleParamsConfigurationEvent = e.event.data;
                        const presaleParams = presaleParamsConfigurationEvent.presaleParams;

                        presale.tokenAddress = presaleParams.tokeniZkBasicTokenAddress.toBase58();
                        presale.totalSaleSupply = Number(presaleParams.totalPresaleSupply.toString());
                        presale.saleRate = Number(presaleParams.presaleRate.toString());
                        presale.whitelistTreeRoot = presaleParams.whitelistTreeRoot.toString();
                        presale.softCap = Number(presaleParams.softCap.toString());
                        presale.hardCap = Number(presaleParams.hardCap.toString());
                        
                   } else if (e.type == 'contribute') {
                        const contributionEvent: ContributionEvent = e.event.data;

                        const user = new UserTokenPresale();
                        user.txHash = e.event.transactionInfo.transactionHash;
                        user.contributorAddress = contributionEvent.address.toBase58();
                        user.saleId = presale.id;
                        user.saleAddress = presale.saleAddress;
                        user.tokenAddress = presale.tokenAddress;
                        user.contributeBlockHeight = blockHeight;
                        user.contributedCurrencyAmount = contributionEvent.minaAmount.toString();

                        await queryRunner.manager.save(user);

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
