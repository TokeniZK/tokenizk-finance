<script setup lang="ts">
import { ref } from 'vue'
import { getAirdropItemsAPI } from '@/apis/airdropAll'
import { onMounted, reactive } from 'vue'

import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
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


// 临时数据
const fetchResult = [
  {
    id: nanoid(),
    photo: '/src/assets/images/1.png',
    name: 'Oggy Inu 2.0',
    status: '',
    teamName: 'Yoga',
    star: 4,
    preSaleAddr: 'B62',
    softCap: '21',
    hardCap: '60',
    totalContributedMina: 40,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '10%',
    lockupTime: '365day',
    presaleStartTime: 1703081125572,
    presaleEndTime: 1705093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 4,
    contributedMinaAmount: 1000,
    recievedTokenAmount: 4000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    status: '',
    teamName: 'walking',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '60',
    totalContributedMina: 20,
    progressStart: '0',
    progressEnd: '60',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1702082115572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 3,
    contributedMinaAmount: 2000,
    recievedTokenAmount: 6000,

  },
  {
    id: nanoid(),
    photo: '/src/assets/images/3.png',
    name: 'Ripple Frog',
    status: '',
    teamName: 'cherry',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '30',
    hardCap: '45',
    totalContributedMina: 60,
    progressStart: '0',
    progressEnd: '45',
    liquidity: '53%',
    lockupTime: '365day',
    presaleStartTime: 1703003135572,
    presaleEndTime: 1703003115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 2,
    contributedMinaAmount: 500,
    recievedTokenAmount: 1000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/3.png',
    name: 'FastAI',
    status: '',
    teamName: 'Tang',
    star: 4,
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '55',
    totalContributedMina: 30,
    progressStart: '10',
    progressEnd: '50',
    liquidity: '40%',
    lockupTime: '365day',
    presaleStartTime: 1703003135572,
    presaleEndTime: 1703003115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 3,
    contributedMinaAmount: 5000,
    recievedTokenAmount: 15000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wrapped XRP',
    status: '',
    teamName: 'mina',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '9',
    hardCap: '50',
    totalContributedMina: 50,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1702083115572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 6,
    contributedMinaAmount: 1500,
    recievedTokenAmount: 9000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/1.png',
    name: 'THREADS V2',
    status: '',
    teamName: 'BTC',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '12',
    hardCap: '50',
    totalContributedMina: 10,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1704083125572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 8,
    contributedMinaAmount: 3000,
    recievedTokenAmount: 24000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Oggy Inu 2.0',
    status: '',
    teamName: 'Yoga',
    star: 5,
    preSaleAddr: 'B62',
    softCap: '11',
    hardCap: '50',
    totalContributedMina: 13,
    progressStart: '23',
    progressEnd: '50',
    liquidity: '15%',
    lockupTime: '365day',
    presaleStartTime: 1704083125572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 3,
    contributedMinaAmount: 4000,
    recievedTokenAmount: 12000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    status: '',
    teamName: 'Yoga',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '20',
    hardCap: '50',
    totalContributedMina: 42,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '23%',
    lockupTime: '365day',
    presaleStartTime: 1703083145572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 5,
    contributedMinaAmount: 6000,
    recievedTokenAmount: 30000,
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    status: '',
    teamName: 'Yoga',
    star: 2,
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '50',
    totalContributedMina: 23,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '54%',
    lockupTime: '365day',
    presaleStartTime: 1703083115572,
    presaleEndTime: 1706093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
    rate: 10,
    contributedMinaAmount: 300,
    recievedTokenAmount: 3000,
  },
];

// 判断项目的状态
let currentTime = new Date().getTime();
fetchResult.forEach(item => {
  if (item.presaleStartTime > currentTime) {
    item.status = 'Upcoming'
  } else if (item.presaleStartTime <= currentTime && item.presaleEndTime > currentTime) {
    item.status = 'Ongoing'
  } else if (item.presaleEndTime < currentTime) {
    item.status = 'Ended'
  } else {
    item.status = 'All Status'
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
          <el-row>
            <ul class="launchpads-ul">
              <li v-for="item in presaleProjects.saleList" :key="item.id">

                <!-- <el-card shadow="hover"> -->

                <div class="launchpads-box">

                  <!-- photo -->
                  <el-row class="thumb">

                    <el-col>

                      <el-row>
                        <img :src="item.photo" :alt="item.name" style="width: 349px; height: 160px;">
                      </el-row>

                      <el-row class="button-box">
                        <el-col>
                          <a href="Ripple-Frog-presale-details.html" class="link link-1">
                            <el-icon>
                              <View />
                            </el-icon>
                          </a>
                        </el-col>
                        <el-col>
                          <a href="#0" class="link link-3"><el-icon>
                              <StarFilled />
                            </el-icon>
                          </a>
                        </el-col>
                      </el-row>

                    </el-col>

                  </el-row>

                  <!-- 项目描述 -->
                  <el-row class="launchpads-content">

                    <el-col>

                      <el-row>
                        <el-col :span="24">
                          <h4><a href="Ripple-Frog-presale-details.html">{{ item.name }}</a></h4>
                        </el-col>
                      </el-row>

                      <!-- 团队名称 -->
                      <el-row class="text-review-change" justify="space-between" style="align-items: center;">

                        <el-col class="text" :span="8">
                          by <a href="" class="link">{{ item.teamName }}</a>
                        </el-col>

                        <el-col :span="5"></el-col>

                        <el-col class="review" :span="7">
                          <el-button type="primary" round>{{ item.status }}</el-button>
                        </el-col>

                      </el-row>

                      <el-row class="row-bg soft-hard-cap" justify="space-between">
                        <el-col :span="10">Soft / Hard</el-col>
                        <el-col :span="2"></el-col>
                        <el-col :span="10">{{ item.softCap }}Mina - {{ item.HardCap }}Mina</el-col>
                      </el-row>

                      <!-- 进度条 -->
                      <el-row class="content-Progress">
                        <el-col>

                          <el-row class="title">Progress</el-row>

                          <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="item.totalContributedMina" />
                          </el-row>

                          <el-row class="row-bg sub-title" justify="space-between">
                            <el-col :span="10"> 0 Mina</el-col>
                            <el-col :span="4"></el-col>
                            <el-col :span="6">50 Mina</el-col>
                          </el-row>

                        </el-col>
                      </el-row>

                      <el-row class="row-bg liquidity-percent" justify="space-between">
                        <el-col :span="10">Liquidity %:</el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="6"> {{ item.liquidity }}</el-col>
                      </el-row>

                      <el-row class="row-bg lockup-time" justify="space-between">
                        <el-col :span="10">Lockup Time:</el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="6">365 day</el-col>
                      </el-row>

                    </el-col>

                  </el-row>

                </div>

                <!-- </el-card> -->

              </li>
            </ul>
          </el-row>

          <el-row style="margin-top: 20px">123</el-row>

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
      height: 416px;
      border-radius: 15px;

      .launchpads-box {
        width: 100%;
        height: 100%;
        background-color: #fff;
        border-radius: 15px;

        .thumb {
          width: 349px;
          height: 160px;
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
    margin-bottom: 5px;
  }

}
</style>