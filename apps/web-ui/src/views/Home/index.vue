<script  setup lang="ts">
import Banner from './components/banner.vue';
import MainFunctionIntroduction from './components/mainFunctionIntroduction.vue';
</script>

<template>
  <el-row class="home-container">
   

    <el-col :span="24">

      <Banner />

      <MainFunctionIntroduction />

    </el-col>
     我是Home页面
  </el-row>
</template>

<style lang="less" scoped>
.home-container {
  width: 100%;
  background-color: #f7f7f7;
}
</style>