<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderNavigation from './components/headerNavigation.vue'
import Footer from './components/footer.vue';
import Banner from './components/banner.vue';
</script>

<template>
  <div class="common-layout">
    <el-container>

      <el-header>
        <HeaderNavigation />
      </el-header>

      <el-main>
        <router-view />
        <Banner />
      </el-main>

      <el-footer>
        <Footer />
      </el-footer>

    </el-container>
  </div>

  <RouterView />
</template>

<style lang="less" scoped></style>
