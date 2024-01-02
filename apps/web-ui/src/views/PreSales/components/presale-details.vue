<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { Minus, Plus, Wallet } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { Calendar } from '@element-plus/icons-vue'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { nanoid } from 'nanoid'
import { type SaleDto } from '@tokenizk/types'

// 组件挂载完成后执行的函数  
onMounted(() => {

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

  // if (!walletListenerSetted.value) {
  //   walletChannel = new BroadcastChannel(CHANNEL_MINA);
  //   walletChannel.onmessage = async (e: any) => {
  //     const event = e.data as WalletEvent;
  //     console.log('claim - walletChannel.onmessage: ', event);
  //     if (event.eventType === WalletEventType.ACCOUNTS_CHANGED) {

  //       if (event.connectedAddress) {
  //         /*
  //         if (event.connectedAddress !== withdrawNote.value?.ownerAddress) {
  //           message.error('The owner of the claim note is inconsistent with the current wallet. Please switch to the correct wallet', {
  //             closable: true,
  //             duration: 0
  //           });

  //           return;
  //         }
  //         showLoadingMask({ text: 'Loading...', id: maskId, closable: false });
  //         setConnectedWallet(event.connectedAddress);
  //         await loadAccountInfoByConnectedWallet();
  //         */

  //       } else {
  //         ElMessage({
  //           showClose: true,
  //           message: `Please connect your wallet`,
  //         })

  //         setConnectedWallet(null);
  //       }

  //     } else if (event.eventType === WalletEventType.NETWORK_INCORRECT) {
  //       message.error(`Please switch to ${appState.minaNetwork} network`, {
  //         closable: true,
  //         duration: 3000
  //       });
  //     }
  //   };

  //   walletListenerSetted.value = true;
  // }
})

// 临时数据本尊
const originalResult: SaleDto[] = [{
  id: 0,
  saleType: 1,
  txHash: '0x123456789',
  status: 1,

  tokenName: 'TZ',
  tokenSymbol: 'tzk',
  totalContributedMina: 20,
  saleName: 'Oggy Inu 2.0',

  teamName: 'Yoga',

  tokenAddress: 'B62xxxt',
  saleAddress: 'B62xxs',

  star: 4,

  totalSaleSupply: 20,
  currency: 'Mina',
  feeRate: '5%',
  saleRate: 10,
  whitelistTreeRoot: '45678ityuioghjk',
  whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',

  softCap: 21,
  hardCap: 60,
  minimumBuy: 0.1,
  maximumBuy: 1,
  startTimestamp: 1704083125572,
  endTimestamp: 1709093115572,

  cliffTime: 6,
  cliffAmountRate: 3,
  vestingPeriod: 1704527581215,
  vestingIncrement: 0,
  contributorsFetchFlag: 0,
  contributorsTreeRoot: '',
  contributorsMaintainFlag: 0,

  logoUrl: '/src/assets/images/1.png',
  website: 'https://tokenizk.finance/',
  facebook: 'https://tokenizk.finance/',
  github: 'https://tokenizk.finance/',
  twitter: 'https://tokenizk.finance/',
  telegram: 'https://tokenizk.finance/',
  discord: 'https://tokenizk.finance/',
  reddit: 'https://tokenizk.finance/',
  description: 'The Launchpad focusing on ZK-Token for Everyone!',
  updatedAt: 1703691515995,
  createdAt: 1703691251595,

  // totalContributedMina: 40, // 请求Mina网络获取/hardcap

  // progressStart: '0',

  // progressEnd: '50',    // hardcap

  // liquidity: '10%',
  // lockupTime: '365day',  // cliffTime  * 5 * 60 * 1000 / 12
  // firstReleaseForProject: '95%',
  // vestingForProject: '3% each 1 days',

},];

// 临时数据本尊的分身   用于渲染出项目
const fetchResult = reactive(originalResult)

// localStorage.setItem('presaleProject', JSON.stringify(fetchResult))


// 进度条
const percentage = ref(20)
const customColor = ref('#00FFC2')

// 倒计时
let currentTime = new Date().getTime();

originalResult.forEach((item: SaleDto) => {

  const timeValue = ref(dayjs().add(item.endTimestamp - currentTime, 'millisecond'))

  if (item.startTimestamp > currentTime) {
    item.projectStatus = 'Upcoming'
  } else if (item.startTimestamp <= currentTime && item.endTimestamp > currentTime) {
    item.projectStatus = 'Ongoing'
  } else if (item.endTimestamp < currentTime) {
    item.projectStatus = 'Ended'
  }

})



