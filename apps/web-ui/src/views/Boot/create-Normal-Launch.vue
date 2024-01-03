<script lang="ts" setup>
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { type SaleDto, type TokenDto } from "@tokenizk/types";
import { useStatusStore, type AppState } from "@/stores";
import { createRemoteCircuitController, CircuitControllerState } from "@/stores"
import { queryToken } from "@/apis/token-api";
import { PrivateKey } from 'o1js';
import { SaleParams, WHITELIST_TREE_ROOT } from '@tokenizk/contracts';
import { submitSale } from '@/apis/sale-api';
import { calcWhitelistTreeRoot } from '@/utils/whitelist-tree-calc';
import { download as downloadAsFile } from '@/utils/sale-key-download';


const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

let saleDtoInit: SaleDto = {
    id: 0,
    saleType: 0,
    txHash: '',
    status: 0,
    tokenAddress: appState.connectedWallet58 as string,
    tokenSymbol: '',
    saleName: '',
    saleAddress: null as any as string,
    totalSaleSupply: null as any as number,
    currency: '',
    feeRate: '',
    saleRate: null as any as number,
    whitelistTreeRoot: '',
    whitelistMembers: '',
    softCap: null as any as number,
    hardCap: null as any as number,
    minimumBuy: null as any as number,
    maximumBuy: null as any as number,
    startTimestamp: new Date().getTime(),
    endTimestamp: new Date().getTime(),
    cliffTime: null as any as number,
    cliffAmountRate: null as any as number,
    vestingPeriod: null as any as number,
    vestingIncrement: null as any as number,
    contributorsFetchFlag: null as any as number,
    contributorsTreeRoot: '',
    contributorsMaintainFlag: null as any as number,
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

const tokenDtoInit: TokenDto = {
    symbol: '',
    id: 0,
    txHash: '',
    type: 0,
    status: 0,
    address: '',
    name: '',
    zkappUri: '',
    totalSupply: 0,
    totalAmountInCirculation: 0,
    updatedAt: 0,
    createdAt: 0,
};

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

const ruleFormRef = ref<FormInstance>()

const saleDto = reactive<SaleDto>(saleDtoInit)
const tokenDto = reactive<TokenDto>(tokenDtoInit)

let saleStartDateTime = new Date();
let saleEndDateTime = new Date();
const changeSaleStartDateTime = (choosedDate: Date) => {
    console.log(choosedDate);
    saleDto.startTimestamp = choosedDate.getTime();
}

watch(() => appState.connectedWallet58, (newAddress: string, oldValue: string) => {
    console.log('oldValue: ' + oldValue)
    saleDto.tokenAddress = newAddress;
});

// 正则
const rules = reactive<FormRules<SaleDto>>({

    // 步骤1
    tokenAddress: [
        { required: true, message: 'Please input Token address', trigger: 'blur' },
    ],

    // tokenName: [
    //   {
    //     required: true,
    //     message: 'Please input Token name',
    //     trigger: 'blur',
    //   },
    // ],

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


    // 步骤2
    saleRate: [
        {
            type: 'number',
            required: true,
            message: 'saleRate must be number type',
            trigger: 'blur'
        },
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
    ],

    hardCap: [
        {
            type: 'number',
            required: true,
            message: 'hardCap must be number type',
            trigger: 'blur'
        },
    ],

    minimumBuy: [
        {
            type: 'number',
            required: true,
            message: 'minimumBuy must be number type',
            trigger: 'blur'
        },
    ],

    maximumBuy: [
        {
            type: 'number',
            required: true,
            message: 'maximumBuy must be number type',
            trigger: 'blur'
        },
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
    ],

    logoUrl: [
        { required: true, message: 'Please input logoUrl', trigger: 'blur' },
    ]
    /*
        ,
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

            const maskId = 'createPresale';
            /*
            // check if circuit has been compiled, if not , prompt: wait
            if (!appState.tokenizkPresaleCompiled) {

                showLoadingMask({ id: maskId, text: 'compiling TokeniZkPresale circuit...' });

                const flag = await CircuitControllerState.remoteController?.compileTokeniZkPresale()
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
            if (saleDto.whitelistMembers) {
                showLoadingMask({ id: maskId, text: 'constructing whitelist tree...' });

                console.log('members: ' + saleDto.whitelistMembers);

                const members = saleDto.whitelistMembers.trim().split(',');
                saleDto.whitelistTreeRoot = await calcWhitelistTreeRoot(members);

                console.log('whitelistTreeRoot: ' + saleDto.whitelistTreeRoot);
            } else {
                saleDto.whitelistTreeRoot = '0';
            }

            showLoadingMask({ id: maskId, text: 'generating presale KeyPair ...' });
            // download keypair
            const saleKey = PrivateKey.random();
            const saleAddress = saleKey.toPublicKey().toBase58();
            saleDto.saleAddress = saleAddress;
            downloadAsFile(`{"presaleKey": ${saleKey.toBase58()}, "presaleAddress": ${saleAddress}}`, 'TokenizkPresale-Key.json');

            showLoadingMask({ id: maskId, text: 'witness calculating...' });
            const factoryAddress = appState.tokeniZkFactoryAddress;
            const basicTokenZkAppAddress = appState.connectedWallet58;

            const saleParams = {
                tokeniZkBasicTokenAddress: saleDto.tokenAddress,
                totalPresaleSupply: saleDto.totalSaleSupply,
                presaleRate: saleDto.saleRate,
                whitelistTreeRoot: saleDto.whitelistTreeRoot,
                softCap: saleDto.softCap * (10 ** 9),
                hardCap: saleDto.hardCap * (10 ** 9),
                minimumBuy: saleDto.minimumBuy * (10 ** 9),
                maximumBuy: saleDto.maximumBuy * (10 ** 9),
                startTime: saleDto.startTimestamp,
                endTime: saleDto.endTimestamp,
                cliffTime: saleDto.cliffTime,
                cliffAmountRate: saleDto.cliffAmountRate,
                vestingPeriod: saleDto.vestingPeriod, // 0 is not allowed, default value is 1
                vestingIncrement: saleDto.vestingIncrement
            };

            const feePayerAddress = appState.connectedWallet58;
            const txFee = 0.1 * (10 ** 9)
            const txJson = await CircuitControllerState.remoteController?.createPresale(factoryAddress, basicTokenZkAppAddress, saleAddress, saleParams, feePayerAddress, txFee);
            console.log('createPresale tsJson: ' + txJson);
            showLoadingMask({ id: maskId, text: 'sending transaction...' });

            try {
                const { hash: txHash } = await window.mina.sendTransaction({
                    transaction: txJson,
                    feePayer: {
                        fee: 0.101,
                        memo: "createPresale"
                    },
                });
                console.log('tx send success, txHash: ', txHash);
                saleDto.txHash = txHash;
            } catch (error) {
                console.error(error);

                closeLoadingMask(maskId);
            }

            // send back to backend for recording
            showLoadingMask({ id: maskId, text: 'submit to backend...' });
            const rs = await submitSale(saleDto);// TODO!!! 本尊
            if (rs) {
                goToTop();
            } else {
                ElMessage({
                    showClose: true,
                    type: 'warning',
                    message: 'submit to backend failed...',
                });
            }

            closeLoadingMask(maskId);

        } else {
            console.log('error submit!', fields)
        }
    })
}

// 组件挂载完成后执行的函数
onMounted(async () => {

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

    // fetch token info
    // TODO!!!
    // const tokenInfo = await queryToken(appState.connectedWallet58);
    const tokenInfo: TokenDto = {
        symbol: 'XMina',
        id: 1,
        txHash: 'ex4353fdsafdsafd',
        type: 0,
        status: 1,
        address: '',
        name: 'XMina Token',
        zkappUri: '',
        totalSupply: 210000000000000,
        totalAmountInCirculation: 1000000000,
        updatedAt: 17553321432430,
        createdAt: 17553321332430,
    };// TODO !!
    tokenDto.symbol = tokenInfo?.symbol;
    tokenDto.id = tokenInfo?.id;
    tokenDto.txHash = tokenInfo?.txHash;
    tokenDto.type = tokenInfo?.type;
    tokenDto.status = tokenInfo?.status;
    tokenDto.address = tokenInfo?.address;
    tokenDto.name = tokenInfo?.name;
    tokenDto.zkappUri = tokenInfo?.zkappUri;
    tokenDto.totalSupply = tokenInfo?.totalSupply;
    tokenDto.totalAmountInCirculation = tokenInfo?.totalAmountInCirculation;
    tokenDto.updatedAt = tokenInfo?.updatedAt;
    tokenDto.createdAt = tokenInfo?.createdAt;

    saleDto.tokenSymbol = tokenInfo?.symbol;

})

</script>

<template>
    <el-row class="row-bg create-normal-launch" justify="center">

        <el-col :span="24">

            <el-row>
                <div class="create-ZkToken-title">
                    <h1>Create Normal Launch</h1>
                </div>
            </el-row>

            <!-- 步骤条 -->
            <el-row class="row-bg Step-Bar" justify="center">
                <el-col :span="24">
                    <el-steps :active="active" finish-status="success" align-center>

                        <el-step title="Verify Token" description="Enter the token address and verify" />

                        <el-step title="Launchpad Info"
                            description="Enter the launchpad information that you want to raise , that should be enter all details about your presale" />

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
                                    <el-col :span="11" v-if="!saleDto.tokenSymbol">
                                        <router-link to="/create-zk-token">
                                            <span style="color: #009688;">Create zkToken</span>
                                        </router-link>
                                    </el-col>

                                    <el-col :span="24" v-else>
                                        <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                                        <el-row class="row-bg">

                                            <el-col>
                                                <el-row>
                                                    <el-col :span="8" hidden="true">
                                                        <el-form-item label="Token address" prop="tokenAddress">
                                                            <el-input v-model.trim="saleDto.tokenAddress"
                                                                placeholder="Ex: Mina" />
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="8">
                                                        <el-form-item label="Token Name">
                                                            {{ tokenDto.symbol }}
                                                        </el-form-item></el-col>
                                                    <el-col :span="8">
                                                        <el-form-item label="Token Total Supply">
                                                            {{ tokenDto.totalSupply }}
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="8">
                                                        <el-form-item label="Amount In Circulation">
                                                            {{ tokenDto.totalAmountInCirculation }}
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                            </el-col>
                                        </el-row>

                                        <el-form-item label="Currency" prop="currency">
                                            <el-radio-group v-model="saleDto.currency">
                                                <el-radio label="MINA" />
                                            </el-radio-group>
                                        </el-form-item>

                                        <el-form-item label="Creation Fee Options" prop="feeRate">
                                            <el-radio-group v-model="saleDto.feeRate">
                                                <el-radio label="100">100 MINA</el-radio>
                                                <el-radio label="0" disabled="true">Other</el-radio>

                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <!-- 步骤2 -->
                                <el-row class="row-bg formTable1" v-show="flagX === 1">
                                    <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>

                                    <el-col :span="24">
                                        <el-col>
                                            <el-form-item label="Sale Name" prop="saleName">
                                                <el-input v-model="saleDto.saleName" placeholder="Ex: Mina" />
                                            </el-form-item>
                                        </el-col>
                                        <el-form-item label="Presale Total Supply" prop="totalSaleSupply">
                                            <el-input v-model.number.trim="saleDto.totalSaleSupply" placeholder="0" />
                                        </el-form-item>
                                        <el-form-item label="Presale rate" prop="saleRate">
                                            <el-input v-model.number.trim="saleDto.saleRate" placeholder="0" />
                                            <div class="form-notes">If I spend 1 Mina how many tokens will I receive?</div>
                                        </el-form-item>

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="SoftCap (Mina)" prop="softCap">
                                                    <el-input v-model.number.trim="saleDto.softCap" placeholder="0" />
                                                    <div class="form-notes"> Softcap must be >= 25% of Hardcap!</div>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="HardCap (Mina)" prop="hardCap">
                                                    <el-input v-model.number.trim="saleDto.hardCap" placeholder="0" />
                                                    <div class="form-notes"> Setting max contribution?</div>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>


                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Minimum buy (Mina)" prop="minimumBuy">
                                                    <el-input v-model.number.trim="saleDto.minimumBuy" placeholder="0" />
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="1"></el-col>

                                            <el-col :span="12">
                                                <el-form-item label="Maximum buy (Mina)" prop="maximumBuy">
                                                    <el-input v-model.number.trim="saleDto.maximumBuy" placeholder="0" />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>


                                        <el-row class="row-bg">
                                            <el-col :span="12">
                                                <el-form-item label="Start Time (UTC)" required style="width: 100%">
                                                    <el-date-picker v-model="saleStartDateTime" type="datetime"
                                                        placeholder="Pick a Date" format="YYYY/MM/DD hh:mm:ss"
                                                        value-format="x" />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="12">
                                                <el-form-item label="End Time (UTC)" required style="width: 100%">
                                                    <el-date-picker v-model="saleEndDateTime" type="datetime"
                                                        placeholder="Pick a Date" format="YYYY/MM/DD hh:mm:ss"
                                                        value-format="x" />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>

                                        <!-- 模态框 -->
                                        <el-form-item label="Whitelist" prop="whitelistMembers">
                                            <el-input v-model.trim="saleDto.whitelistMembers" type="textarea"
                                                :autosize="{ minRows: 2, maxRows: 1000 }"
                                                placeholder="Please input as comma-sperated Mina wallet addresses" />
                                        </el-form-item>

                                        <div style="border-color: #009688; border-width: 10px;">
                                            <span>Liquidity lockup</span><br /><br />
                                            <el-form-item label="cliffTime" prop="cliffTime">
                                                <el-input v-model.number.trim="saleDto.cliffTime" placeholder="0" />
                                            </el-form-item>
                                            <el-form-item label="cliffAmountRate" prop="cliffAmountRate">
                                                <el-input v-model.number.trim="saleDto.cliffAmountRate" placeholder="0" />
                                            </el-form-item>
                                            <el-form-item label="vestingPeriod(>=1)" prop="vestingPeriod">
                                                <el-input v-model.number.trim="saleDto.vestingPeriod" placeholder="0" />
                                            </el-form-item>
                                            <el-form-item label="vestingIncrement" prop="vestingIncrement">
                                                <el-input v-model.number.trim="saleDto.vestingIncrement" placeholder="0" />
                                            </el-form-item>
                                        </div>

                                    </el-col>
                                </el-row>

                                <!-- 步骤3 -->
                                <el-row class="row-bg formTable1" v-show="flagX === 2">
                                    <div class="form-notes" style="margin-bottom: 20px;">(*) is required field.</div>
                                    <el-col :span="24">

                                        <el-row class="row-bg">
                                            <el-col :span="11">
                                                <el-form-item label="Logo URL" prop="logoUrl">
                                                    <el-input v-model.trim="saleDto.logoUrl"
                                                        placeholder="Ex: https://..." />
                                                    <div class="form-notes" style="margin-bottom: 0;">URL must end with a
                                                        supported image extension
                                                        png, jpg, jpeg or gif.You can upload your image at </div>
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

                                        <el-row>
                                            <el-col :span="12">Token name</el-col>
                                            <el-col :span="12">{{ saleDto.tokenSymbol }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Token address</el-col>
                                            <el-col :span="12">{{ saleDto.tokenAddress }}</el-col>
                                        </el-row>
                                        <el-row class="row-bg">
                                            <el-col :span="12">Sale name</el-col>
                                            <el-col :span="12">{{ saleDto.saleName }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Sale contract address</el-col>
                                            <el-col :span="12">{{ (saleDto.saleAddress != null || saleDto.saleAddress !=
                                                '') ? saleDto.saleAddress : `click 'confirm' to generate` }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Sale Supply</el-col>
                                            <el-col :span="12">{{ saleDto.totalSaleSupply }}</el-col>
                                        </el-row>
                                        <!-- 注意 下面两项 -->
                                        <el-row>
                                            <el-col :span="12">Sale currency</el-col>
                                            <el-col :span="12">{{ saleDto.currency }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Sale creation fee</el-col>
                                            <el-col :span="12">{{ saleDto.feeRate }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Sale Rate</el-col>
                                            <el-col :span="12">{{ saleDto.saleRate }}</el-col>
                                        </el-row>

                                        <el-row
                                            :hidden="saleDto.whitelistMembers == null || saleDto.whitelistMembers == ''">
                                            <el-col :span="12">Sale whitelist</el-col>
                                            <el-col :span="12">{{ saleDto.whitelistMembers }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Softcap</el-col>
                                            <el-col :span="12">{{ saleDto.softCap }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">HardCap</el-col>
                                            <el-col :span="12">{{ saleDto.hardCap }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Minimum buy</el-col>
                                            <el-col :span="12">{{ saleDto.minimumBuy }}</el-col>
                                        </el-row>

                                        <el-row>
                                            <el-col :span="12">Maximum buy</el-col>
                                            <el-col :span="12">{{ saleDto.maximumBuy }}</el-col>
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
                                            <el-col :span="12">{{ saleDto.cliffTime }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity cliffAmountRate</el-col>
                                            <el-col :span="12">{{ saleDto.cliffAmountRate }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity vestingPeriod</el-col>
                                            <el-col :span="12">{{ saleDto.vestingPeriod }}</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="12">Liquidity vestingIncrement</el-col>
                                            <el-col :span="12">{{ saleDto.vestingIncrement }}</el-col>
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
                                                :disabled="!saleDto.tokenSymbol" size="large">back</el-button>
                                            <el-button class="steps-Bar" @click="next" type="primary" size="large"
                                                v-show="flagX != 3" :disabled="!saleDto.tokenSymbol">Next
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
.create-normal-launch {
    width: 100%;
    padding: 200px 200px 100px 200px;

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
    }

    .formTable2 {
        background-color: #fff;
        padding: 20px;

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
