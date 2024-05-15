<script lang="ts" setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import type { Token } from 'typescript';
import { type TokenDto, type UserTokenTransferDto } from '@tokenizk/types';
import { queryTokenByUser } from '@/apis/user-api';
import { CircuitControllerState, useStatusStore } from '@/stores';
import { CHANNEL_MINA, WalletEventType, type WalletEvent } from '@/common';
import { checkTx } from '@/utils/txUtils';
import { queryTokenTransferRecord, submitTokenTransfer } from '@/apis/token-api';
import type { TableColumnCtx } from 'element-plus'

const o1js = import('o1js');

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
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' },
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

                const { code, data: txJson, msg } = (await CircuitControllerState.remoteController?.transferToken(
                    basicTokenZkAppAddress,
                    from,
                    to,
                    value * (10 ** 9), // TODO consider if need * (10 ** 9)!!!,
                    feePayerAddress,
                    txFee
                ))!;

                if (code == 1) {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: msg,
                    });
                    closeLoadingMask(maskId);

                    return;
                }

                console.log(`txJson: ${txJson}`);

                try {
                    const { hash: txHash } = await window.mina.sendTransaction({
                        transaction: txJson,
                        feePayer: {
                            fee: 0.201,
                            memo: "createPresale"
                        },
                    });
                    console.log('tx send success, txHash: ', txHash);


                    try {
                        showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

                        // check tx is confirmed
                        await checkTx(txHash);

                        const userTokenTransferDto = {
                            status: 0,
                            from: from,
                            to: to,
                            amount: value,
                            tokenAddress: basicTokenZkAppAddress,
                            tokenId: (await o1js).TokenId.derive((await o1js).PublicKey.fromBase58(basicTokenZkAppAddress)),
                            txHash: txHash,
                        } as unknown as UserTokenTransferDto;

                        ElMessage({
                            showClose: true,
                            type: 'success',
                            message: `transfer token successfully`,
                        });

                        userFundFormRef.amount = null as any as string;
                        userFundFormRef.reciver = null as any as string;

                        // submit to backend
                        await submitTokenTransfer(userTokenTransferDto);

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
    if (!userFundFormRef.token) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please choose a token`,
        });

        return;
    }
    console.log(`userFundFormRef.token: ${userFundFormRef.token}`);
    const maskId = 'fetchBalance'
    try {

        showLoadingMask({ id: maskId, text: 'fetching balance...' });

        const { Mina, fetchAccount,TokenId,PublicKey } = await import('o1js');
        Mina.setActiveInstance(Mina.Network(import.meta.env.VITE_MINA_GRAPHQL_URL));
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
    // TODO temp place it here
    transferData.datas = await queryTokenTransferRecord(appState.connectedWallet58!, userFundFormRef.token);

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


interface User {
    date: string
    receiver: string
    amount: string
}

interface TransferRecord {
    from: string;
    to: string;
    amount: number;
}

const transferRecords = ref<TransferRecord[]>([]);
const fromName = ref('');
const toName = ref('');
const amount = ref(0);
const deleteIndex = ref<number | null>(null);

const addTransferRecord = () => {
    if (fromName.value && toName.value && amount.value > 0) {
        transferRecords.value.push({
            from: fromName.value,
            to: toName.value,
            amount: amount.value,
        });
        fromName.value = '';
        toName.value = '';
        amount.value = 0;
    } else {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please enter complete transfer information!`,
        });
    }
};

const removeTransfer = (index: number) => {
    transferRecords.value.splice(index, 1);
}

const confirmRemoveTransfer = (index: number) => {
    deleteIndex.value = index;
    ElMessageBox.confirm('Are you sure you want to delete this transfer record?')
}

const handleConfirmDelete = () => {
    if (deleteIndex.value !== null) {
        transferRecords.value.splice(deleteIndex.value, 1);
        deleteIndex.value = null;
        ElMessage({
            showClose: true,
            type: 'success',
            message: 'Transfer record deleted successfully',
        });
    }
}

const handleCancelDelete = () => {
    deleteIndex.value = null;
}

const formatter = (row: User, column: TableColumnCtx<User>) => {
    return row.address
}

let transferData: {datas: User[]} = reactive({datas: []});

// Pagination
const paginationValue = ref(false);
const pageSize = ref(5); // 每页显示5条信息  
const currentPage = ref(1); // 当前页码      

// 计算总条目数  
const totalItems = computed(() => transferData.datas.length);

// 计算当前页显示的条目  
const currentPageItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return transferData.datas.slice(start, end);
});

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1; // 当条数变化时，重置到第一页  
}
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
}

