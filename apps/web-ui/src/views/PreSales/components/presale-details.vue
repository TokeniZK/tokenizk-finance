<script lang="ts" setup>
import { ref, onMounted, reactive, computed, type ComputedRef } from 'vue'
import dayjs from 'dayjs'
import type { SaleDto, SaleReq, UserContributionDto, UserRedeemClaimWitnessDto } from '@tokenizk/types'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { querySaleDetails, submitContribution } from '@/apis/sale-api';
import { ElMessage } from 'element-plus';
import { calcWhitelistMerkleWitness } from '@/utils/whitelist-tree-calc';
import { queryContributorWitnessByUser } from '@/apis/witness-api';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }
type SaleContributorsDetailDtoExtend = {
    saleDto: SaleDtoExtend
    contributorList: UserContributionDto[]
}

const saleAddress = '';// from route param
const tokenAddress = '';// from route param

// 转换项目的状态
const transformProjectStatus = (itmes: SaleDtoExtend[]) => {
    let currentTime = new Date().getTime();

    itmes.forEach(item => {
        if (item.startTimestamp > currentTime) {
            item.projectStatus = 'Upcoming'
        } else if (item.startTimestamp <= currentTime && item.endTimestamp > currentTime) {
            item.projectStatus = 'Ongoing'
        } else if (item.endTimestamp < currentTime) {
            item.projectStatus = 'Ended'
        } else {
            item.projectStatus = 'All Status'
        }
    });
}

