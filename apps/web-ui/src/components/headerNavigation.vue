<script lang="ts">
import { CaretBottom } from '@element-plus/icons-vue'
</script>

<template>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false" @select="handleSelect">
    <el-menu-item index="0">
      <img style="width: 180px" src="../assets/logo.svg" alt="Element logo" />
    </el-menu-item>
    <div class="flex-grow" />

    <el-menu-item index="1">
      <router-link to="/home">Home</router-link>
    </el-menu-item>

    <el-sub-menu index="2">
      <template #title><el-icon>
          <HotWater />
        </el-icon>
        Hot Sales
      </template>
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
      <template #title>
        <el-badge :value="12" class="item">
          <el-icon>
            <Bell />
          </el-icon>
        </el-badge>
      </template>

      <el-menu-item index="2-1">
        <router-link to="/comments">
          <el-badge :value="21" class="item">
            Comments and @
          </el-badge>
        </router-link>
      </el-menu-item>

      <el-menu-item index="2-2">
        <router-link to="/add-fans">
          <el-badge :value="6" class="item">
            Add Fans
          </el-badge>
        </router-link>
      </el-menu-item>

      <el-menu-item index="2-3">
        <router-link to="/praise-and-collection">
          <el-badge :value="4" class="item">
            Praise and Collection
          </el-badge>
        </router-link>
      </el-menu-item>

      <el-menu-item index="2-4">
        <router-link to="/private-message">
          <el-badge :value="3" class="item">
            Private Message
          </el-badge>
        </router-link>
      </el-menu-item>

      <el-menu-item index="2-5">
        <router-link to="/system-notifications">
          <el-badge :value="9" class="item">
            System Notifications
          </el-badge>
        </router-link>
      </el-menu-item>

      <el-menu-item index="2-6">
        <router-link to="/message-settings">
          <el-badge :value="14" class="item">
            Message Settings
          </el-badge>
        </router-link>
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 80px;
  color: #fff;
  background-color: #000;

  // .el-menu-item {
  //   color: #fff !important;
  // }

  .item {
    margin-top: 10px;
    margin-right: 40px;
  }

  .el-dropdown {
    margin-top: 1.1rem;
  }

  .flex-grow {
    flex-grow: 1;
  }

  .ConnectBtn {
    background-color: #00FFC2;
  }
}
</style>
