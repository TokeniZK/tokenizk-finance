import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

@Entity("tb_sale_event_fetch_record")
export class SaleEventFetchRecord {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * default: 0
     * 1: presaleMinaHolder
     */
    @Column()
    type: number

    @Column()
    saleId: number

    @Column()
    tokenAddress: string

    @Column()
    saleAddress: string

    @Column()
    blockHeight: number

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date
}

/**
 * sort by 'blockHeight' && 'createdAt'
 */
