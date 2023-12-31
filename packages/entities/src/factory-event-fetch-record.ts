import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'

@Entity("tb_factory_event_fetch_record")
export class FactoryEventFetchRecord {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * default: 0
     */
    @Column()
    type: number

    @Column()
    factoryId: number

    @Column()
    factoryAddress: string

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

