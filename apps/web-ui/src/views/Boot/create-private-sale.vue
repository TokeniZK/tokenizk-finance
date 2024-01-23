<script lang="ts" setup>
import { reactive, ref, onMounted, computed, watch, onUpdated } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { type SaleReq, type SaleDto, type TokenDto } from "@tokenizk/types";
import { useStatusStore, type AppState } from "@/stores";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { queryToken } from "@/apis/token-api";
import { Encoding, Field, Mina, PrivateKey, Scalar, Signature, PublicKey, fetchLastBlock } from 'o1js';
import { SaleParams, WHITELIST_TREE_ROOT } from '@tokenizk/contracts';
import { submitSale, querySale } from '@/apis/sale-api';
import { calcWhitelistTreeRoot } from '@/utils/whitelist-tree-calc';
import { download as downloadAsFile } from '@/utils/sale-key-download';
import { useRoute, useRouter } from 'vue-router';
import { genNewKeyPairBySignature } from '@/utils/keys_helper';
import { generateTokenKey, generateLaunchContractKey } from '@/utils/keys-gen';
import { UploadFilled } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { checkTx, syncLatestBlock } from '@/utils/txUtils';

let route = useRoute();
let saleType = ref(route.query.saleType as any as number);

const router = useRouter();
router.beforeEach((to, from, next) => {
    const query = to.query;
    saleType.value = query.saleType as any as number;
    next();
});

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

let saleDtoInit: SaleDto = {
    id: 0,
    saleType: 2,
    txHash: '',
    status: 0,
    tokenAddress: appState.tokeniZkBasicTokenKeyPair?.value as string, // TODO consider if publickey.empty for privateSale
    tokenSymbol: 'MINA',
    saleName: '',
    saleAddress: 'to be generated...',
    totalSaleSupply: null as any as number,
    currency: 'MINA',
    feeRate: '1',
    saleRate: null as any as number,
    whitelistTreeRoot: null as any as string,
    whitelistMembers: null as any as string,
    softCap: null as any as number,
    hardCap: null as any as number,
    minimumBuy: null as any as number,
    maximumBuy: null as any as number,
    startTimestamp: Date.now(),
    endTimestamp: Date.now() + 10 * 3 * 60 * 1000,
    cliffTime: null as any as number,
    cliffAmountRate: null as any as number,
    vestingPeriod: null as any as number,
    vestingIncrement: null as any as number,
    contributorsFetchFlag: 0,
    contributorsTreeRoot: null as any as string,
    totalContributorNum: 0,
    contributorsMaintainFlag: 0,
    logoUrl: '',
    website: '',
    facebook: '',
    github: '',
    twitter: '',
    telegram: '',
    discord: '',
    reddit: '',
    description: '',
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
    tokenName: '',
    star: 0,
    teamName: '',
    totalContributedMina: 0
};

const ruleFormRef = ref<FormInstance>()

let saleDto = reactive<SaleDto>(saleDtoInit)

// let saleStartDateTime = ref(new Date());
// let startTargetBlockHeight = ref(0);
const changeSaleStartDateTime = async (choosedDate: number) => {
    /*
    if (!choosedDate) {
        choosedDate = Date.now();
    }
    const maskId = 'changeSaleStartDateTime';
    showLoadingMask({ id: maskId, text: 'fetching latest block...' });
    try {
        if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
            appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
            appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
        }
        startTargetBlockHeight.value = appState.latestBlockInfo!.blockchainLength + Math.floor((choosedDate - Date.now()) / (3 * 60 * 1000)) + 1;
        saleDto.startTimestamp = startTargetBlockHeight.value;

    } catch (error) {
        ElMessage.error({ message: 'fetching latest block failed' });
    }

    closeLoadingMask(maskId);
    */

    saleDto.startTimestamp = choosedDate;
}

