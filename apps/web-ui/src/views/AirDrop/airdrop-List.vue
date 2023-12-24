<script setup lang="ts">
import { onMounted } from 'vue'
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
  <el-row class="row-bg airdrop-list">
    <el-col :span="24">

      <el-row class="row-bg" justify="center">
        <el-col :span="18">
          <h1>AirDrop</h1>
        </el-col>
      </el-row>


      <el-row style="margin:50px auto;" justify="center">

        <el-col :span="5"></el-col>

        <el-col :span="6">
          <router-link to="/airdrop-list" class="bline">All Airdrops</router-link>
        </el-col>

        <el-col :span="6">
          <router-link to="/airdrop-list/my-airdrop" class="bline">My Airdrops</router-link>
        </el-col>

        <el-col :span="6">
          <router-link to="/airdrop-list/created-by-you" class="bline">Created By You</router-link>
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
.airdrop-list {
  width: 100%;
  padding-top: 120px;

  .bline:hover {
    border-bottom: 2px solid #00FFC2;
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
}
</style>