const tokenInput = ref(0)

const contributionInputDisabled = ref(false);

const contributionBtnDisabled = ref(false);

fetchResult.forEach((item: SaleDto) => {

  if (item.startTimestamp > currentTime) {
    item.projectStatus = 'Upcoming'
  } else if (item.startTimestamp <= currentTime && item.endTimestamp > currentTime) {
    item.projectStatus = 'Ongoing'
  } else if (item.endTimestamp < currentTime) {
    item.projectStatus = 'Ended'
  }

})



// 判断项目预售时间
const connectAuroWallet = ref('Connect Auro Wallet')
const buyWithMina = ref('Buy with Mina')
const claimTokens = ref('claim tokens')
const redeemTokens = ref('redeem tokens')
const detailSpan = ref('已投资，不可重复投资.')

const flagSpan = ref(0)

// 钱包连接状态判断
let connectStatus = useConnectStatusStore()
let { cnState } = connectStatus

let flagBtn = ref(0)

const checkPresale = () => {

  fetchResult.forEach((item: SaleDto) => {

    if (item.endTimestamp < currentTime) {

      // endTimestamp 已结束
      if (cnState === true) {

        // 已投资
        if (item.hardCap > 0) {

          // 总投资 >= softCap
          if (item.hardCap >= item.softCap) {
            flagBtn.value = 2
            contributionInputDisabled.value = true   // 禁用input
            contributionBtnDisabled.value = false   //  启用按钮
            tokenInput.value = item.hardCap
          } else {
            flagBtn.value = 3
            contributionInputDisabled.value = true   // 禁用input
            contributionBtnDisabled.value = false   //  启用按钮
            tokenInput.value = item.hardCap
          }

        } else {
          // 禁用input
          contributionInputDisabled.value = true
          contributionBtnDisabled.value = true
        }

      } else {

        // 禁用input
        contributionInputDisabled.value = true
        contributionBtnDisabled.value = true

      }

    } else {

      // endTimestamp 没结束
      if (cnState === true) {

        if (fetchResult.hardCap > 0) {
          // 禁用input、按钮
          contributionInputDisabled.value = false
          contributionBtnDisabled.value = false
          flagBtn.value = 1
          // flagSpan.value = 1
        }

      } else {

        // 启用input、按钮
        contributionInputDisabled.value = false
        contributionBtnDisabled.value = false
        flagBtn.value = 1

      }


    }

  })

}


checkPresale()


const checkContribution = () => {
  checkPresale()
}



const countdownFinishCallback = () => {
  // 禁用 input
  contributionInputDisabled.value = true;
  contributionBtnDisabled.value = true;

  // 修改 status 为 Ended
  fetchResult.projectStatus = 'Ended'

  checkContribution();
}





</script>

