import { getLogger } from './lib/logUtils';
import config from "@/lib/config";
import { FastifyCore } from './app'
import { SaleContributorsDB, PlatformDB, IndexDB } from "./worldstate";
import { activeMinaInstance } from "@tokenizk/util";
import { UserNullifierDB } from './worldstate/user-nullifier-db';

const logger = getLogger('web-server');

// init Mina tool
await activeMinaInstance();// TODO improve it to configure graphyQL endpoint

// init mysqlDB
const platformDB = new PlatformDB();
await platformDB.start();
logger.info('platformDB started.');


// init IndexDB
const indexDB = new IndexDB(config.indexedDBPath);
logger.info('indexDB started.');


// init saleContributorsDB
const saleContributorsDB = new SaleContributorsDB(config.saleContributorsDBPath);
logger.info('saleContributorsDB started.');

// TODO should check if all sales' contributor-merkle-trees are synced, to avoid extreme case where process crashes after mysqlDB commit but before tree.commit
// 
//
// 
//

// init userNullifierDB
const userNullifierDB = new UserNullifierDB(config.userNullifierDBPath);
logger.info('userNullifierDB started.');
// TODO should check if all user-nullifier-trees are synced, to avoid extreme case where process crashes after mysqlDB commit but before tree.commit
//
//
// 
//

const app = new FastifyCore();
app.server.decorate('saleContributorsDB', saleContributorsDB);
app.server.decorate('userNullifierDB', userNullifierDB);
app.server.decorate('indexDB', indexDB);
app.server.decorate('platformDB', platformDB);

logger.info('web-server is listening.');
await app.listen()
