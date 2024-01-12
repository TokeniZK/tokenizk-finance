<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, watch, computed, type ComputedRef } from 'vue'
import type { AirdropClaimerDto, AirdropDto } from '@tokenizk/types'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { queryAirdropDetails, submitAirdropClaim } from '@/apis/airdrop-api';
import { ElMessage } from 'element-plus';
import { calcWhitelistMerkleWitness, getEmptyLeafWitness } from '@/utils/whitelist-tree-calc';
import { queryAirdropClaimerWitnessByUser, queryContributorWitnessByUser } from '@/apis/witness-api';
import { useRoute } from 'vue-router';
import { fetchAccount, fetchLastBlock } from 'o1js';
import { checkTx, syncLatestBlock } from '@/utils/txUtils';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type AirdropDtoExtend = AirdropDto & { airdropStartTimeStamp: number, totalClaimedMemberNumber: number, projectStatus: string, progressBarStatus: string, progressPercent: number }
type AirdropClaimersDetailDtoExtend = {
    airdropDto: AirdropDtoExtend
    claimerList: AirdropClaimerDto[]
}

const route = useRoute();
const { airdropAddress: airdropAddress0, tokenAddress: tokenAddress0 } = route.query;// from route param
const airdropAddress = airdropAddress0 as string;
const tokenAddress = tokenAddress0 as string;

// 转换项目的状态
const transformProjectStatus = (itmes: AirdropDtoExtend[]) => {
    let currentTime = new Date().getTime();

    itmes.forEach(item => {
        if (item.airdropStartTimeStamp > currentTime) {
            item.projectStatus = 'Upcoming'
        } else {
            item.projectStatus = 'Ongoing'
        }
    });
}

// 项目进度条
const calcProjectProgress = (itmes: AirdropDtoExtend[]) => {
    itmes.forEach(item => {
        item.progressPercent = computed(() => Number((item.totalClaimedMemberNumber / item.whitelistMembers.split(',').length).toFixed(1))) as any as number;
        if ((item.progressPercent as any as ComputedRef).value >= 80) {
            item.progressBarStatus = 'exception'
        } else if ((item.progressPercent as any as ComputedRef).value >= 60) {
            item.progressBarStatus = 'warning'
        } else {
            item.progressBarStatus = 'success'
        }
    });
}

const currentAirdropClaimerDto = reactive({ currentUser: {} as AirdropClaimerDto });

const airdropClaimersDetailDto = reactive({
    airdropDto: {
    } as AirdropDtoExtend,
    claimerList: []
} as AirdropClaimersDetailDtoExtend);

const tokenInput = ref(0)
const contributionBtnDisabled = ref(false);
const ifAirdropStarted = ref(false);
const checkAirdropStatusDynamically = () => {
    const currentTime = new Date().getTime();
    [airdropClaimersDetailDto.airdropDto].forEach((item: AirdropDto) => {
        if (item.startTimestamp <= currentTime) { // startTimestamp 已结束

            ifAirdropStarted.value = true;
            contributionBtnDisabled.value = false   //  启用按钮
            tokenInput.value = item.totalAirdropSupply / item.whitelistMembers.split(',').length;

        } else { // startTimestamp 没结束
            // 禁用input、按钮
            contributionBtnDisabled.value = false;
        }
    })
}

const countdownFinishCallback = () => {

    // 修改 status 为 Ended
    airdropClaimersDetailDto.airdropDto.projectStatus = 'Ongoing'

    checkAirdropStatusDynamically();
}

watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (appState.connectedWallet58) {
        currentAirdropClaimerDto.currentUser = airdropClaimersDetailDto.claimerList.filter(
            a => a.userAddress == appState.connectedWallet58)[0] ?? ({} as AirdropClaimerDto);
    } else {
        currentAirdropClaimerDto.currentUser = {} as AirdropClaimerDto;
    }
}, { immediate: true });

const currentUserHasClaimed = ref(false);
watch(() => currentAirdropClaimerDto.currentUser, async (value, oldValue) => {
    currentUserHasClaimed.value = (currentAirdropClaimerDto.currentUser.airdropAddress != null && currentAirdropClaimerDto.currentUser.airdropAddress != undefined);
}, { immediate: true, deep: true });


