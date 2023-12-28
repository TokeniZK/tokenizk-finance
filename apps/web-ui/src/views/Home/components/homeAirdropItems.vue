<script setup lang="ts">
import { ref } from 'vue'
import { getAirdropItemsAPI } from '@/apis/airdropAll'
import { onMounted, reactive } from 'vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { type SaleDto } from '@tokenizk/types'

const percentage = ref(20)
const customColor = ref('#00FFC2')

const AirdropItemsList = ref([])

const getAirdropItems = async () => {
  const res = await getAirdropItemsAPI()
  console.log(res, 'homeAirdropItems');
  AirdropItemsList.value = res.data

}

// 组件挂载完成后执行的函数
onMounted(() => {
  getAirdropItems()
})


// 临时数据 本尊
const fetchResult: SaleDto[] = [
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
    // lockupTime: '365day',  // cliffTime  * 5 / 60  >
    // firstReleaseForProject: '95%',
    // vestingForProject: '3% each 1 days',

  },
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
  },
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
  },
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
  },
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
  },
  {
    id: 0,
    saleType: 1,
    txHash: '0x123456789',
    status: 1,

    tokenName: 'TZ',

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
    endTimestamp: 1703093115572,

    cliffTime: 300,
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
  },

];

// 判断项目的状态
let currentTime = new Date().getTime();
fetchResult.forEach(item => {
  if (item.startTimestamp > currentTime) {
    item.projectStatus = 'Upcoming'
  } else if (item.startTimestamp <= currentTime && item.endTimestamp > currentTime) {
    item.projectStatus = 'Ongoing'
  } else if (item.endTimestamp < currentTime) {
    item.projectStatus = 'Ended'
  } else {
    item.projectStatus = 'All Status'
  }
});


let renderSaleBlock = fetchResult;
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

</script>

<template>
  <el-row class="row-bg airdrop-items" justify="center">
    <el-col :span="24">

      <el-row class="row-bg" justify="center">


        <el-col :span="18">

          <el-row class="row-bg ongoing-presales-content">

            <el-col :span="12">
              <el-row>
                <h2 class="title">Airdrop items</h2>
              </el-row>
              <el-row>Fair Airdrop tool helps project team to record related contributors and token distribution.</el-row>
            </el-col>

            <el-col :span="12" class="link">
              <el-row class="mb-4" justify="end">
                <el-button type="primary" size="large" round>
                  <router-link to="/airdrop-list" class="main-btn">View All Item</router-link>
                </el-button>
              </el-row>
            </el-col>

            <!-- <el-col :span="1"></el-col> -->

          </el-row>
        </el-col>

      </el-row>

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="launchpads-ul">

            <li v-for="item in presaleProjects.saleList" :key="item.id">

              <div class="launchpads-box">

                <!-- photo -->
                <el-row class="thumb">
                  <router-link to="/airdrop-datails">
                    <el-image style="width: 349px; height: 130px;" :src="item.logoUrl" :alt="item.saleName"
                      loading="lazy" />
                  </router-link>
                </el-row>

                <!-- 项目描述 -->
                <el-row class="launchpads-content">

                  <el-col :span="24">

                    <el-row class="row-bg" justify="space-between">
                      <el-col :span="24">
                        <h3><a href="#">{{ item.saleName }}</a></h3>
                      </el-col>
                    </el-row>

                    <el-row class="row-bg soft-hard-cap" justify="space-between">
                      <el-col :span="10">Token:</el-col>
                      <el-col :span="8"></el-col>
                      <el-col :span="6">{{ item.tokenName }}</el-col>
                    </el-row>

                    <el-row class="row-bg liquidity-percent" justify="space-between">
                      <el-col :span="10">Total Token:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6"> {{ item.hardCap }}</el-col>
                    </el-row>

                    <el-row class="row-bg lockup-time" justify="space-between">
                      <el-col :span="10">Participants:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6">0</el-col>
                    </el-row>

                    <el-row class="row-bg" justify="space-between">
                      <el-col :span="6">Begin at :</el-col>
                      <el-col :span="14"> {{ new Date(item.startTimestamp).toISOString() }}</el-col>
                    </el-row>

                    <el-row class="row-bg" justify="end">
                      <el-button type="primary" round class="statusColor"> View Airdrop</el-button>
                    </el-row>

                  </el-col>

                </el-row>

              </div>


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
  height: 1080px;
  overflow: hidden;
  margin-bottom: 100px;

  .ongoing-presales-content {
    width: 100%;

    .title {
      font-size: 35px;
      padding-bottom: 1px;
    }

    .link {
      padding-top: 40px;

      .main-btn {
        font-size: 16px;
        color: #fff;
      }

    }

  }

  .launchpads-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    overflow: hidden;

    li {
      margin-top: 25px;
      margin-bottom: 25px;
      width: 349px;
      height: 360px;
      border-radius: 15px;

      .launchpads-box {
        width: 100%;
        height: 100%;
        background-color: #fff;
        border-radius: 15px;

        .thumb {
          width: 349px;
          height: 130px;
          overflow: hidden;
        }

        .launchpads-content {
          width: 100%;
          padding: 12px 20px;

          .demo-progress .el-progress--line {
            margin-bottom: 15px;
            width: 300px;
          }

        }

      }
    }
  }

  .el-row {
    margin-bottom: 12px;
  }

}
</style>