// let saleEndDateTime = ref(new Date());
// let endTargetBlockHeight = ref(0);
const changeSaleEndDateTime = async (choosedDate: number) => {
    /*
    if (!choosedDate) {
        choosedDate = Date.now();
    }
    const maskId = 'changeSaleEndDateTime';
    showLoadingMask({ id: maskId, text: 'fetching latest block...' });
    try {
        if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
            appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
            appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
        }

        endTargetBlockHeight.value = appState.latestBlockInfo!.blockchainLength + Math.floor((choosedDate - Date.now()) / (3 * 60 * 1000)) + 1;
        saleDto.endTimestamp = endTargetBlockHeight.value;

    } catch (error) {
        ElMessage.error({ message: 'fetching latest block failed' });
    }

    closeLoadingMask(maskId);
    */
    saleDto.endTimestamp = choosedDate;
}
const zkTxLinkPrefix = ref(import.meta.env.VITE_EXPLORER_TX_URL);

// 正则
const rules = reactive<FormRules<SaleDto>>({

    // 步骤1
    tokenAddress: [
        { required: true, message: 'Please input Token address', trigger: 'blur' },
    ],

    currency: [
        {
            required: true,
            message: 'Please select currency',
            trigger: 'change',
        },
    ],


    feeRate: [
        {
            required: true,
            message: 'Please select any feeRate',
            trigger: 'change',
        },
    ],

    saleName: [
        {
            required: true,
            message: 'Please input Sale Name',
            trigger: 'blur',
        },
    ],

    totalSaleSupply: [
        {
            type: 'number',
            required: true,
            message: 'Total Sale Supply must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],


    // 步骤2
    saleRate: [
        {
            type: 'number',
            required: true,
            message: 'saleRate must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],

    whitelistMembers: [
        {
            required: true,
            message: 'Please input whitelistMembers address',
            trigger: 'blur',
        },
    ],

    softCap: [
        {
            type: 'number',
            required: true,
            message: 'softCap must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],

    hardCap: [
        {
            type: 'number',
            required: true,
            message: 'hardCap must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],

    minimumBuy: [
        {
            type: 'number',
            required: true,
            message: 'minimumBuy must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],

    maximumBuy: [
        {
            type: 'number',
            required: true,
            message: 'maximumBuy must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],

    startTimestamp: [
        {
            type: 'date',
            required: true,
            message: 'Please pick a date',
            trigger: 'change',
        },
    ],

    endTimestamp: [
        {
            type: 'date',
            required: true,
            message: 'Please pick a date',
            trigger: 'change',
        },
    ],

    cliffTime: [
        {
            type: 'number',
            required: true,
            message: 'cliffTime must be number type',
            trigger: 'blur'
        },
        { pattern: /^[0-9]+$/, message: 'Please enter a non negative number', trigger: 'blur' }, 
    ],


    logoUrl: [
        {
            required: true,
            message: 'Images must be uploaded',
        },
    ]
    /*
      
      website: [
          { required: true, message: 'Please input website address', trigger: 'blur' },
      ],
   
      facebook: [
          { required: true, message: 'Please input facebook address', trigger: 'blur' },
      ],
   
      twitter: [
          { required: true, message: 'Please input twitter address', trigger: 'blur' },
      ],
   
      github: [
          { required: true, message: 'Please input github address', trigger: 'blur' },
      ],
   
      telegram: [
          { required: true, message: 'Please input telegram address', trigger: 'blur' },
      ],
   
      discord: [
          { required: true, message: 'Please input discord address', trigger: 'blur' },
      ],
   
      reddit: [
          { required: true, message: 'Please input reddit address', trigger: 'blur' },
      ],
   
      description: [
          { required: true, message: 'Please input Description', trigger: 'blur' },
      ],
  */

})

// 提交
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid, fields) => {
        // check if auro wallet is connected
        if (appState.connectedWallet58 == null) {
            ElMessage({
                showClose: true,
                type: 'warning',
                message: `Please connect wallet first.`,
            });

            return;
        }

        if (valid) {
            saleDto.totalSaleSupply = 0;
            saleDto.saleRate = 0;
            let saleTag = 'PrivateSale'

            const saleDto1 = JSON.parse(JSON.stringify(saleDto));

            const maskId = 'createSale';

            /* TODO no need compile step!
            // check if circuit has been compiled, if not , prompt: wait
            if (!appState.tokenizkPresaleCompiled) {
      
                showLoadingMask({ id: maskId, text: 'compiling TokeniZkPresale circuit...' });
                // const flag = await CircuitControllerState.remoteController?.compileTokeniZkPresale()
                const flag = await CircuitControllerState.remoteController?.createPresale()
                if (!flag) {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: `circuit compile failed!`,
                    });
      
                    closeLoadingMask(maskId);
                    return;
                }
      
                appState.tokenizkPresaleCompiled = true;
            }
            */
            // calc whitelist tree root
            if (saleDto1.whitelistMembers) {
                showLoadingMask({ id: maskId, text: 'constructing whitelist tree...' });
                const members = saleDto1.whitelistMembers.trim().split(',');
                saleDto1.whitelistTreeRoot = await calcWhitelistTreeRoot(members);

                console.log('whitelistTreeRoot: ' + saleDto1.whitelistTreeRoot);
            } else {
                saleDto1.whitelistTreeRoot = WHITELIST_TREE_ROOT.toString();
                console.log('whitelistTreeRoot: ' + saleDto1.whitelistTreeRoot);
            }

            showLoadingMask({ id: maskId, text: 'generating sale KeyPair ...' });

            const tokenKey = PrivateKey.fromBase58(appState.tokeniZkBasicTokenKeyPair?.key!);
            const tokenAddress = appState.tokeniZkBasicTokenKeyPair?.value;

            const signData = import.meta.env.VITE_PRIVATESALE_KEY_SIGNING_DATA;

            const saleDtoList = await querySale({ tokenAddress, saleType: 2 } as SaleReq);
            const accountIndex = saleDtoList?.length;
            console.log(`token's sale accountIndex: ${accountIndex}`);
            const { privateKey: saleKey, publicKey: saleAddress0 } = await generateLaunchContractKey(tokenKey, signData, accountIndex);
            const saleAddress = saleAddress0.toBase58();
            saleDto1.saleAddress = saleAddress;
            // downloadAsFile(`{"presaleKey": ${saleKey.toBase58()}, "presaleAddress": ${saleAddress}}`, 'TokenizkPresale-Key.json');

            showLoadingMask({ id: maskId, text: 'witness calculating...' });
            const factoryAddress = appState.tokeniZkFactoryAddress;
            const basicTokenZkAppAddress = tokenAddress;

            saleDto1.saleRate = saleDto.saleRate * (10 ** 9);
            saleDto1.maximumBuy = saleDto.maximumBuy * (10 ** 9);
            saleDto1.minimumBuy = saleDto.minimumBuy * (10 ** 9);
            saleDto1.softCap = saleDto.softCap * (10 ** 9);
            saleDto1.hardCap = saleDto.hardCap * (10 ** 9);
            const saleParams = {
                tokenAddress: saleDto1.tokenAddress,
                totalSaleSupply: saleDto1.totalSaleSupply,
                saleRate: saleDto1.saleRate,
                whitelistTreeRoot: saleDto1.whitelistTreeRoot,
                softCap: saleDto1.softCap,
                hardCap: saleDto1.hardCap,
                minimumBuy: saleDto1.minimumBuy,
                maximumBuy: saleDto1.maximumBuy,
                startTime: saleDto1.startTimestamp,
                endTime: saleDto1.endTimestamp,
                cliffTime: saleDto1.cliffTime,
                cliffAmountRate: saleDto1.cliffAmountRate,
                vestingPeriod: saleDto1.vestingPeriod, // 0 is not allowed, default value is 1
                vestingIncrement: saleDto1.vestingIncrement
            };

            console.log('saleParams: ' + JSON.stringify(saleParams));

            const feePayerAddress = appState.connectedWallet58;
            const txFee = 0.21 * (10 ** 9)
            let txJson = await CircuitControllerState.remoteController?.createSale(factoryAddress, basicTokenZkAppAddress!, saleAddress, saleParams, feePayerAddress, txFee);

            if (txJson) {

                showLoadingMask({ id: maskId, text: 'submitting to backend...' });
                // send back to backend for recording
                const rs = await submitSale(saleDto1);// TODO!!! 本尊
                if (rs) {
                    try {
                        showLoadingMask({ id: maskId, text: 'sending transaction...' });

                        let tx = Mina.Transaction.fromJSON(JSON.parse(txJson!));

                        let targetAU = tx.transaction.accountUpdates.filter(e => e.body.publicKey.toBase58() == saleAddress && e.body.authorizationKind.isSigned.toBoolean());
                        targetAU.forEach(e => e.lazyAuthorization = { kind: 'lazy-signature' });
                        tx = tx.sign([saleKey]);

                        txJson = tx.toJSON();
                        console.log('createSale txJson: ' + txJson);

                        const { hash: txHash } = await window.mina.sendTransaction({
                            transaction: txJson,
                            feePayer: {
                                fee: 0.301,
                                memo: `create ${saleTag}`
                            },
                        });
                        console.log('tx send success, txHash: ', txHash);
                        saleDto1.txHash = txHash;

                        try {
                            showLoadingMask({ id: maskId, text: `waiting for tx confirmation: `, link: `${zkTxLinkPrefix.value.concat(txHash)}` });

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

                        // record
                        appState.tokeniZkPrivateSaleKeyPairs?.push({ key: saleKey.toBase58(), value: saleAddress });
                        router.replace(`/sale-datails?saleAddress=${saleAddress}&tokenAddress=${tokenAddress}`);

                        // send back to backend for recording
                        await submitSale(saleDto1);// TODO!!! 本尊
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    ElMessage({
                        showClose: true,
                        type: 'warning',
                        message: 'submit to backend failed...',
                    });
                }

                closeLoadingMask(maskId);
            } else {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: 'createPresale failed...',
                });

                closeLoadingMask(maskId);
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}


const dynamicalCliffAmount = ref(0);
const changeCliffAmountRate = () => {
    if ((saleDto.whitelistMembers != '' && saleDto.whitelistMembers != null)) {
        const members = saleDto.whitelistMembers.split(',').length;
        dynamicalCliffAmount.value = Number((((saleDto.totalSaleSupply ?? 0) / members) * (saleDto.cliffAmountRate / 100)).toFixed(2));
    }
}

const dynamicalVestingIncrement = ref(0);
const changeVestingIncrement = () => {
    if ((saleDto.whitelistMembers != '' && saleDto.whitelistMembers != null)) {
        const members = saleDto.whitelistMembers.split(',').length;
        dynamicalVestingIncrement.value = Number((((saleDto.totalSaleSupply ?? 0) / members) * (saleDto.vestingIncrement / 100)).toFixed(2));
    }
}

const dynamicalCliffTime = ref(0);
const changeCliffTime = () => {
    dynamicalCliffTime.value = saleDto.cliffTime * 3
}

const dynamicalVestingPeriod = ref(0);
const changeVestingPeriod = () => {
    dynamicalVestingPeriod.value = saleDto.vestingPeriod * 3
}

const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
};

const flagX = ref(0);
const nextX = () => {
    if (flagX.value >= 3) {
        flagX.value = 3
    } else {
        flagX.value++
        goToTop()
    }
}
const prevX = () => {
    if (flagX.value <= 0) {
        flagX.value = 0
    } else {
        flagX.value--
        goToTop()
    }
}
// 步骤条 ：上一步、下一步
const active = ref(0)
const next = () => {
    if (active.value >= 3) {
        active.value = 3
    } else {
        active.value++
        nextX()
    }
}
const prev = () => {
    if (active.value <= 0) {
        active.value = 0
    } else {
        active.value--
        prevX()
    }
}


const dialogTableVisible = ref(false)

// 组件挂载完成后执行的函数
onMounted(async () => {

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });
})

watch(() => appState.connectedWallet58, async (newAddress, oldValue) => {
    if (!appState.connectedWallet58) {
        flagX.value = 0;
        saleDto = reactive<SaleDto>(saleDtoInit);
        active.value = 0;

        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });
    } else {
        saleDto.tokenAddress = appState.tokeniZkBasicTokenKeyPair!.value!;
    }
}, { immediate: true })

let checkIfTokenExist = computed(() => !saleDto.tokenSymbol);

const title = computed(() => {
    return `Create ${saleType.value == 0 ? 'PreSale' : (saleType.value == 1 ? 'FairSale' : 'PrivateSale')} Launch`
})

</script>

<template>
    <el-row class="row-bg create-token-sale" justify="center">

        <el-col :span="24">

            <el-row>
                <div class="create-basic-zktoken-title">
                    <h1>{{ title }}</h1>
                </div>
            </el-row>

            <!-- 步骤条 -->
            <el-row class="row-bg Step-Bar" justify="center">
                <el-col :span="24">
                    <el-steps :active="active" finish-status="success" align-center>

                        <el-step title="Before you start" description="Input your awesome title and choose the currency" />

                        <el-step title="Launchpad Info"
                            description="Enter the launchpad information that you want to raise , that should be enter all details about your sale" />

                        <el-step title="Add Additional Info" description="Let people know who you are" />

                        <el-step title="Finish" description="Review your information" />

                    </el-steps>
                </el-col>
            </el-row>

            <!-- 流程 -->
            <el-row class="row-bg" justify="center">
                <el-col :span="24">

                    <el-row>
                        <el-col :span="24">

                            <el-form ref="ruleFormRef" :model="saleDto" :rules="rules" label-width="120px"
                                class="demo-ruleForm" size="large" status-icon label-position="top">

                                <!-- 步骤1 -->
                                <el-row class="row-bg formTable1" v-show="flagX === 0">
                                    <el-col :span="24">
                                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                                        <el-row class="row-bg">

                                            <el-col :span="24">
                                                <el-form-item label="Private Sale Name" prop="privateSaleName">
                                                    <el-input v-model="saleDto.saleName" placeholder="Ex: Mina" />
                                                </el-form-item>
                                            </el-col>

                                        </el-row>

                                        <el-form-item label="Currency" prop="currency">
                                            <el-radio-group v-model="saleDto.currency">
                                                <el-radio label="MINA" />
                                            </el-radio-group>
                                        </el-form-item>

                                        <el-form-item label="Creation Fee Options" prop="feeRate">
                                            <el-radio-group v-model="saleDto.feeRate">
                                                <el-radio label="1">1 MINA</el-radio>
                                                <!-- <el-radio label="0">Other</el-radio> -->
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <!-- 步骤2 -->
                                <el-row class="row-bg formTable1" v-show="flagX === 1">
                                    <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                                    <el-col :span="24">
                                        <!-- 
                    <el-row class="row-bg">
                      <el-col :span="11">
                        <el-form-item label="Sale Name" prop="saleName">
                          <el-input v-model="saleDto.saleName" placeholder="Ex: Mina" />
                        </el-form-item>
                      </el-col>

                      <el-col :span="1"></el-col>

                      <el-col :span="12">
                        <el-form-item label="Total Raise (MINA)" prop="totalSaleSupply">
                          <el-input v-model.number.trim="saleDto.totalSaleSupply" placeholder="0" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    
                                        <el-form-item label="Presale rate" prop="saleRate" v-if="saleType == 0">
                                            <el-input v-model.number.trim="saleDto.saleRate" placeholder="0" />
                                            <div class="form-notes">If I spend 1 Mina how many tokens will I
                                                receive?</div>
                                        </el-form-item>
                    -->
                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="SoftCap (MINA)" prop="softCap">
                                                    <el-input v-model.number.trim="saleDto.softCap" placeholder="0" />
                                                    <div class="form-notes"> Softcap must be >= 25% of Hardcap!</div>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="HardCap (MINA)" prop="hardCap">
                                                    <el-input v-model.number.trim="saleDto.hardCap" placeholder="0" />
                                                    <div class="form-notes"> Setting max amount to raise</div>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>


                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Minimum buy (MINA)" prop="minimumBuy">
                                                    <el-input v-model.number.trim="saleDto.minimumBuy" placeholder="0" />
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Maximum buy (MINA)" prop="maximumBuy">
                                                    <el-input v-model.number.trim="saleDto.maximumBuy" placeholder="0" />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>


                                        <el-row class="row-bg">
                                            <el-col :span="12">
                                                <el-form-item label="Start Time" required style="width: 100%">
                                                    <el-date-picker v-model="saleDto.startTimestamp" type="datetime"
                                                        placeholder="Pick a Date" format="YYYY/MM/DD HH:mm:ss"
                                                        value-format="x" @change="changeSaleStartDateTime" />
                                                    <!-- <div v-if="startTargetBlockHeight != 0">(start at blockHeight: {{
                                                        startTargetBlockHeight }})</div> -->
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="12">
                                                <el-form-item label="End Time" required style="width: 100%">
                                                    <el-date-picker v-model="saleDto.endTimestamp" type="datetime"
                                                        placeholder="Pick a Date" format="YYYY/MM/DD HH:mm:ss"
                                                        value-format="x" @change="changeSaleEndDateTime" />
                                                    <!-- <div v-if="endTargetBlockHeight != 0">(End at blockHeight: {{
                                                        endTargetBlockHeight }})</div> -->
                                                </el-form-item>
                                            </el-col>
                                        </el-row>


                                        <el-form-item label="Whitelist" >
                                            <el-input v-model.trim="saleDto.whitelistMembers" type="textarea"
                                                :autosize="{ minRows: 2, maxRows: 1000 }"
                                                placeholder="Please input as comma-sperated Mina wallet addresses" />
                                        </el-form-item>

                                        <div style="border-color: #009688; border-width: 10px;">
                                            <span>Liquidity lockup</span><br /><br />

                                            <el-row class="row-bg">
                                                <el-col :span="11">
                                                    <el-form-item label="cliffTime(slots)" prop="cliffTime">
                                                        <el-input v-model.number.trim="saleDto.cliffTime" placeholder="0"
                                                            @input="changeCliffTime" />
                                                        <span v-if="dynamicalCliffTime">about {{ dynamicalCliffTime }}
                                                            minutes</span>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col :span="1"></el-col>

                                                <el-col :span="12">
                                                    <el-form-item label="cliffAmountRate(%)" prop="cliffAmountRate">
                                                        <el-input v-model.number.trim="saleDto.cliffAmountRate"
                                                            placeholder="0" @input="changeCliffAmountRate" />
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>

                                            <el-row class="row-bg">
                                                <el-col :span="11">
                                                    <el-form-item label="vestingPeriod(>=1 slot)" prop="vestingPeriod">
                                                        <el-input v-model.number.trim="saleDto.vestingPeriod"
                                                            placeholder="0" @input="changeVestingPeriod" />
                                                        <span v-if="dynamicalVestingPeriod">about {{ dynamicalVestingPeriod
                                                        }} minutes</span>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col :span="1"></el-col>

                                                <el-col :span="12">
                                                    <el-form-item label="vestingIncrement(%)" prop="vestingIncrement">
                                                        <el-input v-model.number.trim="saleDto.vestingIncrement"
                                                            placeholder="0" @input="changeVestingIncrement" />
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>

                                        </div>

                                    </el-col>
                                </el-row>

                                <!-- 步骤3 -->
                                <el-row class="row-bg formTable1" v-show="flagX === 2">
                                    <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>
                                    <el-col :span="24">

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Logo" prop="logoUrl">

                                                    <el-input v-model.trim="saleDto.logoUrl"
                                                        placeholder="Ex: https://..." />
                                                    <!--
                                                    <el-upload class="upload-demo" drag v-model="saleDto.logoUrl"
                                                        action="https://tokenizk.finance/" multiple :limit="1"
                                                        :on-exceed="handleExceed">
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
 -->
                                                    <!-- <div class="form-notes" style="margin-bottom: 0;">URL must end with a
                                                        supported image extension
                                                        png, jpg, jpeg or gif.You can upload your image at </div> -->

                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Website" prop="website">
                                                    <el-input v-model.trim="saleDto.website"
                                                        placeholder="Ex: https://..." />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Facebook" prop="facebook">
                                                    <el-input v-model.trim="saleDto.facebook"
                                                        placeholder="Ex: https://facebook.com/..." />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Twitter" prop="twitter">
                                                    <el-input v-model.trim="saleDto.twitter"
                                                        placeholder="Ex: https://twitter.com/..." />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Github" prop="github">
                                                    <el-input v-model.trim="saleDto.github"
                                                        placeholder="Ex: https://github.com/..." />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Telegram" prop="telegram">
                                                    <el-input v-model.trim="saleDto.telegram"
                                                        placeholder="Ex: https://t.me/..." />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Discord" prop="discord">
                                                    <el-input v-model.trim="saleDto.discord"
                                                        placeholder="Ex: https://discord.com/" />
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Reddit" prop="reddit">
                                                    <el-input v-model.trim="saleDto.reddit"
                                                        placeholder="Ex: https://reddit.com/..." />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <el-form-item label="Description" prop="description">
                                            <el-input v-model="saleDto.description" type="textarea"
                                                placeholder="Ex: This is the best project..." />
                                        </el-form-item>

                                    </el-col>
                                </el-row>

                                <!-- 步骤4 -->
                                <el-row class="row-bg formTable2" v-show="flagX === 3">
                                    <el-col :span="24">
                                        <!-- 
                    <el-row>
                      <el-col :span="12">Token name</el-col>
                      <el-col :span="12">{{ saleDto.tokenSymbol }}</el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">Token address</el-col>
                      <el-col :span="12">{{ saleDto.tokenAddress }}</el-col>
                    </el-row>
                    -->
                                        <el-row class="row-bg">
                                            <el-col :span="12">Sale name</el-col>
                                            <el-col :span="12">{{ saleDto.saleName }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Sale contract address</el-col>
                                            <el-col :span="12">{{ (saleDto.saleAddress != null || saleDto.saleAddress !=
                                                '') ? saleDto.saleAddress : `click 'confirm' to generate` }}</el-col>
                                        </el-row>
                                        <!-- 
                    <el-row>
                      <el-col :span="12">Sale Supply</el-col>
                      <el-col :span="12">{{ saleDto.totalSaleSupply }}</el-col>
                    </el-row>
                    -->
                                        <el-row>
                                            <el-col :span="12">Sale currency</el-col>
                                            <el-col :span="12">{{ saleDto.currency }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Sale creation fee</el-col>
                                            <el-col :span="12">{{ saleDto.feeRate }} MINA</el-col>
                                        </el-row>

<!--                                         
                                        <el-row v-show="saleDto.saleRate">
                                            <el-col :span="12">Sale Rate</el-col>
                                            <el-col :span="12">{{ saleDto.saleRate }}</el-col>
                                        </el-row>
 -->
                                        <el-row>
                                            <el-col :span="12">Sale whitelist</el-col>
                                            <el-col :span="12">
                                                <!-- {{ saleDto.whitelistMembers }} -->

                                                <div v-if="saleDto.whitelistMembers">
                                                    <el-button text @click="dialogTableVisible = true" type="success"
                                                        class="whiteListBtn">
                                                        whileList
                                                    </el-button>

                                                    <el-dialog v-model="dialogTableVisible" title="whileList table"
                                                        style="width:600px">
                                                        <ul>
                                                            <el-scrollbar max-height="400px">
                                                                <li v-for="item in saleDto.whitelistMembers.split(',')"
                                                                    :key="item.index"
                                                                    class="whiteListUl scrollbar-demo-item">{{ item }}
                                                                </li>
                                                            </el-scrollbar>
                                                        </ul>
                                                    </el-dialog>
                                                </div>
                                                <div v-else>
                                                    No WhiteList Members
                                                </div>
                                            </el-col>
                                        </el-row>

                                        <el-row v-show="saleDto.softCap">
                                            <el-col :span="12">Softcap</el-col>
                                            <el-col :span="12">{{ saleDto.softCap }} MINA</el-col>
                                        </el-row>

                                        <el-row v-show="saleDto.hardCap">
                                            <el-col :span="12">HardCap</el-col>
                                            <el-col :span="12">{{ saleDto.hardCap }} MINA</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Minimum buy</el-col>
                                            <el-col :span="12">{{ saleDto.minimumBuy }} MINA</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Maximum buy</el-col>
                                            <el-col :span="12">{{ saleDto.maximumBuy }} MINA</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Start Time</el-col>
                                            <el-col :span="12">{{ new Date(saleDto.startTimestamp) }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">End Time</el-col>
                                            <el-col :span="12">{{ new Date(saleDto.endTimestamp) }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity cliffTime</el-col>
                                            <el-col :span="12">{{ saleDto.cliffTime }} slots (about {{ dynamicalCliffTime
                                            }} minutes )</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity cliffAmountRate(%)</el-col>
                                            <el-col :span="12">{{ saleDto.cliffAmountRate }}%</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity vestingPeriod</el-col>
                                            <el-col :span="12">{{ saleDto.vestingPeriod }} slots (about
                                                {{ dynamicalVestingPeriod }} minutes )</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity vestingIncrement</el-col>
                                            <el-col :span="12">{{ saleDto.vestingIncrement }}%</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">logoUrl</el-col>
                                            <el-col :span="12">{{ saleDto.logoUrl }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Website</el-col>
                                            <el-col :span="12">{{ saleDto.website }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">facebook</el-col>
                                            <el-col :span="12">{{ saleDto.facebook }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">github</el-col>
                                            <el-col :span="12">{{ saleDto.github }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">twitter</el-col>
                                            <el-col :span="12">{{ saleDto.twitter }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">telegram</el-col>
                                            <el-col :span="12">{{ saleDto.telegram }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">discord</el-col>
                                            <el-col :span="12">{{ saleDto.discord }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">reddit</el-col>
                                            <el-col :span="12">{{ saleDto.reddit }}</el-col>
                                        </el-row>

                                    </el-col>
                                </el-row>

                                <!-- 上一步、下一步 -->
                                <el-row class="row-bg" justify="center" style="margin-top: 50px;">
                                    <el-col :span="8"></el-col>

                                    <el-col :span="6">
                                        <el-form-item>
                                            <el-button class="steps-Bar" @click="prev" type="primary"
                                                :disabled="checkIfTokenExist || !appState.connectedWallet58"
                                                size="large">back</el-button>
                                            <el-button class="steps-Bar" @click="next" type="primary" size="large"
                                                v-show="flagX != 3"
                                                :disabled="checkIfTokenExist || !appState.connectedWallet58">Next
                                            </el-button>
                                            <el-button type="primary" @click="submitForm(ruleFormRef)" v-show="flagX === 3">
                                                confirm </el-button>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :span="6"></el-col>
                                </el-row>

                            </el-form>
                        </el-col>
                    </el-row>

                </el-col>
            </el-row>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.create-token-sale {
    width: 100%;
    padding: 10% 15%;

    .form-notes {
        font-size: 12px;
        color: #00c798;
    }

    .Step-Bar {
        margin: 80px auto;
    }

    .steps-Bar {
        margin-right: 30px;
    }

    // 日期选择器
    .demo-datetime-picker {
        display: flex;
        width: 100%;
        padding: 0;
        flex-wrap: wrap;
    }

    .demo-datetime-picker .block {
        padding: 30px 0;
        text-align: center;
        border-right: solid 1px var(--el-border-color);
        flex: 1;
    }

    .demo-datetime-picker .block:last-child {
        border-right: none;
    }

    .demo-datetime-picker .demonstration {
        display: block;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 20px;
    }

    // 步骤4

    .formTable1 {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
    }

    .formTable2 {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;

        .whiteListBtn {
            color: #fff;
            background-color: #00c798;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 10px;
        }

        .whiteListUl {
            border: 1px solid #e6e6e6;
            padding: 10px 0 10px 10px;
        }

        .whiteListUl:nth-child(odd) {
            background-color: #f2f2f2;
        }

        .scrollbar-demo-item {
            display: flex;
            align-items: center;
            margin: 10px;
            text-align: center;
            border-radius: 4px;
        }

        .el-row {
            border-bottom: 1px solid #e6e6e6;
        }
    }

    .el-form-item__label {
        width: 100px;
        text-align: right;
        line-height: 32px;
    }

    .el-form-item {
        margin-bottom: 30px;
    }


    .el-row {
        margin-bottom: 20px;
    }

}
</style>
@/apis/sale-api
