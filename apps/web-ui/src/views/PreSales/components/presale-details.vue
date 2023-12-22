<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
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

// 切换路由地址时，请求响应回来的数据  渲染出项目
const fetchResult = reactive({
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  teamName: 'Yoga',
  star: '4',
  preSaleAddr: 'B62',
  softCap: 300,
  hardCap: 60,
  totalContributedMina: 40,
  progressStart: 0,
  progressEnd: 50,
  liquidity: '10%',
  lockupTime: '365day',
  presaleStartTime: 1701083125572,
  presaleEndTime: 1705093115572,
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
  projectDes: 'TokeniZK Finance is a decentralized launchpad where you could launch your own zk-Token and create your own initial token sale. It provides secure smart contract templates with flexible configuration and complete tool suits for token management, where you could finish all operations simply in several clicks, without knowledge requirement about code & zkp. ',
  rate: 2,
  contributedMinaAmount: 350,
  recievedTokenAmount: 600,
  saleType: 'public',
  minimumBuy: 0.3,
  maximumBuy: 1,
})


localStorage.setItem('presaleProject', JSON.stringify(fetchResult))


// 进度条
const percentage = ref(20)
const customColor = ref('#00FFC2')

let currentTime = new Date().getTime();

// 倒计时
const timeValue = ref(dayjs().add(1, 'month').startOf('month'))

const tokenInput = ref('')



// 钱包连接状态判断
let connectStatus = useConnectStatusStore();
let { cnState } = connectStatus;

// 判断项目预售时间
const projectStatus = ref('Buy with Mina')

if (cnState === false) {
  projectStatus.value = 'Connect Auro Wallet'
} else if (cnState === true && fetchResult.contributedMinaAmount <= 0) {
  projectStatus.value = 'Buy with Mina'
} else if (cnState === true && fetchResult.contributedMinaAmount > 0 && fetchResult.presaleEndTime > currentTime) {
  projectStatus.value = 'claim'
} else if (cnState === true && fetchResult.contributedMinaAmount > 0 && fetchResult.presaleEndTime < currentTime) {
  projectStatus.value = 'redeem'
}



if (fetchResult.presaleStartTime > currentTime) {
  fetchResult.status = 'Upcoming'
} else if (fetchResult.presaleStartTime <= currentTime && fetchResult.presaleEndTime > currentTime) {
  fetchResult.status = 'Ongoing'
} else if (fetchResult.presaleEndTime < currentTime) {
  fetchResult.status = 'Ended'
}



</script>

<style scoped></style>

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
                <el-col :span="12">Presale Start Time</el-col>
                <el-col :span="12">{{ new Date(fetchResult.presaleStartTime) }}</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Presale End Time</el-col>
                <el-col :span="12">{{ new Date(fetchResult.presaleEndTime) }}</el-col>
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

      <el-row class="alert-message">
        Make sure the website is tokenizk.finance !
      </el-row>

      <el-row class="countdown">
        <el-col></el-col>
        <el-col>
          <el-countdown format="DD [days] HH:mm:ss" :value="timeValue">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                End of pre-sale
              </div>
            </template>
          </el-countdown>
        </el-col>
        <el-col></el-col>
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
        <el-input v-model="tokenInput" placeholder="Please input" size="large" clearable />
      </el-row>

      <el-button type="primary">{{ projectStatus }}</el-button>

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
.presale-details {
  width: 100%;
  padding-top: 120px;
  padding-bottom: 120px;
  background: #f7f7f7;

  .project-description {
    background-color: #fff;
    padding: 30px
  }

  .project-status {
    background-color: #fff;
    padding: 30px;
    margin-left: 30px;

    .countdown {
      text-align: center;
    }
  }

  .formTable {
    margin-top: 20px;
    padding: 20px;

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