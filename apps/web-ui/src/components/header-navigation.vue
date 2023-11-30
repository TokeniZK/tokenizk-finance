<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <el-menu-item index="0">
      <img style="width: 100px" src="../assets/logo.svg" alt="Element logo" />
    </el-menu-item>
    <div class="flex-grow" />

    <el-menu-item index="1">Home</el-menu-item>

    <el-sub-menu index="2">
      <template #title
        ><el-icon> <Bell /> </el-icon>Hot Sales</template
      >
      <el-menu-item index="2-1">Presales</el-menu-item>
      <el-menu-item index="2-2">Private Sales</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="3">Airdrop</el-menu-item>

    <el-sub-menu index="4">
      <template #title>Boot</template>
      <el-menu-item index="2-1">Create zkToken</el-menu-item>
      <el-menu-item index="2-2">Create Fair Launch</el-menu-item>
      <el-menu-item index="2-3">Create Normal Launch</el-menu-item>
      <el-menu-item index="2-4">Create Private Sale</el-menu-item>
      <el-menu-item index="2-5">Create Airdrop</el-menu-item>
      <el-menu-item index="2-6">Create Lock</el-menu-item>
      <el-menu-item index="2-7">Create zkNFT</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="5">
      <template #title>About</template>
      <el-menu-item index="2-1">Services</el-menu-item>
      <el-menu-item index="2-2">Team</el-menu-item>
      <el-menu-item index="2-3">FAQ</el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="6">
      <template #title></template>
      <el-menu-item index="2-1">Services</el-menu-item>
      <el-menu-item index="2-2">Team</el-menu-item>
      <el-menu-item index="2-3">FAQ</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.flex-grow {
  flex-grow: 1;
}
</style>
