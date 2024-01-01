export enum ProofTaskType {
    SALE_BATCH_MERGE = 0,
    PRESALE_CONTRACT_CALL = 1,
    FAIRSALE_CONTRACT_CALL = 2,
    PRIVATESALE_CONTRACT_CALL = 3,
}

export interface ProofTaskDto<S, T> {
    taskType: ProofTaskType,
    index: S
    payload: T
}
