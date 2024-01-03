<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { Minus, Plus, Wallet } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { Calendar } from '@element-plus/icons-vue'
import { useConnectStatusStore } from '@/stores/connectStatus'
import { nanoid } from 'nanoid'

// 组件挂载完成后执行的函数  
onMounted(() => {

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})

// 临时数据本尊
const originalResult = {
  id: nanoid(),
  logoUrl: '/src/assets/images/1.png',
  name: 'TokeniZK - Airdrop',
  teamName: 'Yoga',
  star: 4,
  airdropAddress: 'B6273Af06B601b1493C4400E01225cA4C992182b31',
  tokenAddress: 'B6273Af06B601b1493C4400E01225cA4C992182b32',
  tokenName: 'TZ',
  symbol: 'CDV2',
  totalTokens: 3000000,
  TGEReleasePercent: '90%',
  cycle: '15 days',
  cycleReleasePercent: '10%',
  totalContributedMina: 40,
  softCap: 300,
  hardCap: 600,
  progressStart: 0,
  progressEnd: 50,
  liquidity: '10%',
  lockupTime: '365day',
  presaleStartTime: 1702083125572,
  presaleEndTime: 1703336201440,
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
  projectDes: 'TokeniZK Finance is a decentralized launchpad where you could launch your own zk-Token and create your own initial token sale. It provides secure smart contract templates with flexible configuration and complete tool suits for token management, where you could finish all operations simply in several clicks, without knowledge requirement about code & zkp. ',
  rate: 2,
  contributedMinaAmount: 350,
  recievedTokenAmount: 700,
  saleType: 'public',
  minimumBuy: 0.3,
  maximumBuy: 1,
  contractBalance: 300
};

// 临时数据本尊的分身   用于渲染出项目
const fetchResult = reactive(originalResult)

// localStorage.setItem('presaleProject', JSON.stringify(fetchResult))


// 进度条
const percentage = ref(20)
const customColor = ref('#00FFC2')

// 倒计时
let currentTime = new Date().getTime();
const timeValue = ref(dayjs().add(originalResult.presaleEndTime - currentTime, 'millisecond'))

const tokenInput = ref(0)

const contributionInputDisabled = ref(false);
const contributionBtnDisabled = ref(false);


if (fetchResult.presaleStartTime > currentTime) {
  fetchResult.status = 'Upcoming'
} else if (fetchResult.presaleStartTime <= currentTime && fetchResult.presaleEndTime > currentTime) {
  fetchResult.status = 'Ongoing'
} else if (fetchResult.presaleEndTime < currentTime) {
  fetchResult.status = 'Ended'
}

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

  if (fetchResult.presaleEndTime < currentTime) {

    // presaleEndTime 已结束
    if (cnState === true) {

      // 已投资
      if (fetchResult.contributedMinaAmount > 0) {

        // 总投资 >= softCap
        if (fetchResult.contributedMinaAmount >= fetchResult.softCap) {
          flagBtn.value = 2
          contributionInputDisabled.value = true   // 禁用input
          contributionBtnDisabled.value = false   //  启用按钮
          tokenInput.value = fetchResult.recievedTokenAmount
        } else {
          flagBtn.value = 3
          contributionInputDisabled.value = true   // 禁用input
          contributionBtnDisabled.value = false   //  启用按钮
          tokenInput.value = fetchResult.recievedTokenAmount
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

    // presaleEndTime 没结束
    if (cnState === true) {

      if (fetchResult.contributedMinaAmount > 0) {
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

}


checkPresale()


const checkContribution = () => {
  checkPresale()
}



const countdownFinishCallback = () => {
  // 禁用input
  contributionInputDisabled.value = true;
  contributionBtnDisabled.value = true;

  // 修改status 为 Ended
  fetchResult.status = 'Ended'

  checkContribution();
}

</script>

<style scoped></style>

<template>
  <el-row class="row-bg airdrop-details" justify="center">

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
                <h1>{{ fetchResult.name }}</h1>

              </el-row>

              <el-row>
                {{ fetchResult.projectDes }}
              </el-row>
            </el-col>
          </el-row>

          <!-- 项目表格 -->
          <el-row class="row-bg formTable">
            <el-col :span="24">
              <el-row class="row-bg" justify="center">
                <el-col :span="12">Airdrop Address</el-col>
                <el-col :span="12">{{ fetchResult.airdropAddress }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="center">
                <el-col :span="12">Token Address</el-col>
                <el-col :span="12">{{ fetchResult.tokenAddress }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Token Name</el-col>
                <el-col :span="12"> {{ fetchResult.tokenName }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Symbol</el-col>
                <el-col :span="12"> {{ fetchResult.symbol }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Total Tokens</el-col>
                <el-col :span="12">{{ fetchResult.totalTokens }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">TGE Release Percent</el-col>
                <el-col :span="12">{{ fetchResult.TGEReleasePercent }}</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Cycle</el-col>
                <el-col :span="12">{{ fetchResult.cycle }}</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Cycle Release Percent</el-col>
                <el-col :span="12">{{ fetchResult.cycleReleasePercent }}</el-col>
              </el-row>

              <el-row>
                <h3 style="font-family: math; margin-top: 40px;">Allocations(313)</h3>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">{{ fetchResult.airdropAddress }}</el-col>
                <el-col :span="8">4,000 CDV2</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">{{ fetchResult.airdropAddress }}</el-col>
                <el-col :span="8">4,000 CDV2</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">{{ fetchResult.airdropAddress }}</el-col>
                <el-col :span="8">4,000 CDV2</el-col>
              </el-row>

              <el-pagination background layout="prev, pager, next" :total="10" />

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

        <!-- 进度条 -->
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
            :disabled="contributionInputDisabled" class="tokenInput" />
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
            <el-col :span="6">{{ fetchResult.status }}</el-col>
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
.airdrop-details {
  width: 100%;
  padding-top: 120px;
  padding-bottom: 120px;
  background: #f7f7f7;

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

  .tokenInput {
    border-radius: 15px !important;
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