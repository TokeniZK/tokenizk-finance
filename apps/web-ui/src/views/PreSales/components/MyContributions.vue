<script setup lang="ts">
import { reactive } from 'vue'
import { ref } from 'vue'
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
  id: 1,
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  star: '5',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 2,
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  star: '2',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 3,
  photo: '/src/assets/images/3.png',
  name: 'Ripple Frog',
  star: '2',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 4,
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  star: '5',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 5,
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  star: '2',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 6,
  photo: '/src/assets/images/3.png',
  name: 'Ripple Frog',
  star: '2',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 7,
  photo: '/src/assets/images/1.png',
  name: 'Oggy Inu 2.0',
  star: '5',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
  LockupTime: '365day',
  PresaleStartTime: '2023.12.15 19:37 (UTC)',
  PresaleEndTime: '2024.01.12 19:38 (UTC)',
  FirstReleaseForProject: '95%',
  VestingForProject: '3% each 1 days',
},
{
  id: 8,
  photo: '/src/assets/images/2.png',
  name: 'Wojak 2.69',
  star: '2',
  privateSaleAddr: 'B62',
  softCap: '10',
  HardCap: '50',
  progressStart: '2',
  progressEnd: '10',
  liquidity: '50%',
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
  <el-row class="my-contributions">
    <el-col>
      <!-- 搜索、过滤器 -->
      <el-row class="row-bg" justify="center">

        <el-col :span="11">
          <div style="height: 19.59px;"></div>
          <el-input v-model="input" placeholder="Please input" size="large" style="border-radius: 15px;" />
        </el-col>

        <!-- 过滤器 -->
        <el-col :span="4">
          <div>Filter By</div>
          <el-select v-model="value" class="m-2 pool-filter" placeholder="All Status" size="large">
            <el-option v-for="item in options1" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>

        <el-col :span="4">
          <div>Sort By</div>
          <el-select v-model="value" class="m-2 pool-filter" placeholder="No Filter" size="large">
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
      </el-row>

      <!-- 每个项目 -->
      <el-row>
        <el-col>
          <el-row class="test"> test scss 的 自动导入</el-row>
        </el-col>
      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.test {
  color: $warnColor;
}

.my-contributions {
  width: 100%;
  height: 100%;
  padding-top: 20px;
  padding-bottom: 50px;

  .pool-filter {
    color: #000;
    background-color: #00FFC2;
  }
}
</style>
