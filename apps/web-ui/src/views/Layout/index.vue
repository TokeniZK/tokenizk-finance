<script  setup lang="ts">
import LayoutHeader from './components/layout-header.vue'
import LayoutFooter from './components/layout-footer.vue'
</script>

<template>
  <el-row>
    <el-col :span="24">
      <!-- 我是首页 -->
      <LayoutHeader />

      <!-- 二级路由出口 -->
      <RouterView />

      <LayoutFooter />
    </el-col>
  </el-row>
</template>

