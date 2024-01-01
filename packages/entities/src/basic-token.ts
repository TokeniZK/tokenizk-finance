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
@Entity("tb_basic_token")
export class BasiceToken {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * L1TxHash
     */
    @Column()
    txHash: string

    @Column()
    type: number

    /**
     * 0: unconfirmed
     * 1: confirmed
     */
    @Column()
    status: number

    @Column()
    address: string

    @Column()
    fee: string

    @Column()
    name: string

    @Column()
    symbol: string

    @Column()
    zkappUri: string

    /**
     * current batch's starting actionIndex
     */
    @Column()
    totalSupply: string

    @Column()
    totalAmountInCirculation: string

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
