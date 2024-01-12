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
@Entity("tb_user_token_airdrop")
export class UserTokenAirdrop {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({ default: 0 })
    status: number

    @Column()
    userAddress: string

    @Column()
    airdropId: number

    @Column()
    airdropAddress: string

    @Column()
    tokenAddress: string

    @Column()
    tokenId: string

    /**
     * claim TxHash
     */
    @Column()
    claimTxHash: string

    @Column()
    claimAmount: string

    @Column()
    claimBlockHeight: number

    /**
     * 0: default
     * 1: synced
     */
    @Column({ default: 0 })
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
