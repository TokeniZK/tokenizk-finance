<script setup lang="ts">
</script>

<template>
  <el-row>
    <el-col :span="24">

      <el-row>

        <!-- 一级路由出口组件 -->
        <RouterView />

      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped></style>