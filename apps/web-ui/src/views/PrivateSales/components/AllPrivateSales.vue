<script setup lang="ts">
import { getAllLaunchpadsAPI } from '@/apis/presaleAllLaunchpads'
import { onMounted, reactive } from 'vue'
import { ref } from 'vue'
// 生成 唯一标识符
import { nanoid } from 'nanoid'
// 进度条
import { Minus, Plus } from '@element-plus/icons-vue'
const percentage = ref(20)
const customColor = ref('#00FFC2')

const allLaunchpadsList = ref([])

const getAllLaunchpads = async () => {
  const res = await getAllLaunchpadsAPI()
  console.log(res);
  allLaunchpadsList.value = res.data

}

// 组件挂载完成后执行的函数
onMounted(() => {
  getAllLaunchpads()
})

const value = ref('')
const input = ref('')

const options1 = [
  {
    value: 'All Status',
    label: 'All Status',
  },
  {
    value: 'Upcoming',
    label: 'Upcoming',
  },
  {
    value: 'Ongoing',
    label: 'Ongoing',
  },
  {
    value: 'Filled',
    label: 'Filled',
  },
  {
    value: 'Ended',
    label: 'Ended',
  },
  {
    value: 'Canceled',
    label: 'Canceled',
  },
]

const options2 = [
  {
    value: 'No Filter',
    label: 'No Filter',
  },
  {
    value: 'Hard Cap',
    label: 'Hard Cap',
  },
  {
    value: 'Soft Cap',
    label: 'Soft Cap',
  },
  {
    value: 'LP percent',
    label: 'LP percent',
  },
  {
    value: 'Start time',
    label: 'Start time',
  },
  {
    value: 'End time',
    label: 'End time',
  },
]


let obj = [{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  teamName: 'Yoga',
  star: '4',
  preSaleAddr: 'B62',
  softCap: '20',
  HardCap: '50',
  totalContributedMina: '40',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '10%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '60',
  totalContributedMina: '20',
  progressStart: '0',
  progressEnd: '60',
  liquidity: '30%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/3.png',
  name: 'Ripple Frog',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '30',
  HardCap: '45',
  totalContributedMina: '60',
  progressStart: '0',
  progressEnd: '45',
  liquidity: '53%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'FastAI',
  teamName: 'Yoga',
  star: '5',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '30',
  progressStart: '10',
  progressEnd: '50',
  liquidity: '40%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wrapped XRP',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '50',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '30%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/3.png',
  name: 'THREADS V2',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '10',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '30%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  teamName: 'Yoga',
  star: '5',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '13',
  progressStart: '23',
  progressEnd: '50',
  liquidity: '15%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '42',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '23%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  totalContributedMina: '23',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '54%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
]

reactive(obj);

</script>

<template>
  <el-row class="all-private-sales">

    <el-col>

      <!-- 搜索、过滤器 -->
      <el-row class="row-bg" justify="center" style="margin-bottom:50px;">

        <el-col :span="12">
          <div style="height: 19.59px;"></div>
          <el-input v-model="input" placeholder="Please input" size="large" />
        </el-col>

        <el-col :span="1"></el-col>

        <!-- 过滤器 -->
        <el-col :span="3">
          <div>Filter By</div>
          <el-select v-model="value" class="m-2 pool-filter" placeholder="All Status" size="large">
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>

        <el-col :span="3">
          <div>Sort By</div>
          <el-select v-model="value" class="m-2 pool-filter" placeholder="No Filter" size="large">
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>

      </el-row>

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="launchpads-ul">
            <li v-for="item in obj" :key="item.id">

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
                      <el-col class="text" :span="10">
                        by <a href="" class="link">{{ item.teamName }}</a>
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

                        <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                          <el-progress :text-inside="true" :stroke-width="14" :percentage="item.totalContributedMina" />
                        </el-row>

                        <el-row class="row-bg sub-title" justify="space-between">
                          <el-col :span="10" class="is-flex-grow-1"> 0 Mina</el-col>
                          <el-col :span="4"></el-col>
                          <el-col :span="6" class="is-flex-grow-1 has-text-right">50 Mina</el-col>
                        </el-row>

                      </el-col>
                    </el-row>

                    <el-row class="row-bg liquidity-percent" justify="space-between">
                      <el-col :span="10" class="is-flex-grow-1">Liquidity %:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6" class="is-flex-grow-1 has-text-right time-text"> {{ item.liquidity }}</el-col>
                    </el-row>

                    <el-row class="row-bg lockup-time" justify="space-between">
                      <el-col :span="10" class="is-flex-grow-1">Lockup Time:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6" class="is-flex-grow-1 has-text-right time-text">365 day</el-col>
                    </el-row>

                  </el-col>

                </el-row>

              </div>

              <!-- </el-card> -->

            </li>
          </ul>
        </el-col>
      </el-row>

    </el-col>

  </el-row>
</template>

<style lang="less" scoped>
.all-private-sales {
  width: 100%;
  height: 100%;
  padding-top: 20px;
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

          .demo-progress .el-progress--line {
            margin-bottom: 15px;
            width: 300px;
          }

        }

      }
    }
  }
}

.el-row {
  margin-bottom: 5px;
}
</style>
