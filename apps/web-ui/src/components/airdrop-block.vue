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
                    <el-col :span="24">
                        <h3> <router-link :to="toDetailPage">{{ airdropDtoRef.airdropName }}</router-link></h3>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between" style="margin-top: 15px;">
                    <el-col :span="6">Token :</el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            {{ airdropDtoRef.tokenSymbol }}
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between"
                    v-if="airdropDtoRef.startTimestamp - Date.now() >= 10 * 1000">
                    <el-col :span="6">
                        <el-row style="padding-top: 8px;">Begin in :</el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            <el-countdown format="DD [days] HH:mm:ss" :value="airdropDtoRef.startTimestamp"
                                value-style="font-size: 14px;">
                            </el-countdown>
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="space-between" v-else>
                    <el-col :span="6">
                        <el-row style="padding-top: 8px;"></el-row>
                    </el-col>
                    <el-col :span="17">
                        <el-row justify="end">
                            <el-button type="primary" round class="statusColor">Ongoing</el-button>
                        </el-row>
                    </el-col>
                </el-row>

                <el-row class="row-bg" justify="end">
                    <router-link to="toDetailPage">
                        <el-button type="primary" round> View Airdrop</el-button>
                    </router-link>
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
        padding-left: 20px;
        padding-right: 20px;

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
    margin-bottom: 6px;
}
</style>
