import { SaleDto, SaleStatus } from '@tokenizk/types'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

@Entity("tb_comment")
export class Comment {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * 1: presale
     * 2: fairsale
     * 3: privatesale
     * 4: airdrop
     */
    @Column()
    projectType: number

    /**
     * current batch's starting actionState
     */
    @Column()
    projectAddress: string

    @Column()
    fromId: string

    @Column()
    toId: string

    @Column()
    parentCommentId: string

    @Column()
    comment: string

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date
}
