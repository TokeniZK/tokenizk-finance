<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, watch, computed, type ComputedRef } from 'vue'
import type { AirdropClaimerDto, AirdropDto } from '@tokenizk/types'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { queryAirdropDetails, submitAirdropClaim } from '@/apis/airdrop-api';
import { ElMessage } from 'element-plus';
import { calcWhitelistMerkleWitness, getEmptyLeafWitness } from '@/utils/whitelist-tree-calc';
import { queryAirdropClaimerWitnessByUser, queryContributorWitnessByUser } from '@/apis/witness-api';
import { useRoute } from 'vue-router';
import { checkTx, syncLatestBlock } from '@/utils/txUtils';
import AirdropStatistic from "./airdrop-statistic.vue";
import Comment from '@/components/comment.vue'

const ContractConstants = import('@tokenizk/contracts');
const o1js = import('o1js');

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type AirdropDtoExtend = AirdropDto & { totalClaimedMemberNumber: number, projectStatus: string, progressBarStatus: string, progressPercent: number }
type AirdropClaimersDetailDtoExtend = {
    airdropDto: AirdropDtoExtend
    claimerList: AirdropClaimerDto[]
}

const route = useRoute();
const { airdropAddress: airdropAddress0, tokenAddress: tokenAddress0 } = route.query;// from route param
const airdropAddress = airdropAddress0 as string;
const tokenAddress = tokenAddress0 as string;

