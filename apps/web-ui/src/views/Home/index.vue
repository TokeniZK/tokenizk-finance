<script  setup lang="ts">
import { onMounted } from 'vue'
import HomeBanner from './components/homeBanner.vue'
import HomeMainFunctionIntroduction from './components/homeMainFunctionIntroduction.vue'
import HomeOngoingPresales from './components/homeOngoingPresales.vue'
import HomeAirdropItems from './components/homeAirdropItems.vue'

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
  <el-row class="home-container">


    <el-col :span="24">

      <HomeBanner />

      <HomeMainFunctionIntroduction />

      <HomeOngoingPresales />

      <HomeAirdropItems />

    </el-col>

    <!-- 我是Home页面 -->

  </el-row>
</template>

<style lang="less" scoped>
.home-container {
  width: 100%;
  background-color: #f7f7f7;
}
</style>