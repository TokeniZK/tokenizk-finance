<script lang="ts" setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import type { Token } from 'typescript';
import { type TokenDto } from '@tokenizk/types';
import { queryTokenByUser } from '@/apis/user-api';
import { CircuitControllerState, useStatusStore } from '@/stores';
import { PublicKey, TokenId, fetchAccount, Mina } from 'o1js';
import { CHANNEL_MINA, WalletEventType, type WalletEvent } from '@/common';
import { checkTx } from '@/utils/txUtils';

const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
};


const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();
const zkTxLinkPrefix = ref(import.meta.env.VITE_EXPLORER_TX_URL);

const checkConnectedWallet = () => {
    ElMessage({
        showClose: true,
        type: 'warning',
        message: `Please connect wallet first.`,
    });
}

interface UserFundTransferForm {
    token: string
    balance: string
    reciver: string
    amount: string
}

const ruleFormRef = ref<FormInstance>()
const userTokenListRef = reactive<{ tokenList: TokenDto[] }>({ tokenList: [] });
const userFundFormRef = reactive<UserFundTransferForm>({
    token: '',
    balance: '',
    reciver: '',
    amount: '',
});

// 正则
const rules = reactive<FormRules<UserFundTransferForm>>({

    token: [
        {
            required: true,
            message: 'Please select a Token Type',
            trigger: 'change',
        },
    ],

    // balance: [
    //     {
    //         type: 'number',
    //         required: true,
    //         message: 'balance must be number type',
    //         trigger: 'blur'
    //     },
    // ],

    reciver: [
        {
            required: true,
            message: 'Please input reciver',
            trigger: 'blur'
        },
    ],

    amount: [
        {
            type: 'number',
            required: true,
            message: 'amount must be number type',
            trigger: 'blur'
        },
    ],

})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {

    if (!formEl) return

    await formEl.validate(async (valid, fields) => {

        if (appState.connectedWallet58 === '' || appState.connectedWallet58 === null || appState.connectedWallet58 === undefined) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `Please connect wallet first.`,
            });

            return;
        }

        if (valid) {
            const maskId = 'transferToken';
            try {

                // check if circuit has been compiled, if not , prompt: wait
                if (!appState.tokenizkBasicTokenCompiled) {

                    showLoadingMask({ id: maskId, text: 'compiling TokeniZkBasicToken circuit...' });

                    const flag = await CircuitControllerState.remoteController?.compileTokeniZkBasicToken();
                    if (!flag) {
                        ElMessage({
                            showClose: true,
                            type: 'warning',
                            message: `circuit compile failed!`,
                        });

                        closeLoadingMask(maskId);
                        return;
                    }

                    appState.tokenizkBasicTokenCompiled = true;
                }

                const basicTokenZkAppAddress = userFundFormRef.token;
                const from = appState.connectedWallet58;
                const to = userFundFormRef.reciver;
                const value = Number(userFundFormRef.amount);
                const feePayerAddress = appState.connectedWallet58;
                const txFee = 0.21 * (10 ** 9);

                const txJson = await CircuitControllerState.remoteController?.transferToken(
                    basicTokenZkAppAddress,
                    from,
                    to,
                    value,
                    feePayerAddress,
                    txFee
                );
                console.log(`txJson: ${txJson}`);

                try {
                    const { hash: txHash } = await window.mina.sendTransaction({
                        transaction: txJson,
                        feePayer: {
                            fee: 0.101,
                            memo: "createPresale"
                        },
                    });
                    console.log('tx send success, txHash: ', txHash);


                    try {
                        showLoadingMask({ id: maskId, text: `waiting for tx confirmation: ${zkTxLinkPrefix.value.concat(txHash)}` });

                        // check tx is confirmed
                        await checkTx(txHash);

                        showLoadingMask({ id: maskId, text: 'tx is confirmed!' });

                    } catch (error) {
                        console.error(error);
                        showLoadingMask({ id: maskId, text: 'tx failed! please retry later.' });
                        ElMessage({
                            showClose: true,
                            type: 'warning',
                            message: `tx failed! please retry later.`,
                        });
                        closeLoadingMask(maskId);

                        return;
                    }
                    closeLoadingMask(maskId);
                } catch (error) {
                    console.error(error);

                    closeLoadingMask(maskId);
                }

            } catch (error) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `transfer failed!`,
                });
            }

            closeLoadingMask(maskId);
        }
    })
}

