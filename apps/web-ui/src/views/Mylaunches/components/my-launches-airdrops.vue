<script setup lang="ts">
import { onMounted, reactive, computed, type ComputedRef, watch } from 'vue'
import { useStatusStore } from "@/stores"
import type { AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { useRoute, useRouter } from 'vue-router'
import AirdropBlock from '@/components/airdrop-block.vue'

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
  // myContributionsList.saleList = await querySaleUserContribution(type, appState.connectedWallet58!);
  // 临时数据 本尊
  fetchResult = [{
    airdropDto: {
      id: 0,
      type: 1,
      txHash: '0x123456789',
      status: 1,
      tokenName: 'OZ',
      tokenAddress: 'B62xxxt',
      tokenSymbol: 'TZ',
      airdropName: 'Oggy Inu 2.0',
      airdropAddress: 'B62xxs',
      star: 4,
      totalAirdropSupply: 20,
      currency: 'Mina',
      feeRate: '5%',
      whitelistTreeRoot: '45678ityuioghjk',
      whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
      startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
      endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
      projectStatus: '',
      cliffTime: 300,
      cliffAmountRate: 3,
      vestingPeriod: 4,
      vestingIncrement: 5,
      teamName: 'Tokenizk Team',
      logoUrl: '/src/assets/images/1.png',
      website: 'https://tokenizk.finance/',
      facebook: 'https://tokenizk.finance/',
      github: 'https://tokenizk.finance/',
      twitter: 'https://tokenizk.finance/',
      telegram: 'https://tokenizk.finance/',
      discord: 'https://tokenizk.finance/',
      reddit: 'https://tokenizk.finance/',
      description: 'The Launchpad focusing on ZK-Token for Everyone!',
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
    },
  },
  {
    airdropDto: {
      id: 0,
      type: 1,
      txHash: '0x123456789',
      status: 1,
      tokenName: 'OZ',
      tokenAddress: 'B62xxxt',
      tokenSymbol: 'TZ',
      airdropName: 'Oggy Inu 2.0',
      airdropAddress: 'B62xxs',
      star: 4,
      totalAirdropSupply: 20,
      currency: 'Mina',
      feeRate: '5%',
      whitelistTreeRoot: '45678ityuioghjk',
      whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
      startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
      endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
      projectStatus: '',
      cliffTime: 300,
      cliffAmountRate: 3,
      vestingPeriod: 4,
      vestingIncrement: 5,
      teamName: 'Tokenizk Team',
      logoUrl: '/src/assets/images/1.png',
      website: 'https://tokenizk.finance/',
      facebook: 'https://tokenizk.finance/',
      github: 'https://tokenizk.finance/',
      twitter: 'https://tokenizk.finance/',
      telegram: 'https://tokenizk.finance/',
      discord: 'https://tokenizk.finance/',
      reddit: 'https://tokenizk.finance/',
      description: 'The Launchpad focusing on ZK-Token for Everyone!',
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
    },
  },
  {
    airdropDto: {
      id: 0,
      type: 1,
      txHash: '0x123456789',
      status: 1,
      tokenName: 'OZ',
      tokenAddress: 'B62xxxt',
      tokenSymbol: 'TZ',
      airdropName: 'Oggy Inu 2.0',
      airdropAddress: 'B62xxs',
      star: 4,
      totalAirdropSupply: 20,
      currency: 'Mina',
      feeRate: '5%',
      whitelistTreeRoot: '45678ityuioghjk',
      whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
      startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
      endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
      projectStatus: '',
      cliffTime: 300,
      cliffAmountRate: 3,
      vestingPeriod: 4,
      vestingIncrement: 5,
      teamName: 'Tokenizk Team',
      logoUrl: '/src/assets/images/1.png',
      website: 'https://tokenizk.finance/',
      facebook: 'https://tokenizk.finance/',
      github: 'https://tokenizk.finance/',
      twitter: 'https://tokenizk.finance/',
      telegram: 'https://tokenizk.finance/',
      discord: 'https://tokenizk.finance/',
      reddit: 'https://tokenizk.finance/',
      description: 'The Launchpad focusing on ZK-Token for Everyone!',
      updatedAt: new Date().getTime(),
      createdAt: new Date().getTime(),
    },
  }];

  // transformProjectStatus(fetchResult);

  myAirdropsList.airdropList = fetchResult;

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
