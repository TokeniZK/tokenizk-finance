<script lang="ts" setup >
import { ref, onMounted, reactive, computed, type ComputedRef } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute, useRouter } from 'vue-router';
import { querySale } from '@/apis/sale-api';
import { CircuitControllerState, useStatusStore } from '@/stores';
import { syncLatestBlock } from '@/utils/txUtils';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();


let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const router = useRouter();
router.beforeEach((to, from, next) => {
    const query = to.query;
    saleType.value = query.saleType as any as number;

    getSearchProjects();

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
const searchProjects = async () => {
    if (keyWord.value) {
        filterBy.value = '0'
        sortBy.value = '0'

        // trigger api
        await getSearchProjects();
    }
}

const inputChangeTigger = async () => {
    if (!keyWord.value) {
        filterBy.value = '0'
        sortBy.value = '0'

        // trigger api
        await getSearchProjects();
    }
}

// 转换项目的状态
const transformProjectStatus = async (itmes: SaleDtoExtend[]) => {

    if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
        appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
        appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
    }

    const currentBlockHeight = appState.latestBlockInfo!.blockchainLength;
    itmes.forEach(item => {
        if (item.startTimestamp > currentBlockHeight) {
            item.projectStatus = 'Upcoming'
        } else if (item.startTimestamp <= currentBlockHeight && item.endTimestamp > currentBlockHeight) {
            item.projectStatus = 'Ongoing'
        } else if (item.endTimestamp < currentBlockHeight) {
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

    fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];

    calcProjectProgress(fetchResult);
    // 转换项目状态
    await transformProjectStatus(fetchResult);
    // sort 相等运算符会转类型、 最后一项没使用Number做转换
    sortProjects(sortByOptions[0].value, fetchResult);

    renderSaleBlock = fetchResult;
    presaleProjects.saleList = renderSaleBlock
}

// 根据 用户选择 filterBy的选项  过滤数据
const triggerFilterProjects = async () => {
    // 计算项目状态
    await transformProjectStatus(fetchResult);

    if (filterBy.value === '0') {
        renderSaleBlock = fetchResult

    } else if (filterBy.value === '1') {
        renderSaleBlock = fetchResult.filter(item => {
            return item.projectStatus === 'Upcoming'
        });
    } else if (filterBy.value === '2') {
        renderSaleBlock = fetchResult.filter(item => {
            return item.projectStatus === 'Ongoing'
        });
    } else if (filterBy.value === '3') {
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
onMounted(async () => {

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
                        <el-input v-model="keyWord" placeholder="Please input" class="input-with-select" size="large"
                            @input="inputChangeTigger">
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
    }
}

.el-row {
    margin-bottom: 5px;
}
</style>
