<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { type AirdropDto } from '@tokenizk/types/src/airdrop-dto'
import { type AirdropReq } from '@tokenizk/types/src/airdrop-req'
import AirdropBlock from '@/components/airdrop-block.vue'
import { useRoute, useRouter } from 'vue-router';

let route = useRoute();
let type = ref(route.query.type as any as number);

const router = useRouter();
router.beforeEach((to, from, next) => {
  const query = to.query;
  type.value = query.type as any as number;
  next();
});

type AirdropDtoExtend = AirdropDto & { projectStatus: string }

let fetchResult: AirdropDtoExtend[] = [];

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
  }
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
  }
]

// 每次点击 搜索按钮 时，重置 过滤选项 和 排序选项
const searchProjects = () => {
  if (keyWord.value) {
    filterBy.value = '0'
    sortBy.value = '0'

    // trigger api
    getSearchProjects();
  }
}

// 转换项目的状态
const transformProjectStatus = (itmes: AirdropDtoExtend[]) => {
  let currentTime = new Date().getTime();

  itmes.forEach(item => {
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
}

const sortProjects = (sortByValue: string, items: AirdropDtoExtend[]) => {
  if (sortByValue == '1') {
    items.sort((a, b) => {
      return Number(b.startTimestamp) - Number(a.startTimestamp);
    });
  } else if (sortByValue == '2') {
    items.sort((a, b) => {
      return Number(b.endTimestamp) - Number(a.endTimestamp);
    });
  }

  return items;
}

let renderAirdropBlock: AirdropDtoExtend[] = [];
// 临时数据
let airdropProjects = reactive({ airdropList: renderAirdropBlock });

// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const getSearchProjects = async () => {

  const airdropReq = {
    type: type.value,
    airdropName: keyWord.value
  } as any as AirdropReq;

  // 临时数据 本尊
  fetchResult = [{
    id: 0,
    type: 1,
    txHash: '0x333123456789',
    status: 1,
    tokenName: 'TxZ',
    tokenAddress: 'B62xxxt',
    tokenSymbol: 'TxZ',
    airdropName: 'ZHI Inu 2.0',
    airdropAddress: 'B62xxs',
    star: 4,
    totalAirdropSupply: 20,
    currency: 'Mina',
    feeRate: '5%',
    whitelistTreeRoot: '45678ityuioghjk',
    whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
    startTimestamp: new Date().getTime() - 10 * 60 * 60 * 1000,
    endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
    projectStatus: '',
    cliffTime: 3,
    cliffAmountRate: 3,
    vestingPeriod: 3,
    vestingIncrement: 10,
    teamName: 'Zhi Tokenizk Team',
    logoUrl: '/src/assets/images/1.png',
    website: 'https://tokenizk.finance/',
    facebook: 'https://tokenizk.finance/',
    github: 'https://tokenizk.finance/',
    twitter: 'https://tokenizk.finance/',
    telegram: 'https://tokenizk.finance/',
    discord: 'https://tokenizk.finance/',
    reddit: 'https://tokenizk.finance/',
    description: 'The Launchpad focusing on ZK-Token for Everyone!',
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
  },
  {
    id: 0,
    type: 1,
    txHash: '0x123456789',
    status: 1,
    tokenName: 'OZ',
    tokenAddress: 'B62xxxt',
    tokenSymbol: 'TZ',
    airdropName: 'Oggy Inu 2.0',
    airdropAddress: 'B62xxs',
    star: 4,
    totalAirdropSupply: 20,
    currency: 'Mina',
    feeRate: '5%',
    whitelistTreeRoot: '45678ityuioghjk',
    whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
    startTimestamp: new Date().getTime() + 10 * 60 * 60 * 1000,
    endTimestamp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
    projectStatus: '',
    cliffTime: 300,
    cliffAmountRate: 3,
    vestingPeriod: 4,
    vestingIncrement: 5,
    teamName: 'Tokenizk Team',
    logoUrl: '/src/assets/images/1.png',
    website: 'https://tokenizk.finance/',
    facebook: 'https://tokenizk.finance/',
    github: 'https://tokenizk.finance/',
    twitter: 'https://tokenizk.finance/',
    telegram: 'https://tokenizk.finance/',
    discord: 'https://tokenizk.finance/',
    reddit: 'https://tokenizk.finance/',
    description: 'The Launchpad focusing on ZK-Token for Everyone!',
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
  },
  {
    id: 0,
    type: 1,
    txHash: '0x123456789',
    status: 1,
    tokenName: 'XZ',
    tokenAddress: 'B62xxxt',
    tokenSymbol: 'TZ',
    airdropName: 'XX Inu 2.0',
    airdropAddress: 'B62xxs',
    star: 4,
    totalAirdropSupply: 20,
    currency: 'Mina',
    feeRate: '5%',
    whitelistTreeRoot: '45678ityuioghjk',
    whitelistMembers: 'B62xxxxw,B62xxxxwY,B62xxU',
    startTimestamp: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
    endTimestamp: new Date().getTime() - 10 * 60 * 60 * 1000,
    projectStatus: '',
    cliffTime: 300,
    cliffAmountRate: 3,
    vestingPeriod: 12,
    vestingIncrement: 10,
    teamName: 'Tokenizk Team',
    logoUrl: '/src/assets/images/1.png',
    website: 'https://tokenizk.finance/',
    facebook: 'https://tokenizk.finance/',
    github: 'https://tokenizk.finance/',
    twitter: 'https://tokenizk.finance/',
    telegram: 'https://tokenizk.finance/',
    discord: 'https://tokenizk.finance/',
    reddit: 'https://tokenizk.finance/',
    description: 'The Launchpad focusing on ZK-Token for Everyone!',
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
  }];

  // 转换项目状态
  transformProjectStatus(fetchResult);
  // sort 相等运算符会转类型、 最后一项没使用Number做转换
  sortProjects(sortByOptions[0].value, fetchResult);

  renderAirdropBlock = fetchResult;
  airdropProjects.airdropList = renderAirdropBlock
}

// 根据 用户选择 filterBy的选项  过滤数据
const triggerFilterProjects = () => {
  // 计算项目状态
  transformProjectStatus(fetchResult);

  if (filterBy.value === '4') {
    // TODO 
    fetchResult.filter(item => {
      return item.projectStatus === 'All Status'
    })

  } else if (filterBy.value === '0') {
    renderAirdropBlock = fetchResult
  } else {
    renderAirdropBlock = fetchResult.filter(item => {
      if (filterBy.value == '1') {
        return item.projectStatus === 'Upcoming'
      } else if (filterBy.value == '2') {
        return item.projectStatus === 'Ongoing'
      } else if (filterBy.value == '3') {
        return item.projectStatus === 'Ended'
      }
    });
  }

  // sort
  sortProjects(sortBy.value, renderAirdropBlock);

  airdropProjects.airdropList = renderAirdropBlock;
}

// 根据 用户选择 sortBy的选项 sort排序 由近到远
const triggerSortProjects = () => {
  // sort
  sortProjects(sortBy.value, renderAirdropBlock);

  renderAirdropBlock = JSON.parse(JSON.stringify(renderAirdropBlock));
  airdropProjects.airdropList = renderAirdropBlock;
}


// 组件挂载完成后执行的函数 
onMounted(() => {
  getSearchProjects();

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });

})


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
              @click="triggerFilterProjects()" />
          </el-select>
        </el-col>

        <el-col :span="3">
          <div>Sort By</div>
          <el-select v-model="sortBy" class="m-2 sortBy" placeholder="Select" size="large">
            <el-option v-for="item in sortByOptions" :key="item.value" :label="item.label" :value="item.value"
              @click="triggerSortProjects()" />
          </el-select>
        </el-col>

      </el-row>

      <!-- 每个项目 -->
      <el-row class="row-bg" justify="center">
        <el-col :span="20">

          <ul class="airdrops-ul">
            <li v-for="item in airdropProjects.airdropList" :key="item.id">

              <AirdropBlock :airdropDto="item" />

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

  .airdrops-ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
}

.el-row {
  margin-bottom: 5px;
}
</style>
