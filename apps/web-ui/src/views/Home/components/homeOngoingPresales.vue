<script setup lang="ts">
import { getOngoingPresaleAPI } from '@/apis/homeOngingPresale'
import { onMounted, reactive } from 'vue'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { log } from 'console'

const percentage = ref(20)
const customColor = ref('#00FFC2')

const OngoingPresaleList = ref([])

const getOngoingPresale = async () => {
  const res = await getOngoingPresaleAPI()
  console.log(res, 'OngoingPresale');
  OngoingPresaleList.value = res.result
}

// 组件挂载完成后执行的函数
onMounted(() => {
  getOngoingPresale()
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
    totalContributedMina: '40',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '60',
    totalContributedMina: '20',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '30',
    hardCap: '45',
    totalContributedMina: '60',
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
    star: '4',
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '55',
    totalContributedMina: '30',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '9',
    hardCap: '50',
    totalContributedMina: '50',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '12',
    hardCap: '50',
    totalContributedMina: '10',
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
    star: '5',
    preSaleAddr: 'B62',
    softCap: '11',
    hardCap: '50',
    totalContributedMina: '13',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '20',
    hardCap: '50',
    totalContributedMina: '42',
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
    star: '2',
    preSaleAddr: 'B62',
    softCap: '10',
    hardCap: '50',
    totalContributedMina: '23',
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
  <el-row class="row-bg ongoing-presales" justify="center">

    <el-col :span="24">

      <el-row class="row-bg" justify="center">
        <!-- <el-col :span="1"></el-col> -->

        <el-col :span="18">

          <el-row class="row-bg ongoing-presales-content">

            <el-col :span="12">
              <el-row>
                <h2 class="title"> Ongoing Presales</h2>
              </el-row>
              <el-row>Normal Presale pages work for project team to pre-configure a set of presale rules</el-row>
            </el-col>

            <el-col :span="12" class="link">
              <el-row class="mb-4" justify="end">
                <el-button type="primary" size="large" round>
                  <router-link to="/pre-sales" class="main-btn">View All Item</router-link>
                </el-button>
              </el-row>
            </el-col>

            <el-col :span="1"></el-col>

          </el-row>
        </el-col>

      </el-row>

      <!-- 轮播图 -->
      <!-- 每个项目 -->
      <el-row class="row-bg ongoing-presales-carousel">

        <el-col :span="2"></el-col>

        <el-col :span="20">

          <ul class="launchpads-ul" style="width:100%;">

            <el-carousel :interval="3000" type="card" height="500px">
              <el-carousel-item v-for="items in 4" :key="items">

                <li v-for="item in presaleProjects.saleList" :key="item.id">
                  <div class="launchpads-box">
                    <!-- photo -->
                    <el-row class="thumb">
                      <router-link to="/presale-datails">
                        <el-image style="width: 349px; height: 160px;" :src="item.photo" :alt="item.name"
                          loading="lazy" />
                      </router-link>
                    </el-row>

                    <!-- 项目描述 -->
                    <el-row class="launchpads-content">

                      <el-col :span="24">

                        <el-row class="row-bg" justify="space-between">
                          <el-col :span="8">
                            <h4><a href="#">{{ item.name }}</a></h4>
                          </el-col>

                          <el-col :span="5"></el-col>

                          <el-col class="review" :span="7">
                            <el-button type="primary" round class="statusColor" to="">{{ item.status }}</el-button>
                          </el-col>
                        </el-row>

                        <!-- 团队名称 -->
                        <el-row class="text-review-change" justify="space-between">
                          <el-col class="text" :span="10">
                            by {{ item.teamName }}
                          </el-col>

                          <el-col class="review" :span="10">
                            <el-rate v-model="item.star" size="large" />
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

                            <el-row class="Progress demo-progress" >
                              <el-progress :text-inside="true" :stroke-width="14"
                                :percentage="item.totalContributedMina" />
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
                </li>

              </el-carousel-item>
            </el-carousel>

          </ul>

        </el-col>

        <el-col :span="2"></el-col>

      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.ongoing-presales {
  width: 100%;
  height: 700px;
  padding: 0px 0px 120px;
  background-color: #f7f7f7;

  .ongoing-presales-content {
    width: 100%;

    .title {
      font-size: 35px;
      padding-bottom: 11px;
    }

    .link {
      padding-top: 40px;

      .main-btn {
        font-size: 16px;
        color: #fff;
      }

    }
  }

  .ongoing-presales-carousel {
    .launchpads-ul {
      width: 100%;
      justify-content: space-around;

      li {
        margin-top: 60px;
        // margin-right: 200px;
        margin-bottom: 30px;
        width: 349px;
        height: 416px;
        border-radius: 15px;

        .launchpads-box {
          width: 100%;
          height: 100%;
          background-color: #fff;
          // border: 1px solid yellow;
          border-radius: 15px;

          .thumb {
            width: 349px;
            height: 160px;
            overflow: hidden;
          }

          .launchpads-content {
            width: 100%;
            padding: 12px 20px;

            .content-Progress {
              margin: 6px auto 4px;
            }

            .demo-progress .el-progress--line {
              margin-bottom: 10px;
              width: 300px;
            }

          }

        }
      }
    }
  }

}
</style>