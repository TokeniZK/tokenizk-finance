import config from "@/lib/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = __dirname + '../../../../../../packages/grpc-protos/core-service/index.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const coreService_proto = grpc.loadPackageDefinition(packageDefinition).coreservice;
export const coreClient = new coreService_proto.RollupSeq(config.coreServiceHost + ':' + config.coreServicePort, grpc.credentials.createInsecure());
