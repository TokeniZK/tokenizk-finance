<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HeaderNavigation from './components/headerNavigation.vue'
import Footer from './components/footer.vue';
</script>

<template>
  <div class="common-layout">

    <el-container>

      <el-header>
        <HeaderNavigation />
      </el-header>

      <el-main>Main</el-main>

      <el-footer>
        <Footer />
      </el-footer>

    </el-container>

  </div>

  <RouterView />
</template>

<style lang="less" scoped>
el-header {
  width: 100%;
}

el-main {
  width: 100%;
  height: 3000px;
}

el-footer {
  width: 100%;
}
</style>
