<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, watch, computed, type ComputedRef } from 'vue'
import type { SaleDto, UserContributionDto } from '@tokenizk/types'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { querySaleDetails, submitContribution } from '@/apis/sale-api';
import { ElMessage } from 'element-plus';
import { calcWhitelistMerkleWitness, getEmptyLeafWitness } from '@/utils/whitelist-tree-calc';
import { queryContributorWitnessByUser } from '@/apis/witness-api';
import { useRoute } from 'vue-router';
import { checkTx, syncLatestBlock } from '@/utils/txUtils';
import SaleStatistic from './sale-statistic.vue'
import Comment from '@/components/comment.vue'

const ContractConstants = import('@tokenizk/contracts');
const o1js = import('o1js');

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type SaleDtoExtend = SaleDto & { saleStartTimeStamp: number, saleEndTimeStamp: number, projectStatus: string, progressBarStatus: string, progressPercent: number }
type SaleContributorsDetailDtoExtend = {
    saleDto: SaleDtoExtend
    contributorList: UserContributionDto[]
}

const route = useRoute();
const { saleAddress: saleAddress0, tokenAddress: tokenAddress0 } = route.query;// from route param
const saleAddress = saleAddress0 as string;
const tokenAddress = tokenAddress0 as string;

// 转换项目的状态
const transformProjectStatus = (itmes: SaleDtoExtend[]) => {
    let currentTime = new Date().getTime();

    itmes.forEach(item => {
        if (item.startTimestamp > currentTime) {
            item.projectStatus = 'Upcoming'
        } else if (item.startTimestamp <= currentTime && currentTime < item.endTimestamp) {
            item.projectStatus = 'Ongoing'
        } else if (item.endTimestamp <= currentTime) {
            item.projectStatus = 'Ended'
        } else {
            item.projectStatus = 'All Status'
        }
    });
}

// 项目进度条
const calcProjectProgress = (itmes: SaleDtoExtend[]) => {
    itmes.forEach(item => {
        console.log('calc progress: ' + item.totalContributedMina);
        item.progressPercent = computed(() => Number((item.totalContributedMina * 100 / item.hardCap).toFixed(1))) as any as number;
        if ((item.progressPercent as any as ComputedRef).value >= 80) {
            item.progressBarStatus = 'exception'
        } else if ((item.progressPercent as any as ComputedRef).value >= 60) {
            item.progressBarStatus = 'warning'
        } else {
            item.progressBarStatus = 'success'
        }
    });
}

const curentUserContributionDto = reactive({ currentUser: {} as UserContributionDto });

const saleContributorsDetailDto = reactive({
    saleDto: {
    } as SaleDtoExtend,
    contributorList: []
} as SaleContributorsDetailDtoExtend);

const tokenInput = ref(0)
const contributionBtnDisabled = ref(false);
let flagBtn = ref(1)

const ifSaleEnded = ref(false);

const checkSaleStatusDynamically = () => {
    const currentTime = new Date().getTime();
    [saleContributorsDetailDto.saleDto].forEach((item: SaleDtoExtend) => {
        if (item.endTimestamp <= currentTime) { // endTimestamp 已结束

            ifSaleEnded.value = true;
            if (item.totalContributedMina >= item.softCap) {// claim tokens
                flagBtn.value = 2
                contributionBtnDisabled.value = false   //  启用按钮
                tokenInput.value = item.saleRate * Number(curentUserContributionDto.currentUser.contributeCurrencyAmount)
            } else {// redeem funds
                flagBtn.value = 3
                contributionBtnDisabled.value = false   //  启用按钮
                tokenInput.value = 0
            }

        } else { // endTimestamp 没结束
            // 禁用input、按钮
            contributionBtnDisabled.value = false;
            flagBtn.value = 1;
        }
    })
}

const countdownFinishCallback = () => {

    // 修改 status 为 Ended
    saleContributorsDetailDto.saleDto.projectStatus = 'Ended'

    checkSaleStatusDynamically();
}

watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (appState.connectedWallet58) {
        curentUserContributionDto.currentUser = saleContributorsDetailDto.contributorList.filter(
            a => a.contributorAddress === appState.connectedWallet58)[0] ?? ({} as UserContributionDto);
    } else {
        curentUserContributionDto.currentUser = {} as UserContributionDto;
    }
}, { immediate: true });

const currentUserHasContributed = ref(false);
watch(() => curentUserContributionDto.currentUser, async (value, oldValue) => {
    currentUserHasContributed.value = curentUserContributionDto.currentUser.saleAddress != null
        && curentUserContributionDto.currentUser.contributorAddress != undefined;
}, { immediate: true });


let saleStatistic = reactive({
    dataArr: [
        {
            value: 0,
            name: 'distributed tokens'
        },
        {
            value: 0,
            name: 'rest tokens'
        }
    ]
});

