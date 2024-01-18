<script lang="ts" setup >
import { onMounted, reactive, computed, type ComputedRef } from 'vue'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '@/components/sale-block.vue'
import { useStatusStore } from '@/stores';
import { querySale } from '@/apis/sale-api'
import { syncLatestBlock } from '@/utils/txUtils'

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }

let fetchResult: SaleDtoExtend[] = [];

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

let renderSaleBlock: SaleDtoExtend[] = [];
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {
    let saleReq = { tokenAddress: appState.tokeniZkBasicTokenKeyPair.value } as SaleReq;
    fetchResult = (await querySale(saleReq)) ?? [] as SaleDtoExtend[];
    if (fetchResult.length == 0) {
        saleReq = { saleAddress: appState.connectedWallet58 } as SaleReq;
        fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];
    }

    if (fetchResult.length == 0) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `fetch no sales!`,
        });
        return;
    }

    calcProjectProgress(fetchResult);
    // 转换项目状态
    await transformProjectStatus(fetchResult);

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
    <el-row class="all-launchpads" v-if="presaleProjects.saleList.length > 0">
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

    <el-row class="all-launchpads" v-else>
        <el-col :span="24" class="tokenTable">
            <div>
                You have not created any sales yet. Please go create ones : <br>
                <router-link to="/create-token-sale?saleType=0">
                    <el-button type="primary" class="JumpBtn">Create Presale</el-button>
                </router-link>
                <router-link to="/create-token-sale?saleType=1">
                    <el-button type="primary" class="JumpBtn">Create Fair Sale</el-button>
                </router-link>
                <router-link to="/create-private-sale?saleType=2">
                    <el-button type="primary" class="JumpBtn">Create Private Sale</el-button>
                </router-link>
            </div>
        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.all-launchpads {
    width: 100%;
    padding: 0 15%;

    .input-with-select .el-input-group__prepend {
        background-color: var(--el-fill-color-blank);
    }

    .launchpads-ul {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }

    .tokenTable {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;

        .JumpBtn {
            margin-top: 20px;
            margin-left: 20px;
        }
    }
}

.el-row {
    margin-bottom: 5px;
}
</style>
