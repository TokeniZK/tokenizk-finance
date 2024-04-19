import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import * as apiHandlers from "./app/grpc-endpoints";

const PROTO_PATH = __dirname + './../../../packages/grpc-protos/core-service';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const apiSeq = grpc.loadPackageDefinition(packageDefinition).apiSequencer;

function getGrpcServer() {
    const server = new grpc.Server();
    server.addService(apiSeq.ApiSequencer.service, {
        maintainSaleContributors: apiHandlers.maintainSaleContributors,
        queryUserAirdropWitness: apiHandlers.queryUserAirdropWitness,
        queryUserContributionWitness: apiHandlers.queryUserContributionWitness,
        queryUserMetaStates: apiHandlers.queryUserMetaStates,
        syncUserAirdropNullifier: apiHandlers.syncUserAirdropNullifier,
    });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

getGrpcServer();
