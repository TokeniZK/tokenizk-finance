import { SaleStatus } from '@tokenizk/types'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

/**
 * 
 */
@Entity("tb_airdrop")
export class Airdrop {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * L1TxHash
     */
    @Column()
    txHash: string

    /**
     * {@link L1TxStatus}
     */
    @Column({ default: SaleStatus.UNCONFIRMED })
    status: number

    /**
     * current batch's starting actionState
     */
    @Column()
    startActionHash: string

    /**
     * next batch's starting actionState
     */
    @Column()
    nextActionHash: string

    /**
     * current batch's starting actionIndex
     */
    @Column()
    startActionIndex: string

    /**
     * next batch's starting actionIndex
     */
    @Column()
    nextActionIndex: string

    /**
     * record the starting block number where obtaining actions/events
     */
    @Column()
    startBlock: number

    /**
     * record the ending block number where obtaining actions/events
     */
    @Column()
    endBlock: number

    @Column()
    startDepositRoot: string

    @Column()
    nextDepositRoot: string

    /**
     * just record
     */
    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date

    /**
     * the timestamp when L2Block is created at Layer2
     */
    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date
}
