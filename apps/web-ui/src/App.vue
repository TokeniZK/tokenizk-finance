<script setup lang="ts">
import HeaderNavigation from '@/components/headerNavigation.vue'
import Foot from '@/components/footer.vue';
</script>

<template>
  <el-row>
    <el-col :span="24">

      <!-- <el-row>
        <HeaderNavigation />
      </el-row> -->

      <el-row>
        
        <!-- 一级路由出口组件 -->
        <RouterView />

      </el-row>

      <!-- <el-row>
        <Foot />
      </el-row> -->

    </el-col>
  </el-row>
</template>

<style lang="less" scoped></style>