<script setup lang="ts">
import { ref } from 'vue'
import { getAllLaunchpadsAPI } from '@/apis/presaleAll'
import { onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 生成 唯一标识符
import { nanoid } from 'nanoid'
// 进度条
import { Minus, Plus } from '@element-plus/icons-vue'
// 搜索获取项目
import { getSearchProjectAPI } from '@/apis/getSearchProjectsApi'

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


// 搜索
let keyWord = ref('')

const getSearchProjects = async () => {
  let searchRes = getSearchProjectAPI(keyWord);
  console.log(searchRes);
  // allLaunchpadsList.value = searchRes.value
}

// 过滤器
const filterBy = ref('')
const sortBy = ref('')

const filterByOptions = [
  {
    value: '0',
    label: 'All Status',
  },
  {
    value: '1',
    label: 'Upcoming',
  },
  {
    value: '2',
    label: 'Ongoing',
  },
  {
    value: '3',
    label: 'Filled',
  },
  {
    value: '4',
    label: 'Ended',
  },
  {
    value: '5',
    label: 'Canceled',
  },
]

const sortByOptions = [
  {
    value: '0',
    label: 'No Sort',
  },
  {
    value: '1',
    label: 'Hard Cap',
  },
  {
    value: '2',
    label: 'Soft Cap',
  },
  {
    value: '3',
    label: 'LP percent',
  },
  {
    value: '4',
    label: 'Start time',
  },
  {
    value: '5',
    label: 'End time',
  },
]

const searchProjects = () => {
  filterBy.value = '0'
  sortBy.value = '0'
}


// 临时数据渲染
let obj = reactive([{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  status: '3',
  teamName: 'Yoga',
  star: '4',
  preSaleAddr: 'B62',
  softCap: '20',
  hardCap: '50',
  totalContributedMina: '40',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '10%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  status: '2',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '60',
  totalContributedMina: '20',
  progressStart: '0',
  progressEnd: '60',
  liquidity: '30%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/3.png',
  name: 'Ripple Frog',
  status: '1',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '30',
  hardCap: '45',
  totalContributedMina: '60',
  progressStart: '0',
  progressEnd: '45',
  liquidity: '53%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'FastAI',
  status: '2',
  teamName: 'Yoga',
  star: '4',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '50',
  totalContributedMina: '30',
  progressStart: '10',
  progressEnd: '50',
  liquidity: '40%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wrapped XRP',
  status: '5',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '50',
  totalContributedMina: '50',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '30%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/3.png',
  name: 'THREADS V2',
  status: '3',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '50',
  totalContributedMina: '10',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '30%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  status: '2',
  teamName: 'Yoga',
  star: '5',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '50',
  totalContributedMina: '13',
  progressStart: '23',
  progressEnd: '50',
  liquidity: '15%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  status: '3',
  teamName: 'Yoga',
  star: '2',
  preSaleAddr: 'B62',
  softCap: '10',
  hardCap: '50',
  totalContributedMina: '42',
  progressStart: '0',
  progressEnd: '50',
  liquidity: '23%',
  lockupTime: '365day',
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
{
  id: nanoid(),
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  status: '5',
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
  presaleStartTime: '2023.12.15 19:37 (UTC)',
  presaleEndTime: '2024.01.12 19:38 (UTC)',
  firstReleaseForProject: '95%',
  vestingForProject: '3% each 1 days',
},
])

// 处理映射关系
obj.map((item) => {
  // console.log(item.status);
  if (item.status === '0') {
    item.status = 'All Status'
  } else if (item.status === '1') {
    item.status = 'Upcoming'
  } else if (item.status === '2') {
    item.status = 'Ongoing'
  } else if (item.status === '3') {
    item.status = 'Filled'
  } else if (item.status === '4') {
    item.status = 'Ended'
  } else if (item.status === '5') {
    item.status = 'Canceled'
  }
})


</script>

<template>
  <el-row class="all-launchpads">

    <el-col>

      <!-- 搜索、过滤器 -->
      <el-row class="row-bg" justify="center" style="margin-bottom:50px;" :gutter="20">

        <el-col :span="13">
          <div style="height: 19.59px;"></div>

          <div class="mt-4">
            <el-input v-model="keyWord" placeholder="Please input" class="input-with-select" size="large">
              <template #append>
                <el-button :icon="Search" @click="searchProjects" />
              </template>
            </el-input>
          </div>

        </el-col>

        <!-- 过滤器 -->
        <el-col :span="3">
          <div>Filter By</div>
          <el-select v-model="filterBy" class="m-2 pool-filter" placeholer="Select" size="large">
            <el-option v-for="item in filterByOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>

        <el-col :span="3">
          <div>Sort By</div>
          <el-select v-model="sortBy" class="m-2 pool-filter" placeholder="Select" size="large">
            <el-option v-for="item in sortByOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>

      </el-row>

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="launchpads-ul">
            <li v-for="item in obj" :key="item.id">

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

                  <el-col :span="24">

                    <el-row class="row-bg" justify="space-between">
                      <el-col :span="8">
                        <h4><a href="#">{{ item.name }}</a></h4>
                      </el-col>

                      <el-col :span="5"></el-col>

                      <el-col class="review" :span="7">
                        <el-button type="primary" round>{{ item.status }}</el-button>
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
                      <el-col :span="10">{{ item.softCap }}Mina - {{ item.hardCap }}Mina</el-col>
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


            </li>
          </ul>
        </el-col>
      </el-row>

    </el-col>

  </el-row>
</template>

<style lang="less" scoped>
.all-launchpads {
  width: 100%;
  height: 100%;
  padding-top: 20px;
  padding-bottom: 50px;

  .input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
  }

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