const connectAddress = ref('B62qoLrv1LQDY5aMXLrjBJ1XqSzZ7MLYQMjvhXuLksdRjBEfd2b3V2B')

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
    <el-row class="row-bg Wallet" justify="center" v-if="transferData.datas.length <= 0">
        <el-col :span="24">

            <el-row>
                <h1>Wallet Transfer</h1>
            </el-row>

            <el-row class="walletInfo">
                <el-col :span="24">

                    <el-form ref="ruleFormRef" :model="userFundFormRef" :rules="rules" label-width="100px"
                        class="demo-ruleForm walletForm" size="large" status-icon label-position="left">

                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                        <el-form-item label="Token" prop="token">
                            <el-select v-model.trim="userFundFormRef.token" placeholder="Tokens You Hold"
                                @change="tokenChoose">
                                <el-option v-for="    item     in     userTokenListRef.tokenList    "
                                    :label="item.symbol" :value="item.address" :key="item.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Balance" prop="balance">
                            {{ balanceRef }}
                            <el-icon class="refreshBalanceRef" @click="tokenChoose">
                                <Refresh />
                            </el-icon>
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

        </el-col>
    </el-row>

    <el-row class="row-bg Wallet2" justify="center" v-if="transferData.datas.length > 0">
        <el-col :span="24">

            <el-row>
                <h1>Wallet Transfer</h1>
            </el-row>

            <el-row class="walletInfo">

                <el-col :span="17">
                    <el-form ref="ruleFormRef" :model="userFundFormRef" :rules="rules" label-width="100px"
                        class="demo-ruleForm walletForm" size="large" status-icon label-position="left">

                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                        <el-form-item label="Token" prop="token">
                            <el-select v-model.trim="userFundFormRef.token" placeholder="Tokens You Hold"
                                @change="tokenChoose">
                                <el-option v-for="    item     in     userTokenListRef.tokenList    "
                                    :label="item.symbol" :value="item.address" :key="item.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Balance" prop="balance">
                            {{ balanceRef }}
                            <el-icon class="refreshBalanceRef" @click="tokenChoose">
                                <Refresh />
                            </el-icon>
                        </el-form-item>

                        <el-form-item label="Reciver" prop="reciver">
                            <el-input v-model.trim="userFundFormRef.reciver" placeholder="Ex: B62xxx" />
                        </el-form-item>

                        <el-form-item label="Amount" prop="amount">
                            <el-input v-model.number.trim="userFundFormRef.amount" placeholder="0" />
                        </el-form-item>

                        <el-form-item>
                            <el-button class="steps-Bar" type="primary" @click="submitForm(ruleFormRef)"> Create
                            </el-button>
                            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
                        </el-form-item>

                    </el-form>
                </el-col>

            </el-row>

            <el-row v-if="appState.connectedWallet58 === connectAddress">
                <el-col :span="24">

                    <div class="transferRecordTable">
                        <h2>Transfer Record</h2>
                        <el-table :data="currentPageItems" height="250" style="width: 100%">
                            <el-table-column prop="date" label="Date" width="180" />
                            <el-table-column prop="receiver" label="From/To" width="560" />
                            <el-table-column prop="amount" label="Amount" />
                        </el-table>
                        <!-- 分页 -->
                        <el-scrollbar max-height="700px" style="margin-top: 20px;">
                            <el-pagination class="pagination-block" background :page-size="pageSize"
                                :current-page="currentPage" :pager-count="6" layout="total,prev, pager, next,jumper"
                                :hide-on-single-page="paginationValue" :total="totalItems"
                                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                        </el-scrollbar>
                    </div>

                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.Wallet {
    padding: 10% 15%;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .walletInfo {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
    }

    .steps-Bar {
        margin-right: 20px;

        &:hover {
            color: #00c798;
        }
    }


    .el-form-item {
        margin-bottom: 35px;
    }

    .refreshBalanceRef {
        margin-left: 20px;
        font-size: 16px;
        cursor: pointer;
        color: #00c798;
    }

    .el-row {
        margin-bottom: 40px;
    }

}

.Wallet2 {
    width: 100%;
    padding: 10% 15%;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .walletInfo {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
    }

    .steps-Bar {
        margin-right: 20px;

        &:hover {
            color: #00c798;
        }
    }


    .el-form-item {
        margin-bottom: 35px;
    }

    .refreshBalanceRef {
        margin-left: 20px;
        font-size: 16px;
        cursor: pointer;
        color: #00c798;
    }

    .el-row {
        margin-bottom: 40px;
    }
}
</style>
