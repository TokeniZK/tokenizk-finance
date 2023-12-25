<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getMyContributionsAPI } from '@/apis/presaleAll'
import { Search } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'

const percentage = ref(20)
const customColor = ref('#00FFC2')

const myContributionsList = ref([])
const getMyContributions = async () => {
  const res = await getMyContributionsAPI()
  console.log(res);
  myContributionsList.value = res.result
}

// 组件挂载完成后执行的函数  请求数据  
onMounted(() => {
  getMyContributions()

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})

// 临时数据 本尊
const fetchResult = [
  {
    id: nanoid(),
    photo: '/src/assets/images/1.png',
    name: 'Oggy Inu 2.0',
    teamName: 'Yoga',
    star: 4,
    preSaleAddr: 'B62',
    softCap: 21,
    hardCap: 60,
    totalContributedMina: 40,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '10%',
    lockupTime: '365day',
    presaleStartTime: 1704083125572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    teamName: 'walking',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 10,
    hardCap: 60,
    totalContributedMina: 20,
    progressStart: '0',
    progressEnd: '60',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1703082115572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/3.png',
    name: 'Ripple Frog',
    teamName: 'cherry',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 30,
    hardCap: 45,
    totalContributedMina: 60,
    progressStart: '0',
    progressEnd: '45',
    liquidity: '53%',
    lockupTime: '365day',
    presaleStartTime: 1703003135572,
    presaleEndTime: 1703003115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/3.png',
    name: 'FastAI',
    teamName: 'Tang',
    star: 4,
    preSaleAddr: 'B62',
    softCap: 10,
    hardCap: 55,
    totalContributedMina: 30,
    progressStart: '10',
    progressEnd: '50',
    liquidity: '40%',
    lockupTime: '365day',
    presaleStartTime: 1703003135572,
    presaleEndTime: 1703003115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wrapped XRP',
    teamName: 'mina',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 9,
    hardCap: 50,
    totalContributedMina: 50,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1702083115572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/1.png',
    name: 'THREADS V2',
    teamName: 'BTC',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 12,
    hardCap: 50,
    totalContributedMina: 10,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '30%',
    lockupTime: '365day',
    presaleStartTime: 1704083125572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Oggy Inu 2.0',
    teamName: 'Yoga',
    star: 5,
    preSaleAddr: 'B62',
    softCap: 11,
    hardCap: 50,
    totalContributedMina: 13,
    progressStart: '23',
    progressEnd: '50',
    liquidity: '15%',
    lockupTime: '365day',
    presaleStartTime: 1704083125572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    teamName: 'Yoga',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 20,
    hardCap: 50,
    totalContributedMina: 42,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '23%',
    lockupTime: '365day',
    presaleStartTime: 1703083145572,
    presaleEndTime: 1703093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
  },
  {
    id: nanoid(),
    photo: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    teamName: 'Yoga',
    star: 2,
    preSaleAddr: 'B62',
    softCap: 10,
    hardCap: 50,
    totalContributedMina: 23,
    progressStart: '0',
    progressEnd: '50',
    liquidity: '54%',
    lockupTime: '365day',
    presaleStartTime: 1703083115572,
    presaleEndTime: 1706093115572,
    firstReleaseForProject: '95%',
    vestingForProject: '3% each 1 days',
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
  <el-row class="my-contributions">

    <el-col>

      <!-- 搜索、过滤器 -->
      <el-row class="row-bg" justify="center" style="margin-bottom:50px;" :gutter="20">

        <!-- <el-col :span="13">
          <div style="height: 19.59px;"></div>

          <div class="mt-4">
            <el-input v-model="keyWord" placeholder="Please input" class="input-with-select" size="large">
              <template #append>
                <el-button :icon="Search" @click="searchProjects" />
              </template>
            </el-input>
          </div>

        </el-col>

        <el-col :span="3">
          <div>Filter By</div>
          <el-select v-model="filterBy" class="m-2 filterBy" placeholer="Select" size="large">
            <el-option v-for="item in filterByOptions" :key="item.value" :label="item.label" :value="item.value"
              @click="filterOption(item.value)" />
          </el-select>
        </el-col>

        <el-col :span="3">
          <div>Sort By</div>
          <el-select v-model="sortBy" class="m-2 sortBy" placeholder="Select" size="large">
            <el-option v-for="item in sortByOptions" :key="item.value" :label="item.label" :value="item.value"
              @click="sortOption(item.value)" />
          </el-select>
        </el-col> -->

      </el-row>

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="launchpads-ul">
            <li v-for="item in presaleProjects.saleList" :key="item.id">

              <div class="launchpads-box">

                <!-- photo -->
                <el-row class="thumb">
                  <router-link to="/presale-datails">
                    <el-image style="width: 349px; height: 160px;" :src="item.photo" :alt="item.name" loading="lazy" />
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
                        <el-button type="primary" round class="statusColor" to="/presale-datails">{{
                          item.status }}</el-button>
                      </el-col>
                    </el-row>

                    <!-- 投资Mina数量 -->
                    <el-row class="row-bg liquidity-percent" justify="space-between">
                      <el-col :span="15">contributed Mina Amount :</el-col>
                      <el-col :span="6"> {{ item.contributedMinaAmount }}</el-col>
                    </el-row>

                    <!-- 团队名称 -->
                    <el-row class="text-review-change" justify="space-between">
                      <el-col class="text" :span="10">
                        by <a href="" class="link">{{ item.teamName }}</a>
                      </el-col>

                      <el-col class="review" :span="10">
                        <el-rate v-model="item.star" size="default" />
                      </el-col>
                    </el-row>

                    <el-row class="row-bg soft-hard-cap" justify="space-between">
                      <el-col :span="10">Soft / Hard</el-col>
                      <el-col :span="2"></el-col>
                      <el-col :span="10">{{ item.softCap }}Mina - {{ item.hardCap }}Mina</el-col>
                    </el-row>

                    <!-- 进度条 -->
                    <el-row class="content-Progress">
                      <el-col>

                        <el-row class="title">Progress :</el-row>

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
                      <el-col :span="10">Liquidity % :</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6"> {{ item.liquidity }}</el-col>
                    </el-row>

                    <el-row class="row-bg lockup-time" justify="space-between">
                      <el-col :span="10">Lockup Time :</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6">365 day</el-col>
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
.my-contributions {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 50px;

  .launchpads-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    li {
      margin-top: 0px;
      margin-bottom: 30px;
      width: 349px;
      height: 430px;
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
            margin-bottom: 10px;
            width: 300px;
          }

        }

      }
    }
  }
}

.el-row {
  margin-bottom: 8px;
}
</style>
