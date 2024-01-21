import { SaleDto, SaleStatus } from '@tokenizk/types'
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
import { SaleParams } from '@tokenizk/contracts';

/**
 * 
 */
@Entity("tb_sale")
export class Sale {
    @PrimaryGeneratedColumn("increment")
    id: number

    /**
     * 1: presale
     * 2: fairsale
     * 3: privatesale
     */
    @Column()
    saleType: number

    /**
     * L1TxHash
     */
    @Column()
    txHash: string

    /**
     * {@link L1TxStatus}
     */
    @Column({ default: SaleStatus.UNCONFIRMED })
    status: number

    @Column()
    saleName: string

    /**
     * current batch's starting actionState
     */
    @Column()
    saleAddress: string

    @Column()
    tokenAddress: string

    @Column()
    totalSaleSupply: number

    @Column()
    currency: string

    @Column()
    feeRate: string

    @Column()
    saleRate: number

    @Column()
    whitelistTreeRoot: string

    /**
     * comma separated list of addresses
     */
    @Column()
    whitelistMembers: string

    @Column()
    softCap: number

    @Column()
    hardCap: number

    @Column()
    minimumBuy: number

    @Column()
    maximumBuy: number

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

    /**
     * 0: not yet, 1: handle
     * 
     */
    @Column()
    contributorsFetchFlag: number

    @Column()
    contributorsTreeRoot: string

    @Column()
    totalContributedMina: number
    /**
     * 0: not yet, 1: handle
     * 
     */
    @Column()
    contributorsMaintainFlag: number

    @Column()
    contributorsMaintainTxHash: string

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
        const saleParams = new SaleParams({
            tokenAddress: PublicKey.fromBase58(this.tokenAddress),
            totalSaleSupply: UInt64.from(this.totalSaleSupply),
            saleRate: UInt64.from(this.saleRate),
            whitelistTreeRoot: Field(this.whitelistTreeRoot),
            softCap: UInt64.from(this.softCap),
            hardCap: UInt64.from(this.hardCap),
            minimumBuy: UInt64.from(this.minimumBuy),
            maximumBuy: UInt64.from(this.maximumBuy),
            startTime: UInt64.from(this.startTimestamp),
            endTime: UInt64.from(this.endTimestamp),
            cliffTime: UInt32.from(this.cliffTime),
            cliffAmountRate: UInt64.from(this.cliffAmountRate),
            vestingPeriod: UInt32.from(this.vestingPeriod), // 0 is not allowed, default value is 1
            vestingIncrement: UInt64.from(this.vestingIncrement)
        });

        return saleParams;
    }

    static fromDto(saleDto: SaleDto) {
        const sale = new Sale();

        Object.assign(sale, saleDto);

        return sale;
    }

}