const init = async () => {
    // query sale and current user
    const saleContributorsDetailDto0 = (await querySaleDetails(saleAddress, tokenAddress)) as SaleContributorsDetailDtoExtend;

    if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
        appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
        appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
    }

    /*
    saleContributorsDetailDto0.saleDto.saleStartTimeStamp = Date.now() + (saleContributorsDetailDto0.saleDto.startTimestamp - Number(appState.latestBlockInfo.blockchainLength.toString())) * 3 * 60 * 1000;
    console.log('saleContributorsDetailDto0.saleDto.saleStartTimeStamp:' + saleContributorsDetailDto0.saleDto.saleStartTimeStamp);

    saleContributorsDetailDto0.saleDto.saleEndTimeStamp = Date.now() + (saleContributorsDetailDto0.saleDto.endTimestamp - Number(appState.latestBlockInfo.blockchainLength.toString())) * 3 * 60 * 1000;
    console.log('saleContributorsDetailDto0.saleDto.saleEndTimeStamp:' + saleContributorsDetailDto0.saleDto.saleEndTimeStamp);

    */
    saleContributorsDetailDto0.saleDto.totalContributedMina = saleContributorsDetailDto0.contributorList.reduce<number>((p, c) => p + Number(c.contributeCurrencyAmount), 0);

    transformProjectStatus([saleContributorsDetailDto0.saleDto]);
    calcProjectProgress([saleContributorsDetailDto0.saleDto]);

    saleContributorsDetailDto0.saleDto.feeRate = (Number(saleContributorsDetailDto0.saleDto.feeRate) / (10 ** 9)).toFixed(2);
    saleContributorsDetailDto0.saleDto.softCap = Number((saleContributorsDetailDto0.saleDto.softCap / (10 ** 9)).toFixed(2));
    saleContributorsDetailDto0.saleDto.hardCap = Number((saleContributorsDetailDto0.saleDto.hardCap / (10 ** 9)).toFixed(2));
    saleContributorsDetailDto0.saleDto.minimumBuy = Number((saleContributorsDetailDto0.saleDto.minimumBuy / (10 ** 9)).toFixed(2));
    saleContributorsDetailDto0.saleDto.maximumBuy = Number((saleContributorsDetailDto0.saleDto.maximumBuy / (10 ** 9)).toFixed(2));

    saleContributorsDetailDto.saleDto = saleContributorsDetailDto0.saleDto;
    saleContributorsDetailDto.contributorList = saleContributorsDetailDto0.contributorList ?? [];

    if (appState.connectedWallet58) {
        curentUserContributionDto.currentUser = saleContributorsDetailDto.contributorList.filter(
            a => a.contributorAddress === appState.connectedWallet58)[0] ?? ({} as UserContributionDto);
    }

    checkSaleStatusDynamically();

    if (saleContributorsDetailDto.saleDto.saleType == 0) {
        saleTag.value = 'Presale';
    } else if (saleContributorsDetailDto.saleDto.saleType == 1) {
        saleTag.value = 'Fairsale';
    } else if (saleContributorsDetailDto.saleDto.saleType == 2) {
        saleTag.value = 'Privatesale';
    }

    saleAddressLinkPrefix.value = saleAddressLinkPrefix.value + (saleContributorsDetailDto.saleDto.saleAddress)
    tokenAddressLinkPrefix.value = tokenAddressLinkPrefix.value + (saleContributorsDetailDto.saleDto.tokenAddress)


    const totalSaledTokenAmount = saleContributorsDetailDto.saleDto.totalContributedMina / (10 ** 9) * saleContributorsDetailDto.saleDto.saleRate
    const restUnsaledTokenAmount = saleContributorsDetailDto.saleDto.totalSaleSupply - totalSaledTokenAmount

    saleStatistic.dataArr[0].value = totalSaledTokenAmount;
    saleStatistic.dataArr[1].value = restUnsaledTokenAmount;

    console.log('refresh sale-detail info intervally: done!');
}

