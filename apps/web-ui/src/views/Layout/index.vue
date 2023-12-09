<script  setup lang="ts">
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutFooter from './components/LayoutFooter.vue'
</script>

<template>
  我是首页
  <LayoutHeader />

  <!-- 二级路由出口 -->
  <RouterView />

  <LayoutFooter />
</template>

