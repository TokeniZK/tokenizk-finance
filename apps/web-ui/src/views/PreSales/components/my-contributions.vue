<script setup lang="ts">
import { ref, onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores"
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute, useRouter } from 'vue-router'


let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const router = useRouter();
router.beforeEach((to, from, next) => {
    const query = to.query;
    saleType.value = query.saleType as any as number;
    next();
});

watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (!appState.connectedWallet58) {
        router.replace('/sales?saleType=' + saleType);
    }
})

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }

let fetchResult: SaleDtoExtend[] = [];

type SaleUserDtoExtend = {
    saleDto: SaleDtoExtend,
    userContribute: {
        txHash: string;
        contributeTimestamp: string;
        contributedCurrencyAmount: string;
    }
}


// 转换项目的状态
const transformProjectStatus = (itmes: SaleDtoExtend[]) => {
    let currentTime = new Date().getTime();

    itmes.forEach(item => {
        if (item.saleDto.startTimestamp > currentTime) {
            item.saleDto.projectStatus = 'Upcoming'
        } else if (item.saleDto.startTimestamp <= currentTime && item.saleDto.endTimestamp > currentTime) {
            item.saleDto.projectStatus = 'Ongoing'
        } else if (item.saleDto.endTimestamp < currentTime) {
            item.saleDto.projectStatus = 'Ended'
        } else {
            item.saleDto.projectStatus = 'All Status'
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
let myContributionsList = reactive({ saleList: renderSaleBlock });


// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {

    //myContributionsList.saleList = await querySaleUserContribution(saleType, appState.connectedWallet58!);
    // 临时数据 本尊
    fetchResult = [{
        saleDto: {
            id: 0,
            saleType: 1,
            txHash: '0x333123456789',
            status: 1,

            tokenName: 'TxZ',
            tokenAddress: 'B62xxxt',
            tokenSymbol: 'TxZ',

            saleName: 'CCC ZHI Inu 2.0',
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
            totalContributorNum: 0,

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

        },
        userContribute: {
            txHash: '',
            contributeTimestamp: '',
            contributedCurrencyAmount: ''
        }
    },
    {
        saleDto: {
            id: 0,
            saleType: 1,
            txHash: '0x123456789',
            status: 1,

            tokenName: 'TZ',
            tokenAddress: 'B62xxxt',
            tokenSymbol: 'TZ',

            saleName: 'CCC Oggy Inu 2.0',
            saleAddress: 'B62xxs',

            star: 4,

            totalSaleSupply: 20,
            currency: 'Mina',
            feeRate: '5%',
            saleRate: 10,
            whitelistTreeRoot: '45678ityuioghjk',
            whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
            totalContributedMina: 80,

            softCap: 11,
            hardCap: 90,
            minimumBuy: 0.1,
            maximumBuy: 1,
            startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
            endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
            projectStatus: '',

            cliffTime: 300,
            cliffAmountRate: 3,
            vestingPeriod: 1704527581215,
            vestingIncrement: 0,
            contributorsFetchFlag: 0,
            contributorsTreeRoot: '',
            contributorsMaintainFlag: 0,
            totalContributorNum: 0,

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
        userContribute: {
            txHash: '',
            contributeTimestamp: '',
            contributedCurrencyAmount: ''
        }
    },
    {
        saleDto: {
            id: 0,
            saleType: 1,
            txHash: '0x123456789',
            status: 1,

            tokenName: 'TZ',
            tokenAddress: 'B62xxxt',
            tokenSymbol: 'TZ',

            saleName: 'CCC XX Inu 2.0',
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
            vestingPeriod: 1704527581215,
            vestingIncrement: 0,
            contributorsFetchFlag: 0,
            contributorsTreeRoot: '',
            contributorsMaintainFlag: 0,
            totalContributorNum: 0,

            totalContributedMina: 100,

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
        userContribute: {
            txHash: '',
            contributeTimestamp: '',
            contributedCurrencyAmount: ''
        }
    }
    ];

    calcProjectProgress(fetchResult);
    transformProjectStatus(fetchResult);

    myContributionsList.saleList = fetchResult;

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})

</script>

<template>
    <el-row class="my-contributions">
        <el-col>
            <!-- 每个项目 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="20">

                    <ul class="launchpads-ul">
                        <li v-for="item in myContributionsList.saleList" :key="item.id" style="margin-bottom: 40px;">

                            <SaleBlock :saleDto="item" />

                        </li>
                    </ul>
                </el-col>
            </el-row>

        </el-col>

    </el-row>
</template>

<style lang="less" scoped>
.my-contributions {
    width: 100%;
    padding-top: 10px;
    padding-bottom: 50px;

    .launchpads-ul {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
}

.el-row {
    margin-bottom: 8px;
}
</style>

