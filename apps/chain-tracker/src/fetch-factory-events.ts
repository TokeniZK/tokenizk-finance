import { PublicKey, UInt32 } from 'o1js';
import { getConnection } from 'typeorm';
import { BasiceToken, FactoryEventFetchRecord, Sale, TokenFactory, User } from '@tokenizk/entities';
import { ConfigLauchpadPlatformParamsEvent, CreateBasicTokenEvent, CreateSaleEvent, CreateRedeemAccount, TokeniZkFactory } from '@tokenizk/contracts';
import { EventsStandardResponse } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";

const logger = getLogger('standardFetchFactoryEvents');

await initORM();

export async function standardFetchFactoryEvents() {
    logger.info('start fetch factory events by Standard...');

    try {
        const connection = getConnection();

        const factoryRepo = connection.getRepository(TokenFactory);
        const factory = (((await factoryRepo.find()) ?? []).sort((f0, f1) => f1.id - f0.id))[0];

        const queryRunner = connection.createQueryRunner();
        try {
            await queryRunner.startTransaction();

            let factoryEventFetchRecord = await queryRunner.manager.findOne(FactoryEventFetchRecord, { factoryId: factory.id });

            let startBlock = 0;
            if (factoryEventFetchRecord) {
                startBlock = factoryEventFetchRecord.blockHeight + 1;
            } else {
                factoryEventFetchRecord = new FactoryEventFetchRecord();
                factoryEventFetchRecord.factoryAddress = factory.factoryAddress;
                factoryEventFetchRecord.factoryId = factory.id;
                factoryEventFetchRecord.blockHeight = 0;
            }

            const tokenzkFactoryContract = new TokeniZkFactory(PublicKey.fromBase58(factory.factoryAddress));

            // fetch events
            const eventList: EventsStandardResponse[] = await tokenzkFactoryContract.fetchEvents(new UInt32(startBlock));
            eventList.sort((a, b) => Number(a.blockHeight.sub(b.blockHeight).toBigint()));

            for (let i = 0; i < eventList.length; i++) {
                const e = eventList[i];
                const txHash = e.event.transactionInfo.transactionHash.toString();
                const blockHeight = Number(e.blockHeight.toBigint());

                if (e.type == 'configLauchpadPlatformParams') {
                    const configLauchpadPlatformParamsEvent: ConfigLauchpadPlatformParamsEvent = e.event.data;
                    const newLauchpadPlatformParams = configLauchpadPlatformParamsEvent.newLauchpadPlatformParams;

                    factory.basicTokenVk = newLauchpadPlatformParams.basicTokenVk.toString(),
                        factory.basicTokenCreationFee = newLauchpadPlatformParams.basicTokenCreationFee.toString(),

                        factory.presaleContractVk = newLauchpadPlatformParams.presaleContractVk.toString(),
                        factory.presaleCreationFee = newLauchpadPlatformParams.presaleCreationFee.toString(),
                        factory.presaleServiceFeeRate = newLauchpadPlatformParams.presaleServiceFeeRate.toString(),
                        factory.presaleMinaFundHolderVk = newLauchpadPlatformParams.presaleMinaFundHolderVk.toString(),

                        factory.fairSaleContractVk = newLauchpadPlatformParams.fairSaleContractVk.toString(),
                        factory.fairSaleCreationFee = newLauchpadPlatformParams.fairSaleCreationFee.toString(),
                        factory.fairSaleServiceFeeRate = newLauchpadPlatformParams.fairSaleServiceFeeRate.toString(),

                        factory.privateSaleContractVk = newLauchpadPlatformParams.privateSaleContractVk.toString(),
                        factory.privateSaleCreationFee = newLauchpadPlatformParams.privateSaleCreationFee.toString(),
                        factory.privateSaleServiceFeeRate = newLauchpadPlatformParams.privateSaleServiceFeeRate.toString(),

                        factory.redeemAccountVk = newLauchpadPlatformParams.redeemAccountVk.toString(),

                        await queryRunner.manager.save(factory);

                } else if (e.type == 'createBasicToken') {
                    const createBasicTokenEvent: CreateBasicTokenEvent = e.event.data;

                    const basiceToken = ((await queryRunner.manager.find(BasiceToken, {
                        txHash,
                        tokenAddress: createBasicTokenEvent.basicTokenAddress.toBase58()
                    })) ?? [])[0];

                    if (basiceToken) {
                        basiceToken.status = 1;
                        basiceToken.fee = createBasicTokenEvent.fee.toString();
                        basiceToken.totalSupply = createBasicTokenEvent.totalSupply.toString();

                        await queryRunner.manager.save(basiceToken);
                    }

                } else if (e.type == 'createPresale' || e.type == 'createFairsale' || e.type == 'createPrivateSale') {
                    const createPresaleEvent: CreateSaleEvent = e.event.data;

                    const sale = (await queryRunner.manager.find(Sale, {
                        tokenAddress: createPresaleEvent.basicTokenAddress.toBase58(),
                        saleAddress: createPresaleEvent.saleContractAddress.toBase58()
                    }))![0];

                    sale.feeRate = createPresaleEvent.fee.toString();
                    sale.status = 1;
                    // TODO should fill with all saleparams
                    //
                    // 
                    //
                    // 

                    await queryRunner.manager.save(sale);

                } else if (e.type == 'createRedeemAccount') {
                    const redeemTokenEvent: CreateRedeemAccount = e.event.data;

                    const user = (await queryRunner.manager.find(User, {
                        address: redeemTokenEvent.redeemAccountAddress.toBase58()
                    }))![0];
                    user.txHash = e.event.transactionInfo.transactionHash;
                    user.status = 1;
                    user.nullifierRoot = redeemTokenEvent.nullifierRoot.toString();
                    await queryRunner.manager.save(user);

                }

                // save to saleEventFetchRecord
                factoryEventFetchRecord.blockHeight = blockHeight;
                await queryRunner.manager.save(factoryEventFetchRecord);
            }

            if (eventList.length > 0) {
                factoryEventFetchRecord.blockHeight = Number(eventList[eventList.length - 1].blockHeight.toBigint());
            }
            await queryRunner.manager.save(factoryEventFetchRecord);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

        return true;
    } catch (error) {
        console.error(error);
        logger.error(error);

        return false;
    } finally {
        logger.info('end.');
    }

}

