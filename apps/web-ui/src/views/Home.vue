<script  setup lang="ts">
import Banner from '@/components/banner.vue';
import MainFunctionIntroduction from '@/components/mainFunctionIntroduction.vue';
</script>

<template>
  <el-col class="home-container">

    <el-row :span="24">
      <el-col :span="24">
        <div class="grid-content ep-bg-purple-dark" />
        <Banner />
      </el-col>
    </el-row>

    <el-row :span="24">
      <el-col :span="24">
        <div class="grid-content ep-bg-purple-dark" />
        <MainFunctionIntroduction />
      </el-col>
    </el-row>

  </el-col>
</template>

<style lang="less" scoped>
.home-container {
  left: 0;
  right: 0;
  margin-left: -32px;
  width: 1960px;
  background-color: #f7f7f7;
  align-content: center;
}
</style>
