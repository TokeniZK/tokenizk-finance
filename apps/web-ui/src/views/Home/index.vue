<script setup lang="ts">
import { onMounted } from 'vue'
import HomeBanner from './components/home-banner.vue'
import HomeMainFunctionIntroduction from './components/home-introduction.vue'
import HomeOngoingPresale from './components/home-presales.vue'
import HomeFairSale from './components/home-fair-sale.vue'
import HomePrivateSale from './components/home-private-sale.vue'
import HomeAirdropItem from './components/home-airdrop-items.vue'

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

      <HomeOngoingPresale />

      <HomeFairSale />

      <HomePrivateSale />

      <HomeAirdropItem />

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