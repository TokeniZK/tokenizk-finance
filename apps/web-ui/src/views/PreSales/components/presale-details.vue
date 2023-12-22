<script lang="ts" setup>
import { ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { Calendar } from '@element-plus/icons-vue'
import { useConnectStatus } from '@/stores/connectStatus'



// 进度条
const percentage = ref(20)
const customColor = ref('#00FFC2')

// 倒计时
const timeValue = ref(dayjs().add(1, 'month').startOf('month'))

const tokenInput = ref('')

// 钱包连接状态判断
let connectStatus = useConnectStatus();
let { cnState } = connectStatus;

const projectStatus = ref('Buy with Mina')

// if()


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
            <el-col :span="3">
              <el-image src="/src/assets/presale-project-logo.png" lazy />
            </el-col>

            <el-col :span="21">
              <el-row>
                <h1>tokenizk - Presale</h1>
              </el-row>

              <el-row>
                TokeniZK Finance is a decentralized launchpad where you could launch your own
                zk-Token and create your own initial token sale.
                It provides secure smart contract templates with flexible configuration and complete
                tool suits for token management, where you could finish all operations simply in several clicks, without
                knowledge requirement about code & zkp.
              </el-row>
            </el-col>
          </el-row>

          <!-- 项目表格 -->
          <el-row class="row-bg formTable">
            <el-col :span="24">
              <el-row class="row-bg">
                <el-col :span="12">Presale Address</el-col>
                <el-col :span="12">B6273Af06B601b1493C4400E01225cA4C992182b31</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Soft Cap</el-col>
                <el-col :span="10">100 Mina</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Hard Cap</el-col>
                <el-col :span="10">200 Mina</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Presale Start Time</el-col>
                <el-col :span="10">2023.07.03 19:37 (UTC)</el-col>
              </el-row>
              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Presale End Timee</el-col>
                <el-col :span="10">2023.07.10 19:38 (UTC)</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">First Release For Project</el-col>
                <el-col :span="10">95%</el-col>
              </el-row>

              <el-row class="row-bg" justify="space-between">
                <el-col :span="12">Vesting For Project</el-col>
                <el-col :span="10">3% each 1 days</el-col>
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
            <el-col :span="4"></el-col>
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
            <el-col :span="6">Status</el-col>
            <el-col :span="6"></el-col>
            <el-col :span="7">Ongoing</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="8">Sale Type</el-col>
            <el-col :span="8"></el-col>
            <el-col :span="8">Public</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="10">Minimum Buy</el-col>
            <el-col :span="6"></el-col>
            <el-col :span="6">0.03 Mina</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="10">Maximum Buy</el-col>
            <el-col :span="6"></el-col>
            <el-col :span="8">5 Mina</el-col>
          </el-row>
          <el-row class="row-bg" justify="space-between">
            <el-col :span="12">Total Contributors</el-col>
            <el-col :span="6"></el-col>
            <el-col :span="6">3</el-col>
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
    text-align: center;
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