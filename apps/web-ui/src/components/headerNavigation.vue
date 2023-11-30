<template>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false" @select="handleSelect">
    <el-menu-item index="0">
      <img style="width: 100px" src="../assets/logo.svg" alt="Element logo" />
    </el-menu-item>
    <div class="flex-grow" />

    <el-menu-item index="1">
      <router-link to="/home">Home</router-link>
    </el-menu-item>

    <el-sub-menu index="2">
      <template #title>Hot Sales</template>
      <el-menu-item index="2-1">
        <router-link to="/pre-Sales">Presales</router-link>
      </el-menu-item>
      <el-menu-item index="2-2">
        <router-link to="/private-Sales">Private Sales</router-link>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="3">
      <router-link to="/airdrop-list">Airdrop</router-link>
    </el-menu-item>

    <el-sub-menu index="4">
      <template #title>Boot</template>
      <el-menu-item index="2-1">
        <router-link to="/create-ZkToken">Create zkToken</router-link>
      </el-menu-item>
      <el-menu-item index="2-2">
        <router-link to="/create-Fair-Launch">Create Fair Launch</router-link>
      </el-menu-item>
      <el-menu-item index="2-3">
        <router-link to="/create-Normal-Launch">Create Normal Launch</router-link>
      </el-menu-item>
      <el-menu-item index="2-4">
        <router-link to="/create-Private-Sale">Create Private Sale</router-link>
      </el-menu-item>
      <el-menu-item index="2-5">
        <router-link to="/create-Airdrop">Create Airdrop</router-link>
      </el-menu-item>
      <el-menu-item index="2-6">
        <router-link to="/create-Lock"> Create Lock</router-link>
      </el-menu-item>
      <el-menu-item index="2-7">
        <router-link to="/create-zkNFT"> Create zkNFT</router-link>
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="5">
      <template #title>About</template>
      <el-menu-item index="2-1">
        <router-link to="/services">Services</router-link>

      </el-menu-item>
      <el-menu-item index="2-2">
        <router-link to="/team">Team</router-link>

      </el-menu-item>
      <el-menu-item index="2-3">
        <router-link to="/faq">FAQ</router-link>
      </el-menu-item>
    </el-sub-menu>

    <el-sub-menu index="6">
      <template #title><el-icon>
          <Bell />
        </el-icon></template>
      <el-menu-item index="2-1">
        <router-link to="/comments">Comments and @</router-link>
      </el-menu-item>
      <el-menu-item index="2-2">
        <router-link to="/add-fans">Add Fans</router-link>
      </el-menu-item>
      <el-menu-item index="2-3">
        <router-link to="/praise-and-collection">Praise and Collection</router-link>
      </el-menu-item>
      <el-menu-item index="2-4">
        <router-link to="/private-message">Private Message</router-link>
      </el-menu-item>
      <el-menu-item index="2-5">
        <router-link to="/system-notifications">System Notifications</router-link>
      </el-menu-item>
      <el-menu-item index="2-6">
        <router-link to="/message-settings">Message Settings</router-link>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="7">
      <el-row class="mb-4">
        <el-button type="success" class="ConnectBtn">Connect</el-button>
      </el-row>
    </el-menu-item>

  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style lang="less" scoped>
.el-menu-demo {

  color: #fff;
  background-color: #000;

  .el-menu-item,
  .is-active {
    color: #fff !important;
  }

  .flex-grow {
    flex-grow: 1;
  }

  .ConnectBtn {
    background-color: #00FFC2;
  }
}
</style>
