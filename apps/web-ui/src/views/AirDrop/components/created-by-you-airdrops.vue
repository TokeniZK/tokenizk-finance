<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getCreatedByYouAirdropsAPI } from '@/apis/airdropAll'
import { Search } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import { Minus, Plus } from '@element-plus/icons-vue'
import { getSearchProjectAPI } from '@/apis/getSearchProjectsApi'
import { type SaleDto } from '@tokenizk/types'

const createdByYouAirdrops = ref([])

const getCreatedByYouAirdrops = async () => {
  const res = await getCreatedByYouAirdropsAPI()
  createdByYouAirdrops.value = res.data
}

// 组件挂载完成后执行的函数 
onMounted(() => {
  getCreatedByYouAirdrops()

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

// 过滤器
const sortBy = ref('')

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
]

// 临时数据 副本
let renderSaleBlock = fetchResult;
let presaleProjects = reactive({ saleList: renderSaleBlock });


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
  <el-row class="row-bg createdByYouAirdrops">

    <el-col :span="24">

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

                    <el-row class="row-bg " justify="space-between">
                      <el-col :span="10">Token:</el-col>
                      <el-col :span="8"></el-col>
                      <el-col :span="6">{{ item.tokenName }}</el-col>
                    </el-row>

                    <el-row class="row-bg " justify="space-between">
                      <el-col :span="10">Total Token:</el-col>
                      <el-col :span="4"></el-col>
                      <el-col :span="6"> {{ item.hardCap }}</el-col>
                    </el-row>

                    <el-row class="row-bg" justify="space-between">
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
.createdByYouAirdrops {
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
}

.el-row {
  margin-bottom: 12px;
}
</style>
