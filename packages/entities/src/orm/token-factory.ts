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
@Entity("tb_token_factory")
export class TokenFactory {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    txHash: string

    @Column()
    status: number

    @Column()
    platfromFeeAddress: string

    @Column()
    lauchpadPlatformParamsHash: string




    @Column()
    basicTokenVk: string

    @Column()
    basicTokenCreationFee: string

    @Column()
    presaleContractVk: string

    @Column()
    presaleCreationFee: string

    @Column()
    presaleServiceFeeRate: string

    @Column()
    presaleMinaFundHolderVk: string



        @Column()
        fairSaleContractVk: string
    

        @Column()
        fairSaleCreationFee: string
    

        @Column()
        fairSaleServiceFeeRate: string
    



    @Column()
    privateSaleContractVk: string

    @Column()
    privateSaleCreationFee: string

    @Column()
    privateSaleServiceFeeRate: string


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
