<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getAllAirdropListAPI } from '@/apis/airdropAll'
import { Search } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { getSearchProjectAPI } from '@/apis/getSearchProjectsApi'

const allAirdropList = ref([])
const getAllAirdropList = async () => {
  const res = await getAllAirdropListAPI()
  allAirdropList.value = res.data
}

// 组件挂载完成后执行的函数 
onMounted(() => {
  getAllAirdropList()

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
    logoUrl: '/src/assets/images/1.png',
    name: 'Favoom ',
    tokenName: 'FM',
    teamName: 'Yoga',
    participants: 100,
    star: 4,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/2.png',
    name: 'BabyAmple ',
    tokenName: 'BA',
    teamName: 'walking',
    participants: 200,
    star: 2,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/3.png',
    name: 'Versa',
    tokenName: 'VA',
    participants: 300,
    teamName: 'cherry',
    star: 2,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/3.png',
    name: 'FastAI',
    tokenName: 'BA',
    participants: 400,
    teamName: 'Tang',
    star: 4,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/2.png',
    name: 'Wrapped',
    tokenName: 'VA',
    participants: 500,
    teamName: 'mina',
    star: 2,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/1.png',
    name: 'THREADS V2',
    tokenName: 'VA',
    participants: 200,
    teamName: 'BTC',
    star: 2,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/2.png',
    name: 'Oggy Inu 2.0',
    tokenName: 'OI',
    participants: 100,
    teamName: 'Yoga',
    star: 5,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    tokenName: 'WK',
    participants: 200,
    teamName: 'Yoga',
    star: 2,
    saleAddress: 'B62',
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
    logoUrl: '/src/assets/images/2.png',
    name: 'Wojak 2.69',
    tokenName: 'WK',
    participants: 100,
    teamName: 'Yoga',
    star: 2,
    saleAddress: 'B62',
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


// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const getSearchProjects = async () => {
  let searchRes = getSearchProjectAPI(keyWord)
  allAirdropList.value = searchRes.data
}

// 过滤器
const filterBy = ref('')
const sortBy = ref('')

// fitlerBy 下拉菜单 渲染所需的数据
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
    label: 'Ended',
  },
  // {
  //   value: '4',
  //   label: 'Canceled',
  // },
]

// sortBy 下拉菜单 渲染所需的数据
const sortByOptions = [
  {
    value: '0',
    label: 'No Sort',
  },
  {
    value: '1',
    label: 'Start time',
  },
  {
    value: '2',
    label: 'End time',
  },
  // {
  //   value: '5',
  //   label: 'LP percent',
  // },
]

// 每次点击 搜索按钮 时，重置 过滤选项 和 排序选项
const searchProjects = () => {
  filterBy.value = '0'
  sortBy.value = '0'
}

// 判断项目的状态
let currentTime = new Date().getTime();
fetchResult.forEach(item => {
  if (item.presaleStartTime > currentTime) {
    item.projectStatus = 'Upcoming'
  } else if (item.presaleStartTime <= currentTime && item.presaleEndTime > currentTime) {
    item.projectStatus = 'Ongoing'
  } else if (item.presaleEndTime < currentTime) {
    item.projectStatus = 'Ended'
  } else {
    item.projectStatus = 'All Status'
  }
});

// sort   
if (sortBy.value == '1') {
  fetchResult.sort((a, b) => {
    return Number(b.presaleStartTime) - Number(a.presaleStartTime);
  });
} else if (sortBy.value == '2') {
  fetchResult.sort((a, b) => {
    return Number(b.presaleEndTime) - Number(a.presaleEndTime);
  });
}

// 临时数据 副本
let renderSaleBlock = fetchResult;
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 根据 用户选择 filterBy的选项  过滤数据
const filterOption = (option: string) => {

  let currentTime = new Date().getTime();
  fetchResult.forEach(item => {
    if (item.presaleStartTime > currentTime) {
      item.projectStatus = 'Upcoming'
    } else if (item.presaleStartTime <= currentTime && item.presaleEndTime > currentTime) {
      item.projectStatus = 'Ongoing'
    } else if (item.presaleEndTime < currentTime) {
      item.projectStatus = 'Ended'
    } else {
      item.projectStatus = 'All Status'
    }
  });


  if (option === '3') {
    // TODO 
    fetchResult.filter(item => {
      return item.projectStatus === 'All Status'
    })

  } else if (option === '0') {
    renderSaleBlock = fetchResult
  } else {
    renderSaleBlock = fetchResult.filter(item => {
      if (option == '1') {
        return item.projectStatus === 'Upcoming'
      } else if (option == '2') {
        return item.projectStatus === 'Ongoing'
      } else if (option == '3') {
        return item.projectStatus === 'Ended'
      }
    });

    // sort
    if (sortBy.value == '1') {
      renderSaleBlock.sort((a, b) => {
        return Number(b.presaleStartTime) - Number(a.presaleStartTime);
      });
    } else if (sortBy.value == '2') {
      renderSaleBlock.sort((a, b) => {
        return Number(b.presaleEndTime) - Number(a.presaleEndTime);
      });
    }

    presaleProjects.saleList = renderSaleBlock;

  }

}


// 根据 用户选择 sortBy的选项 sort排序 由近到远
const sortOption = (option: string) => {
  // sort
  if (sortBy.value == '1') {
    renderSaleBlock.sort((a, b) => {
      return Number(b.presaleStartTime) - Number(a.presaleStartTime);
    });
  } else if (sortBy.value == '2') {
    renderSaleBlock.sort((a, b) => {
      return Number(b.presaleEndTime) - Number(a.presaleEndTime);
    });
  }
  renderSaleBlock = JSON.parse(JSON.stringify(renderSaleBlock))
  presaleProjects.saleList = renderSaleBlock;
}


</script>

<template>
  <el-row class="row-bg all-airdrop">

    <el-col :span="24">

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
                    <el-image style="width: 349px; height: 130px;" :src="item.logoUrl" :alt="item.name" loading="lazy" />
                  </router-link>
                </el-row>

                <!-- 项目描述 -->
                <el-row class="launchpads-content">

                  <el-col :span="24">

                    <el-row class="row-bg" justify="space-between">
                      <el-col :span="24">
                        <h3><a href="#">{{ item.name }}</a></h3>
                      </el-col>
                    </el-row>

                    <el-row class="row-bg soft-hard-cap" justify="space-between">
                      <el-col :span="10">Token</el-col>
                      <el-col :span="8"></el-col>
                      <el-col :span="6">{{ item.tokenName }}</el-col>
                    </el-row>

                    <el-row class="row-bg liquidity-percent" justify="space-between">
                      <el-col :span="10">Total Token:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6"> {{ item.totalContributedMina }}</el-col>
                    </el-row>

                    <el-row class="row-bg lockup-time" justify="space-between">
                      <el-col :span="10">Participants:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6">{{ item.participants }}</el-col>
                    </el-row>

                    <el-row class="row-bg" justify="space-between">
                      <el-col :span="6">Begin at :</el-col>
                      <el-col :span="14"> {{ new Date(item.presaleStartTime).toISOString() }}</el-col>
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
.all-airdrop {
  width: 100%;
  padding-top: 10px;
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
      height: 400px;
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
}

.el-row {
  margin-bottom: 12px;
}
</style>
