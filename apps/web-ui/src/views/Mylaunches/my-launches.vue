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
          <router-link to="/my-launches" class="bline"
            v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">Tokens</router-link>

          <div v-else @click="checkConnectedWallet">
            <span>Tokens</span>
          </div>
        </el-col>

        <el-col :span="6">
          <router-link to="/my-launches/sales" class="bline"
            v-if="appState.connectedWallet58 != '' && appState.connectedWallet58 != null">Sales</router-link>

          <div v-else @click="checkConnectedWallet">
            <span>Sales</span>
          </div>
        </el-col>

        <el-col :span="6">
          <router-link to="/my-launches/airdrops" class="bline"
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