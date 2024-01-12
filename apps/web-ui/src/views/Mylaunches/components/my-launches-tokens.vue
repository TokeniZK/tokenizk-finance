<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
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

    // query token list
    const tokenDtoList = (await queryToken(appState.tokeniZkBasicTokenKeyPair?.value)) ?? [];

    if (tokenDtoList.length == 0) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `fetch no token!`,
        });
        return;
    }

    tokenDtoForm.tokenDto = tokenDtoList[0];

    // 进入当前组件都会回到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动到顶部  
    });

})

</script>

<template>
    <el-row class="row-bg my-launches-tokens">
        <el-col :span="24" class="tokenTable">
            <el-row>
                <el-col :span="8">Name :</el-col>
                <el-col :span="12">{{ tokenDtoForm.tokenDto.name }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8">Symbol :</el-col>
                <el-col :span="12">{{ tokenDtoForm.tokenDto.symbol }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8">Total supply :</el-col>
                <el-col :span="12">{{ tokenDtoForm.tokenDto.totalSupply }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8">Total Amount In Circulation :</el-col>
                <el-col :span="12">{{ tokenDtoForm.tokenDto.totalAmountInCirculation }}</el-col>
            </el-row>

            <el-row>
                <el-col :span="8">txHash :</el-col>
                <el-col :span="12">{{ appState.explorerUrl.concat(tokenDtoForm.tokenDto.txHash) }}</el-col>
            </el-row>
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
    }

    .el-row {
        margin-bottom: 20px;
    }
}
</style>
