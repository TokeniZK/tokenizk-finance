<script lang="ts" setup>
import { ref, onMounted, reactive, computed, type ComputedRef } from 'vue'
import { type SaleDto, type SaleReq } from '@tokenizk/types'
import SaleBlock from '../../../components/sale-block.vue'
import { useRoute, useRouter } from 'vue-router';
import { querySale } from '@/apis/sale-api';
import { CircuitControllerState, useStatusStore } from '@/stores';
import { syncLatestBlock } from '@/utils/txUtils';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

let saleType = 2;

type SaleDtoExtend = SaleDto & { projectStatus: string, progressBarStatus: string, progressPercent: number }

let fetchResult: SaleDtoExtend[] = [];



// 转换项目的状态
const transformProjectStatus = async (itmes: SaleDtoExtend[]) => {
    /*
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
    */

    const currentTimestamp = Date.now();
    itmes.forEach(item => {
        if (item.startTimestamp > currentTimestamp) {
            item.projectStatus = 'Upcoming'
        } else if (item.startTimestamp <= currentTimestamp && item.endTimestamp > currentTimestamp) {
            item.projectStatus = 'Ongoing'
        } else if (item.endTimestamp < currentTimestamp) {
            item.projectStatus = 'Ended'
        } else {
            item.projectStatus = 'All Status'
        }
    });
}

// 项目进度条
const calcProjectProgress = (itmes: SaleDtoExtend[]) => {
    itmes.forEach(item => {
        item.progressPercent = Number((item.totalContributedMina * 100 / item.hardCap).toFixed(1));
        if (item.progressPercent >= 80) {
            item.progressBarStatus = 'exception'
        } else if (item.progressPercent >= 60) {
            item.progressBarStatus = 'warning'
        } else {
            item.progressBarStatus = 'success'
        }
    });
}


let renderSaleBlock: SaleDtoExtend[] = [];
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const getSearchProjects = async () => {
    const saleReq = {
        saleType,
        saleName: keyWord.value,
        queryBriefInfo: true,
        take: 3
    } as any as SaleReq;

    fetchResult = (await querySale(saleReq)) as SaleDtoExtend[];

    calcProjectProgress(fetchResult);
    // 转换项目状态
    await transformProjectStatus(fetchResult);

    renderSaleBlock = fetchResult;
    presaleProjects.saleList = renderSaleBlock
}


// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {

    getSearchProjects();

})




</script>

<template>
    <el-row class="row-bg private-sales" justify="center">
        <el-col :span="24">

            <!-- 标题+按钮 -->
            <el-row class="row-bg private-sales-content" justify="center">

                <el-col :span="10">
                    <el-row>
                        <h2 class="title"> Hot Private Sales </h2>
                    </el-row>
                    <!-- <el-row>Normal Presale pages work for project team to pre-configure a set of presale rules</el-row> -->
                </el-col>

                <el-col :span="8" class="link">
                    <el-row class="mb-4" justify="end">
                        <router-link to="/sales?saleType=2">
                            <el-button type="primary" size="large" class="main-btn" round>
                                View All Item
                            </el-button>
                        </router-link>
                    </el-row>
                </el-col>

            </el-row>

            <!-- 轮播图 -->
            <el-row class="row-bg private-sales-carousel" justify="space-between">

                <el-col :span="2"></el-col>

                <el-col :span="19" class="ongoingBox">

                    <!-- 每个项目 -->
                    <ul>
                        <li v-for="item in presaleProjects.saleList" :key="item.id" class="launchpadsLi">

                            <SaleBlock :saleDto="item" />

                        </li>
                    </ul>

                </el-col>

                <el-col :span="2"></el-col>

            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.private-sales {
    width: 100%;
    margin-bottom: 100px;
    background-color: #f7f7f7;

    .private-sales-content {
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

                &:hover {
                    color: #00c798;
                }
            }

        }
    }

    .private-sales-carousel {
        overflow: hidden;

        .ongoingBox {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            margin-top: 40px;

            ul {
                width: 100%;
                flex-wrap: wrap;
                display: inline-block;
                display: flex;
                justify-content: space-between;

                .launchpadsLi {
                    display: inline-block;
                }
            }

        }

    }

}
</style>