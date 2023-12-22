
import { TaskStack } from './task-stack.js';
import { SubProcessCordinator } from '@/create-sub-processes';
import { ProofPayload } from "../constant.js";
import { getLogger } from "../lib/logUtils.js";
import fs from "fs";
import { getDateString } from '@/lib';

const logger = getLogger('presale-rollup-handler');

export const presaleRollupBatchAndMerge = async (subProcessCordinator: SubProcessCordinator, proofPayloads: ProofPayload<any>[], sendCallBack?: any) => {
}
