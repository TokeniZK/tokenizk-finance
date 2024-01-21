<script lang="ts" setup >
import { ref, onMounted, reactive, computed, type ComputedRef, onUpdated } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { type AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { syncLatestBlock } from '@/utils/txUtils';

type AirdropDtoExtend = AirdropDto & { airdropStartTimeStamp: number, projectStatus: string }

const props = defineProps<{
    airdropDto: AirdropDtoExtend
}>()

const airdropDtoRef: AirdropDtoExtend = JSON.parse(JSON.stringify(props.airdropDto));

const type = 0;
const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {
});

onUpdated(() => {
    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
});

const toDetailPage = `/airdrop-datails?airdropAddress=${airdropDtoRef.airdropAddress}&tokenAddress=${airdropDtoRef.tokenAddress}`;
</script>


<template>
    <div class="airdrop-box">

        <!-- photo -->
        <el-row class="thumb">
            <router-link :to="toDetailPage">
                <el-image style="width: 349px; height: 130px;" :src="airdropDtoRef.logoUrl" :alt="airdropDtoRef.airdropName"
                    loading="lazy" />
            </router-link>
        </el-row>

        <!-- 项目描述 -->
        <el-row class="launchpads-content">

            <el-col :span="24">

                <el-row class="row-bg" justify="space-between">
                    <el-col :span="17">
                        <h4> <router-link :to="toDetailPage">{{ airdropDtoRef.airdropName }}</router-link></h4>
                    </el-col>
                    <el-col :span="6">
                        <el-row justify="end" v-if="airdropDtoRef.startTimestamp > Date.now()">
                            <el-button type="warning" round class="statusColor" plain size="small">Upcoming</el-button>
                        </el-row>
                        <el-row justify="end" v-else>
                            <el-button type="primary" round class="statusColor" plain size="small">Ongoing</el-button>
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg teamName" justify="space-between" style="align-items: center;">
                    <el-col class="text" :span="15">
                        by <a :href="airdropDtoRef.website" target="_blank">{{ airdropDtoRef.teamName }}</a>
                    </el-col>

                    <el-col class="likes" :span="8">
                        <el-rate v-model="airdropDtoRef.star" size="large" />
                    </el-col>
                </el-row>


                <el-row class="row-bg" justify="space-between">
                    <el-col :span="6">
                        <el-row>Token :</el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            {{ airdropDtoRef.tokenSymbol }}
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between">
                    <el-col :span="12">
                        <el-row> Total Supply :</el-row>
                    </el-col>
                    <el-col :span="12">
                        <el-row justify="end">
                            {{ airdropDtoRef.totalAirdropSupply }}
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between"
                    v-if="airdropDtoRef.startTimestamp - Date.now() >= 10 * 1000">

                    <el-col :span="6">
                        <el-row>Begin in :</el-row>
                    </el-col>

                    <el-col :span="17">
                        <el-row justify="end">
                            <el-countdown format="DD [days] HH:mm:ss" :value="airdropDtoRef.startTimestamp"
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
.airdrop-box {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 15px;

    .thumb {
        width: 349px;
        height: 130px;
        overflow: hidden;
        border-radius: 15px 15px 0 0;
    }

    .launchpads-content {
        width: 100%;
        padding: 15px 20px 10px;

        .statusColor {
            border: 0;
        }

        .statusColor:hover {
            cursor: default;
        }

        .NStatus {
            align-items: center;
        }

        .el-row {
            margin-bottom: 5px;
        }

    }

}
</style>
