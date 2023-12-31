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
    type: number

    saleId: number

    tokenAddress: string

    saleAddress: string

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
