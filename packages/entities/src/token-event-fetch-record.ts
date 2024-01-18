import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

@Entity("tb_token_event_fetch_record")
export class TokenEventFetchRecord {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * default: 0
     */
    type: number

    tokenId: number

    tokenAddress: string

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
