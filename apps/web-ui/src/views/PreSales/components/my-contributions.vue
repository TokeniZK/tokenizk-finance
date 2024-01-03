<script setup lang="ts">
import { onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores";
import type { SaleDto } from '@tokenizk/types';
import { useRouter } from 'vue-router';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const router = useRouter();
watch(()=> appState.connectedWallet58, async (value, oldValue)=>{
    if (!appState.connectedWallet58) {
        router.replace('/pre-sale');
    }
})

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }
type SaleUserDtoExtend = {
    saleDto: SaleDtoExtend,
    userContribute: {
        txHash: string;
        contributeTimestamp: string;
        contributedCurrencyAmount: string;
    }
}

let fetchResult: SaleUserDtoExtend[] = [];

const myContributionsList = reactive({ saleList: fetchResult });

const saleType = 0; // from parent component

// 转换项目的状态
const transformProjectStatus = (itmes: SaleUserDtoExtend[]) => {
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
const calcProjectProgress = (itmes: SaleUserDtoExtend[]) => {
    itmes.forEach(item => {
        item.saleDto.progressPercent = computed(() => Number((item.saleDto.totalContributedMina * 100 / item.saleDto.hardCap).toFixed(1))) as any as number;
        if ((item.saleDto.progressPercent as any as ComputedRef).value >= 80) {
            item.saleDto.progressBarStatus = 'exception'
        } else if ((item.saleDto.progressPercent as any as ComputedRef).value >= 60) {
            item.saleDto.progressBarStatus = 'warning'
        } else {
            item.saleDto.progressBarStatus = 'success'
        }
    });
}

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
    }];

    transformProjectStatus(fetchResult);
    calcProjectProgress(fetchResult);

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
                        <li v-for="item in myContributionsList.saleList" :key="item.saleDto.id">

                            <div class="launchpads-box">

                                <!-- photo -->
                                <el-row class="thumb">
                                    <router-link to="/presale-datails">
                                        <el-image style="width: 349px; height: 130px;" :src="item.saleDto.logoUrl"
                                            :alt="item.saleDto.saleName" loading="lazy" />
                                    </router-link>
                                </el-row>

                                <!-- 项目描述 -->
                                <el-row class="launchpads-content">

                                    <el-col :span="24">

                                        <el-row class="row-bg" justify="space-between">
                                            <el-col :span="8">
                                                <h4><a href="#">{{ item.saleDto.saleName }}</a></h4>
                                            </el-col>

                                            <el-col :span="5"></el-col>

                                            <el-col class="review" :span="7">
                                                <el-button type="primary" round class="statusColor" to="/presale-datails">
                                                    {{ item.saleDto.projectStatus }}
                                                </el-button>
                                            </el-col>
                                        </el-row>

                                        <!-- 投资Mina数量 -->
                                        <el-row class="row-bg liquidity-percent" justify="space-between">
                                            <el-col :span="15">contributed Mina Amount :</el-col>
                                            <el-col :span="6"> {{ item.saleDto.hardCap }}</el-col>
                                        </el-row>

                                        <!-- 团队名称 -->
                                        <el-row class="text-review-change" justify="space-between">
                                            <el-col class="text" :span="10">
                                                by <a href="" class="link">{{ item.saleDto.teamName }}</a>
                                            </el-col>

                                            <el-col class="review" :span="10">
                                                <el-rate v-model="item.saleDto.star" size="default" />
                                            </el-col>
                                        </el-row>

                                        <el-row class="row-bg soft-hard-cap" justify="space-between">
                                            <el-col :span="10">Soft / Hard</el-col>
                                            <el-col :span="2"></el-col>
                                            <el-col :span="10">{{ item.saleDto.softCap }}Mina - {{ item.saleDto.hardCap
                                            }}Mina</el-col>
                                        </el-row>

                                        <!-- 注意  进度条 -->
                                        <el-row class="content-Progress">
                                            <el-col>

                                                <!-- 注意  进度条 -->
                                                <el-row class="content-Progress">
                                                    <el-col>

                                                        <el-row class="title">Progress</el-row>

                                                        <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                                                            <el-progress :text-inside="true" :stroke-width="14"
                                                                :status="item.saleDto.progressBarStatus"
                                                                :percentage="item.saleDto.progressPercent" striped
                                                                striped-flow :duration="6" />
                                                        </el-row>

                                                        <el-row class="row-bg sub-title" justify="space-between">
                                                            <el-col :span="10"> 0 Mina</el-col>
                                                            <el-col :span="4"></el-col>
                                                            <el-col :span="6">{{ item.saleDto.hardCap }} Mina </el-col>
                                                        </el-row>

                                                    </el-col>
                                                </el-row>

                                            </el-col>
                                        </el-row>

                                        <el-row class="row-bg lockup-time" justify="space-between">
                                            <el-col :span="10">Lockup Time :</el-col>
                                            <el-col :span="4"></el-col>
                                            <el-col :span="6">{{ new Date(item.saleDto.cliffTime).getHours() }}
                                                minutes</el-col>
                                        </el-row>


                                        <el-row class="row-bg Sale-Ends-In" justify="space-between">
                                            <el-col :span="10">Sale Ends In :</el-col>
                                            <el-col :span="4"></el-col>
                                            <el-col :span="6">{{ item.saleDto.cliffTime * 5 }} </el-col>
                                        </el-row>

                                    </el-col>

                                </el-row>

                            </div>

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
                        margin-bottom: 10px;
                        width: 300px;
                    }

                }

            }
        }
    }
}

.el-row {
    margin-bottom: 8px;
}
</style>

