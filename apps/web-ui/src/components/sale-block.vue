<script lang="ts" setup >
import { onMounted, onUpdated } from 'vue'
import { type SaleDto } from '@tokenizk/types'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { syncLatestBlock } from '@/utils/txUtils';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

type SaleDtoExtend = SaleDto & { saleStartTimeStamp: number, saleEndTimeStamp: number, projectStatus: string, progressBarStatus: string, progressPercent: number }
const props = defineProps<{
    saleDto: SaleDtoExtend
}>()

const saleDtoRef: SaleDtoExtend = props.saleDto;

onMounted(async () => {
});

onUpdated(() => {
    console.log('saleDtoRef: ' + JSON.stringify(saleDtoRef));
    // calcProjectProgress([saleDtoRef]);

    // 转换项目状态
    // transformProjectStatus([saleDtoRef]);

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
});

const toDetailPage = `/sale-datails?saleAddress=${saleDtoRef.saleAddress}&tokenAddress=${saleDtoRef.tokenAddress}`;

</script>

<template>
    <div class="launchpads-box">

        <!-- photo -->
        <el-row class="thumb">
            <router-link :to='toDetailPage'>
                <el-image class="salePhoto" :src="saleDtoRef.logoUrl" :alt="saleDtoRef.saleName" loading="lazy" />
            </router-link>
        </el-row>

        <!-- 项目描述 -->
        <el-row class="launchpads-content">
            <el-col :span="24">

                <el-row class="row-bg NStatus" justify="space-between">
                    <el-col :span="17">
                        <el-row>
                            <h4>{{ saleDtoRef.saleName }}</h4>
                        </el-row>
                    </el-col>

                    <el-col :span="6">
                        <el-row justify="end">
                            <el-button
                                :type="saleDtoRef.projectStatus === 'Ongoing' ? 'primary' : '' || saleDtoRef.projectStatus === 'Upcoming' ? 'warning' : ''"
                                round class="statusColor" plain size="small">{{ saleDtoRef.projectStatus }}</el-button>

                            <!-- <div :type="saleDtoRef.projectStatus === 'Ongoing' ? 'primary' : '' || saleDtoRef.projectStatus === 'Upcoming' ? 'warning' : ''"
                                class="statusColor">{{ saleDtoRef.projectStatus }}</div> -->

                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg teamName" justify="space-between" style="align-items: center;">
                    <el-col class="text" :span="15">
                        by <a :href="saleDtoRef.website" target="_blank">{{ saleDtoRef.teamName }}</a>
                    </el-col>

                    <el-col class="likes" :span="8">
                        <el-rate v-model="saleDtoRef.star" size="large" />
                    </el-col>
                </el-row>

                <el-row class="row-bg soft-hard-cap" justify="space-between">
                    <el-col :span="10">
                        <el-row>
                            Total Supply:
                        </el-row>
                    </el-col>
                    <el-col :span="10">
                        <el-row justify="end">
                            {{ saleDtoRef.totalSaleSupply / 10**9 }} {{ saleDtoRef.tokenSymbol }}
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg soft-hard-cap" justify="space-between" v-if="saleDtoRef.saleType != 1">
                    <el-col :span="11">
                        <el-row>
                            Soft / Hard:
                        </el-row>
                    </el-col>
                    <el-col :span="13">
                        <el-row justify="end">
                            {{ saleDtoRef.softCap / (10 ** 9) }} - {{ saleDtoRef.hardCap / (10 ** 9) }} Mina
                        </el-row>
                    </el-col>
                </el-row>

                <!-- <el-row style="margin-bottom: 6px; margin-top: 6px;">progress</el-row> -->
                <el-row class="Progress demo-progress" style="margin-bottom: 0;" v-if="saleDtoRef.saleType != 1">
                    <el-progress :text-inside="true" :stroke-width="14" :status="saleDtoRef.progressBarStatus"
                        :percentage="saleDtoRef.progressPercent" striped striped-flow :duration="6" />
                </el-row>

                <el-row class="row-bg" justify="space-between">
                    <el-col :span="7">
                        <el-row>Lockup Time: </el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            ({{ saleDtoRef.cliffTime * 3 }} mins,{{ saleDtoRef.cliffAmountRate }}%),
                            ({{ saleDtoRef.vestingIncrement }}%/{{ saleDtoRef.vestingPeriod * 3 }} mins)
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between" v-if="saleDtoRef.startTimestamp > Date.now()">
                    <el-col :span="7">
                        <el-row style="padding-top: 8px;">Sale Starts In: </el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            <el-countdown format="DD [days] HH:mm:ss" :value="saleDtoRef.startTimestamp"
                                value-style="font-size: 14px;">
                            </el-countdown>
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between" v-else>
                    <el-col :span="7">
                        <el-row style="padding-top: 8px;">Sale Ends In: </el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            <el-countdown format="DD [days] HH:mm:ss" :value="saleDtoRef.endTimestamp"
                                value-style="font-size: 14px;">
                            </el-countdown>
                        </el-row>
                    </el-col>
                </el-row>


            </el-col>
        </el-row>

    </div>
</template>

<style lang="less" scoped>
.launchpads-box {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 15px;

    .thumb {
        width: 349px;
        height: 130px;
        overflow: hidden;
        text-align: center;
        border-radius: 15px 15px 0 0;

        .salePhoto {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
        }
    }

    .launchpads-content {
        width: 100%;
        padding: 12px 20px;

        .statusColor {
            border: 0;
        }

        .statusColor:hover {
            cursor: default;
        }

        .NStatus {
            align-items: center;
        }

        .likes {
            display: flex;
            justify-content: flex-end;
        }

        .demo-progress .el-progress--line {
            margin-bottom: 15px;
            width: 300px;
        }

    }

}


.el-row {
    margin-bottom: 5px;
}

.el-row:last-child {
    margin-bottom: 5px;
}
</style>
