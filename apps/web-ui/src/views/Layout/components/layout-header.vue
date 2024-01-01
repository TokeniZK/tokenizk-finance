<script lang="ts" setup>
import { useStatusStore } from "@/stores";
import { omitAddress } from "@/utils";
import { ElMessage } from 'element-plus'
import { ref } from "vue";

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const connectWallet = async () => {
  console.log('connect wallet...');
  if (!window.mina) {
    ElMessage({
      showClose: true,
      message: 'Please install auro wallet browser extension first.',
    })
    return;
  }

  try {
    const currentNetwork = await window.mina.requestNetwork();
    if (appState.minaNetwork !== currentNetwork.name) {
      ElMessage({
        showClose: true,
        message: `Please switch to the correct network (${appState.minaNetwork}) first.`,
      })
      return;
    }

    let accounts = await window.mina.requestAccounts();
    setConnectedWallet(accounts[0]);
  } catch (err: any) {
    // if user reject, requestAccounts will throw an error with code and message filed
    console.error(err);
    ElMessage({
      showClose: true,
      message: `Please switch to the correct network (${err.message}) first.`,
    })
  }
};

const disconnect = async () => {
  setConnectedWallet(null);
}

</script>


<template>
  <el-row class="LayoutHeader">
    <el-col :span="24">

      <el-menu :default-active="activeIndex" class="el-menu-demo LayoutHeader" mode="horizontal" :ellipsis="false"
        @select="handleSelect">

        <el-menu-item index="0">
          <RouterLink class="logo" to="/" alt="Element logo" />
        </el-menu-item>

        <div class="flex-grow" />

        <el-menu-item index="1" class="header-category">
          <router-link to="/">Home </router-link>
        </el-menu-item>

        <el-sub-menu index="2" class="header-category">

          <template #title>
            <i class="iconfont icon-fire"></i>
            <span class="header-category">Hot Sales</span>
          </template>

          <router-link to="/pre-sales">
            <el-menu-item index="2-1">
              Presales
            </el-menu-item>
          </router-link>

          <router-link to="/private-sales">
            <el-menu-item index="2-2">
              Private Sales
            </el-menu-item>
          </router-link>

        </el-sub-menu>

        <el-menu-item index="3" class="header-category">
          <router-link to="/airdrop-list">Airdrop</router-link>
        </el-menu-item>

        <el-sub-menu index="4">

          <template #title>
            <span class="header-category">Boot</span>
          </template>

          <router-link to="/create-zk-token">
            <el-menu-item index="4-1">
              Create zkToken
            </el-menu-item>
          </router-link>

          <router-link to="/create-fair-launch">
            <el-menu-item index="4-2">
              Create Fair Launch
            </el-menu-item>
          </router-link>

          <router-link to="/create-normal-launch">
            <el-menu-item index="4-3">
              Create Normal Launch
            </el-menu-item>
          </router-link>

          <router-link to="/create-private-sale">
            <el-menu-item index="4-4">
              Create Private Sale
            </el-menu-item>
          </router-link>

          <router-link to="/create-new-airdrop">
            <el-menu-item index="4-5">
              Create Airdrop
            </el-menu-item>
          </router-link>

          <router-link to="/create-lock">
            <el-menu-item index="4-6">
              Create Lock
            </el-menu-item>
          </router-link>

          <router-link to="/create-zk-nft">
            <el-menu-item index="4-7">
              Create zkNFT
            </el-menu-item>
          </router-link>

        </el-sub-menu>

        <el-menu-item index="5" class="header-category">
          <router-link to="/wallet">Wallet</router-link>
        </el-menu-item>

        <el-sub-menu index="6">
          <template #title>
            <span class="header-category">About</span>
          </template>

          <router-link to="/services">
            <el-menu-item index="6-1">
              Services
            </el-menu-item>
          </router-link>

          <router-link to="/team">
            <el-menu-item index="6-2">
              team
            </el-menu-item>
          </router-link>

          <router-link to="/faq">
            <el-menu-item index="6-3">
              FAQ
            </el-menu-item>
          </router-link>

        </el-sub-menu>

        <el-sub-menu index="7">

          <template #title>
            <el-badge :value="12" class="item">
              <el-icon class="header-category">
                <Bell />
              </el-icon>
            </el-badge>
          </template>

          <router-link to="/comments">
            <el-menu-item index="7-1">
              <el-badge :value="21" class="item">
                Comments and @
              </el-badge>
            </el-menu-item>
          </router-link>

          <router-link to="/add-fans">
            <el-menu-item index="7-2">
              <el-badge :value="6" class="item">
                Add Fans
              </el-badge>
            </el-menu-item>
          </router-link>

          <router-link to="/praise-and-collection">
            <el-menu-item index="7-3">
              <el-badge :value="4" class="item">
                Praise and Collection
              </el-badge>
            </el-menu-item>
          </router-link>

          <router-link to="/private-message">
            <el-menu-item index="7-4">
              <el-badge :value="3" class="item">
                Private Message
              </el-badge>
            </el-menu-item>
          </router-link>

          <router-link to="/system-notifications">
            <el-menu-item index="7-5">
              <el-badge :value="9" class="item">
                System Notifications
              </el-badge>
            </el-menu-item>
          </router-link>

          <router-link to="/message-settings">
            <el-menu-item index="7-6">
              <el-badge :value="14" class="item">
                Message Settings
              </el-badge>
            </el-menu-item>
          </router-link>

        </el-sub-menu>

        <el-menu-item index="8">
          <el-row class="mb-4">
            <div v-if="appState.connectedWallet58 == null">
              <el-button type="success" class="ConnectBtn" @click="connectWallet">Connect</el-button>
            </div>
            <div v-if="appState.connectedWallet58 != null">
              <el-dropdown>
                <span class="el-dropdown-link">
                  {{ omitAddress(appState.connectedWallet58) }}
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button @click="disconnect">Disconnect</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-row>
        </el-menu-item>

      </el-menu>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.el-menu-demo {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 80px;
  color: #fff;
  background-color: #000;

  .header-category {
    color: #fff;
    font-size: 16px;
  }

  .header-category:hover {
    color: #fff;
    color: #00FFC2;
  }

  .icon-fire {
    color: #F2B535;
    margin-right: 8px;
  }


  .logo {
    width: 200px;
    height: 80px;
    background: url("/src/assets/logo.svg") no-repeat right 2px;
    background-size: 200px 70px;
  }

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
    font-size: 16px;
    background-color: #00FFC2;
  }
}
</style>