const init = async () => {
    // query airdrop and current user
    const airdropClaimersDetailDto0 = (await queryAirdropDetails(airdropAddress, tokenAddress)) as any as AirdropClaimersDetailDtoExtend;

    if (!airdropClaimersDetailDto0) {
        ElMessage.warning('cannot find the airdrop!');
        return;
    }

    if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
        appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
        appState.fetchLatestBlockInfoTimestamp = new Date().getTime();

        airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp = Date.now() + (airdropClaimersDetailDto0.airdropDto.startTimestamp - Number(appState.latestBlockInfo.blockchainLength.toString())) * 3 * 60 * 1000;
        console.log('airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp:' + airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp);
    }

    airdropClaimersDetailDto0.airdropDto.totalClaimedMemberNumber = (airdropClaimersDetailDto0.claimerList ?? []).length;

    transformProjectStatus([airdropClaimersDetailDto0.airdropDto]);
    calcProjectProgress([airdropClaimersDetailDto0.airdropDto]);

    airdropClaimersDetailDto.airdropDto = airdropClaimersDetailDto0.airdropDto;
    airdropClaimersDetailDto.claimerList = airdropClaimersDetailDto0.claimerList ?? [];

    if (appState.connectedWallet58) {
        currentAirdropClaimerDto.currentUser = airdropClaimersDetailDto.claimerList.filter(
            a => a.userAddress === appState.connectedWallet58)[0] ?? ({} as AirdropClaimerDto);
    }

    checkAirdropStatusDynamically();

    airdropAddressLinkPrefix.value = airdropAddressLinkPrefix.value + (airdropClaimersDetailDto.airdropDto.airdropAddress)
    tokenAddressLinkPrefix.value = tokenAddressLinkPrefix.value + (airdropClaimersDetailDto.airdropDto.tokenAddress)

    console.log('refresh airdrop-detail info intervally: done!');
}

const constructAirdropParams = (airdropDto: AirdropDto) => {
    const airdropParams = {
        tokenAddress: airdropDto.tokenAddress,
        totalAirdropSupply: airdropDto.totalAirdropSupply,
        totalMembersNumber: airdropDto.whitelistMembers.split(',').length,
        whitelistTreeRoot: airdropDto.whitelistTreeRoot,
        startTime: airdropDto.startTimestamp,
        endTime: airdropDto.endTimestamp,
        cliffTime: airdropDto.cliffTime,
        cliffAmountRate: airdropDto.cliffAmountRate,
        vestingPeriod: airdropDto.vestingPeriod, // 0 is not allowed, default value is 1
        vestingIncrement: airdropDto.vestingIncrement
    };
    return airdropParams;
}

const airdropTag = ref('Airdrop');

const claimTokens = async () => {
    if (!appState.connectedWallet58) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    const airdropDto = airdropClaimersDetailDto.airdropDto;

    if (airdropDto.whitelistMembers.includes(appState.connectedWallet58)) {
        // query whitelist witness
        const maskId = 'claimTokens';

        const txFee = 0.21 * (10 ** 9)

        // deploy Redeem account
        let redeemAccount = await fetchAccount({ publicKey: appState.connectedWallet58 });
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
            /*
            await new Promise<void>((resolve, reject) => {
                setTimeout(async () => {
                    redeemAccount = await fetchAccount({ publicKey: appState.connectedWallet58! });
                    if (!redeemAccount.account!.zkapp) {
                        resolve();
                    }
                }, 1.5 *60*1000);
            })
            */
            try {
                showLoadingMask({ id: maskId, text: `waiting for tx confirmation: ${addressLinkPrefix.value.concat(txHash)}` });

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

        showLoadingMask({ id: maskId, text: 'compiling TokeniZkAirdrop...' });
        const flag = true// await CircuitControllerState.remoteController!.compileTokeniZkAirdrop();
        if (!flag) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `circuit ${airdropTag.value} compile failed!`,
            });

            closeLoadingMask(maskId);
            return;
        }

        // get Claim witness
        const userRedeemClaimWitnessDto = (await queryAirdropClaimerWitnessByUser(airdropDto.tokenAddress, airdropDto.airdropAddress,
            appState.connectedWallet58))!;

        // construct whitelist tree and get witness
        const membershipMerkleWitness = await calcWhitelistMerkleWitness(airdropDto.whitelistMembers.split(','), appState.connectedWallet58);
        const leafIndex = airdropDto.whitelistMembers.split(',').findIndex(a => a == appState.connectedWallet58);

        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });
        const airdropParams = constructAirdropParams(airdropDto);

        const feePayerAddress = appState.connectedWallet58;
        const txJson = await CircuitControllerState.remoteController?.claimTokensAirdrop(
            airdropAddress,
            airdropParams,
            membershipMerkleWitness,
            leafIndex.toString(),
            userRedeemClaimWitnessDto.lowLeafWitness,
            userRedeemClaimWitnessDto.oldNullWitness,
            feePayerAddress, txFee);

        if (txJson) {
            try {
                const airdropClaimerDto0 = {
                    airdropId: airdropDto.id,
                    airdropAddress: airdropDto.airdropAddress,
                    tokenAddress: airdropDto.tokenAddress,
                    userAddress: currentAirdropClaimerDto.currentUser.userAddress,
                    claimTxHash: currentAirdropClaimerDto.currentUser.claimTxHash,
                    claimAmount: airdropDto.totalAirdropSupply / airdropDto.whitelistMembers.split(',').length,
                } as any as AirdropClaimerDto;
                const rs0 = await submitAirdropClaim(airdropClaimerDto0);
                if (!rs0) {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: 'submit to backend failed...',
                    });

                } else {
                    showLoadingMask({ id: maskId, text: 'sending transaction...' });
                    const { hash: txHash } = await window.mina.sendTransaction({
                        transaction: txJson,
                        feePayer: {
                            fee: 0.301,
                            memo: `${airdropTag.value}.claimToken`
                        },
                    });
                    console.log('tx send success, txHash: ', txHash);
                    currentAirdropClaimerDto.currentUser.claimTxHash = txHash;

                    // send back to backend for recording
                    showLoadingMask({ id: maskId, text: 'submit to backend...' });
                    const airdropClaimerDto = {
                        claimTxHash: currentAirdropClaimerDto.currentUser.claimTxHash,
                    } as any as AirdropClaimerDto;
                    const rs = await submitAirdropClaim(airdropClaimerDto);
                    if (!rs) {
                        ElMessage({
                            showClose: true,
                            type: 'warning',
                            message: 'submit to backend failed...',
                        });
                    }
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `claim tokens failed!`,
            });
            closeLoadingMask(maskId);
            return;
        }

        closeLoadingMask(maskId);
    }
}


