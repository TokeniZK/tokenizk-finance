import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

export enum TaskType {
  SALE,
  FACTORY,
}

export enum TaskStatus {
  PENDING = 0,
  DONE
}


@Entity("tb_client_prove_task")
export class ClientProveTask {
  @PrimaryGeneratedColumn("increment")
  id: number

  /**
   * 0: airdrop
   * 1: presale
   */
  @Column()
  type: number

  @Column()
  params: string

  @Column()
  result: string

  @Column()
  userAddress: string

  @Column()
  targetAddress: string

  @Column()
  tokenAddress: string

  @Column()
  txHash: string

  /**
   * 0: pending
   * 1: done
   */
  @Column()
  status: number

  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
}
