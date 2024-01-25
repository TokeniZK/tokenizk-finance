<script setup lang="ts">
import { ref, onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores"
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute, useRouter } from 'vue-router'
import { querySaleUserContribution } from '@/apis/sale-api'


let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const router = useRouter();
router.afterEach(async (to, from, next) => {
    if (from.path == '/sales' && to.path == '/sales/my-contributions') {
        const query = to.query;
        saleType.value = query.saleType as any as number;
        console.log(`changed saleType...`)
    }
});
watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (!appState.connectedWallet58) {
        router.replace('/sales?saleType=' + saleType.value);
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

let renderSaleBlock: SaleDtoExtend[] = [];
// 临时数据
let myContributionsList = reactive({ saleList: renderSaleBlock });


// 组件挂载完成后执行的函数  请求数据
onMounted(async () => {

    let fetchResult = (await querySaleUserContribution(saleType.value, appState.connectedWallet58!)) as any as SaleUserDtoExtend[];

    console.log(`fetchResult: ${JSON.stringify(fetchResult)}`);
    

    calcProjectProgress(fetchResult);
    transformProjectStatus(fetchResult);

    myContributionsList.saleList = fetchResult.map(a => a.saleDto);

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

