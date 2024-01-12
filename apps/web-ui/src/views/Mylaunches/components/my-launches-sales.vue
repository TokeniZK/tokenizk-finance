<script lang="ts" setup >
import { onMounted, reactive, computed, type ComputedRef } from 'vue'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '@/components/sale-block.vue'
import { useStatusStore } from '@/stores';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }

let fetchResult: SaleDtoExtend[] = [];

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

let renderSaleBlock: SaleDtoExtend[] = [];
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 组件挂载完成后执行的函数  请求数据  
onMounted(() => {
    let saleReq = { tokenAddress: appState.connectedWallet58 } as SaleReq;
    // fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];
    if (fetchResult.length == 0) {
        saleReq = { saleAddress: appState.connectedWallet58 } as SaleReq;
        // fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];
    }
    // 临时数据 本尊
    fetchResult = [{
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
        totalContributorNum: 3,
        softCap: 21,
        hardCap: 60,
        minimumBuy: 0.1,
        maximumBuy: 1,
        startTimestamp: new Date().getTime() - 10 * 60 * 60 * 1000,
        endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
        projectStatus: '',

        cliffTime: 300,
        cliffAmountRate: 3,
        vestingPeriod: 3,
        vestingIncrement: 10,
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
        updatedAt: 1703641015995,
        createdAt: 1703691251595,

        progressBarStatus: 'success',
        progressPercent: 0,

    },
    {
        id: 0,
        saleType: 1,
        txHash: '0x123456789',
        status: 1,

        tokenName: 'TZ',
        tokenAddress: 'B62xxxt',
        tokenSymbol: 'TZ',

        saleName: 'Oggy Inu 2.0',
        saleAddress: 'B62xxs',

        star: 4,

        totalSaleSupply: 20,
        currency: 'Mina',
        feeRate: '5%',
        saleRate: 10,
        whitelistTreeRoot: '45678ityuioghjk',
        whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
        totalContributedMina: 80,
        totalContributorNum: 3,
        softCap: 11,
        hardCap: 90,
        minimumBuy: 0.1,
        maximumBuy: 1,
        startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
        endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
        projectStatus: '',

        cliffTime: 300,
        cliffAmountRate: 3,
        vestingPeriod: 4,
        vestingIncrement: 5,
        contributorsFetchFlag: 0,
        contributorsTreeRoot: '',
        contributorsMaintainFlag: 0,

        teamName: 'Tokenizk Team',
        logoUrl: '/src/assets/images/1.png',
        website: 'https://tokenizk.finance/',
        facebook: 'https://tokenizk.finance/',
        github: 'https://tokenizk.finance/',
        twitter: 'https://tokenizk.finance/',
        telegram: 'https://tokenizk.finance/',
        discord: 'https://tokenizk.finance/',
        reddit: 'https://tokenizk.finance/',
        description: 'The Launchpad focusing on ZK-Token for Everyone!',
        updatedAt: new Date().getTime(),
        createdAt: new Date().getTime(),

        progressBarStatus: 'success',
        progressPercent: 0
    },
    {
        id: 0,
        saleType: 1,
        txHash: '0x123456789',
        status: 1,

        tokenName: 'TZ',
        tokenAddress: 'B62xxxt',
        tokenSymbol: 'TZ',

        saleName: 'XX Inu 2.0',
        saleAddress: 'B62xxs',

        star: 4,

        totalSaleSupply: 20,
        currency: 'Mina',
        feeRate: '5%',
        saleRate: 10,
        whitelistTreeRoot: '45678ityuioghjk',
        whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',

        softCap: 101,
        hardCap: 300,
        minimumBuy: 0.1,
        maximumBuy: 1,
        startTimestamp: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
        endTimestamp: new Date().getTime() - 10 * 60 * 60 * 1000,
        projectStatus: '',

        cliffTime: 300,
        cliffAmountRate: 3,
        vestingPeriod: 12,
        vestingIncrement: 10,
        contributorsFetchFlag: 0,
        contributorsTreeRoot: '',
        contributorsMaintainFlag: 0,
        totalContributedMina: 100,
        totalContributorNum: 3,
        teamName: 'Tokenizk Team',
        logoUrl: '/src/assets/images/1.png',
        website: 'https://tokenizk.finance/',
        facebook: 'https://tokenizk.finance/',
        github: 'https://tokenizk.finance/',
        twitter: 'https://tokenizk.finance/',
        telegram: 'https://tokenizk.finance/',
        discord: 'https://tokenizk.finance/',
        reddit: 'https://tokenizk.finance/',
        description: 'The Launchpad focusing on ZK-Token for Everyone!',
        updatedAt: new Date().getTime(),
        createdAt: new Date().getTime(),

        progressBarStatus: 'success',
        progressPercent: 0
    }];

    calcProjectProgress(fetchResult);
    // 转换项目状态
    transformProjectStatus(fetchResult);

    renderSaleBlock = fetchResult;
    presaleProjects.saleList = renderSaleBlock

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
})

</script>

<template>
    <el-row class="all-launchpads">
        <el-col>
            <!-- 每个项目 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="20">

                    <ul class="launchpads-ul">

                        <li v-for="item in presaleProjects.saleList" :key="item.id">

                            <SaleBlock :saleDto="item" />

                        </li>
                    </ul>
                </el-col>
            </el-row>

        </el-col>

    </el-row>
</template>

<style lang="less" scoped>
.all-launchpads {
    width: 100%;
    padding-top: 10px;
    padding-bottom: 50px;

    .input-with-select .el-input-group__prepend {
        background-color: var(--el-fill-color-blank);
    }

    .launchpads-ul {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;

        li {
            margin-top: 0px;
            margin-bottom: 30px;
            width: 349px;
            height: 430px;
            border-radius: 15px;

            .launchpads-box {
                width: 100%;
                height: 100%;
                background-color: #fff;
                border-radius: 15px;

                .thumb {
                    width: 349px;
                    height: 130px;
                    overflow: hidden;
                }

                .launchpads-content {
                    width: 100%;
                    padding: 12px 20px;

                    .demo-progress .el-progress--line {
                        margin-bottom: 15px;
                        width: 300px;
                    }

                }

            }
        }
    }
}

.el-row {
    margin-bottom: 5px;
}
</style>
