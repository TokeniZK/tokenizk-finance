<script lang="ts" setup>
import { CHANNEL_MINA, WalletEventType, type WalletEvent } from "@/common";
import { useStatusStore } from "@/stores";
import { omitAddress } from "@/utils";
import { ElMessage } from 'element-plus'
import { onUpdated, ref, onMounted } from "vue";
import { generateTokenKey } from '@/utils/keys-gen';
import { queryToken } from "@/apis/token-api";

const chan = new BroadcastChannel(CHANNEL_MINA);
const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const activeIndex = ref('')
// const handleMenuSelect = (key: string, keyPath: string[]) => {
//     console.log(key, keyPath)
// }

// 当用户选择一个菜单项时  
const handleMenuSelect = (index: string) => {
    activeIndex.value = index; // 更新当前激活的菜单项  
    localStorage.setItem('currentMenuItem', index); // 存储到 localStorage  
};

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

        // gen token
        const { privateKey: tokenKey, publicKey: tokenAddress0 } = await generateTokenKey();
        console.log(`tokenKey: ${tokenKey.toBase58()}, tokenAddress: ${tokenAddress0.toBase58()}`)
        appState.tokeniZkBasicTokenKeyPair!.key = tokenKey.toBase58();
        appState.tokeniZkBasicTokenKeyPair!.value = tokenAddress0.toBase58();

        setConnectedWallet(accounts[0]);
        chan.postMessage({
            eventType: WalletEventType.CONNECT,
            connectedAddress: accounts[0],
        } as WalletEvent);
    } catch (err: any) {
        // if user reject, requestAccounts will throw an error with code and message filed
        console.error(err);
        ElMessage({
            showClose: true,
            message: `${err.message}`,
        })
    }
};

const disconnect = async () => {
    setConnectedWallet(null);
    // window.mina.emitAccountsChanged([]);
    chan.postMessage({
        eventType: WalletEventType.DISCONNECT,
        connectedAddress: undefined,
    } as WalletEvent);
}

// 在组件加载时，从 localStorage 获取并设置激活的菜单项  
onMounted(() => {
    const savedIndex = localStorage.getItem('currentMenuItem');
    if (savedIndex) {
        activeIndex.value = savedIndex;
    }
});


</script>


<template>
    <el-row class="LayoutHeader">
        <el-col :span="24">

            <el-menu :default-active="activeIndex" class="el-menu-demo LayoutHeader" mode="horizontal" :ellipsis="false"
                @select="handleMenuSelect" background-color="#000" active-text-color="#00FFC2">

                <el-menu-item>
                    <RouterLink class="logo" to="/" alt="Element logo" />
                </el-menu-item>

                <div class="flex-grow" />


                <el-menu-item index="1" class="header-category">
                    <router-link to="/">Home</router-link>
                </el-menu-item>

                <el-sub-menu index="2" text-color="#fff" popper-class="subMenuSecondaryMenu">

                    <template #title>
                        <i class="iconfont icon-fire2"></i>
                        <span class="header-title">Hot Sales</span>
                    </template>

                    <router-link to="/sales?saleType=0">
                        <el-menu-item index="2-1">
                            PreSales
                        </el-menu-item>
                    </router-link>

                    <router-link to="/sales?saleType=1">
                        <el-menu-item index="2-2">
                            Fair Sales
                        </el-menu-item>
                    </router-link>

                    <router-link to="/sales?saleType=2">
                        <el-menu-item index="2-3">
                            Private Sales
                        </el-menu-item>
                    </router-link>

                </el-sub-menu>


                <el-menu-item index="3" class="header-category">
                    <router-link to="/airdrop-list">Airdrop</router-link>
                </el-menu-item>

                <el-sub-menu index="4" class="header-title" popper-class="subMenuSecondaryMenu">

                    <template #title>
                        <span class="header-title">Boot</span>
                    </template>

                    <router-link to="/create-zk-token">
                        <el-menu-item index="4-1">
                            Create zkToken
                        </el-menu-item>
                    </router-link>

                    <router-link to="/create-token-sale?saleType=0">
                        <el-menu-item index="4-3">
                            Create PreSales
                        </el-menu-item>
                    </router-link>

                    <router-link to="/create-token-sale?saleType=1">
                        <el-menu-item index="4-2">
                            Create Fair Sale
                        </el-menu-item>
                    </router-link>

                    <router-link to="/create-private-sale?saleType=2">
                        <el-menu-item index="4-4">
                            Create Private Sale
                        </el-menu-item>
                    </router-link>

                    <router-link to="/create-new-airdrop">
                        <el-menu-item index="4-5">
                            Create Airdrop
                        </el-menu-item>
                    </router-link>

                    <!-- 
                    <router-link to="/create-lock">
                        <el-menu-item index="4-6">
                            Create Lock
                        </el-menu-item>
                    </router-link>

                    <router-link to="/create-zk-nft">
                        <el-menu-item index="4-7">
                            Create zkNFT
                        </el-menu-item>
                    </router-link>-->

                </el-sub-menu>


                <el-menu-item index="5" class="header-category">
                    <router-link to="/wallet"> Wallet</router-link>
                </el-menu-item>


                <!-- 
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

                </el-sub-menu>-->


                <el-menu-item>
                    <el-row class="mb-4">

                        <div v-if="appState.connectedWallet58 == null" style="padding-top: 2px;">
                            <el-button type="success" class="ConnectBtn" @click="connectWallet">Connect</el-button>
                        </div>

                        <div v-else class="el-dropdown-link">

                            <el-dropdown>

                                <span class="address--left">
                                    {{ omitAddress(appState.connectedWallet58) }}
                                    <el-icon class="el-icon--right" size="14px">
                                        <arrow-down />
                                    </el-icon>
                                </span>

                                <template #dropdown>

                                    <el-dropdown-menu style="width: 180px;">

                                        <el-dropdown-item @click="disconnect">
                                            Disconnect
                                        </el-dropdown-item>

                                        <router-link to="/my-launches">
                                            <el-dropdown-item>
                                                my launches
                                            </el-dropdown-item>
                                        </router-link>

                                        <!-- <el-dropdown-item>
                                            <el-button @click="disconnect">Disconnect</el-button>
                                        </el-dropdown-item>

                                        <router-link to="/my-launches">
                                            <el-dropdown-item>
                                                <el-button>my launches</el-button>
                                            </el-dropdown-item>
                                        </router-link> -->

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
    height: 70px;
    color: #fff;
    background-color: #000;

    .logo {
        width: 200px;
        height: 70px;
        background: url("/src/assets/logo.svg") no-repeat right 2px;
        background-size: 200px 70px;
    }

    .item {
        margin-top: 10px;
        margin-right: 40px;
    }

    .el-dropdown {
        margin-top: 13px;
    }

    .flex-grow {
        flex-grow: 1;
    }

    .header-category {
        color: #fff;
        font-size: 16px;
        margin-right: 20px;
        // padding-top: 20px;
    }

    .header-category:hover {
        color: #00FFC2;
    }

    .header-title {
        font-size: 16px;
        color: #fff;
    }

    .header-title:hover {
        color: #00FFC2;
    }

    .icon-fire2 {
        color: #F2B535;
        margin-right: 8px;
    }

    .subMenu-item {
        background-color: #fff;
    }

    .ConnectBtn {
        font-size: 16px;
        background-color: #00FFC2;
    }

    .address--left {
        padding-top: 10px;
        padding-left: 10px;
        font-size: 16px;
        color: #00FFC2;
    }

    .el-icon--right {
        color: #00FFC2;
    }

}
</style>
