<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { type TokenDto } from "@tokenizk/types";
import { useStatusStore, type AppState } from "@/stores";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { submitToken } from '@/apis/token-api';

const { appState, showLoadingMask, closeLoadingMask } = useStatusStore();

// 组件挂载完成后执行的函数
onMounted(() => {

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})

const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
};

let connectStatus = useConnectStatusStore();
let { cnState } = connectStatus;

let flag = ref(true);

let getFlag = () => {
    flag.value = !(flag.value);
}

const ruleFormRef = ref<FormInstance>()

const tokenDtoInit: TokenDto = {
    id: 0,
    txHash: '',
    type: 0,
    status: 0,
    address: appState.connectedWallet58 as string,
    name: '',
    symbol: '',
    zkappUri: '',
    totalSupply: 0,
    totalAmountInCirculation: 0,
    nullifierRoot: '',
    nullStartIndex: '',
    updatedAt: 0,
    createdAt: 0
}

const tokenDtoForm = reactive<TokenDto>({ ...tokenDtoInit });

// 正则
const rules = reactive<FormRules<TokenDto>>({

    type: [
        {
            required: true,
            message: 'Please select a Token Type',
            trigger: 'change',
        },
    ],

    name: [
        { required: true, message: 'Please input Token name', trigger: 'blur' },
        { min: 3, max: 10, message: 'Length should be 3 to 10', trigger: 'blur' },
    ],

    symbol: [
        {
            required: true,
            message: 'Please input symbol',
            trigger: 'blur'
        },
    ],

    totalSupply: [
        {
            type: 'number',
            required: true,
            message: 'Total Sale Supply must be number type',
            trigger: 'blur'
        },
    ],
})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {

    if (!formEl) return

    await formEl.validate(async (valid, fields) => {
        if (valid) {
            // check if auro wallet is connected
            if (appState.connectedWallet58 == null) {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: `Please connect wallet first.`,
                });

                return;
            }

            const maskId = 'createZkToken';
            // check if circuit has been compiled, if not , prompt: wait
            if (!appState.tokenizkBasicTokenCompiled) {

                // 
                showLoadingMask({ id: maskId, text: 'compiling TokeniZkBasicToken circuit...' });

                const flag = await CircuitControllerState.remoteController?.compileTokeniZkBasicToken();
                if (!flag) {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: `circuit compile failed!`,
                    });
                    return;
                }

                appState.tokenizkBasicTokenCompiled = true;
            }

            showLoadingMask({ id: maskId, text: 'witness calculating...' });
            const factoryAddress = appState.tokeniZkFactoryAddress;
            const basicTokenZkAppAddress = appState.connectedWallet58;
            const totalSupply = tokenDtoForm.totalSupply;
            const feePayerAddress = appState.connectedWallet58;
            const txFee = 0.1 * (10 ** 9)
            const txJson = await CircuitControllerState.remoteController?.createBasicToken(factoryAddress, basicTokenZkAppAddress, totalSupply, feePayerAddress, txFee);

            showLoadingMask({ id: maskId, text: 'sending transaction...' });
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: txJson,
                feePayer: {
                    fee: 0.101,
                    memo: "createZkToken"
                },
            });
            console.log('tx send success, txHash: ', txHash);
            tokenDtoForm.txHash = txHash;

            // send back to backend for recording
            showLoadingMask({ id: maskId, text: 'submit to backend...' });
            const rs = await submitToken(tokenDtoForm);// TODO!!! 本尊
            if (rs) {
                closeLoadingMask(maskId);

                getFlag();

                goToTop();
            } else {
                showLoadingMask({ id: maskId, text: 'submit to backend failed...' });
            }


        } else {
            console.log('error submit!', fields)
        }
    })
}

// 重置
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}


</script>

<template>
    <el-row class="row-bg create-ZkToken" justify="center">
        <el-col :span="24">

            <el-row v-show="flag">
                <el-col :span="24">

                    <el-row>
                        <div class="create-ZkToken-title">
                            <h1>Create ZkToken</h1>
                        </div>
                    </el-row>

                    <el-form ref="ruleFormRef" :model="tokenDtoForm" :rules="rules" label-width="120px"
                        class="demo-ruleForm tokenTable" size="large" status-icon label-position="top">

                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                        <el-form-item label="Token Type" prop="type">
                            <el-select v-model.trim="tokenDtoForm.type" placeholder="select zkToken type">
                                <el-option label="Basic ZkToken" value=0 />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Token Name" prop="name">
                            <el-input v-model.trim="tokenDtoForm.name" placeholder="Ex: Mina" />
                        </el-form-item>

                        <el-form-item label="Symbol" prop="symbol">
                            <el-input v-model.trim="tokenDtoForm.symbol" placeholder="Ex: Mina" />
                        </el-form-item>

                        <el-form-item label="Total Sale Supply" prop="totalSupply">
                            <el-input v-model.number.trim="tokenDtoForm.totalSupply" placeholder="Ex: 100000000000" />
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm(ruleFormRef)"> Create </el-button>
                            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
                        </el-form-item>

                    </el-form>
                </el-col>
            </el-row>

            <!-- 创建后 -->
            <el-row class="row-bg tokenTable" justify="center" v-show="!flag">
                <el-col :span="24">

                    <el-row> Your token was created ! </el-row>

                    <el-row>
                        <el-col :span="4">Name</el-col>
                        <el-col :span="12">{{ tokenDtoForm.name }}</el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="4">Symbol</el-col>
                        <el-col :span="12">{{ tokenDtoForm.symbol }}</el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="4">Total supply</el-col>
                        <el-col :span="12">{{ tokenDtoForm.totalSupply }}</el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="4">txHash</el-col>
                        <el-col :span="12">{{ appState.explorerUrl.concat(tokenDtoForm.txHash) }}</el-col>
                    </el-row>

                    <el-button type="primary" size="large">
                        <router-link to="/create-normal-launch" style="color: #fff;"> Create launchpad</router-link>
                    </el-button>

                    <el-button type="primary" size="large">
                        <router-link to="/create-normal-launch" style="color: #fff;"> Create Fairlaunch</router-link>
                    </el-button>

                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.create-ZkToken {
    width: 100%;
    padding: 200px 200px 100px 200px;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .tokenTable {
        background-color: #fff;
        padding: 20px;
    }

    .el-form-item {
        margin-bottom: 35px;
    }

    .el-row {
        margin-bottom: 40px;
    }
}
</style>
<<<<<<< HEAD

=======
>>>>>>> main
