<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getAllPrivateSalesAPI } from '@/apis/privateSalesAll'
import { Search } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { getSearchProjectAPI } from '@/apis/getSearchProjectsApi'
import { type SaleDto } from '@tokenizk/types'

const percentage = ref(20)
const customColor = ref('#00FFC2')

const allPrivateSalesList = ref([])
const getAllPrivateSales = async () => {
  const res = await getAllPrivateSalesAPI()
  allPrivateSalesList.value = res.result
}

// 组件挂载完成后执行的函数  请求数据  
onMounted(() => {
  getAllPrivateSales()

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

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

  cliffTime: 6,
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
  // lockupTime: '365day',  // cliffTime  * 5 * 60 * 1000 / 12
  // firstReleaseForProject: '95%',
  // vestingForProject: '3% each 1 days',

},];

let keyWord = ref('')
const getSearchProjects = async () => {
  let searchRes = getSearchProjectAPI(keyWord)
  allPrivateSalesList.value = searchRes.value
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
    label: 'Filled',
  },
  {
    value: '4',
    label: 'Ended',
  },
  // {
  //   value: '5',
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
    label: 'Soft Cap',
  },
  {
    value: '2',
    label: 'Hard Cap',
  },
  {
    value: '3',
    label: 'Start time',
  },
  {
    value: '4',
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

// sort   相等运算符会转类型、 最后一项没使用Number做转换
if (sortBy.value == '1') {
  fetchResult.sort((a, b) => {
    return Number(a.softCap) - Number(b.softCap);
  });
} else if (sortBy.value == '2') {
  fetchResult.sort((a, b) => {
    return Number(b.hardCap) - Number(a.hardCap);
  });
} else if (sortBy.value == '3') {
  fetchResult.sort((a, b) => {
    return Number(b.startTimestamp) - Number(a.startTimestamp);
  });
} else if (sortBy.value == '4') {
  fetchResult.sort((a, b) => {
    return Number(b.endTimestamp) - Number(a.endTimestamp);
  });
}

let renderSaleBlock = fetchResult;
// 临时数据
let presaleProjects = reactive({ saleList: renderSaleBlock });

// 根据 用户选择 filterBy的选项  过滤数据
const filterOption = (option: string) => {

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
        return Number(a.softCap) - Number(b.softCap);
      });
    } else if (sortBy.value == '2') {
      renderSaleBlock.sort((a, b) => {
        return Number(b.hardCap) - Number(a.hardCap);
      });
    } else if (sortBy.value == '3') {
      renderSaleBlock.sort((a, b) => {
        return Number(b.startTimestamp) - Number(a.startTimestamp);
      });
    } else if (sortBy.value == '4') {
      renderSaleBlock.sort((a, b) => {
        return Number(b.endTimestamp) - Number(a.endTimestamp);
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
      return Number(a.softCap) - Number(b.softCap);
    });
  } else if (sortBy.value == '2') {
    renderSaleBlock.sort((a, b) => {
      return Number(b.hardCap) - Number(a.hardCap);
    });
  } else if (sortBy.value == '3') {
    renderSaleBlock.sort((a, b) => {
      return Number(b.startTimestamp) - Number(a.startTimestamp);
    });
  } else if (sortBy.value == '4') {
    renderSaleBlock.sort((a, b) => {
      return Number(b.endTimestamp) - Number(a.endTimestamp);
    });
  }
  renderSaleBlock = JSON.parse(JSON.stringify(renderSaleBlock))
  obj.saleList = renderSaleBlock;
}

</script>

<template>
  <el-row class="row-bg all-private-sales">

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

              <!-- <el-card shadow="hover"> -->

              <div class="launchpads-box">

                <!-- photo -->
                <el-row class="thumb">
                  <router-link to="/private-sales-datails">
                    <el-image style="width: 100%; height: 100%;" :src="item.logoUrl" :alt="item.saleName"
                      loading="lazy" />
                  </router-link>
                </el-row>


                <!-- 项目描述 -->
                <el-row class="launchpads-content">

                  <el-col>

                    <el-row>
                      <el-col :span="24">
                        <h4><a href="Ripple-Frog-presale-details.html">{{ item.saleName }}</a></h4>
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

                    <!-- 注意  进度条 -->
                    <el-row class="content-Progress">
                      <el-col>

                        <el-row class="title">Progress</el-row>

                        <el-row class="Progress demo-progress" style="margin-bottom: 0;">
                          <el-progress :text-inside="true" :stroke-width="14" :percentage="30" />
                        </el-row>

                        <el-row class="row-bg sub-title" justify="space-between">
                          <el-col :span="10"> 0 Mina</el-col>
                          <el-col :span="4"></el-col>
                          <el-col :span="6">{{ item.hardCap }} Mina </el-col>
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
                      <el-col :span="6">{{ item.cliffTime }} </el-col>
                    </el-row>


                    <el-row class="row-bg Sale-Ends-In" justify="space-between">
                      <el-col :span="10">Sale Ends In :</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6">{{ item.cliffTime }} </el-col>
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
          height: 130px;
          border-radius: 15px;
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
