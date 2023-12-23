export enum ProofTaskType {
    PRESALE_BATCH_MERGE = 0,
    PRESALE_CONTRACT_CALL = 1,
}

export interface ProofTaskDto<S, T> {
    taskType: ProofTaskType,
    index: S
    payload: T
}
