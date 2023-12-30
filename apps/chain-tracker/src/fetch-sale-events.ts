import { PublicKey, UInt32, TokenId } from 'o1js';
import { getConnection } from 'typeorm';
import { Sale, SaleEventFetchRecord, UserTokenSale } from '@tokenizk/entities';
import { ClaimTokenEvent, ContributionEvent, PresaleMinaFundHolder, RedeemEvent, SaleParamsConfigurationEvent, TokeniZkFairSale, TokeniZkPresale, TokeniZkPrivateSale } from '@tokenizk/contracts';
import { EventsStandardResponse, SaleType, SaleStatus } from "@tokenizk/types";
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
        const presaleList = (await presaleRepo.find({
            status: SaleStatus.CONFIRMED,
        })) ?? [];

        



        

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

