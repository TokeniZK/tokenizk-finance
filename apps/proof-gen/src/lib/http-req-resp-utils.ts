
import { ProofTaskDto, ProofTaskType } from "@tokenizk/types";
import fs from "fs";

export function saveProofTaskDtoFile(proofTaskDto: ProofTaskDto<any, any>, dirDest: string) {
    let logNamePrefix = 'proofTaskDto_proofResult_';
    switch (proofTaskDto.taskType) {
        case ProofTaskType.SALE_BATCH_MERGE:
            logNamePrefix += `SALE_BATCH_MERGE_`
            break;
        case ProofTaskType.PRESALE_CONTRACT_MAINTAIN_CONTRIBUTORS:
            logNamePrefix += `SALE_CONTRACT_CALL_`
            break;
        case ProofTaskType.CLIENT_AIRDROP_PROOF_REQ:
            logNamePrefix += `CLIENT_AIRDROP_PROOF_REQ_`
            break;
    }

    fs.writeFileSync(`${dirDest}/${logNamePrefix}-${proofTaskDto.index?.id}-${getDateString()}.json`, JSON.stringify(proofTaskDto));
}


export function getDateString() {
    let date = new Date();
    let YY = date.getFullYear() + '';
    let MM =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + '';
    let DD = date.getDate() < 10 ? "0" + date.getDate() : date.getDate() + '-';
    let hh = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + '';
    let mm = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + '';
    let ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return YY + MM + DD + hh + mm + ss;
}
