import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'


@Entity("tb_user_token_transfer")
export class UserTokenTransfer {
  @PrimaryGeneratedColumn("increment")
  id: number

  @Column()
  status: number

  @Column()
  from: string

  @Column()
  to: string

  @Column()
  amount: string

  @Column()
  tokenAddress: string

  @Column()
  tokenId: string

  /**
   * contribution TxHash
   */
  @Column()
  txHash: string

  @Column()
  blockHeight: number

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