let airdropStatistic = reactive({
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

// 转换项目的状态
const transformProjectStatus = (itmes: AirdropDtoExtend[]) => {
    let currentTime = new Date().getTime();

    itmes.forEach(item => {
        if (item.startTimestamp > currentTime) {
            item.projectStatus = 'Upcoming'
        } else {
            item.projectStatus = 'Ongoing'
        }
    });
}

// 项目进度条
const calcProjectProgress = (itmes: AirdropDtoExtend[]) => {
    itmes.forEach(item => {
        item.progressPercent = computed(() => Number((item.totalClaimedMemberNumber / item.whitelistMembers.split(',').length * 100).toFixed(1))) as any as number;
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


const currentUserIsInWhiteList = ref(false);
const currentUserHasClaimed = ref(false);

let couldClaimAmount = ref(0);

const init = async () => {
    // query airdrop and current user
    const airdropClaimersDetailDto0 = (await queryAirdropDetails(airdropAddress, tokenAddress)) as any as AirdropClaimersDetailDtoExtend;

    if (!airdropClaimersDetailDto0) {
        ElMessage.warning('cannot find the airdrop!');
        return;
    }

    /*
    if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
        appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
        appState.fetchLatestBlockInfoTimestamp = new Date().getTime();

        airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp = Date.now() + (airdropClaimersDetailDto0.airdropDto.startTimestamp - Number(appState.latestBlockInfo.blockchainLength.toString())) * 3 * 60 * 1000;
        console.log('airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp:' + airdropClaimersDetailDto0.airdropDto.airdropStartTimeStamp);
    }
    */

    airdropClaimersDetailDto0.airdropDto.totalClaimedMemberNumber = (airdropClaimersDetailDto0.claimerList ?? []).length;

    transformProjectStatus([airdropClaimersDetailDto0.airdropDto]);
    calcProjectProgress([airdropClaimersDetailDto0.airdropDto]);

    airdropClaimersDetailDto.airdropDto = airdropClaimersDetailDto0.airdropDto;
    airdropClaimersDetailDto.claimerList = airdropClaimersDetailDto0.claimerList ?? [];

    if (appState.connectedWallet58) {
        currentAirdropClaimerDto.currentUser = airdropClaimersDetailDto.claimerList.filter(
            a => a.userAddress === appState.connectedWallet58)[0] ?? ({} as AirdropClaimerDto);

        if (airdropClaimersDetailDto.airdropDto.whitelistTreeRoot != (await ContractConstants).WHITELIST_TREE_ROOT.toString()) {
            currentUserIsInWhiteList.value = airdropClaimersDetailDto.airdropDto.whitelistMembers.includes(appState.connectedWallet58);
        } else {
            currentUserIsInWhiteList.value = true;
        }
    }

    if (airdropClaimersDetailDto.airdropDto.whitelistTreeRoot != (await ContractConstants).WHITELIST_TREE_ROOT.toString()) {
        couldClaimAmount.value = Math.floor(airdropClaimersDetailDto.airdropDto.totalAirdropSupply / airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',').length);
    }

    checkAirdropStatusDynamically();

    airdropAddressLinkPrefix.value = airdropAddressLinkPrefix.value + (airdropClaimersDetailDto.airdropDto.airdropAddress)
    tokenAddressLinkPrefix.value = tokenAddressLinkPrefix.value + (airdropClaimersDetailDto.airdropDto.tokenAddress)

    const totalAirdropTokenAmount = airdropClaimersDetailDto.claimerList.reduce((p, c) => {
        return p + Number(c.claimAmount);
    }, 0);
    const restUnsaledTokenAmount = airdropClaimersDetailDto.airdropDto.totalAirdropSupply - totalAirdropTokenAmount
    airdropStatistic.dataArr[0].value = totalAirdropTokenAmount;
    airdropStatistic.dataArr[1].value = restUnsaledTokenAmount;

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
    if (airdropDto.startTimestamp >= Date.now()) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Airdrop has not started yet.`,
        });

        return;
    }

    if (airdropClaimersDetailDto.airdropDto.whitelistTreeRoot == (await ContractConstants).WHITELIST_TREE_ROOT.toString() || airdropDto.whitelistMembers.includes(appState.connectedWallet58)) {
        // query whitelist witness
        const maskId = 'claimTokens';

        const txFee = 0.21 * (10 ** 9)

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

        // showLoadingMask({ id: maskId, text: 'compiling TokeniZkAirdrop...' });
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

        // calc whitelist tree root
        let membershipMerkleWitness: string[] = [];
        let leafIndex = 0;
        if (airdropDto.whitelistTreeRoot != (await ContractConstants).WHITELIST_TREE_ROOT.toString()) {
            membershipMerkleWitness = await calcWhitelistMerkleWitness(airdropDto.whitelistMembers.split(','), appState.connectedWallet58);
            leafIndex = airdropDto.whitelistMembers.split(',').findIndex(a => a == appState.connectedWallet58);
        } else {
            membershipMerkleWitness = await getEmptyLeafWitness();
            leafIndex = 0;
        }

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
                    userAddress: appState.connectedWallet58,
                    claimAmount: Math.floor(airdropDto.totalAirdropSupply / airdropDto.whitelistMembers.split(',').length),
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
                    airdropClaimerDto0.claimTxHash = txHash;
                    const rs = await submitAirdropClaim(airdropClaimerDto0);
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
    } else {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: 'You are not in Whitelist!',
        });
    }
}

const dialogTableVisible = ref(false)
let whiteListArr = reactive({ whitelist: [] as string[] });

const zkTxLinkPrefix = ref(import.meta.env.VITE_EXPLORER_TX_URL);
const airdropAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);
const tokenAddressLinkPrefix = ref(import.meta.env.VITE_EXPLORER_ACCOUNT_URL);

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

    watch(() => appState.connectedWallet58, async (value, oldValue) => {
        if (appState.connectedWallet58) {
            currentAirdropClaimerDto.currentUser = airdropClaimersDetailDto.claimerList.filter(a => a.userAddress == appState.connectedWallet58)[0] ?? ({} as AirdropClaimerDto);
            if (airdropClaimersDetailDto.airdropDto.whitelistTreeRoot != (await ContractConstants).WHITELIST_TREE_ROOT.toString()) {
                currentUserIsInWhiteList.value = airdropClaimersDetailDto.airdropDto.whitelistMembers.includes(appState.connectedWallet58);
            } else {
                currentUserIsInWhiteList.value = true;
            }

        } else {
            currentAirdropClaimerDto.currentUser = {} as AirdropClaimerDto;
        }
    }, { immediate: true });

    watch(() => currentAirdropClaimerDto.currentUser, async (value, oldValue) => {
        currentUserHasClaimed.value = (currentAirdropClaimerDto.currentUser.airdropAddress != null
            && currentAirdropClaimerDto.currentUser.airdropAddress != undefined);
    }, { immediate: true, deep: true });


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

                    <el-col :span="1"></el-col>

                    <el-col :span="19">
                        <el-row>
                            <h1>{{ airdropClaimersDetailDto.airdropDto.airdropName }}</h1>
                        </el-row>

                        <el-row>
                            <a :href="airdropClaimersDetailDto.airdropDto.website"
                                v-show="airdropClaimersDetailDto.airdropDto.website" target="_blank">
                                <i class="iconfont icon-xitong"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.twitter"
                                v-show="airdropClaimersDetailDto.airdropDto.twitter" target="_blank">
                                <i class="iconfont icon-bird"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.discord"
                                v-show="airdropClaimersDetailDto.airdropDto.discord" target="_blank">
                                <i class="iconfont icon-discord"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.github"
                                v-show="airdropClaimersDetailDto.airdropDto.github" target="_blank">
                                <i class="iconfont icon-GitHub"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.telegram"
                                v-show="airdropClaimersDetailDto.airdropDto.telegram" target="_blank">
                                <i class="iconfont icon-telegram"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.facebook"
                                v-show="airdropClaimersDetailDto.airdropDto.facebook" target="_blank">
                                <i class="iconfont icon-facebook"></i>
                            </a>

                            <a :href="airdropClaimersDetailDto.airdropDto.reddit"
                                v-show="airdropClaimersDetailDto.airdropDto.reddit" target="_blank">
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
                                    <a :href="tokenAddressLinkPrefix" target="_blank" class="titleContent">
                                        <el-icon style="margin-left: 10px;">
                                            <CopyDocument />
                                        </el-icon>
                                    </a>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- 
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
                        -->
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

                                    <a :href="airdropAddressLinkPrefix" target="_blank" class="titleContent">
                                        <el-icon style="margin-left: 10px;">
                                            <CopyDocument />
                                        </el-icon>
                                    </a>

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
                                    {{ airdropClaimersDetailDto.airdropDto.totalAirdropSupply }} {{
            airdropClaimersDetailDto.airdropDto.tokenSymbol }}
                                </el-row>
                            </el-col>
                        </el-row>

                        <!-- 
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
                        -->

                        <el-row justify="space-between" class="tableLine">
                            <el-col :span="8">
                                <el-row class="titleName">
                                    Airdrop creation fee :
                                </el-row>
                            </el-col>
                            <el-col :span="12">
                                <el-row justify="end" class="titleContent">
                                    {{ Number(airdropClaimersDetailDto.airdropDto.feeRate) / (10 ** 9) }} MINA
                                </el-row>
                            </el-col>
                        </el-row>

                        <el-row justify="space-between" class="tableLine">

                            <el-col :span="8" class="titleName">
                                Airdrop whitelist :
                            </el-col>

                            <el-col :span="16" style="overflow-wrap: break-word;">

                                <el-row justify="end" class="titleContent"
                                    v-if="airdropClaimersDetailDto.airdropDto.whitelistMembers">
                                    <el-button text @click="dialogTableVisible = true" type="success"
                                        class="whiteListBtn">
                                        whileList table
                                    </el-button>

                                    <el-dialog v-model="dialogTableVisible" title="whileList table"
                                        style="width:600px;height: 570px;">
                                        <ul>
                                            <el-scrollbar max-height="700px">
                                                <li v-for="item in currentPageItems" :key="item.index"
                                                    class="whiteListUl scrollbar-demo-item">{{ item }}
                                                </li>

                                                <el-pagination class="pagination-block" background :page-size="pageSize"
                                                    :current-page="currentPage" :pager-count="6"
                                                    layout="total,prev, pager, next,jumper"
                                                    :hide-on-single-page="paginationValue" :total="totalItems"
                                                    @size-change="handleSizeChange"
                                                    @current-change="handleCurrentChange" />

                                            </el-scrollbar>
                                        </ul>
                                    </el-dialog>
                                </el-row>

                                <el-row justify="end" class="titleContent" v-else>No Whitelist Members</el-row>

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
                                    {{ airdropClaimersDetailDto.airdropDto.cliffTime }} slots (about {{
            airdropClaimersDetailDto.airdropDto.cliffTime * 3 }} minutes)
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
                                    {{ airdropClaimersDetailDto.airdropDto.cliffAmountRate }}%
                                    <span v-if="airdropClaimersDetailDto.airdropDto.whitelistTreeRoot != '0'">(about
                                        {{
            (Math.floor(airdropClaimersDetailDto.airdropDto.totalAirdropSupply /
                airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',').length) *
                (airdropClaimersDetailDto.airdropDto.cliffAmountRate / 100)).toFixed(2)
        }} {{ airdropClaimersDetailDto.airdropDto.tokenSymbol }}

                                        )</span>
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
                                    {{ airdropClaimersDetailDto.airdropDto.vestingPeriod }} slots (about {{
            airdropClaimersDetailDto.airdropDto.vestingPeriod * 3 }} minutes)
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
                                    {{ airdropClaimersDetailDto.airdropDto.vestingIncrement }}%(about {{
            (Math.floor(airdropClaimersDetailDto.airdropDto.totalAirdropSupply /
                airdropClaimersDetailDto.airdropDto.whitelistMembers.split(',').length) *
                (airdropClaimersDetailDto.airdropDto.vestingIncrement / 100)).toFixed(2)
        }} {{ airdropClaimersDetailDto.airdropDto.tokenSymbol }})
                                </el-row>
                            </el-col>
                        </el-row>

                        <!-- e-charts -->
                        <el-row class="row-bg echarts-row">
                            <AirdropStatistic :dataArr="airdropStatistic.dataArr" />
                        </el-row>

                        <el-row class="comment-row">
                            <el-col :span="24">
                                <Suspense>
                                    <Comment :address="airdropClaimersDetailDto.airdropDto.airdropAddress"
                                        :projectType="4" />
                                </Suspense>
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
                                :value="airdropClaimersDetailDto.airdropDto.startTimestamp"
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
                        <el-row v-if="appState.connectedWallet58 && currentUserIsInWhiteList && couldClaimAmount">
                            <div v-if="currentUserHasClaimed">
                                You has claimed {{ couldClaimAmount }} {{
            airdropClaimersDetailDto.airdropDto.tokenSymbol
        }}!
                            </div>
                            <div v-else>
                                You could claim {{ couldClaimAmount }} {{
            airdropClaimersDetailDto.airdropDto.tokenSymbol
        }}!
                            </div>
                        </el-row>

                        <el-row
                            v-if='!appState.connectedWallet58 || (appState.connectedWallet58 && currentUserIsInWhiteList && !currentUserHasClaimed)'>
                            <el-button type="primary" :disabled="contributionBtnDisabled" @click="claimTokens">claim
                                your
                                Tokens</el-button>
                        </el-row>
                        <el-row v-if="appState.connectedWallet58 && !currentUserIsInWhiteList">
                            <span style="color: red;">Opps! You are NOT in whitelist.</span>
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

        .echarts-row {
            background: #f7f7f7;
        }

        .comment-row {
            width: 100%;
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
        padding: 30px 15px;
        background-color: #fff;
        border-radius: 20px;

        .titleName {
            // font-weight: 700;
            font-size: 13px;
            color: #6f7987;
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
