import config from '../config';
import "reflect-metadata"

import { createConnection } from 'typeorm'
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { getLogger } from "@/lib/logUtils";
import { L2TxDtoOrigin, WithdrawEventFetchRecord, DepositActionEventFetchRecord, DepositProcessorSignal, Task, WithdrawInfo, DepositCommitment, DepositProverOutput, DepositRollupBatch, DepositTreeTrans, Account, MemPlL2Tx, L2Tx, Block, BlockCache, BlockProverOutput, InnerRollupBatch, DepositTreeTransCache, MinaBlock, ZkappCommands, BlocksZkappCommands } from '@tokenizk/dao';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const logger = getLogger('orm');

export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeOrmMysql,
            // 【error1】 ...entities
            // 【error2】 entities: [L2TxDtoOrigin, ...entities]
            entities: [L2TxDtoOrigin, WithdrawEventFetchRecord, DepositActionEventFetchRecord, DepositProcessorSignal, Task, WithdrawInfo, DepositCommitment, DepositProverOutput, DepositRollupBatch, DepositTreeTrans, Account, MemPlL2Tx, L2Tx, Block, BlockCache, BlockProverOutput, InnerRollupBatch, DepositTreeTransCache],
            ...connectionOverrides,
            timezone: '+00:00'
        });
        logger.info('### INFO: Mysql Connection Established')
        return connection;
    } catch (error) {
        logger.info(error)

        throw error;
    }
};

export const initOrmPg = async (connectionOverrides?: Partial<PostgresConnectionOptions>) => {
    logger.info('### INFO: Creating Postgres Connection for typeORM')
    try {
        const connection = await createConnection(<PostgresConnectionOptions>{
            name: 'postgres_archive',
            ...config.typeOrmPg,
            entities: [MinaBlock, ZkappCommands, BlocksZkappCommands],
            ...connectionOverrides,
            timezone: '+00:00',
            enum: true,
            dialectOptions: {
                array: true
            }
        });
        logger.info('### INFO: Postgres Connection Established')
        return connection;
    } catch (error) {
        logger.info(error);
        throw error;
    }
};
