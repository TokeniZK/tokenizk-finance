import config from '../config';
import "reflect-metadata"

import { createConnection } from 'typeorm'
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { getLogger } from "@/lib/logUtils";
import { TokenFactory, UserTokenSale, UserTokenAirdrop, Sale, User, SaleRollupProverParam, SaleEventFetchRecord, FactoryEventFetchRecord, BasiceToken, Airdrop, ClientProveTask } from '@tokenizk/entities';

const logger = getLogger('orm');
export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORM,
            entities: [TokenFactory, ClientProveTask, BasiceToken, UserTokenSale, Sale, User, SaleRollupProverParam, SaleEventFetchRecord, FactoryEventFetchRecord, Airdrop, UserTokenAirdrop],
            ...connectionOverrides,
            timezone: '+00:00'
        });
        logger.info('### INFO: Connection Established')
        return connection
    } catch (error) {
        return logger.info(error)
    }
};
