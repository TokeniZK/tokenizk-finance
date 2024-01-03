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
@Entity("tb_user")
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    txHash:string

    @Column()
    status: number

    @Column()
    address: string

    @Column()
    name: string

    @Column()
    nullifierRoot: string

    @Column()
    nullStartIndex: string

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