// 项目进度条
const calcProjectProgress = (itmes: SaleDtoExtend[]) => {
    itmes.forEach(item => {
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
const contributionInputDisabled = ref(false);
const contributionBtnDisabled = ref(false);
const flagSpan = ref(0)
let flagBtn = ref(1)

const checkSaleStatusDynamically = () => {
    const currentTime = new Date().getTime();
    [saleContributorsDetailDto.saleDto].forEach((item: SaleDto) => {

        if (item.endTimestamp < currentTime) { // endTimestamp 已结束

            if (appState.connectedWallet58 !== '' && appState.connectedWallet58 !== null && appState.connectedWallet58 !== undefined) {

                // 总投资 >= softCap
                if (item.totalContributedMina >= item.softCap) {
                    flagBtn.value = 2
                    contributionInputDisabled.value = true   // 禁用input
                    contributionBtnDisabled.value = false   //  启用按钮
                    tokenInput.value = item.saleRate * curentUserContributionDto.currentUser.contributeCurrencyAmount
                } else {
                    flagBtn.value = 3
                    contributionInputDisabled.value = true   // 禁用input
                    contributionBtnDisabled.value = false   //  启用按钮
                    tokenInput.value = 0
                }
            } else {
                flagBtn.value = 1;
                // 禁用input
                contributionInputDisabled.value = true;
                contributionBtnDisabled.value = true;
            }

        } else { // endTimestamp 没结束

            if (appState.connectedWallet58 !== '' && appState.connectedWallet58 !== null && appState.connectedWallet58 !== undefined) {

                if (curentUserContributionDto.currentUser.id) {
                    // 禁用input、按钮
                    contributionInputDisabled.value = false
                    contributionBtnDisabled.value = false
                    flagBtn.value = 1
                    flagSpan.value = 1
                }

            } else {
                // 启用input、按钮
                contributionInputDisabled.value = false
                contributionBtnDisabled.value = false
                flagBtn.value = 1
            }
        }
    })
}

const countdownFinishCallback = () => {
    // 禁用 input
    contributionInputDisabled.value = true;
    contributionBtnDisabled.value = true;

    // 修改 status 为 Ended
    saleContributorsDetailDto.saleDto.projectStatus = 'Ended'

    checkSaleStatusDynamically();
}

const init = async () => {
    // query sale and current user
    // const saleContributorsDetailDto0 = (await querySaleDetails(saleAddress, tokenAddress)) as SaleContributorsDetailDtoExtend;
    const saleContributorsDetailDto0 = {
        saleDto: {
        } as SaleDtoExtend,
        contributorList: []
    } as SaleContributorsDetailDtoExtend;
    saleContributorsDetailDto0.saleDto = {
        id: 0,
        saleType: 1,
        txHash: '0x333123456789',
        status: 1,

        tokenName: 'TxZ',
        tokenAddress: 'B62xxxt',
        tokenSymbol: 'TxZ',

        saleName: 'ZHI Inu 2.0',
        saleAddress: 'B62xxs',

        star: 4,

        totalSaleSupply: 20,
        currency: 'Mina',
        feeRate: '5%',
        saleRate: 10,
        whitelistTreeRoot: '45678ityuioghjk',
        whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',

        softCap: 21,
        hardCap: 60,
        minimumBuy: 0.1,
        maximumBuy: 1,
        startTimestamp: new Date().getTime() - 10 * 60 * 60 * 1000,
        endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
        projectStatus: '',

        cliffTime: 300,
        cliffAmountRate: 3,
        vestingPeriod: 1704527581215,
        vestingIncrement: 0,
        contributorsFetchFlag: 0,
        contributorsTreeRoot: '',
        contributorsMaintainFlag: 0,
        totalContributedMina: 11,
        teamName: 'Zhi Tokenizk Team',
        logoUrl: '/src/assets/images/1.png',
        website: 'https://tokenizk.finance/',
        facebook: 'https://tokenizk.finance/',
        github: 'https://tokenizk.finance/',
        twitter: 'https://tokenizk.finance/',
        telegram: 'https://tokenizk.finance/',
        discord: 'https://tokenizk.finance/',
        reddit: 'https://tokenizk.finance/',
        description: 'The Launchpad focusing on ZK-Token for Everyone!',
        updatedAt: 1703691515995,
        createdAt: 1703691251595,

        progressBarStatus: 'success',
        progressPercent: 0,

    }

    transformProjectStatus([saleContributorsDetailDto0.saleDto]);
    calcProjectProgress([saleContributorsDetailDto0.saleDto]);

    saleContributorsDetailDto.saleDto = saleContributorsDetailDto0.saleDto;
    saleContributorsDetailDto.contributorList = saleContributorsDetailDto0.contributorList ?? [];

    if (appState.connectedWallet58) {
        curentUserContributionDto.currentUser = saleContributorsDetailDto.contributorList.filter(a => a.address === appState.connectedWallet58);
    }

    checkSaleStatusDynamically();
}

const buyWithMina = async () => {
    if (appState.connectedWallet58 === '' || appState.connectedWallet58 === null || appState.connectedWallet58 === undefined) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    if(tokenInput.value == 0) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Amount should be greater than 0`,
        });

        return;
    }

    const saleDto = saleContributorsDetailDto.saleDto;

    if (!curentUserContributionDto.currentUser.id) {

        // query whitelist witness
        const maskId = 'createPresale';

        // check if circuit has been compiled, if not , prompt: wait
        if ((saleDto.saleType == 1 && !appState.tokenizkPresaleCompiled)
            || (saleDto.saleType == 2 && !appState.tokenizkFairsaleCompiled)
            || (saleDto.saleType == 3 && !appState.tokenizkPrivatesaleCompiled)) {

            showLoadingMask({ id: maskId, text: 'compiling circuit...' });

            const flag = await CircuitControllerState.remoteController?.compileTokeniZkPresale()
            if (!flag) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `circuit compile failed!`,
                });

                closeLoadingMask(maskId);
                return;
            }

            appState.tokenizkPresaleCompiled = true;
        }

        // calc whitelist tree root
        let whitelistWitness: string[] = [];
        let leafIndex = 0;
        if (saleDto.whitelistMembers?.length > 0 || saleDto.whitelistTreeRoot == '0') {
            showLoadingMask({ id: maskId, text: 'constructing whitelist tree...' });

            const members: string[] = saleDto.whitelistMembers.trim().split(',');
            whitelistWitness = await calcWhitelistMerkleWitness(members, curentUserContributionDto.currentUser.address);
            leafIndex = members.indexOf(curentUserContributionDto.currentUser.address);
        } else {
            const members: string[] = ['0'];
            whitelistWitness = await calcWhitelistMerkleWitness(members, '0');
            leafIndex = 0;
        }

        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });
        const basicTokenZkAppAddress = appState.connectedWallet58;

        const saleParams = {
            tokeniZkBasicTokenAddress: saleDto.tokenAddress,
            totalPresaleSupply: saleDto.totalSaleSupply,
            presaleRate: saleDto.saleRate,
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

        const feePayerAddress = appState.connectedWallet58;
        const txFee = 0.1 * (10 ** 9)
        const txJson = await CircuitControllerState.remoteController?.contributePresale(basicTokenZkAppAddress, saleAddress, saleParams, appState.connectedWallet58, tokenInput.value, whitelistWitness, leafIndex.toString(), feePayerAddress, txFee);
        console.log('contribute presale txJson: ' + txJson);
        showLoadingMask({ id: maskId, text: 'sending transaction...' });

        try {
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson,
                feePayer: {
                    fee: 0.101,
                    memo: "contribute presale"
                },
            });
            console.log('tx send success, txHash: ', txHash);
            saleDto.txHash = txHash;
        } catch (error) {
            console.error(error);

            closeLoadingMask(maskId);
        }

        // send back to backend for recording
        showLoadingMask({ id: maskId, text: 'submit to backend...' });
        const userContributionDto: UserContributionDto = {};// TODO !!!!!

        const rs = await submitContribution(userContributionDto);
        if (!rs) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: 'submit to backend failed...',
            });
        }

        closeLoadingMask(maskId);

        // broadcast tx
    }
}


const claimTokens = async () => {
    if (appState.connectedWallet58 === '' || appState.connectedWallet58 === null || appState.connectedWallet58 === undefined) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    const saleDto = saleContributorsDetailDto.saleDto;

    if (!curentUserContributionDto.currentUser.id) {

        // query whitelist witness
        const maskId = 'claimTokens';

        // check if circuit has been compiled, if not , prompt: wait
        if ((saleDto.saleType == 1 && !appState.tokenizkPresaleCompiled)
            || (saleDto.saleType == 2 && !appState.tokenizkFairsaleCompiled)
            || (saleDto.saleType == 3 && !appState.tokenizkPrivatesaleCompiled)) {

            showLoadingMask({ id: maskId, text: 'compiling circuit...' });

            const flag = await CircuitControllerState.remoteController?.compileTokeniZkPresale()
            if (!flag) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `circuit compile failed!`,
                });

                closeLoadingMask(maskId);
                return;
            }

            appState.tokenizkPresaleCompiled = true;
        }

        // get contributor witness
        const userRedeemClaimWitnessDto = await queryContributorWitnessByUser(saleDto.tokenAddress, saleDto.saleAddress, curentUserContributionDto.currentUser.address);

        // trigger circuit
        showLoadingMask({ id: maskId, text: 'witness calculating...' });

        const saleParams = {
            tokeniZkBasicTokenAddress: saleDto.tokenAddress,
            totalPresaleSupply: saleDto.totalSaleSupply,
            presaleRate: saleDto.saleRate,
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

        const feePayerAddress = appState.connectedWallet58;
        const txFee = 0.1 * (10 ** 9)
        const txJson = await CircuitControllerState.remoteController?.claimTokens(saleParams,
            userRedeemClaimWitnessDto.saleContributorMembershipWitnessData,
            userRedeemClaimWitnessDto.lowLeafWitness,
            userRedeemClaimWitnessDto.oldNullWitness,
            feePayerAddress, txFee);
        console.log('contribute presale txJson: ' + txJson);
        showLoadingMask({ id: maskId, text: 'sending transaction...' });

        try {
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson,
                feePayer: {
                    fee: 0.101,
                    memo: "contribute presale"
                },
            });
            console.log('tx send success, txHash: ', txHash);
            saleDto.txHash = txHash;
        } catch (error) {
            console.error(error);

            closeLoadingMask(maskId);
        }

        // send back to backend for recording
        showLoadingMask({ id: maskId, text: 'submit to backend...' });
        const userContributionDto: UserContributionDto = {};// TODO !!!!!

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

const redeemFunds = async () => {

}
// 组件挂载完成后执行的函数  
onMounted(async () => {
    await init();

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
})

</script>

<style scoped></style>

<template>
    <div v-if="saleContributorsDetailDto.saleDto.id == undefined && saleContributorsDetailDto.saleDto.id == null">
        the sale does not exist!
    </div>
    <el-row v-else class="row-bg presale-details" justify="center">
        <!-- 项目描述 -->
        <el-col :span="12" class="project-description">
            <el-row>
                <el-col :span="24">

                    <el-row>
                        <el-col :span="4">
                            <el-image src="/src/assets/presale-project-logo.png" fit="contain" lazy />
                        </el-col>

                        <el-col :span="20">
                            <el-row>
                                <h1>{{ saleContributorsDetailDto.saleDto.saleName }}</h1>
                            </el-row>

                            <el-row>
                                <i class="iconfont icon-birdxiaoniao"></i>
                                <i class="iconfont icon-discord"></i>
                                <i class="iconfont icon-telegram"></i>
                            </el-row>

                            <el-row>
                                {{ saleContributorsDetailDto.saleDto.description }}
                            </el-row>
                        </el-col>
                    </el-row>

                    <!-- 项目表格 -->
                    <el-row class="row-bg formTable">
                        <el-col :span="24">
                            <el-row class="row-bg" justify="center">
                                <el-col :span="12">Presale Address</el-col>
                                <el-col :span="12">{{ saleContributorsDetailDto.saleDto.saleAddress }}</el-col>
                            </el-row>
                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="12">Soft Cap</el-col>
                                <el-col :span="12"> {{ saleContributorsDetailDto.saleDto.softCap }}</el-col>
                            </el-row>
                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="12">Hard Cap</el-col>
                                <el-col :span="12"> {{ saleContributorsDetailDto.saleDto.hardCap }}</el-col>
                            </el-row>
                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="11">Presale Start Time</el-col>
                                <el-col :span="13">{{ new Date(saleContributorsDetailDto.saleDto.startTimestamp) }}</el-col>
                            </el-row>
                            <el-row class="row-bg" justify="space-between">
                                <el-col :span="11">Presale End Time</el-col>
                                <el-col :span="13">{{ new Date(saleContributorsDetailDto.saleDto.endTimestamp) }}</el-col>
                            </el-row>

                        </el-col>
                    </el-row>

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
                        <el-countdown format="DD [days] HH:mm:ss" :value="saleContributorsDetailDto.saleDto.endTimestamp"
                            @finish="countdownFinishCallback">
                            <template #title>
                                <div style="display: inline-flex; align-items: center">End of pre-sale</div>
                            </template>
                        </el-countdown>
                    </el-col>
                </el-row>

                <!-- 注意  进度条 -->
                <el-row>
                    <el-col>
                        <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="20" />
                        </el-row>

                        <el-row class="row-bg" justify="space-between">
                            <el-col :span="10"> 0 Mina</el-col>
                            <!-- <el-col :span="8"></el-col> -->
                            <el-col :span="6">50 Mina</el-col>
                        </el-row>
                    </el-col>
                </el-row>

                <el-row>Amount</el-row>

                <el-row>
                    <el-input v-model="tokenInput" type="number" placeholder="Please input" size="large" clearable
                        :disabled="contributionInputDisabled" />
                </el-row>

                <el-row>
                    <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 0">
                        connect Auro Wallet</el-button>
                    <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 1"
                        @click="buyWithMina">buy with Mina</el-button>
                    <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 2"
                        @click="claimTokens">claim your Tokens</el-button>
                    <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 3"
                        @click="redeemFunds">redeem your Funds</el-button>
                    <span class="detail-span" v-show="flagSpan === 1"> You has contributed </span>

                </el-row>

            </div>

            <!-- 项目表格 -->
            <el-row class="row-bg formTable">
                <el-col :span="24">

                    <el-row class="row-bg" justify="space-between">
                        <el-col :span="12">Status</el-col>
                        <el-col :span="6">{{ saleContributorsDetailDto.saleDto.projectStatus }}</el-col>
                    </el-row>
                    <el-row class="row-bg" justify="space-between">
                        <el-col :span="8">Sale Type</el-col>
                        <el-col :span="6">{{ saleContributorsDetailDto.saleDto.saleType }}</el-col>
                    </el-row>
                    <el-row class="row-bg" justify="space-between">
                        <el-col :span="10">Minimum Buy</el-col>
                        <el-col :span="6">{{ saleContributorsDetailDto.saleDto.minimumBuy }}</el-col>
                    </el-row>
                    <el-row class="row-bg" justify="space-between">
                        <el-col :span="10">Maximum Buy</el-col>
                        <el-col :span="6">{{ saleContributorsDetailDto.saleDto.saleType }}</el-col>
                    </el-row>
                    <el-row class="row-bg" justify="space-between">
                        <el-col :span="12">Total Contributors</el-col>
                        <el-col :span="6">{{ saleContributorsDetailDto.contributorList.length }}</el-col>
                    </el-row>

                </el-col>
            </el-row>

        </el-col>

    </el-row>
</template>

<style lang="less" scoped>
.presale-details {
    width: 100%;
    padding-top: 120px;
    padding-bottom: 120px;
    background: #f7f7f7;

    .icon-discord,
    .icon-birdxiaoniao,
    .icon-telegram {
        margin-right: 20px;
        font-size: 20px;
        color: #00FFC2;
    }

    .project-description {
        background-color: #fff;
        padding: 30px
    }

    .project-status {
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
        padding: 30px;
        background-color: #fff;

        .el-row {
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
