import { AirdropDto } from '@tokenizk/types'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'
import {
    UInt64,
    PublicKey,
    Field,
    UInt32,
} from 'o1js';
import { AirdropParams } from '@tokenizk/contracts';

/**
 * 
 */
@Entity("tb_airdrop")
export class Airdrop {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    type: number

    /**
     * L1TxHash
     */
    @Column()
    txHash: string

    /**
     * {@link L1TxStatus}
     */
    @Column()
    status: number

    @Column()
    airdropName: string

    /**
     * current batch's starting actionState
     */
    @Column()
    airdropAddress: string

    @Column()
    tokenAddress: string

    @Column()
    totalAirdropSupply: number

    @Column()
    currency: string

    @Column()
    feeRate: string

    @Column()
    whitelistTreeRoot: string

    /**
     * comma separated list of addresses
     */
    @Column()
    whitelistMembers: string

    @Column()
    startTimestamp: number

    @Column()
    endTimestamp: number

    @Column()
    cliffTime: number

    @Column()
    cliffAmountRate: number

    @Column()
    vestingPeriod: number

    @Column()
    vestingIncrement: number
    
    @Column()
    star: number

    @Column()
    logoUrl: string

    @Column()
    website: string

    @Column()
    facebook: string

    @Column()
    github: string

    @Column()
    twitter: string

    @Column()
    telegram: string

    @Column()
    discord: string

    @Column()
    reddit: string

    @Column()
    description: string

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date

    generateSaleParam() {
        const airdropParams = new AirdropParams({
            tokenAddress: PublicKey.fromBase58(this.tokenAddress),
            totalAirdropSupply: UInt64.from(this.totalAirdropSupply),
            totalMembersNumber: UInt64.from(this.whitelistMembers.split(',').length),
            whitelistTreeRoot: Field(this.whitelistTreeRoot),
            startTime: UInt32.from(this.startTimestamp),
            cliffTime: UInt32.from(this.cliffTime),
            cliffAmountRate: UInt64.from(this.cliffAmountRate),
            vestingPeriod: UInt32.from(this.vestingPeriod), // 0 is not allowed, default value is 1
            vestingIncrement: UInt64.from(this.vestingIncrement)
        });

        return airdropParams;
    }

    static fromDto(airdropDto: AirdropDto) {
        const airdrop = new Airdrop();

        Object.assign(airdrop, airdropDto);

        return airdrop;
    }

}
