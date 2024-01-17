import { PublicKey, UInt32, fetchAccount, fetchLastBlock } from 'o1js';
import { getConnection } from 'typeorm';
import { Airdrop, BasiceToken, FactoryEventFetchRecord, Sale, TokenFactory, User } from '@tokenizk/entities';
import { ConfigLauchpadPlatformParamsEvent, CreateBasicTokenEvent, CreateSaleEvent, CreateRedeemAccount, TokeniZkFactory, CreateAirdropEvent } from '@tokenizk/contracts';
import { EventsStandardResponse } from "@tokenizk/types";
import { getLogger } from "@/lib/logUtils";
import { initORM } from "./lib/orm";
import { activeMinaInstance, syncNetworkStatus } from '@tokenizk/util';

const logger = getLogger('standardFetchFactoryEvents');
// init 
await activeMinaInstance();
await initORM();


const periodRange = 1.5 * 60 * 1000
await standardFetchFactoryEvents();
setInterval(standardFetchFactoryEvents, periodRange); // exec/1.5mins
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
                factoryEventFetchRecord.blockHeight = startBlock;
            }

            // await syncNetworkStatus();

            const factoryAddr = PublicKey.fromBase58(factory.factoryAddress);
            await fetchAccount({ publicKey: factoryAddr });
            const tokenzkFactoryContract = new TokeniZkFactory(factoryAddr);

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
                        address: createBasicTokenEvent.basicTokenAddress.toBase58()
                    })) ?? [])[0];

                    if (basiceToken) {
                        basiceToken.status = 1;
                        basiceToken.fee = createBasicTokenEvent.fee.toString();
                        basiceToken.totalSupply = createBasicTokenEvent.totalSupply.toString();

                        await queryRunner.manager.save(basiceToken);
                    }

                } else if (e.type == 'createPresale' || e.type == 'createFairsale' || e.type == 'createPrivateSale') {
                    const createSaleEvent: CreateSaleEvent = e.event.data;

                    const sale = (await queryRunner.manager.find(Sale, {
                        tokenAddress: createSaleEvent.basicTokenAddress.toBase58(),
                        saleAddress: createSaleEvent.saleContractAddress.toBase58()
                    }))![0];

                    sale.feeRate = createSaleEvent.fee.toString();
                    sale.status = 1;
                    sale.txHash = txHash;
                    // must update the params!
                    sale.totalSaleSupply = Number(createSaleEvent.saleParams.totalSaleSupply.toString());
                    sale.saleRate = Number(createSaleEvent.saleParams.saleRate.toString());
                    sale.whitelistTreeRoot = createSaleEvent.saleParams.whitelistTreeRoot.toString();
                    sale.softCap = Number(createSaleEvent.saleParams.softCap.toString());
                    sale.hardCap = Number(createSaleEvent.saleParams.hardCap.toString());
                    sale.minimumBuy = Number(createSaleEvent.saleParams.minimumBuy.toString())
                    sale.maximumBuy = Number(createSaleEvent.saleParams.maximumBuy.toString())
                    sale.startTimestamp = Number(createSaleEvent.saleParams.startTime.toString());
                    sale.endTimestamp = Number(createSaleEvent.saleParams.endTime.toString());
                    sale.cliffTime = Number(createSaleEvent.saleParams.cliffTime.toString());
                    sale.cliffAmountRate = Number(createSaleEvent.saleParams.cliffAmountRate.toString());
                    sale.vestingPeriod = Number(createSaleEvent.saleParams.vestingPeriod.toString());
                    sale.vestingIncrement = Number(createSaleEvent.saleParams.vestingIncrement.toString());

                    await queryRunner.manager.save(sale);

                    if (e.type == 'createPresale' || e.type == 'createFairsale') {
                        const token = (await queryRunner.manager.findOne(BasiceToken, {
                            address: createSaleEvent.basicTokenAddress.toBase58()
                        }))!;

                        token.totalAmountInCirculation += sale.totalSaleSupply;

                        await queryRunner.manager.save(token);
                    }
                } else if (e.type == 'createRedeemAccount') {
                    const redeemTokenEvent: CreateRedeemAccount = e.event.data;

                    const user = (await queryRunner.manager.find(User, {
                        address: redeemTokenEvent.redeemAccountAddress.toBase58()
                    }))![0];
                    user.txHash = e.event.transactionInfo.transactionHash;
                    user.status = 1;
                    user.nullifierRoot = redeemTokenEvent.nullifierRoot.toString();
                    await queryRunner.manager.save(user);

                } else if (e.type == 'createAirdrop') {
                    const createAirdropEvent: CreateAirdropEvent = e.event.data;

                    const airdrop = (await queryRunner.manager.find(Airdrop, {
                        tokenAddress: createAirdropEvent.basicTokenAddress.toBase58(),
                        airdropAddress: createAirdropEvent.airdropContractAddress.toBase58()
                    }))![0];

                    airdrop.feeRate = createAirdropEvent.fee.toString();
                    airdrop.status = 1;
                    airdrop.txHash = txHash;
                    // must update the params
                    airdrop.totalAirdropSupply = Number(createAirdropEvent.airdropParams.totalAirdropSupply.toString());
                    airdrop.whitelistTreeRoot = createAirdropEvent.airdropParams.whitelistTreeRoot.toString();
                    airdrop.startTimestamp = Number(createAirdropEvent.airdropParams.startTime.toString());
                    airdrop.cliffTime = Number(createAirdropEvent.airdropParams.cliffTime.toString());
                    airdrop.cliffAmountRate = Number(createAirdropEvent.airdropParams.cliffAmountRate.toString());
                    airdrop.vestingPeriod = Number(createAirdropEvent.airdropParams.vestingPeriod.toString());
                    airdrop.vestingIncrement = Number(createAirdropEvent.airdropParams.vestingIncrement.toString());

                    await queryRunner.manager.save(airdrop);
                }

            }

            if (eventList.length > 0) {
                factoryEventFetchRecord.blockHeight = Number(eventList[eventList.length - 1].blockHeight.toBigint());
            }
            await queryRunner.manager.save(factoryEventFetchRecord);

            await queryRunner.commitTransaction();
        } catch (err) {
            console.error(err);
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
