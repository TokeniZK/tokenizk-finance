<script setup lang="ts">
import { useStatusStore } from "@/stores";
import { onMounted, ref } from "vue";
import useClientUtils from "./utils/useClientUtils";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { CHANNEL_MINA, WalletEventType, type WalletEvent, type ChainInfoArgs } from "./common";
import { ElMessage } from "element-plus";

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const supportStatus = ref("supported");

// init wallet listening
const chan = new BroadcastChannel(CHANNEL_MINA);
(window as any)?.mina?.on("accountsChanged", async (accounts: string[]) => {
    console.log('App - connected account change: ', accounts);

    if (accounts.length === 0) {
        chan.postMessage({
            eventType: WalletEventType.ACCOUNTS_CHANGED,
            connectedAddress: undefined,
        } as WalletEvent);

        setConnectedWallet(null);
    } else {
        chan.postMessage({
            eventType: WalletEventType.ACCOUNTS_CHANGED,
            connectedAddress: accounts[0],
        } as WalletEvent);
        setConnectedWallet(accounts[0]);
    }
});

window.mina?.on('chainChanged', (chainInfo: ChainInfoArgs) => {
    console.log('App - current chain info: ', chainInfo);
    if (chainInfo.name !== appState.minaNetwork) {
        setConnectedWallet(null);

        chan.postMessage({
            eventType: WalletEventType.NETWORK_INCORRECT,
        } as WalletEvent);

        ElMessage({
            showClose: true,
            message: `Please switch to the correct network (${appState.minaNetwork}) first.`,
        })
    }
});

onMounted(async () => {
    const { getSupportStatus } = useClientUtils();
    const support = await getSupportStatus();
    console.log('support status:', support);
    supportStatus.value = support;

    console.log('runtimeConfig: ', import.meta.env);

    if (supportStatus.value !== 'supported') {
        return;
    }

    // init appState
    appState.connectedWallet58 = null;
    appState.minaNetwork = import.meta.env.VITE_MINA_NETWORK;
    appState.explorerUrl = import.meta.env.VITE_EXPLORER_TX_URL;
    appState.tokeniZkFactoryAddress = import.meta.VITE_TOKENIZK_FACTORY_ADDR;

    // init web workers
    await createRemoteCircuitController();

});


</script>

<template>
    <el-row class="row-bg" v-if="supportStatus === 'supported'">
        <el-col :span="24">

            <el-row>

                <!-- 一级路由出口组件 -->
                <RouterView />

            </el-row>

        </el-col>
    </el-row>

    <div v-else
        style="display: flex;justify-content: center;align-items: center;height: 100vh;width: 100%;font-size: 20px;font-weight: 600;">
        Your device or browser is not supported, reason: {{ supportStatus }}
    </div>

    <el-dialog v-model="appState.mask.show" width="30%" :close-on-click-modal="appState.mask.closable"
        :close-on-press-escape="false" :show-close="false" class="dialog-box">
        <span style="font-size: 16px;  text-align: center;">{{ appState.mask.loadingText }}</span>
        <a :href="appState.mask.loadingLink" v-if="appState.mask.loadingLink" class="urlLink" target="_blank">{{ appState.mask.loadingLink }}</a>
    </el-dialog>
</template>
<style lang="less">
.subMenuSecondaryMenu {
    border: none !important;

    .el-menu {
        // 修改二级菜单整个背景颜色
        background-color: #fff;
        width: 200px;
        padding: 0;
        border-radius: 10px;

        // 二级菜单中的子选项
        .el-menu-item {
            background-color: transparent !important;
            color: #000 !important;
            font-weight: 400;
            width: 100%;
            font-size: 14px;
            text-align: center;
            border-radius: 10px;

            // 被选择的子选项
            &:not(.is-disabled):hover {
                color: #00c798 !important;
                background-color: #E6FFF9 !important;
                width: 100%;
                text-align: center;
            }

        }

        .el-menu-item.is-active {
            color: #00FFC2 !important;
            background-color: #E6FFF9 !important;
            width: 100%;
            text-align: center;
        }
    }

    // 弹出的二级菜单
    .el-menu--popup {
        min-width: 104px !important;
        min-height: 112px !important;
    }
}

.dialog-box {
    border-radius: 25px !important;
    text-align: center;
    font-size: 16px;
    overflow-wrap: break-word;

    .urlLink {
        cursor: pointer;
        color: #00c798;
    }
}

.el-dialog__body {
    padding-top: 10px;
}
</style>
