<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { type AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { type AirdropReq } from '@tokenizk/types/src/airdrop-req'
import AirdropBlock from '@/components/airdrop-block.vue'
import { queryAirdrop } from '@/apis/airdrop-api'
import { CircuitControllerState, useStatusStore } from '@/stores';
import { syncLatestBlock } from '@/utils/txUtils'
import { ElMessage } from 'element-plus'

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

let type = 0;

type AirdropDtoExtend = AirdropDto & { projectStatus: string }

let fetchResult: AirdropDtoExtend[] = [];

// 转换项目的状态
const transformProjectStatus = async (itmes: AirdropDtoExtend[]) => {

  // if (appState.latestBlockInfo!.blockchainLength == 0 || new Date().getTime() - appState.fetchLatestBlockInfoTimestamp >= 2 * 60 * 1000) {
  //   appState.latestBlockInfo = (await syncLatestBlock()) ?? appState.latestBlockInfo;
  //   appState.fetchLatestBlockInfoTimestamp = new Date().getTime();
  // }

  // const currentBlockHeight = appState.latestBlockInfo!.blockchainLength;
  // itmes.forEach(item => {
  //   if (item.startTimestamp > currentBlockHeight) {
  //     item.projectStatus = 'Upcoming'
  //   } else if (item.startTimestamp <= currentBlockHeight && item.endTimestamp > currentBlockHeight) {
  //     item.projectStatus = 'Ongoing'
  //   } else if (item.endTimestamp < currentBlockHeight) {
  //     item.projectStatus = 'Ended'
  //   } else {
  //     item.projectStatus = 'All Status'
  //   }
  // });

  const currentTimestamp = Date.now();
  itmes.forEach(item => {
    if (item.startTimestamp > currentTimestamp) {
      item.projectStatus = 'Upcoming'
    } else if (item.startTimestamp <= currentTimestamp && item.endTimestamp > currentTimestamp) {
      item.projectStatus = 'Ongoing'
    } else if (item.endTimestamp < currentTimestamp) {
      item.projectStatus = 'Ended'
    } else {
      item.projectStatus = 'All Status'
    }
  });


}


let renderAirdropBlock: AirdropDtoExtend[] = [];
// 临时数据
let airdropProjects = reactive({ airdropList: renderAirdropBlock });

// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const getSearchProjects = async () => {

  const airdropReq = {
    airdropType: type,
    airdropName: keyWord.value,
    take: 6
  } as any as AirdropReq;

  fetchResult = (await queryAirdrop(airdropReq)) as AirdropDtoExtend[];

  if (!fetchResult) {
    ElMessage({
      showClose: true,
      type: 'warning',
      message: `Please check network connection !`,
    });
    return;
  }

  // 转换项目状态
  await transformProjectStatus(fetchResult);

  renderAirdropBlock = fetchResult;
  airdropProjects.airdropList = renderAirdropBlock
}


// 组件挂载完成后执行的函数 
onMounted(() => {
  getSearchProjects();
})


</script>


<template>
  <el-row class="row-bg airdrop-items" justify="center">
    <el-col :span="24">

      <!-- 标题+按钮 -->
      <el-row class="row-bg ongoing-presales-content" justify="center">

        <el-col :span="10">
          <el-row>
            <h2 class="title">Airdrop items</h2>
          </el-row>
          <el-row>Fair Airdrop tool helps project team to record related contributors and token distribution.</el-row>
        </el-col>

        <el-col :span="8" class="link">
          <el-row class="mb-4" justify="end">
            <router-link to="/airdrop-list" >
              <el-button type="primary" size="large" class="main-btn" round>
                View All Item
              </el-button>
            </router-link>
          </el-row>
        </el-col>

      </el-row>


      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="airdrops-ul">
            <li v-for="item in airdropProjects.airdropList" :key="item.id" style="margin-bottom: 40px;">

              <AirdropBlock :airdropDto="item" />

            </li>
          </ul>

        </el-col>
      </el-row>


    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.airdrop-items {
  width: 100%;
  overflow: hidden;
  margin-bottom: 100px;

  .ongoing-presales-content {
    width: 100%;

    .title {
      font-size: 35px;
    }

    .link {
      padding-top: 40px;

      .main-btn {
        font-size: 16px;
        color: #fff;
        &:hover {
            color: #00c798;
        }
      }

    }

  }

  .airdrops-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    overflow: hidden;
    margin-top: 40px;
  }

  .el-row {
    margin-bottom: 5px;
  }

}
</style>