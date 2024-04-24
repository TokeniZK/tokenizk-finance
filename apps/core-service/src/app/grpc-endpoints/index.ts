
import config from "@/lib/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

export {maintainSaleContributors} from './maintain-sale-contributors';
export {queryUserAirdropWitness} from './query-user-airdrop-witness';
export {queryUserContributionWitness} from './query-user-contribution-witness';
export {queryUserMetaStates} from './query-user-meta-states';
export {syncUserAirdropNullifier} from './sync-user-airdrop-nullifier';
export {syncUserSaleNullifier} from './sync-user-sale-nullifier'



const PROTO_PATH = __dirname + '../../../../../../packages/grpc-protos/proof-gen/index.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const pgClientService_proto = grpc.loadPackageDefinition(packageDefinition).proofGen;
export const pgClient = new pgClientService_proto.RollupSeq(config.proofGenHost + ':' + config.proofGenPort, grpc.credentials.createInsecure());
