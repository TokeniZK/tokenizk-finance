<script setup lang="ts">
import { onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores"
import type { AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { useRoute, useRouter } from 'vue-router'
import AirdropBlock from '@/components/airdrop-block.vue'
import { queryAirdropUserContribution } from '@/apis/airdrop-api'
import { ElMessage } from 'element-plus'

const type = 0;

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
  // userContribute: {
  //   txHash: string;
  //   contributeTimestamp: string;
  //   contributedCurrencyAmount: string;
  // }
}

let fetchResult: AirdropUserDtoExtend[] = [];

const myAirdropsList = reactive({ airdropList: fetchResult });

// 转换项目的状态
// const transformProjectStatus = (itmes: AirdropDtoExtend[]) => {
//   let currentTime = new Date().getTime();

//   itmes.forEach(item => {
//     if (item.airdropDto.startTimestamp > currentTime) {
//       item.airdropDto.projectStatus = 'Upcoming'
//     } else if (item.airdropDto.startTimestamp <= currentTime && item.airdropDto.endTimestamp > currentTime) {
//       item.airdropDto.projectStatus = 'Ongoing'
//     } else if (item.airdropDto.endTimestamp < currentTime) {
//       item.airdropDto.projectStatus = 'Ended'
//     } else {
//       item.airdropDto.projectStatus = 'All Status'
//     }
//   });
// }

// 组件挂载完成后执行的函数  请求数据  
onMounted(async () => {
  fetchResult = await queryAirdropUserContribution(type, appState.connectedWallet58!);

  // transformProjectStatus(fetchResult);

  myAirdropsList.airdropList = fetchResult;

  if (myAirdropsList.airdropList.length == 0) {
    ElMessage({
      showClose: true,
      type: 'info',
      message: `My Airdrops List is empty.`,
    });
  }

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})

</script>

<template>
  <el-row class="row-bg my-airdrop">

    <el-col :span="24">

      <!-- 搜索、过滤器 -->


      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="my-airdrop-ul">

            <li v-for="item in myAirdropsList.airdropList" :key="item.airdropDto.id" style="margin-bottom: 40px;">

              <AirdropBlock :airdropDto="item" />

            </li>

          </ul>

        </el-col>
      </el-row>

    </el-col>

  </el-row>
</template>

<style lang="less" scoped>
.my-airdrop {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 50px;

  .input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
  }

  .my-airdrop-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

}

.el-row {
  margin-bottom: 5px;
}
</style>
