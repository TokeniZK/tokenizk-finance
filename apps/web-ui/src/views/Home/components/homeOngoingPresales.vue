<script lang="ts" setup >
import { ref, onMounted, reactive, computed, type ComputedRef } from 'vue'
import { getOngoingPresaleAPI } from '@/apis/sale-api'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute } from 'vue-router';


const route = useRoute();
const saleType = route.query.saleType;

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }

let fetchResult: SaleDtoExtend[] = [];

// 过滤器
const filterBy = ref('')
const sortBy = ref('')

// fitlerBy 下拉菜单 渲染所需的数据
const filterByOptions = [
    {
        value: '0',
        label: 'All Status',
    },
    {
        value: '1',
        label: 'Upcoming',
    },
    {
        value: '2',
        label: 'Ongoing',
    },
    {
        value: '3',
        label: 'Ended',
    },
    /*
        {
            value: '4',
            label: 'Filled',
        },
        {
            value: '5',
            label: 'notFilled',
        },
    */
]

// sortBy 下拉菜单 渲染所需的数据
const sortByOptions = [
    {
        value: '0',
        label: 'No Sort',
    },
    {
        value: '1',
        label: 'Soft Cap',
    },
    {
        value: '2',
        label: 'Hard Cap',
    },
    {
        value: '3',
        label: 'Start time',
    },
    {
        value: '4',
        label: 'End time',
    }
]

// 每次点击 搜索按钮 时，重置 过滤选项 和 排序选项
const searchProjects = () => {
    if (keyWord.value) {
        filterBy.value = '0'
        sortBy.value = '0'

        // trigger api
        getSearchProjects();
    }
}

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

const sortProjects = (sortByValue: string, items: SaleDtoExtend[]) => {
    if (sortByValue == '1') {
        items.sort((a, b) => {
            return Number(a.softCap) - Number(b.softCap);
        });
    } else if (sortByValue == '2') {
        items.sort((a, b) => {
            return Number(b.hardCap) - Number(a.hardCap);
        });
    } else if (sortByValue == '3') {
        items.sort((a, b) => {
            return Number(b.startTimestamp) - Number(a.startTimestamp);
        });
    } else if (sortByValue == '4') {
        items.sort((a, b) => {
            return Number(b.endTimestamp) - Number(a.endTimestamp);
        });
    }

    return items;
}

let renderSaleBlock: SaleDtoExtend[] = [];
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const getSearchProjects = async () => {
    // const saleReq = {
    //     saleType,
    //     saleName: keyWord.value
    // } as SaleReq;
    // fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];
    // 临时数据 本尊
    fetchResult = [
        {
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
    // sort 相等运算符会转类型、 最后一项没使用Number做转换
    sortProjects(sortByOptions[0].value, fetchResult);

    renderSaleBlock = fetchResult;
    presaleProjects.saleList = renderSaleBlock
}

// 根据 用户选择 filterBy的选项  过滤数据
const triggerFilterProjects = () => {
    // 计算项目状态
    transformProjectStatus(fetchResult);

    if (filterBy.value === '4') {
        // TODO 
        fetchResult.filter(item => {
            return item.projectStatus === 'All Status'
        })

    } else if (filterBy.value === '0') {
        renderSaleBlock = fetchResult
    } else {
        renderSaleBlock = fetchResult.filter(item => {
            if (filterBy.value == '1') {
                return item.projectStatus === 'Upcoming'
            } else if (filterBy.value == '2') {
                return item.projectStatus === 'Ongoing'
            } else if (filterBy.value == '3') {
                return item.projectStatus === 'Ended'
            }
        });
    }

    // sort
    sortProjects(sortBy.value, renderSaleBlock);

    presaleProjects.saleList = renderSaleBlock;
}

// 根据 用户选择 sortBy的选项 sort排序 由近到远
const triggerSortProjects = () => {
    // sort
    sortProjects(sortBy.value, renderSaleBlock);

    renderSaleBlock = JSON.parse(JSON.stringify(renderSaleBlock));
    presaleProjects.saleList = renderSaleBlock;
}


// 组件挂载完成后执行的函数  请求数据  
onMounted(() => {
    getSearchProjects();
})

</script>

<template>
    <el-row class="row-bg ongoing-presales" justify="center">
        <el-col :span="24">

            <!-- 标题+按钮 -->
            <el-row class="row-bg ongoing-presales-content" justify="center">

                <el-col :span="10">
                    <el-row>
                        <h2 class="title"> Ongoing Presales</h2>
                    </el-row>
                    <el-row>Normal Presale pages work for project team to pre-configure a set of presale
                        rules</el-row>
                </el-col>

                <el-col :span="8" class="link">
                    <el-row class="mb-4" justify="end">
                        <router-link to="/sales?saleType=0" class="main-btn">
                            <el-button type="primary" size="large" round>
                                View All Item
                            </el-button>
                        </router-link>
                    </el-row>
                </el-col>

            </el-row>

            <!-- 轮播图 -->
            <el-row class="row-bg ongoing-presales-carousel" justify="center">

                <el-col :span="20" class="ongoingBox">

                    <!-- 每个项目 -->
                    <ul>
                        <li v-for="item in presaleProjects.saleList" :key="item.id" class="launchpadsLi">

                            <SaleBlock :saleDto="item" />

                        </li>
                    </ul>

                    <!-- <el-carousel :interval="3000" type="card" height="500px" loop>
                        <el-carousel-item v-for="item in presaleProjects.saleList" :key="item.id" class="launchpadsLi">

                        <SaleBlock :saleDto="item" />

                        </el-carousel-item>
                    </el-carousel> -->

                </el-col>

            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.ongoing-presales {
    width: 100%;
    margin-bottom: 100px;
    background-color: #f7f7f7;

    .ongoing-presales-content {
        width: 100%;
        padding-bottom: 10px;

        .title {
            font-size: 35px;
            padding-bottom: 11px;
        }

        .link {
            padding-top: 40px;

            .main-btn {
                font-size: 16px;
                color: #fff;
            }

        }
    }

    .ongoing-presales-carousel {
        overflow: hidden;

        .ongoingBox {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            margin-top: 40px;

            ul {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                display: inline-block;
                // padding-right: 100%;
                // animation: move 6s infinite linear;
                // animation: move 6s infinite alternate linear backwards;
                // animation: move 6s infinite alternate linear forwards;


                .launchpadsLi {
                    display: inline-block;
                    margin-left: 30px;
                    margin-right: 50px;
                }
            }

            // @keyframes move {
            //     0% {
            //         transform: translateX(0);
            //     }

            //     100% {
            //         transform: translateX(-100%);
            //     }
            // }


        }

        // .ongoingBox:hover ul {
        //     animation-play-state: paused;
        // }

    }

}
</style>

