<script lang="ts" setup>
import { onBeforeMount, onMounted, reactive } from 'vue'
import { useStatusStore, type AppState } from "@/stores";
import { ElMessage } from 'element-plus';
import { queryToken } from '@/apis/token-api';
import type { TokenDto } from '@tokenizk/types';

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const tokenDtoForm = reactive<{ tokenDto: TokenDto }>({ tokenDto: {} as TokenDto });

// 组件挂载完成后执行的函数
onMounted(async () => {
    if (!(appState.connectedWallet58 != '' && appState.connectedWallet58 != null)) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect wallet first.`,
        });
        return;
    }

    const maskId = 'queryToken';
    showLoadingMask({ id: maskId, text: 'loading...' });
    // query token list
    const tokenDtoList = (await queryToken(appState.tokeniZkBasicTokenKeyPair?.value)) ?? [];

    if (tokenDtoList.length == 0) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `fetch no token!`,
        });
        closeLoadingMask(maskId);
        return;
    }

    tokenDtoForm.tokenDto = tokenDtoList[0];

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

    closeLoadingMask(maskId);

})

</script>

<template>
    <el-row class="row-bg my-launches-tokens" v-if="tokenDtoForm.tokenDto.name">

        <el-col :span="24" class="tokenTable">

            <el-row justify="flex-start">
                <el-col :span="8" class="wide4">Name :</el-col>
                <el-col :span="15">{{ tokenDtoForm.tokenDto.name }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8" class="wide4">Symbol :</el-col>
                <el-col :span="15">{{ tokenDtoForm.tokenDto.symbol }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8" class="wide4">Total supply :</el-col>
                <el-col :span="15">{{ tokenDtoForm.tokenDto.totalSupply / (10 ** 9) }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8" class="wide4">Total Amount In Circulation :</el-col>
                <el-col :span="15">{{ tokenDtoForm.tokenDto.totalAmountInCirculation / (10 ** 9) }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8" class="wide4">txHash :</el-col>
                <el-col :span="15">{{ appState.explorerUrl.concat(tokenDtoForm.tokenDto.txHash) }}</el-col>
            </el-row>

        </el-col>

    </el-row>

    <el-row class="row-bg my-launches-tokens" v-else>
        <el-col :span="24" class="tokenTable">

            <div>You have not created any token yet. please go : <br>
                <router-link to="/create-zk-token">
                    <el-button type="primary" class="JumpBtn">Create zkToken</el-button>
                </router-link>
            </div>

        </el-col>
    </el-row>
</template>

<style lang="less" scoped>
.my-launches-tokens {
    width: 100%;
    padding: 0 15%;

    .tokenTable {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        // text-align: center;

        .JumpBtn {
            margin-top: 20px;
            margin-left: 20px;
            &:hover {
                 color: #00c798;
            }
        }

        .wide4 {
            font-weight: 700;
        }
    }

    .el-row {
        margin-bottom: 20px;
    }
}
</style>
