<script lang="ts" setup>
import { onMounted } from 'vue'
import { useStatusStore, type AppState } from "@/stores";
import { ElMessage } from 'element-plus';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const checkConnectedWallet = () => {
    ElMessage({
        showClose: true,
        type: 'warning',
        message: `Please connect wallet first.`,
    });

}

// 组件挂载完成后执行的函数
onMounted(() => {

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})

</script>

<template>
    <el-row class="pre-Sales">
        <el-col :span="24">

            <el-row class="row-bg" justify="center">
                <el-col :span="18">
                    <h1>Current Presales</h1>
                </el-col>
            </el-row>

            <el-row style="margin:50px auto;" justify="center">

                <el-col :span="8"></el-col>

                <el-col :span="6">
                    <router-link to="/pre-sales" class="bline">All launchpads</router-link>
                </el-col>

                <el-col :span="6">
                    <router-link to="/pre-sales/my-contributions" class="bline"
                        v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">My
                        Contributions</router-link>
                    <div v-else @click="checkConnectedWallet">
                        <span>My Contributions</span>
                    </div>
                </el-col>

                <el-col :span="4"></el-col>

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
.pre-Sales {
    width: 100%;
    padding-top: 120px;

    .bline:hover {
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
