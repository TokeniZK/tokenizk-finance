import config from '../config';
import "reflect-metadata"

import { createConnection } from 'typeorm'
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { getLogger } from "@/lib/logUtils";
import { L2TxDtoOrigin, WithdrawEventFetchRecord, DepositActionEventFetchRecord, DepositProcessorSignal, Task, WithdrawInfo, DepositCommitment, DepositProverOutput, DepositRollupBatch, DepositTreeTrans, Account, MemPlL2Tx, L2Tx, Block, BlockCache, BlockProverOutput, InnerRollupBatch, DepositTreeTransCache } from '@tokenizk/dao';

const logger = getLogger('orm');
export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORM,
            // 【error1】 ...entities
            // 【error2】 entities: [L2TxDtoOrigin, ...entities]
            entities: [L2TxDtoOrigin, WithdrawEventFetchRecord, DepositActionEventFetchRecord, DepositProcessorSignal, Task, WithdrawInfo, DepositCommitment, DepositProverOutput, DepositRollupBatch, DepositTreeTrans, Account, MemPlL2Tx, L2Tx, Block, BlockCache, BlockProverOutput, InnerRollupBatch, DepositTreeTransCache],
            ...connectionOverrides,
            timezone: '+00:00'
        });
        logger.info('### INFO: Connection Established')
        return connection
    } catch (error) {
        return logger.info(error)
    }
};
