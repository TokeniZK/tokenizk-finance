import config from '../config';
import "reflect-metadata"

import { createConnection } from 'typeorm'
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { getLogger } from "@/lib/logUtils";
// import {  } from '@tokenizk/entities';

const logger = getLogger('orm');
export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORM,
            // 【error1】 ...entities
            // 【error2】 entities: [...entities]
            entities: [],
            ...connectionOverrides,
        });
        logger.info('### INFO: Connection Established！')
        return connection
    } catch (error) {
        return logger.info(error)
    }
};
export const initORMPg = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating PG Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORM,
            // 【error1】 .export const initORM = async (connectionOverrides?: Partial<MysqlConnectionOptions>) => {
    logger.info('### INFO: Creating Mysql Connection for typeORM')
    try {
        const connection = await createConnection(<MysqlConnectionOptions>{
            ...config.typeORMPg,
            // 【error1】 ...entities
            // 【error2】 entities: [...entities]
            entities: [],
            ...connectionOverrides,
        });
        logger.info('### INFO: Connection Established！')
        return pgconnection
    } catch (error) {
        return logger.info(error)
    }
};
};
