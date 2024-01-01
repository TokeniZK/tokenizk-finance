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
@Entity("tb_user_token_sale")
export class UserTokenSale {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    contributorAddress: string

    @Column()
    saleId: number

    @Column()
    saleAddress: string

    @Column()
    tokenAddress: string

    @Column()
    tokenId: string

    /**
     * contribution TxHash
     */
    @Column()
    contributeTxHash: string

    @Column()
    contributeBlockHeight: number

    @Column()
    contributeCurrencyAmount: string

    @Column()
    contributeActionIndex: number

    /**
     * redeem TxHash
     */
    @Column()
    redeemTxHash: string

    @Column()
    redeemOrClaimBlockHeight: number

    /**
     * claim TxHash
     */
    @Column()
    claimTxHash: string

    @Column()
    claimAmount: string

    /**
     * 0: default
     * 1: synced
     */
    @Column({default:0})
    syncNullTreeFlag: number

    /**
     * record the leaf index in user_nullifier_tree
     */
    @Column()
    nullTreeLeafIndex: number

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