const buyWithMina = async () => {
    let saleDto = saleContributorsDetailDto.saleDto;
    if (saleDto.startTimestamp >= Date.now()) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `The Sale has not started yet.`,
        });

        return;
    }

    if (appState.connectedWallet58 === '' || appState.connectedWallet58 === null || appState.connectedWallet58 === undefined) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    if (tokenInput.value == 0) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Amount should be greater than 0`,
        });

        return;
    }

    if (tokenInput.value > saleDto.maximumBuy) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `maximum contribution MINA amount: ${saleDto.maximumBuy}`,
        });

        return;
    }

    if (tokenInput.value < saleDto.minimumBuy) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `minimumBuy contribution MINA amount: ${saleDto.minimumBuy}`,
        });

        return;
    }

    if (!curentUserContributionDto.currentUser.contributorAddress) {// if user did not ever contribute
        // query whitelist witness
        const maskId = 'contributeSale';

        /*
        // check if circuit has been compiled, if not , prompt: wai
        showLoadingMask({ id: maskId, text: 'compiling circuit...' });
        const flag = await compileCircuit(saleDto.saleType);
        if (!flag) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `circuit compile failed!`,
            });

            closeLoadingMask(maskId);
            return;
        }
        */

        // calc whitelist tree root
        let whitelistWitness: string[] = [];
        let leafIndex = 0;
        if (saleDto.whitelistMembers?.length > 0 || saleDto.whitelistTreeRoot != (await ContractConstants).WHITELIST_TREE_ROOT.toString()) {
            showLoadingMask({ id: maskId, text: 'constructing whitelist tree...' });

            const members: string[] = saleDto.whitelistMembers.trim().split(',');
            whitelistWitness = await calcWhitelistMerkleWitness(members, appState.connectedWallet58);
            leafIndex = members.indexOf(appState.connectedWallet58);
        } else {
            whitelistWitness = await getEmptyLeafWitness();
            leafIndex = 0;
        }

        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });
        const saleParams = constructSaleParams(saleDto);
        const feePayerAddress = appState.connectedWallet58;
        const txFee = 0.21 * (10 ** 9)

        let txJson = await CircuitControllerState.remoteController?.contributeSale(saleDto.tokenAddress, saleAddress, saleParams,
            appState.connectedWallet58, tokenInput.value * (10 ** 9), whitelistWitness, leafIndex.toString(),
            feePayerAddress, txFee);

        if (txJson) {
            try {
                // send back to backend for recording
                showLoadingMask({ id: maskId, text: 'submit to backend...' });
                const userContributionDto = {
                    contributorAddress: appState.connectedWallet58,
                    saleId: saleDto.id,
                    saleAddress: saleDto.saleAddress,
                    tokenAddress: saleDto.tokenAddress,
                    contributeCurrencyAmount: tokenInput.value * (10 ** 9),
                } as any as UserContributionDto;
                const rs = await submitContribution(userContributionDto);
                if (!rs) {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: 'submit to backend failed...',
                    });
                } else {
                    try {
                        showLoadingMask({ id: maskId, text: 'sending transaction...' });

                        let txHash = (await window.mina.sendTransaction({
                            transaction: txJson,
                            feePayer: {
                                fee: 0.301,
                                memo: `${saleTag.value}.contributeSale`
                            },
                        })).hash;

                        /*
                        let tx = Mina.Transaction.fromJSON(JSON.parse(txJson!));
                        let targetAUList = tx.transaction.accountUpdates.filter(e => (e.body.publicKey.toBase58() == appState.connectedWallet58)
                            && e.body.authorizationKind.isSigned.toBoolean());
                        targetAUList.forEach(e => e.lazyAuthorization = { kind: 'lazy-signature' });
                        const feePayerKey = PrivateKey.fromBase58('EKFRjBg41WLqfjCAcmiiaQhrwCJ6BUMJ6n6iUvzEzdaEzM1ZBvtC');
                        tx = tx.sign([feePayerKey]);
                        console.log(tx.toJSON());
                        let txHash = (await tx.send()).hash();
                        */

                        try {
                            showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

                            // check tx is confirmed
                            await checkTx(txHash);

                            showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

                        } catch (error) {
                            console.error(error);
                            showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
                            ElMessage({
                                showClose: true,
                                type: 'warning',
                                message: `tx failed! please retry later.`,
                            });
                            closeLoadingMask(maskId);

                            return;
                        }
                        console.log('tx send success, txHash: ', txHash!.concat(''));

                        userContributionDto.contributeTxHash = txHash!// txHash;
                        await submitContribution(userContributionDto);// sync txHash to backend

                        const x = saleContributorsDetailDto.contributorList.filter(a => a.contributorAddress == userContributionDto.contributorAddress);
                        if (x.length > 0) {
                            x[0].contributeTxHash = userContributionDto.contributeTxHash;
                        } else {
                            saleContributorsDetailDto.contributorList.push(userContributionDto);
                        }
                        curentUserContributionDto.currentUser = userContributionDto;
                    } catch (error) {
                        console.log('tx send failed, error: ', error);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: 'witness calc failed...',
            });
        }
        closeLoadingMask(maskId);
    } else {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: 'you have contributed!',
        });
    }
}

const compileCircuit = async (saleType: number) => {
    let flag = false;
    if (saleType == 0) {
        flag = await CircuitControllerState.remoteController!.compileTokeniZkPresale();
        appState.tokenizkPresaleCompiled = true;
    } else if (saleType == 1) {
        flag = await CircuitControllerState.remoteController!.compileTokeniZkFairsale();
        appState.tokenizkFairsaleCompiled = true;
    } else if (saleType == 2) {
        flag = await CircuitControllerState.remoteController!.compileTokeniZkPrivatesale();
        appState.tokenizkPrivatesaleCompiled = true;
    }
    return flag;
}

const constructSaleParams = (saleDto: SaleDto) => {
    const saleParams = {
        tokenAddress: saleDto.tokenAddress,
        totalSaleSupply: saleDto.totalSaleSupply,
        saleRate: saleDto.saleRate,
        whitelistTreeRoot: saleDto.whitelistTreeRoot,
        softCap: saleDto.softCap * (10 ** 9),
        hardCap: saleDto.hardCap * (10 ** 9),
        minimumBuy: saleDto.minimumBuy * (10 ** 9),
        maximumBuy: saleDto.maximumBuy * (10 ** 9),
        startTime: saleDto.startTimestamp,
        endTime: saleDto.endTimestamp,
        cliffTime: saleDto.cliffTime,
        cliffAmountRate: saleDto.cliffAmountRate,
        vestingPeriod: saleDto.vestingPeriod, // 0 is not allowed, default value is 1
        vestingIncrement: saleDto.vestingIncrement
    };
    return saleParams;
}

const saleTag = ref('');

const claimTokens = async () => {
    if (!appState.connectedWallet58) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    const saleDto = saleContributorsDetailDto.saleDto;
    const txFee = 0.21 * (10 ** 9)

    if (curentUserContributionDto.currentUser.contributorAddress) {

        // query whitelist witness
        const maskId = 'claimTokens';

        // deploy Redeem account
        let redeemAccount = await (await o1js).fetchAccount({ publicKey: appState.connectedWallet58 });
        if (!redeemAccount.account!.zkapp) {
            showLoadingMask({ id: maskId, text: 'compiling RedeemAccount circuit...' });
            const flag = await CircuitControllerState.remoteController!.compileRedeemAccount();
            if (!flag) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `compile RedeemAccount circuit failed!`,
                });
                closeLoadingMask(maskId);
                return;
            }
            showLoadingMask({ id: maskId, text: 'deploying RedeemAccount(witness calc)...' });
            const txJson = await CircuitControllerState.remoteController?.deployRedeemAccount(appState.connectedWallet58, txFee);
            if (!txJson) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `create RedeemAccount failed!`,
                });
                closeLoadingMask(maskId);
                return;
            }

            showLoadingMask({ id: maskId, text: 'deploying RedeemAccount(send tx)...' });
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson
            });
            console.log('tx send success, txHash: ', txHash);

            try {
                showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

                // check tx is confirmed
                await checkTx(txHash);

                showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

            } catch (error) {
                console.error(error);
                showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `tx failed! please retry later.`,
                });
                closeLoadingMask(maskId);

                return;
            }
        }

        // check if circuit has been compiled, if not , prompt: wai
        showLoadingMask({ id: maskId, text: 'compiling circuit...' });

        /*
        const flag = await compileCircuit(saleDto.saleType);
        if (!flag) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `circuit ${saleTag.value} compile failed!`,
            });

            closeLoadingMask(maskId);
            return;
        }
        */
        // get contributor witness
        const userRedeemClaimWitnessDto = await queryContributorWitnessByUser(saleDto.tokenAddress, saleDto.saleAddress,
            curentUserContributionDto.currentUser.contributorAddress);

        if (!userRedeemClaimWitnessDto) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `query contributor witness failed...`,
            });
            closeLoadingMask(maskId);

            return;
        }

        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });

        const saleParams = constructSaleParams(saleDto);

        const feePayerAddress = appState.connectedWallet58;
        const txJson = await CircuitControllerState.remoteController?.claimTokensSale(saleParams,
            userRedeemClaimWitnessDto.saleContributorMembershipWitnessData as any,
            userRedeemClaimWitnessDto.lowLeafWitness,
            userRedeemClaimWitnessDto.oldNullWitness,
            feePayerAddress, txFee);
        showLoadingMask({ id: maskId, text: 'sending transaction...' });

        try {
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson,
                feePayer: {
                    fee: 0.301,
                    memo: `${saleTag.value}.claimToken`
                },
            });
            console.log('tx send success, txHash: ', txHash);

            try {
                showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

                // check tx is confirmed
                await checkTx(txHash);

                showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

            } catch (error) {
                console.error(error);
                showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `tx failed! please retry later.`,
                });
                closeLoadingMask(maskId);

                return;
            }

            curentUserContributionDto.currentUser.claimTxHash = txHash;

            // send back to backend for recording
            showLoadingMask({ id: maskId, text: 'submit to backend...' });
            const userContributionDto = {
                saleId: saleDto.id,
                saleAddress: saleDto.saleAddress,
                tokenAddress: saleDto.tokenAddress,
                contributorAddress: curentUserContributionDto.currentUser.contributorAddress,
                claimTxHash: curentUserContributionDto.currentUser.claimTxHash,
                claimAmount: Number(curentUserContributionDto.currentUser.contributeCurrencyAmount) * saleDto.saleRate,
            } as any as UserContributionDto;
            const rs = await submitContribution(userContributionDto);
            if (!rs) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: 'submit to backend failed...',
                });
            }

        } catch (error) {
            console.error(error);
        }

        closeLoadingMask(maskId);
    }
}

const redeemFunds = async () => {
    if (!appState.connectedWallet58) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    const saleDto = saleContributorsDetailDto.saleDto;
    const txFee = 0.21 * (10 ** 9)

    if (curentUserContributionDto.currentUser.contributorAddress) {

        // query whitelist witness
        const maskId = 'redeemFunds';

        // deploy Redeem account
        let redeemAccount = await (await o1js).fetchAccount({ publicKey: appState.connectedWallet58 });
        if (!redeemAccount.account!.zkapp) {
            showLoadingMask({ id: maskId, text: 'compiling RedeemAccount circuit...' });
            const flag = await CircuitControllerState.remoteController!.compileRedeemAccount();
            if (!flag) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `compile RedeemAccount circuit failed!`,
                });
                closeLoadingMask(maskId);
                return;
            }
            showLoadingMask({ id: maskId, text: 'deploying RedeemAccount(witness calc)...' });
            const txJson = await CircuitControllerState.remoteController?.deployRedeemAccount(appState.connectedWallet58, txFee);
            if (!txJson) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `create RedeemAccount failed!`,
                });
                closeLoadingMask(maskId);
                return;
            }

            showLoadingMask({ id: maskId, text: 'deploying RedeemAccount(send tx)...' });
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson
            });
            console.log('tx send success, txHash: ', txHash);

            try {
                showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

                // check tx is confirmed
                await checkTx(txHash);

                showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

            } catch (error) {
                console.error(error);
                showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `tx failed! please retry later.`,
                });
                closeLoadingMask(maskId);

                return;
            }
        }
        /*
        // check if circuit has been compiled, 
        showLoadingMask({ id: maskId, text: 'compiling circuit...' });

        let flag = await compileCircuit(saleDto.saleType);
        flag = await CircuitControllerState.remoteController!.compilePresaleMinaFundHolder();
        appState.tokenizkPresaleCompiled = true;

        if (!flag) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `circuit ${saleTag.value} compile failed!`,
            });

            closeLoadingMask(maskId);
            return;
        }
        */
        // get contributor witness
        const userRedeemClaimWitnessDto = (await queryContributorWitnessByUser(saleDto.tokenAddress, saleDto.saleAddress, curentUserContributionDto.currentUser.contributorAddress));
        if (!userRedeemClaimWitnessDto) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `user ${curentUserContributionDto.currentUser.contributorAddress} not found in sale!`,
            });
            closeLoadingMask(maskId);

            return;
        }
        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });

        const saleParams = constructSaleParams(saleDto);

        const feePayerAddress = appState.connectedWallet58;
        const txJson = await CircuitControllerState.remoteController?.redeemFunds(saleParams,
            userRedeemClaimWitnessDto.saleContributorMembershipWitnessData! as any,
            userRedeemClaimWitnessDto.lowLeafWitness,
            userRedeemClaimWitnessDto.oldNullWitness,
            feePayerAddress, txFee);
        showLoadingMask({ id: maskId, text: 'sending transaction...' });

        try {
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson,
                feePayer: {
                    fee: 0.301,
                    memo: `${saleTag.value}.claimToken`
                },
            });
            console.log('tx send success, txHash: ', txHash);

            showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });
            // check tx is confirmed
            await checkTx(txHash);
            showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

            curentUserContributionDto.currentUser.redeemTxHash = txHash;
        } catch (error) {
            console.error(error);
            showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `tx failed! please retry later.`,
            });
            closeLoadingMask(maskId);

            return;
        }
        // send back to backend for recording
        showLoadingMask({ id: maskId, text: 'submit to backend...' });
        const userContributionDto = {
            saleId: saleDto.id,
            saleAddress: saleDto.saleAddress,
            tokenAddress: saleDto.tokenAddress,
            contributorAddress: curentUserContributionDto.currentUser.contributorAddress,
            redeemTxHash: curentUserContributionDto.currentUser.redeemTxHash
        } as any as UserContributionDto;
        const rs = await submitContribution(userContributionDto);
        if (!rs) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: 'submit to backend failed...',
            });
        }

        closeLoadingMask(maskId);
    }
}

const dialogTableVisible = ref(false)
let whiteListArr = reactive({ whitelist: [] as string[] });

const saleAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);
const tokenAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);
const zkTxLinkPrefix = ref(import.meta.env.VITE_EXPLORER_TX_URL);

let refreshTimer = undefined as any;


// Pagination
const paginationValue = ref(false);
const pageSize = ref(8); // 每页显示8条信息  
const currentPage = ref(1); // 当前页码  

// 计算总条目数  
const totalItems = computed(() => whiteListArr.whitelist.length);

// 计算当前页显示的条目  
const currentPageItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return whiteListArr.whitelist.slice(start, end);
});

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1; // 当条数变化时，重置到第一页  
}
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
}

// 组件挂载完成后执行的函数  
onMounted(async () => {
    await init();

    refreshTimer = setInterval(init, 60 * 1000);

    whiteListArr.whitelist = saleContributorsDetailDto.saleDto.whitelistMembers.split(',');

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
})

onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});


</script>

<style scoped></style>

<template>
    <div v-if="saleContributorsDetailDto.saleDto.id == undefined && saleContributorsDetailDto.saleDto.id == null">
        the sale does not exist!
    </div>

    <div v-else>
        <el-row class="row-bg presale-details" justify="center">

            <!-- 项目描述 -->
            <el-col :span="12" class="project-description">

                <el-row class="row-bg presale-description-box">
                    <el-col :span="4">
                        <el-image :src="saleContributorsDetailDto.saleDto.logoUrl" fit="contain" lazy />
                    </el-col>

                    <el-col :span="1"></el-col>

                    <el-col :span="19">
                        <el-row>
                            <h1>{{ saleContributorsDetailDto.saleDto.saleName }}</h1>
                        </el-row>

                        <el-row>
                            <a :href="saleContributorsDetailDto.saleDto.website"
                                v-show="saleContributorsDetailDto.saleDto.website" target="_blank">
                                <i class="iconfont icon-xitong"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.twitter"
                                v-show="saleContributorsDetailDto.saleDto.twitter" target="_blank">
                                <i class="iconfont icon-bird"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.discord"
                                v-show="saleContributorsDetailDto.saleDto.discord" target="_blank">
                                <i class="iconfont icon-discord"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.github"
                                v-show="saleContributorsDetailDto.saleDto.github" target="_blank">
                                <i class="iconfont icon-GitHub"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.telegram"
                                v-show="saleContributorsDetailDto.saleDto.telegram" target="_blank">
                                <i class="iconfont icon-telegram"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.facebook"
                                v-show="saleContributorsDetailDto.saleDto.facebook" target="_blank">
                                <i class="iconfont icon-facebook"></i>
                            </a>

                            <a :href="saleContributorsDetailDto.saleDto.reddit"
                                v-show="saleContributorsDetailDto.saleDto.reddit" target="_blank">
                                <i class="iconfont icon-redditsquare"></i>
                            </a>

                        </el-row>

                        <el-row>
                            {{ saleContributorsDetailDto.saleDto.description }}
                        </el-row>
                    </el-col>
                </el-row>

                <!-- 项目表格1 -->
                <el-row class="row-bg formTable">
                    <el-col :span="24">

                        <!-- <el-row>
                                <el-col :span="8" class="titleName">Token name : </el-col>
                                <el-col :span="12">{{ saleContributorsDetailDto.saleDto.tokenSymbol }}</el-col>
                            </el-row> -->

                        <el-row justify="space-between" class="tableLine"
                            v-if="saleContributorsDetailDto.saleDto.saleType != 2">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Token name :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.tokenSymbol }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine"
                            v-if="saleContributorsDetailDto.saleDto.saleType != 2">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Token address :
                                </el-row>
                            </el-col>

                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">
                                    <a :href="tokenAddressLinkPrefix" class="titleContent" target="_blank">
                                        {{ saleContributorsDetailDto.saleDto.tokenAddress }}
                                    </a>

                                    <a :href="tokenAddressLinkPrefix" class="titleContent" target="_blank">
                                        <el-icon style="margin-left: 10px;">
                                            <CopyDocument />
                                        </el-icon>
                                    </a>

                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Sale contract address :
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">

                                    <a :href="saleAddressLinkPrefix" class="titleContent" target="_blank">
                                        {{ saleContributorsDetailDto.saleDto.saleAddress }}
                                    </a>

                                    <a :href="saleAddressLinkPrefix" class="titleContent" target="_blank">
                                        <el-icon style="margin-left: 10px;">
                                            <CopyDocument />
                                        </el-icon>
                                    </a>

                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine"
                            v-if="saleContributorsDetailDto.saleDto.saleType != 2">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Sale Supply :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.totalSaleSupply }} {{
        saleContributorsDetailDto.saleDto.tokenSymbol }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Sale currency :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.currency }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Sale creation fee :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.feeRate }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine"
                            v-if="saleContributorsDetailDto.saleDto.saleType == 0">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Sale Rate :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.saleRate }}x
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">

                            <el-col :span="8" class="titleName">
                                Sale whitelist :
                            </el-col>

                            <el-col :span="16" style="overflow-wrap: break-word;">

                                <el-row justify="end" class="titleContent">
                                    <div v-if="saleContributorsDetailDto.saleDto.whitelistMembers">
                                        <el-button text @click="dialogTableVisible = true" type="success"
                                            class="whiteListBtn">
                                            whileList table
                                        </el-button>

                                        <el-dialog v-model="dialogTableVisible" title="whileList table"
                                            style="width:600px;height: 570px;">
                                            <ul>
                                                <el-scrollbar max-height="700px">

                                                    <li v-for="item in currentPageItems" :key="item.index"
                                                        class="whiteListUl scrollbar-demo-item">{{ item }}</li>

                                                    <el-pagination class="pagination-block" background
                                                        :page-size="pageSize" :current-page="currentPage"
                                                        :pager-count="6" layout="total,prev, pager, next,jumper"
                                                        :hide-on-single-page="paginationValue" :total="totalItems"
                                                        @size-change="handleSizeChange"
                                                        @current-change="handleCurrentChange" />

                                                </el-scrollbar>
                                            </ul>
                                        </el-dialog>
                                    </div>
                                    <div v-else>
                                        NO WHITELIST
                                    </div>

                                </el-row>


                            </el-col>

                        </el-row>

                        <el-row justify="space-between" class="tableLine"
                            v-show="saleContributorsDetailDto.saleDto.softCap">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Softcap :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.softCap }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine"
                            v-show="saleContributorsDetailDto.saleDto.hardCap">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    HardCap :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.hardCap }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Sale Start At:
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">
                                    {{ new Date(saleContributorsDetailDto.saleDto.startTimestamp) }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Sale End At:
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">
                                    {{ new Date(saleContributorsDetailDto.saleDto.endTimestamp) }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Liquidity cliffTime :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.cliffTime }} slots (about {{
        saleContributorsDetailDto.saleDto.cliffTime * 3 }} minutes)
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Liquidity cliffAmountRate :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.cliffAmountRate }}%
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Liquidity vestingPeriod :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.vestingPeriod }} slots (about {{
        saleContributorsDetailDto.saleDto.vestingPeriod * 3 }} minutes)
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Liquidity vestingIncrement :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.vestingIncrement }}%
                                </el-row>
                            </el-col>
                        </el-row>


                        <!-- echarts -->
                        <el-row class="row-bg echarts-row" v-if="saleContributorsDetailDto.saleDto.saleType == 0">
                            <SaleStatistic :dataArr="saleStatistic.dataArr" />
                        </el-row>

                        <el-row class="row-bg comment-row" justify="start">
                            <el-col span="24">
                                <Comment />
                            </el-col>
                        </el-row>

                        <!-- <el-row justify="space-between" class="tableLine">
                                <el-col :span="4" class="titleName">
                                    logoUrl :
                                </el-col>
                                <el-col :span="20">
                                    <el-row justify="end" style="overflow-wrap: break-word;">
                                        {{ saleContributorsDetailDto.saleDto.logoUrl }}
                                    </el-row>
                                </el-col>
                            </el-row> 

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        Website :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.website }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        facebook :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.facebook }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        github :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.website }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        twitter :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.twitter }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        telegram :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.telegram }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        discord :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.discord }}
                                    </el-row>
                                </el-col>
                            </el-row>

                            <el-row justify="space-between" class="tableLine">
                                <el-col :span="8">
                                    <el-row class="titleName">
                                        reddit :
                                    </el-row>
                                </el-col>
                                <el-col :span="16">
                                    <el-row justify="end" class="titleContent">
                                        {{ saleContributorsDetailDto.saleDto.reddit }}
                                    </el-row>
                                </el-col>
                            </el-row>
                        -->



                    </el-col>
                </el-row>

            </el-col>

            <!-- 项目状态 -->
            <el-col :span="6" class="project-status">

                <div class="project-status-box">
                    <el-row class="alert-message">
                        Make sure the website is tokenizk.finance !
                    </el-row>

                    <el-row class="countdown">
                        <el-col v-if="saleContributorsDetailDto.saleDto.startTimestamp > ((new Date()).getTime())">
                            <el-countdown format="DD [days] HH:mm:ss"
                                :value="saleContributorsDetailDto.saleDto.startTimestamp"
                                @finish="countdownFinishCallback">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">Start of Sale</div>
                                </template>
                            </el-countdown>
                        </el-col>
                        <el-col v-else>
                            <el-countdown format="DD [days] HH:mm:ss"
                                :value="saleContributorsDetailDto.saleDto.endTimestamp"
                                @finish="countdownFinishCallback">

                                <template #title>
                                    <div style="display: inline-flex; align-items: center">End of Sale</div>
                                </template>
                            </el-countdown>
                        </el-col>
                    </el-row>

                    <!-- 注意  进度条 -->
                    <el-row v-if="saleContributorsDetailDto.saleDto.saleType != 1">
                        <el-col>
                            <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                                <el-progress :text-inside="true" :stroke-width="14"
                                    :percentage="saleContributorsDetailDto.saleDto.progressPercent" />
                            </el-row>

                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="10"> 0 Mina</el-col>
                                <!-- <el-col :span="8"></el-col> -->
                                <el-col :span="6">{{ saleContributorsDetailDto.saleDto.hardCap }} Mina</el-col>
                            </el-row>
                        </el-col>
                    </el-row>

                    <div v-if="!currentUserHasContributed && !ifSaleEnded">
                        <el-row>Amount</el-row>
                        <el-row>
                            <el-input v-model="tokenInput" type="number" placeholder="Please input" size="large"
                                clearable />
                        </el-row>
                        <el-row>
                            <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 1"
                                @click="buyWithMina">buy
                                with Mina</el-button>
                        </el-row>
                    </div>
                    <div v-else>
                        <el-row v-if="currentUserHasContributed">
                            You has contributed {{
        Number(curentUserContributionDto.currentUser.contributeCurrencyAmount) /
        (10 ** 9) }} Mina!
                        </el-row>
                        <el-row>
                            <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn == 2"
                                @click="claimTokens">claim
                                your Tokens</el-button>
                            <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn == 3"
                                @click="redeemFunds">redeem
                                your
                                Funds</el-button>
                        </el-row>
                    </div>
                </div>

                <!-- 项目表格2 -->
                <el-row class="row-bg formTable">
                    <el-col :span="24">

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Status :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.projectStatus }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Sale Type :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    Public
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="10">
                                <el-row class="titleName">
                                    Minimum Buy :
                                </el-row>
                            </el-col>
                            <el-col :span="14">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.minimumBuy }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="10">
                                <el-row class="titleName">
                                    Maximum Buy :
                                </el-row>
                            </el-col>
                            <el-col :span="14">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.saleDto.maximumBuy }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="14">
                                <el-row class="titleName">
                                    Total Contributors :
                                </el-row>
                            </el-col>
                            <el-col :span="10">
                                <el-row justify="end" class="titleContent">
                                    {{ saleContributorsDetailDto.contributorList.length }}
                                </el-row>
                            </el-col>
                        </el-row>


                    </el-col>
                </el-row>

            </el-col>

        </el-row>

    </div>
</template>

<style lang="less" scoped>
.presale-details {
    width: 100%;
    padding-top: 120px;
    padding-bottom: 120px;
    background: #f7f7f7;

    .project-description {
        width: 100%;
        background-color: #fff;
        padding: 30px 15px;

        .presale-description-box {
            border-radius: 20px;


            .icon-discord,
            .icon-bird,
            .icon-xitong,
            .icon-telegram,
            .icon-redditsquare,
            .icon-facebook,
            .icon-GitHub {
                margin-right: 20px;
                font-size: 20px;
                color: #00c798;
            }

            .icon-discord:hover,
            .icon-xitong:hover,
            .icon-bird:hover,
            .icon-telegram:hover,
            .icon-redditsquare:hover,
            .icon-facebook:hover,
            .icon-GitHub:hover {
                margin-right: 20px;
                font-size: 20px;
                color: #000;
            }
        }

        .echarts-row {
            background: #f7f7f7;
        }

    }

    .project-status {
        width: 100%;
        margin-left: 30px;

        .project-status-box {
            padding: 30px;
            background-color: #fff;
            border-radius: 20px;

            .countdown {
                text-align: center;
            }

            .detail-span {
                color: red;
                margin-left: 10px;
            }
        }

    }

    .formTable {
        margin-top: 20px;
        padding: 30px 20px;
        background-color: #fff;
        border-radius: 20px;

        .titleName {
            // font-weight: 700;
            font-size: 13px;
        }

        .titleContent {
            color: #00c798;
        }

        .titleContent:hover {
            color: #000;
        }

        .whiteListBtn {
            color: #00c798;
            background-color: #e6fff9;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 10px;
        }

        .whiteListBtn:hover {
            color: #fff;
            background-color: #00FFC2;
        }

        .whiteListUl {
            border: 1px solid #e6e6e6;
            padding: 10px 0 10px 10px;
        }

        .whiteListUl:nth-child(odd) {
            background-color: #f2f2f2;
        }

        .scrollbar-demo-item {
            display: flex;
            align-items: center;
            margin: 10px;
            text-align: center;
            border-radius: 4px;
        }

        .tableLine {
            border-bottom: 1px solid #e6e6e6;

            .pagination-block {
                margin-top: 30px;
            }
        }



    }

    .alert-message {
        padding: 5px 14px;
        border: 2px dashed #00FFC2;
        text-align: center;
    }


    .demo-progress .el-progress--line {
        margin-bottom: 15px;
        width: 350px;
    }


    .el-row {
        margin-bottom: 20px;
    }

    .el-row:last-child {
        margin-bottom: 0;
    }

    .el-col {
        border-radius: 4px;
    }

}
</style>
