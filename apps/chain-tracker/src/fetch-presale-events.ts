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

}