<template>
  <el-row class="row-bg presale-details" justify="center">

    <!-- <el-col :span="1"></el-col> -->

    <!-- 项目描述 -->
    <el-col :span="12" class="project-description">
      <el-row>
        <el-col :span="24">

          <el-row>
            <el-col :span="4">
              <el-image src="/src/assets/presale-project-logo.png" fit="contain" lazy />
            </el-col>

            <el-col :span="20">
              <el-row>
                <h1>{{ fetchResult.saleName }} Oggy Inu 2.0</h1>
              </el-row>

              <el-row>
                <i class="iconfont icon-birdxiaoniao"></i>
                <i class="iconfont icon-discord"></i>
                <i class="iconfont icon-telegram"></i>
              </el-row>

              <el-row>
                {{ fetchResult.projectDes }}
                TokeniZK Finance is a decentralized launchpad where you could launch your own zk-Token and create your own
                initial token sale. It provides secure smart contract templates with flexible configuration and complete
                tool suits for token management, where you could finish all operations simply in several clicks, without
                knowledge requirement about code & zkp.
              </el-row>
            </el-col>
          </el-row>

          <!-- 项目表格 -->
          <el-row class="row-bg formTable">
            <el-col :span="24">
              <el-row class="row-bg" justify="center">
                <el-col :span="12">Presale Address</el-col>
                <el-col :span="12">B6273Af06B601b1493C4400E01225cA4C992182b31</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Soft Cap</el-col>
                <el-col :span="12"> {{ fetchResult.softCap }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Hard Cap</el-col>
                <el-col :span="12"> {{ fetchResult.hardCap }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="11">Presale Start Time</el-col>
                <el-col :span="13">{{ new Date(fetchResult.startTimestamp) }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="11">Presale End Time</el-col>
                <el-col :span="13">{{ new Date(fetchResult.endTimestamp) }}</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">First Release For Project</el-col>
                <el-col :span="12">{{ fetchResult.firstReleaseForProject }}</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Vesting For Project</el-col>
                <el-col :span="12">{{ fetchResult.vestingForProject }}</el-col>
              </el-row>

            </el-col>
          </el-row>

        </el-col>
      </el-row>
    </el-col>

    <!-- 项目状态 -->
    <el-col :span="6" class="project-status">

      <div class="project-status-box">
        <el-row class="alert-message">
          Make sure the website is tokenizk.finance !
        </el-row>

        <el-row class="countdown">
          <el-col>

            <el-countdown format="DD [days] HH:mm:ss" :value="timeValue" @finish="countdownFinishCallback">
              <template #title>
                <div style="display: inline-flex; align-items: center">End of pre-sale</div>
              </template>
            </el-countdown>

          </el-col>
        </el-row>

        <!-- 注意  进度条 -->
        <el-row>
          <el-col>
            <el-row class="Progress demo-progress" style="margin-bottom: 0;">
              <el-progress :text-inside="true" :stroke-width="14" :percentage="20" />
            </el-row>

            <el-row class="row-bg" justify="space-between">
              <el-col :span="10"> 0 Mina</el-col>
              <!-- <el-col :span="8"></el-col> -->
              <el-col :span="6">50 Mina</el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>Amount</el-row>

        <el-row>
          <el-input v-model="tokenInput" placeholder="Please input" size="large" clearable
            :disabled="contributionInputDisabled" />
        </el-row>

        <el-row>
          <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 0">{{
            connectAuroWallet }}</el-button>
          <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 1">{{ buyWithMina
          }}</el-button>
          <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 2">{{ claimTokens
          }}</el-button>
          <el-button type="primary" :disabled="contributionBtnDisabled" v-show="flagBtn === 3">{{ redeemTokens
          }}</el-button>

          <span class="detail-span" v-show="flagSpan === 1">{{ detailSpan }}</span>

        </el-row>

      </div>

      <!-- 项目表格 -->
      <el-row class="row-bg formTable">
        <el-col :span="24">

          <el-row class="row-bg" justify="space-between">
            <el-col :span="12">Status</el-col>
            <el-col :span="6">{{ fetchResult.projectStatus }}</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="8">Sale Type</el-col>
            <el-col :span="6">{{ fetchResult.saleType }}</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="10">Minimum Buy</el-col>
            <el-col :span="6">{{ fetchResult.minimumBuy }}</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="10">Maximum Buy</el-col>
            <el-col :span="6">{{ fetchResult.saleType }}</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="12">Total Contributors</el-col>
            <el-col :span="6">{{ fetchResult.totalContributedMina }}</el-col>
          </el-row>

        </el-col>
      </el-row>

    </el-col>

  </el-row>
</template>

<style lang="less" scoped>
.presale-details {
  width: 100%;
  padding-top: 120px;
  padding-bottom: 120px;
  background: #f7f7f7;

  .icon-discord,
  .icon-birdxiaoniao,
  .icon-telegram {
    margin-right: 20px;
    font-size: 20px;
    color: #00FFC2;
  }

  .project-description {
    background-color: #fff;
    padding: 30px
  }

  .project-status {
    margin-left: 30px;

    .project-status-box {
      padding: 30px;
      background-color: #fff;

      .countdown {
        text-align: center;
      }

      .detail-span {
        color: red;
        margin-left: 10px;
      }
    }

  }

  .formTable {
    margin-top: 20px;
    padding: 30px;
    background-color: #fff;

    .el-row {
      border-bottom: 1px solid #e6e6e6;
    }
  }

  .alert-message {
    padding: 5px 14px;
    border: 2px dashed #00FFC2;
    text-align: center;
  }


  .demo-progress .el-progress--line {
    margin-bottom: 15px;
    width: 350px;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-row:last-child {
    margin-bottom: 0;
  }

  .el-col {
    border-radius: 4px;
  }
}
</style>
