<script setup lang="ts">
import { onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores"
import type { AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { useRoute, useRouter } from 'vue-router'
import AirdropBlock from '@/components/airdrop-block.vue'
import { queryAirdrop } from '@/apis/airdrop-api'
import { syncLatestBlock } from '@/utils/txUtils'

const route = useRoute();
const type = route.query.type;

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

const router = useRouter();
watch(() => appState.connectedWallet58, async (value, oldValue) => {
  if (!appState.connectedWallet58) {
    router.replace('/sales?type=' + type);
  }
})

type AirdropDtoExtend = AirdropDto & { projectStatus: string }
type AirdropUserDtoExtend = {
  airdropDto: AirdropDtoExtend,
}

let fetchResult: AirdropUserDtoExtend[] = [];

const myAirdropsList = reactive({ airdropList: fetchResult });

// 转换项目的状态
const transformProjectStatus = async (itmes: AirdropDtoExtend[]) => {
  if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 1.5 * 60 * 1000) {
    appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
    appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
  }

  const currentBlockHeight = appState.latestBlockInfo!.blockchainLength;
  itmes.forEach(item => {
    if (item.startTimestamp > currentBlockHeight) {
      item.projectStatus = 'Upcoming'
    } else if (item.startTimestamp <= currentBlockHeight && item.endTimestamp > currentBlockHeight) {
      item.projectStatus = 'Ongoing'
    } else if (item.endTimestamp < currentBlockHeight) {
      item.projectStatus = 'Ended'
    } else {
      item.projectStatus = 'All Status'
    }
  });
}

// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {
  const req: AirdropReq = {
    airdropType: 0,
    tokenAddress: appState.tokeniZkBasicTokenKeyPair.value
  };
  fetchResult = await queryAirdrop(req);
  await transformProjectStatus(fetchResult);

  myAirdropsList.airdropList = fetchResult;

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})

</script>

<template>
  <el-row class="row-bg my-airdrop" v-if="myAirdropsList.airdropList.length > 0">
    <el-col :span="24">

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="my-airdrop-ul">

            <li v-for="item in myAirdropsList.airdropList" :key="item.id" style="margin-bottom: 40px;">

              <AirdropBlock :airdropDto="item" />

            </li>

          </ul>

        </el-col>
      </el-row>

    </el-col>
  </el-row>


  <el-row class="my-airdrop" v-else>
    <el-col :span="24" class="tokenTable">

      <div>
        You have not created any airdrops yet. Please go create ones : <br>
        <router-link to="/create-new-airdrop">
          <el-button type="primary" class="JumpBtn">Create Airdrop</el-button>
        </router-link>
      </div>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.my-airdrop {
  width: 100%;
  padding: 0 15%;

  .input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
  }

  .my-airdrop-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .tokenTable {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;

    .JumpBtn {
      margin-top: 20px;
      margin-left: 20px;
    }
  }

}

.el-row {
  margin-bottom: 5px;
}
</style>
