<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
// @ 这个配置项 只做 联想提示
import HeaderNavigation from '@/components/headerNavigation.vue'
import Footer from '@/components/footer.vue';
import Home from '@/views/Home.vue';
</script>

<template>
  <el-col>

    <el-row>
      <el-col>
        <HeaderNavigation />
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="grid-content ep-bg-purple-dark" />
        <Home />
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="grid-content ep-bg-purple-dark" />
        <Footer />
      </el-col>
    </el-row>

  </el-col>

  <RouterView />
</template>

<style lang="less" scoped></style>
