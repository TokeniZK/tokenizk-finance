<script  setup lang="ts">
</script>

<template>
  <el-col :span="24">

    我是首页

    <!-- 二级路由出口     -->

    <RouterView />

    <el-row>
      <el-col>
        <Home />
        <RouterView />
      </el-col>
    </el-row>

  </el-col>
</template>

<style lang="less" scoped></style>
