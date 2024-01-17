<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { type TokenDto } from "@tokenizk/types";
import { useStatusStore, type AppState } from "@/stores";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { queryToken, submitToken } from '@/apis/token-api';
import { Field, Mina, PrivateKey, PublicKey, Scalar, Signature } from 'o1js';
import { download as downloadAsFile } from '@/utils/sale-key-download';
import { genNewKeyPairBySignature } from '@/utils/keys_helper';
import { generateTokenKey } from '@/utils/keys-gen';
import { UploadFilled } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { checkTx } from '@/utils/txUtils';


const upload = ref<UploadInstance>()
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

const { appState, showLoadingMask, closeLoadingMask } = useStatusStore();
const zkTxLinkPrefix = ref(import.meta.env.VITE_EXPLORER_TX_URL);

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
    type: null as any as number,
    status: 0,
    address: appState.connectedWallet58 as string,
    name: '',
    logoUrl: '',
    symbol: '',
    zkappUri: '',
    totalSupply: 0,
    totalAmountInCirculation: 0,
    updatedAt: 0,
    createdAt: 0,

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

    // logoUrl: [
    //     {
    //         required: true,
    //         message: 'Images must be uploaded',
    //     },
    // ],

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

            const tokenInfo = await queryToken(appState.tokeniZkBasicTokenKeyPair?.value);
            if (tokenInfo!.length > 0) {
                hasDeployedYet.value = true;
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: 'already created a token!',
                });

                return;
            }

            const maskId = 'createZkToken';
            /* no need compile step!
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
            */

            showLoadingMask({ id: maskId, text: 'generating token KeyPair ...' });

            const { key: tokenKey, value: tokenAddress } = appState.tokeniZkBasicTokenKeyPair!;
            tokenDtoForm.address = tokenAddress;
            // downloadAsFile(`{"Key": ${tokenKey.toBase58()}, "Address": ${tokenAddress}}`, 'TokenizkBasicToken-Key.json');

            showLoadingMask({ id: maskId, text: 'witness calculating...' });
            const factoryAddress = appState.tokeniZkFactoryAddress;
            const basicTokenZkAppAddress = tokenDtoForm.address;
            const totalSupply = tokenDtoForm.totalSupply;
            const feePayerAddress = appState.connectedWallet58;
            const txFee = 0.3 * (10 ** 9)
            const txJson = await CircuitControllerState.remoteController?.createBasicToken(factoryAddress, basicTokenZkAppAddress, totalSupply, feePayerAddress, txFee);

            if (!txJson) {
                showLoadingMask({ id: maskId, text: 'witness calculation failed...', closable: true });

                // closeLoadingMask(maskId);
                return;
            }
            let tx = Mina.Transaction.fromJSON(JSON.parse(txJson!));
            const targetAU = tx.transaction.accountUpdates.filter(e => e.body.publicKey.toBase58() == tokenAddress);
            targetAU.forEach(e => e.lazyAuthorization = { kind: 'lazy-signature' });
            tx = tx.sign([PrivateKey.fromBase58(tokenKey)]);

            showLoadingMask({ id: maskId, text: 'sending transaction...' });
            const { hash: txHash } = await window.mina.sendTransaction({
                transaction: tx.toJSON(),
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
            if (!rs) {
                showLoadingMask({ id: maskId, text: 'submit to backend failed...' });
            }

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

            getFlag();

            goToTop();
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

const hasDeployedYet = ref(false);

const checkIfDeployed = async () => {
    // check if auro wallet is connected
    if (appState.connectedWallet58 == null) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });

        return;
    }

    const tokenInfo = await queryToken(appState.tokeniZkBasicTokenKeyPair?.value);
    if (tokenInfo?.length > 0) {
        hasDeployedYet.value = true;
        ElMessage({
            showClose: true,
            type: 'warning',
            message: 'already created a token!',
        });
    }

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



                        <el-row class="row-bg">
                            <el-col :span="12">

                                <el-form-item label="Token Type" prop="type">
                                    <el-select v-model.trim="tokenDtoForm.type" placeholder="select zkToken type"
                                        @change="checkIfDeployed">
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
                                    <el-input v-model.number.trim="tokenDtoForm.totalSupply"
                                        placeholder="Ex: 100000000000" />
                                </el-form-item>

                            </el-col>

                            <el-col :span="1"></el-col>

                            <el-col :span="11">
                                <el-form-item label="Logo" prop="logoUrl">
                                    <el-upload class="upload-demo" drag v-model="tokenDtoForm.logoUrl"
                                        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple
                                        :limit="1" :on-exceed="handleExceed">
                                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                        <div class="el-upload__text">Drop file here or <em>click to
                                                upload</em></div>
                                        <template #tip>
                                            <div class="el-upload__tip">
                                                jpg/png files with a size less than 500kb.
                                                limit 1 file, new file will cover the old file
                                            </div>
                                        </template>
                                    </el-upload>
                                </el-form-item>
                            </el-col>

                        </el-row>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm(ruleFormRef)"
                                :disabled="hasDeployedYet || !appState.connectedWallet58"> Create
                            </el-button>
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
                        <el-col :span="12">

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

                        </el-col>

                        <el-col :span="12">
                            <el-row>{{ tokenDtoForm.logoUrl }}</el-row>
                        </el-col>
                    </el-row>

                    <el-button type="primary" size="large">
                        <router-link to="/create-token-sale?saleType=0" style="color: #fff;"> Create PreSale </router-link>
                    </el-button>

                    <el-button type="primary" size="large">
                        <router-link to="/create-token-sale?saleType=1" style="color: #fff;"> Create Fair
                            Sale</router-link>
                    </el-button>

                    <el-button type="primary" size="large">
                        <router-link to="/create-airdrop" style="color: #fff;"> Create Airdrop</router-link>
                    </el-button>
                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.create-ZkToken {
    width: 100%;
    padding: 10% 15%;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .tokenTable {
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

