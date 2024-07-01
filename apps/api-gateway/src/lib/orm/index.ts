import config from '../config';

import { createConnection } from 'typeorm'
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { getLogger } from "@/lib/logUtils";
import { Comment, TokenFactory, UserTokenSale,UserTokenTransfer, UserTokenAirdrop, Sale, User, SaleRollupProverParam, SaleEventFetchRecord, FactoryEventFetchRecord, BasiceToken, Airdrop, ClientProveTask } from '@tokenizk/entities';

const logger = getLogger('orm');
export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORM,
            entities: [Comment, TokenFactory, ClientProveTask, BasiceToken,UserTokenTransfer, UserTokenSale, Sale, User, SaleRollupProverParam, SaleEventFetchRecord, FactoryEventFetchRecord, Airdrop, UserTokenAirdrop],
            ...connectionOverrides,
            timezone: '+00:00'
        });
        logger.info('### INFO: Connection Established')
        return connection
    } catch (error) {
        return logger.info(error)
    }
};
