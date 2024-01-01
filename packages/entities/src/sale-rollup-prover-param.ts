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
@Entity("tb_sale_rollup_prover_param")
export class SaleRollupProverParam {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * 0: presale
     * 1: fairsale
     * 2: private sale
     */
    @Column()
    type: number

    @Column()
    saleId: number

    @Column()
    saleAddress: string

    @Column()
    tokenAddress: string

    @Column()
    tokenId: string

    @Column()
    param: string

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
