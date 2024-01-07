<script setup lang="ts">
import { useStatusStore } from "@/stores";
import { onMounted, ref } from "vue";
import useClientUtils from "./utils/useClientUtils";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { CHANNEL_MINA, WalletEventType, type WalletEvent, type ChainInfoArgs } from "./common";

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const supportStatus = ref("supported");
const walletListenerSetted = ref(false);

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
    const minaNetwork = import.meta.env.VITE_MINA_NETWORK;
    const explorerUrl = import.meta.env.VITE_EXPLORER_URL;
    const tokeniZkFactory = import.meta.env.VITE_TOKENIZK_FACTORY_ADDR;

    appState.connectedWallet58 = null;
    appState.minaNetwork = minaNetwork;
    appState.explorerUrl = explorerUrl;
    appState.tokeniZkFactoryAddress = tokeniZkFactory;

    // init web workers
    await createRemoteCircuitController();
    await CircuitControllerState.remoteController?.compileTokeniZkBasicToken();

    // init wallet listening
    if (!walletListenerSetted.value) {
        if (window.mina) {
            const chan = new BroadcastChannel(CHANNEL_MINA);
            window.mina.on('accountsChanged', (accounts: string[]) => {
                console.log('App - connected account change: ', accounts);

                if (accounts.length === 0) {
                    chan.postMessage({
                        eventType: WalletEventType.ACCOUNTS_CHANGED,
                        connectedAddress: undefined,
                    } as WalletEvent);
                } else {
                    chan.postMessage({
                        eventType: WalletEventType.ACCOUNTS_CHANGED,
                        connectedAddress: accounts[0],
                    } as WalletEvent);
                }

            });

            window.mina.on('chainChanged', (chainInfo: ChainInfoArgs) => {
                console.log('App - current chain info: ', chainInfo);
                if (chainInfo.chainId !== appState.minaNetwork) {
                    chan.postMessage({
                        eventType: WalletEventType.NETWORK_INCORRECT,
                    } as WalletEvent);
                }
            });
        }

        walletListenerSetted.value = true;
    }

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

    <el-dialog v-model="appState.mask.show" width="30%" :close-on-click-modal="false" :close-on-press-escape="false"
        :show-close="false">
        <span>{{ appState.mask.loadingText }}</span>
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

        // 二级菜单中的子选项
        .el-menu-item {
            background-color: transparent !important;
            color: #000 !important;
            font-weight: 400;
            width: 100%;
            font-size: 14px;
            text-align: center;

            // 被选择的子选项
            &:not(.is-disabled):hover {
                color: #00FFC2 !important;
                background-color: #E6FFF9 !important;
                width: 100%;
                text-align: center;
            }
        }
    }

    // 弹出的二级菜单
    .el-menu--popup {
        min-width: 104px !important;
        min-height: 112px !important;
    }
}
</style>

