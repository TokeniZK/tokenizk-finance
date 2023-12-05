<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
// @ 这个配置项 只做 联想提示
import HeaderNavigation from '@/components/headerNavigation.vue'
import Foot from '@/components/footer.vue';
import Home from '@/views/Home.vue';
</script>

<template>
  <el-col :span="24">

    <el-row>
      <el-col>
        <HeaderNavigation />
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <Home />
        <RouterView />
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <Foot />
      </el-col>
    </el-row>

  </el-col>
</template>

<style lang="less" scoped></style>
