import { FastifyPlugin } from "fastify"
import { highFeeTxExist } from "./high-fee-tx-exit";

export const txEndpoints: FastifyPlugin = async (
    instance,
    options,
    done
): Promise<void> => {
    instance.register(highFeeTxExist);
}