const dialogTableVisible = ref(false)
let whiteListArr = reactive({ whitelist: [] as string[] });

const airdropAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);
const tokenAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);

let refreshTimer = undefined as any;

// 组件挂载完成后执行的函数  
onMounted(async () => {
    await init();

    refreshTimer = setInterval(init, 2 * 60 * 1000);

    whiteListArr.whitelist = airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',');

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
    <div
        v-if="(airdropClaimersDetailDto.airdropDto.id == undefined && airdropClaimersDetailDto.airdropDto.id == null)
            || (airdropAddress == null || airdropAddress == undefined || tokenAddress == null || tokenAddress == undefined)">
        the airdrop does not exist!
    </div>

    <div v-else>
        <el-row class="row-bg preairdrop-details" justify="center">

            <!-- 项目描述 -->
            <el-col :span="12" class="project-description">

                <el-row>
                    <el-col :span="4">
                        <el-image :src="airdropClaimersDetailDto.airdropDto.logoUrl" fit="contain" lazy />
                    </el-col>
                    <el-col :span="20">
                        <el-row>
                            <h1>{{ airdropClaimersDetailDto.airdropDto.airdropName }}</h1>
                        </el-row>

                        <el-row>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-bird"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-discord1"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-GitHub"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-telegram"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-facebook"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-redditsquare"></i>
                            </a>

                        </el-row>

                        <el-row>
                            {{ airdropClaimersDetailDto.airdropDto.description }}
                        </el-row>
                    </el-col>
                </el-row>

                <!-- 项目表格1 -->
                <el-row class="row-bg formTable">
                    <el-col :span="24">

                        <!-- <el-row>
                <el-col :span="8" class="titleName">Token name : </el-col>
                <el-col :span="12">{{ airdropContributorsDetailDto.airdropDto.tokenSymbol }}</el-col>
            </el-row> -->

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Token name :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.tokenSymbol }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Token address :
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">
                                    <a :href="tokenAddressLinkPrefix" target="_blank" class="titleContent">{{
                                        airdropClaimersDetailDto.airdropDto.tokenAddress
                                    }}</a>
                                    <el-icon style="margin-left: 10px;">
                                        <CopyDocument />
                                    </el-icon>
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop name :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.airdropName }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Airdrop contract address:
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">

                                    <a :href="airdropAddressLinkPrefix" target="_blank" class="titleContent">{{
                                        airdropClaimersDetailDto.airdropDto.airdropAddress }}</a>

                                    <el-icon style="margin-left: 10px;">
                                        <CopyDocument />
                                    </el-icon>

                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop Supply :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.totalAirdropSupply }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop currency :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.currency }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop creation fee :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.feeRate }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">

                            <el-col :span="8"
                                :hidden="airdropClaimersDetailDto.airdropDto.whitelistMembers == null || airdropClaimersDetailDto.airdropDto.whitelistMembers == ''"
                                class="titleName">
                                Airdrop whitelist :
                            </el-col>

                            <el-col :span="16" style="overflow-wrap: break-word;">

                                <el-row justify="end" class="titleContent">

                                    <el-button text @click="dialogTableVisible = true" type="success" class="whiteListBtn">
                                        whileList table
                                    </el-button>

                                    <el-dialog v-model="dialogTableVisible" title="whileList table" style="width:600px">
                                        <ul>
                                            <el-scrollbar max-height="400px">
                                                <li v-for="item in whiteListArr.whitelist" :key="item.index"
                                                    class="whiteListUl scrollbar-demo-item">{{
                                                        item }}</li>
                                            </el-scrollbar>
                                        </ul>
                                    </el-dialog>

                                </el-row>


                            </el-col>

                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="6">
                                <el-row class="titleName">
                                    Start Time :
                                </el-row>
                            </el-col>
                            <el-col :span="18">
                                <el-row justify="end" class="titleContent">
                                    {{ new Date(airdropClaimersDetailDto.airdropDto.startTimestamp) }}
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
                                    {{ airdropClaimersDetailDto.airdropDto.cliffTime }}
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
                                    {{ airdropClaimersDetailDto.airdropDto.cliffAmountRate }}
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
                                    {{ airdropClaimersDetailDto.airdropDto.vestingPeriod }}
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
                                    {{ airdropClaimersDetailDto.airdropDto.vestingIncrement }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <!-- <el-row justify="space-between" class="tableLine">
                <el-col :span="4" class="titleName">
                    logoUrl :
                </el-col>
                <el-col :span="20">
                    <el-row justify="end" style="overflow-wrap: break-word;">
                        {{ airdropContributorsDetailDto.airdropDto.logoUrl }}
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
                        {{ airdropContributorsDetailDto.airdropDto.website }}
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
                        {{ airdropContributorsDetailDto.airdropDto.facebook }}
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
                        {{ airdropContributorsDetailDto.airdropDto.website }}
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
                        {{ airdropContributorsDetailDto.airdropDto.twitter }}
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
                        {{ airdropContributorsDetailDto.airdropDto.telegram }}
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
                        {{ airdropContributorsDetailDto.airdropDto.discord }}
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
                        {{ airdropContributorsDetailDto.airdropDto.reddit }}
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
                        <el-col>
                            <el-countdown format="DD [days] HH:mm:ss"
                                :value="airdropClaimersDetailDto.airdropDto.airdropStartTimeStamp"
                                @finish="countdownFinishCallback">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">Start of Airdrop</div>
                                </template>
                            </el-countdown>
                        </el-col>
                    </el-row>

                    <!-- 注意  进度条 -->
                    <el-row>
                        <el-col>
                            <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                                <el-progress :text-inside="true" :stroke-width="14"
                                    :percentage="airdropClaimersDetailDto.airdropDto.progressPercent" />
                            </el-row>

                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="10"> 0 </el-col>
                                <!-- <el-col :span="8"></el-col> -->
                                <el-col :span="6">{{ airdropClaimersDetailDto.airdropDto.totalAirdropSupply }}
                                    {{ airdropClaimersDetailDto.airdropDto.tokenSymbol }}</el-col>
                            </el-row>
                        </el-col>
                    </el-row>

                    <div>
                        <el-row v-if="(!currentUserHasClaimed) && appState.connectedWallet58">
                            You could claim {{
                                Math.floor(airdropClaimersDetailDto.airdropDto.totalAirdropSupply /
                                    airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',').length)
                            }} {{ airdropClaimersDetailDto.airdropDto.tokenSymbol }}!
                        </el-row>
                        <el-row>
                            <el-button type="primary" :disabled="contributionBtnDisabled" @click="claimTokens">claim your
                                Tokens</el-button>
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
                                    {{ airdropClaimersDetailDto.airdropDto.projectStatus }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop Type :
                                </el-row>
                            </el-col>
                            <el-col :span="16">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.type == 0 ? 'Normal' : 'Normal' }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="14">
                                <el-row class="titleName">
                                    Total Claimers :
                                </el-row>
                            </el-col>
                            <el-col :span="10">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',').length }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="14">
                                <el-row class="titleName">
                                    Claimed Members :
                                </el-row>
                            </el-col>
                            <el-col :span="10">
                                <el-row justify="end" class="titleContent">
                                    {{ airdropClaimersDetailDto.claimerList.length }}
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
.preairdrop-details {
    width: 100%;
    padding-top: 120px;
    padding-bottom: 120px;
    background: #f7f7f7;

    .project-description {
        width: 100%;
        background-color: #fff;
        padding: 30px 15px;

        .icon-discord1,
        .icon-bird,
        .icon-telegram,
        .icon-redditsquare,
        .icon-facebook,
        .icon-GitHub {
            margin-right: 20px;
            font-size: 20px;
            color: #00c798;
        }

        .icon-discord1:hover,
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

    .project-status {
        width: 100%;
        margin-left: 30px;

        .project-status-box {
            padding: 30px;
            background-color: #fff;

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
        padding: 30px 15px;
        background-color: #fff;

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
            color: #fff;
            background-color: #00c798;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 10px;
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