const balanceRef = ref<number>(0);
const tokenChoose = async () => {
    console.log(`userFundFormRef.token: ${userFundFormRef.token}`);
    const maskId = 'fetchBalance'
    try {
        showLoadingMask({ id: maskId, text: 'fetching balance...' });

        // fetch account
        const tokenId = TokenId.derive(PublicKey.fromBase58(userFundFormRef.token));
        const accountInfo = await fetchAccount({ publicKey: PublicKey.fromBase58(appState.connectedWallet58!), tokenId });// TODO!!!
        if (accountInfo.account) {
            balanceRef.value = Number(accountInfo.account.balance.toBigInt());
        } else {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `fetch balance failed, please retry.`,
            });
        }
    } catch (error) {
        console.error(error);
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `fetch balance failed, please retry.`,
        });
    }
    closeLoadingMask(maskId);
}
// 重置
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
    balanceRef.value = 0;
}

watch(() => appState.connectedWallet58, async (value, oldValue) => {
    if (appState.connectedWallet58 != '' && appState.connectedWallet58 != null) {
        userTokenListRef.tokenList = (await queryTokenByUser(appState.connectedWallet58!)) ?? [];
    } else {
        userTokenListRef.tokenList = [];
        resetForm(ruleFormRef.value);
    }
})

// 组件挂载完成后执行的函数
onMounted(async () => {

    if (appState.connectedWallet58 != '' && appState.connectedWallet58 != null) {
        userTokenListRef.tokenList = (await queryTokenByUser(appState.connectedWallet58)) ?? [];
    }

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})


</script>

<template>
    <el-row class="row-bg Wallet" justify="center">
        <el-col :span="24">

            <el-row>
                <el-col :span="24">

                    <el-row>
                        <div class="create-ZkToken-title">
                            <h1>Wallet Transfer</h1>
                        </div>
                    </el-row>

                    <el-form ref="ruleFormRef" :model="userFundFormRef" :rules="rules" label-width="100px"
                        class="demo-ruleForm walletTable" size="large" status-icon label-position="left">

                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                        <el-form-item label="Token" prop="token">
                            <el-select v-model.trim="userFundFormRef.token" placeholder="Tokens You Hold"
                                @change="tokenChoose">
                                <el-option v-for="item in userTokenListRef.tokenList" :label="item.symbol"
                                    :value="item.address" :key="item.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Balance" prop="balance">
                            {{ balanceRef }}
                        </el-form-item>

                        <el-form-item label="Reciver" prop="reciver">
                            <el-input v-model.trim="userFundFormRef.reciver" placeholder="Ex: B62xxx" />
                        </el-form-item>

                        <el-form-item label="Amount" prop="amount">
                            <el-input v-model.number.trim="userFundFormRef.amount" placeholder="0" />
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
                            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
                        </el-form-item>

                    </el-form>

                </el-col>
            </el-row>

            <!-- 创建后 -->
            <!-- <el-row class="row-bg walletTable" justify="center" v-show="!flag">
        <el-col :span="24">

          <el-row> Your token was created ! </el-row>

          <el-row>
            <el-col :span="4">Name</el-col>
            <el-col :span="12">{{ ruleForm.name }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Symbol</el-col>
            <el-col :span="12">{{ ruleForm.reciver }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Total supply</el-col>
            <el-col :span="12">{{ ruleForm.totalSupply }}</el-col>
          </el-row>

          <el-row>
            <el-col :span="4">Address</el-col>
            <el-col :span="12">0xd550e943D6E7Cd1a425088a7C90b08738901CBfD</el-col>
          </el-row>

          <el-button size="large" disabled>View transaction</el-button>

          <el-button type="primary" size="large">
            <router-link to="/create-normal-launch" style="color: #fff;"> Create launchpad</router-link>
          </el-button>

          <el-button type="primary" size="large">
            <router-link to="/create-normal-launch" style="color: #fff;"> Create Fairlaunch</router-link>
          </el-button>

        </el-col>
      </el-row>  -->

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.Wallet {
    width: 100%;
    padding: 10% 20%;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .walletTable {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
    }

    .el-form-item {
        margin-bottom: 35px;
    }

    .el-row {
        margin-bottom: 40px;
    }
}
</style>
