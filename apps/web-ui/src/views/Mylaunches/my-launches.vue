<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useStatusStore, type AppState } from "@/stores";
import { ElMessage } from 'element-plus';
import { CHANNEL_MINA, WalletEventType, type WalletEvent } from '@/common';
import message from 'element-plus/es/components/message/index.mjs';
import { disconnect } from 'process';
import { useRouter } from 'vue-router';

let isASelected = ref(true)
let isBSelected = ref(false)
let isCSelected = ref(false)

const handleAClick = () => {
    isASelected.value = true;
    isBSelected.value = false;
    isCSelected.value = false;
}

const handleBClick = () => {
    isASelected.value = false;
    isBSelected.value = true;
    isCSelected.value = false;
}

const handleCClick = () => {
    isASelected.value = false;
    isBSelected.value = false;
    isCSelected.value = true;
}



const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const checkConnectedWallet = () => {
    if (!(appState.connectedWallet58 != '' && appState.connectedWallet58 != null)) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

    }
}

const router = useRouter();
watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (!appState.connectedWallet58) {
        router.replace('/');
    }
})

// 组件挂载完成后执行的函数
onMounted(() => {

    checkConnectedWallet();

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})

</script>


<template>
    <el-row class="myLaunches">
        <el-col :span="24">

            <el-row class="row-bg" justify="center">
                <el-col :span="18">
                    <h1>My Launches</h1>
                </el-col>
            </el-row>

            <el-row style="margin:50px auto;" justify="center">

                <el-col :span="6"></el-col>

                <el-col :span="6">
                    <router-link to="/my-launches" :class="{ 'activeMenu': isASelected }" @click="handleAClick"
                        v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">Tokens</router-link>

                    <div v-else @click="checkConnectedWallet">
                        <span>Tokens</span>
                    </div>
                </el-col>

                <el-col :span="6">
                    <router-link to="/my-launches/sales" :class="{ 'activeMenu': isBSelected }" @click="handleBClick"
                        v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">Sales</router-link>

                    <div v-else @click="checkConnectedWallet">
                        <span>Sales</span>
                    </div>
                </el-col>

                <el-col :span="6">
                    <router-link to="/my-launches/airdrops" :class="{ 'activeMenu': isCSelected }" @click="handleCClick"
                        v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">Airdrops</router-link>

                    <div v-else @click="checkConnectedWallet">
                        <span>Airdrops</span>
                    </div>
                </el-col>

            </el-row>

            <!-- 三级路由出口组件 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="24">

                    <router-view />

                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.myLaunches {
    width: 100%;
    padding-top: 120px;

    .activeMenu {
        border-bottom: 2px solid #00FFC2;
    }

}

.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
</style>
