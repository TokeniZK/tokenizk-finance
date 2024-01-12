<script lang="ts" setup >
import { ref, onMounted, reactive, computed, type ComputedRef } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute, useRouter } from 'vue-router';


let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const router = useRouter();
router.beforeEach((to, from, next) => {
    const query = to.query;
    saleType.value = query.saleType as any as number;
    next();
});

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
    const saleReq = {
        saleType: saleType.value,
        saleName: keyWord.value
    } as any as SaleReq;
    // fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];
    // 临时数据 本尊
    fetchResult = [
        {
            id: 0,
            saleType: 1,
            txHash: '0x333123456789',
            status: 1,

            tokenName: 'TxZ',
            tokenAddress: 'B62qqJEi4QGEqy4Po72s16BSa8oPnXQzHRk2eErETU4PucrMqaCKL88',
            tokenSymbol: 'TxZ',

            saleName: 'ZHI Inu 2.0',
            saleAddress: 'B62qrWrGd7iCwXf9ucNxL2kyw8s63Uz7ovHtKMkRwfRREWAWtvXjkFy',

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
            tokenAddress: 'B62qqJEi4QGEqy4Po72s16BSa8oPnXQzHRk2eErETU4PucrMqaCKL88',
            tokenSymbol: 'TZ',

            saleName: 'Oggy Inu 2.0',
            saleAddress: 'B62qrWrGd7iCwXf9ucNxL2kyw8s63Uz7ovHtKMkRwfRREWAWtvXjkFy',

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
            logoUrl: '/src/assets/images/2.png',
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
            tokenAddress: 'B62qqJEi4QGEqy4Po72s16BSa8oPnXQzHRk2eErETU4PucrMqaCKL88',
            tokenSymbol: 'TZ',

            saleName: 'XX Inu 2.0',
            saleAddress: 'B62qrWrGd7iCwXf9ucNxL2kyw8s63Uz7ovHtKMkRwfRREWAWtvXjkFy',

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
            logoUrl: '/src/assets/images/3.png',
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
    ];

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

    if (filterBy.value === '0') {
        // TODO 
        // renderSaleBlock = fetchResult.filter(item => {
        //     return item.projectStatus === 'All Status'
        // })
        renderSaleBlock = fetchResult

    }else if (filterBy.value === '1'){
        renderSaleBlock = fetchResult.filter(item => { 
            return item.projectStatus === 'Ongoing'
        });
    }else if (filterBy.value === '2'){
        renderSaleBlock = fetchResult.filter(item => { 
            return item.projectStatus === 'Ongoing'
        });
    }else if (filterBy.value === '3'){
        renderSaleBlock = fetchResult.filter(item => { 
            return item.projectStatus === 'Ended'
        });
    }

    // sort
    sortProjects(sortBy.value, renderSaleBlock);
    // renderSaleBlock = JSON.parse(JSON.stringify(renderSaleBlock));
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
            <!-- 搜索、过滤器 -->
            <el-row class="row-bg" justify="center" style="margin-bottom:50px;" :gutter="20">

                <el-col :span="13">
                    <div style="height: 19.59px;"></div>

                    <div class="mt-4">
                        <el-input v-model="keyWord" placeholder="Please input" class="input-with-select" size="large">
                            <template #append>
                                <el-button :icon="Search" @click="searchProjects" />
                            </template>
                        </el-input>
                    </div>
                </el-col>

                <!-- 过滤器 -->
                <el-col :span="3">
                    <div>Filter By</div>
                    <el-select v-model="filterBy" class="m-2 filterBy" placeholer="Select" size="large">
                        <el-option v-for="item in filterByOptions" :key="item.value" :label="item.label" :value="item.value"
                            @click="triggerFilterProjects()" />
                    </el-select>
                </el-col>

                <el-col :span="3">
                    <div>Sort By</div>
                    <el-select v-model="sortBy" class="m-2 sortBy" placeholder="Select" size="large">
                        <el-option v-for="item in sortByOptions" :key="item.value" :label="item.label" :value="item.value"
                            @click="triggerSortProjects()" />
                    </el-select>
                </el-col>

            </el-row>

            <!-- 每个项目 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="20">

                    <ul class="launchpads-ul">

                        <li v-for="item in presaleProjects.saleList" :key="item.id" style="margin-bottom: 40px;">

                            <SaleBlock :saleDto="item"/>

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
    }
}

.el-row {
    margin-bottom: 5px;
}
</style>
