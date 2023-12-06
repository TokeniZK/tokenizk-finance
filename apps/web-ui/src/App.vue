<script setup lang="ts">
import HeaderNavigation from '@/components/headerNavigation.vue'
import Foot from '@/components/footer.vue';
</script>

<template>
  <el-col>

    <HeaderNavigation />

    <!-- 一级路由出口组件 -->
    <RouterView />

    <Foot />

  </el-col>
</template>

<style lang="less" scoped></style>
