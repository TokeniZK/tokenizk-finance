<script setup lang="ts">
import { onMounted, ref } from 'vue'

let isASelected = ref(true)
let isBSelected = ref(false)

const handleAClick = () => {
  isASelected.value = true;
  isBSelected.value = false;
}

const handleBClick = () => {
  isASelected.value = false;
  isBSelected.value = true;
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
  <el-row class="row-bg airdrop-list" justify="center">
    <el-col :span="24">

      <el-row class="row-bg" justify="center">
        <el-col :span="18">
          <h1>AirDrop</h1>
        </el-col>
      </el-row>

      <el-row class="row-bg " justify="center">
        <el-col :span="18" class="airdropBoard">
          <el-row class="row-bg" justify="center">
            <el-col :span="8">
              <el-row class="row-bg" justify="center">Airdrop
                Launched</el-row>
              <el-row class="row-bg" justify="center">
                <h3>294</h3>
              </el-row>
            </el-col>

            <el-col :span="8">
              <el-row class="row-bg" justify="center">Participants in
                All-time</el-row>
              <el-row class="row-bg" justify="center">
                <h3>16790</h3>
              </el-row>
            </el-col>
          </el-row>

        </el-col>
      </el-row>


      <el-row style="margin:50px auto;" justify="center">

        <el-col :span="5"></el-col>

        <el-col :span="6">
          <router-link to="/airdrop-list" :class="{ 'activeMenu': isASelected }" @click="handleAClick">All
            Airdrops</router-link>
        </el-col>

        <el-col :span="6">
          <router-link to="/airdrop-list/my-airdrop" :class="{ 'activeMenu': isBSelected }" @click="handleBClick">My
            Airdrops</router-link>
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

  .airdropBoard {
    padding: 20px;
    background-color: #fff;
    border-radius: 30px !important;
    text-align: center;
  }

  .activeMenu {
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
