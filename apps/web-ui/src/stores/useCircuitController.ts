
import { type Remote, wrap } from "comlink";
import { type CircuitController } from "@/workers/circuit-worker";

export const CircuitControllerState = {
    remoteController: null as Remote<CircuitController> | null,
    controllerWorker: null as Worker | null,
};

export const createRemoteCircuitController = async () => {
    console.log("create remote CircuitController...");
    if (CircuitControllerState.controllerWorker !== null) {
        CircuitControllerState.controllerWorker.terminate();
    }

    CircuitControllerState.controllerWorker = new Worker(
        new URL("../workers/circuit-worker.ts", import.meta.url),
        {
            type: "module",
        },
    );
    CircuitControllerState.remoteController = wrap<CircuitController>(CircuitControllerState.controllerWorker);
    console.log("remote CircuitController create success");
};

