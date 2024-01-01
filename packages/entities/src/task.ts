import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

export enum TaskType {
    SALE,
    FACTORY,
}

export enum TaskStatus {
    PENDING = 0,
    DONE
}


/**
 * mainly for L1 tx status trace of DepositContract Maintainance, RollupContract Maintaince, Withdraw Maintainance.
 * * when L1tx for DepositContract Maintainance is done, then update 'DepositTreeTrans' and all related items of table 'DepositInfo';
 * * when L1tx for RollupContract Maintainance is done, then update target item of table 'BlockProverOutputEntity';
 * * when L1tx for Withdraw Maintainance is done, then update target item of table 'WithdrawInfo';
 */
@Entity("tb_task")
export class Task {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * entity id for the target, like 'WithdrawInfo', 'BlockProverOutputEntity', 'DepositTreeTrans'
     * @optional
     */
    @Column()
    targetId: number

    /**
     * L1TxHash
     */
    @Column()
    txHash: string

    /**
     * {@link TaskStatus}
     */
    @Column()
    status: number

    @Column()
    taskType: number

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date
}
