import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import {proofGen} from "./app/grpc/server/proof-gen-req";

const PROTO_PATH = __dirname + './../../../packages/grpc-protos/proof-gen';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const apiPfg = grpc.loadPackageDefinition(packageDefinition).apiProofGen;

function getGrpcServer() {
    const server = new grpc.Server();
    server.addService(apiPfg.apiProofGen.service, {
        proofGen
    });
    server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

getGrpcServer();
