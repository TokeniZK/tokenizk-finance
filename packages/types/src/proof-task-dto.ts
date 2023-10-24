export enum ProofTaskType {
    LOCK_TOKEN_CLAIM,
    AIRDROP_TOKEN_CLAIM
}


// export interface ProofTaskDto<S, T> {
//     taskType: ProofTaskType,
//     index: S
//     payload: T
// }

export interface ProofTaskDto<S, T> {
    taskType: ProofTaskType,
    index: S
    payload: T
}
