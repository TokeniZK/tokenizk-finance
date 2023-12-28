<script setup lang="ts">
import { getOngoingPresaleAPI } from '@/apis/presaleAll'
import { onMounted, reactive } from 'vue'
import { ref } from 'vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { type SaleDto } from '@tokenizk/types'

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


// 临时数据 本尊
const fetchResult: SaleDto[] = [{
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

},];

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

          <ul class="launchpads-ul">

            <el-carousel :interval="3000" type="card" height="500px" loop>
              <el-carousel-item v-for="item in presaleProjects.saleList" :key="item.id" class="launchpadsLi">

                <!-- <li v-for="item in presaleProjects.saleList" :key="item.id" class="launchpadsLi"> -->

                <div class="launchpads-box">

                  <!-- photo -->
                  <el-row class="thumb">
                    <router-link to="/presale-datails">
                      <el-image style="width: 349px; height: 130px;" :src="item.logoUrl" :alt="item.saleName"
                        loading="lazy" />
                    </router-link>
                  </el-row>

                  <!-- 项目描述 -->
                  <el-row class="launchpads-content">

                    <el-col :span="24">

                      <el-row class="row-bg" justify="space-between">
                        <el-col :span="8">
                          <h4><a href="#">{{ item.saleName }}</a></h4>
                        </el-col>

                        <el-col :span="5"></el-col>

                        <el-col class="review" :span="7">
                          <el-button type="primary" round class="statusColor" to="">{{ item.projectStatus }}</el-button>
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
                        <el-col :span="10">{{ item.softCap }}Mina - {{ item.hardCap }}Mina</el-col>
                      </el-row>


                      <!-- 注意  进度条 -->
                      <el-row class="content-Progress">
                        <el-col>

                          <el-row class="title">Progress</el-row>

                          <el-row class="Progress demo-progress">
                            <el-progress :text-inside="true" :stroke-width="14" :percentage="20" />
                          </el-row>

                          <el-row class="row-bg sub-title" justify="space-between">
                            <el-col :span="10"> 0 Mina</el-col>
                            <el-col :span="4"></el-col>
                            <el-col :span="6">{{ item.hardCap }} Mina</el-col>
                          </el-row>

                        </el-col>
                      </el-row>
                      <!-- 
                      <el-row class="row-bg liquidity-percent" justify="space-between">
                        <el-col :span="10">Liquidity %:</el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="6"> {{ item.liquidity }}</el-col>
                      </el-row> -->

                      <el-row class="row-bg lockup-time" justify="space-between">
                        <el-col :span="10">Lockup Time:</el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="6">365 day</el-col>
                      </el-row>

                      <el-row class="row-bg Sale-Ends-In" justify="space-between">
                        <el-col :span="10">Sale Ends In :</el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="6">{{ item.cliffTime * 5 }} </el-col>
                      </el-row>

                    </el-col>

                  </el-row>
                </div>

                <!-- </li> -->

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
    width: 100%;

    .launchpads-ul {
      width: 100%;

      .launchpadsLi {
        margin-top: 60px;
        margin-bottom: 30px;
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
