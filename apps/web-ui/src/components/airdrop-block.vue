<script lang="ts" setup >
import { ref, onMounted, reactive, computed, type ComputedRef, onUpdated } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { type AirdropDto } from '@tokenizk/types/src/airdrop-dto'

type AirdropDtoExtend = AirdropDto & { projectStatus: string }

const props = defineProps<{
  airdropDto: AirdropDtoExtend
}>()

const airdropDtoRef: AirdropDtoExtend = JSON.parse(JSON.stringify(props.airdropDto));


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


const countdownFinishCallback = () => {
  // 修改 status 为 Ended
  airdropDtoRef.projectStatus = 'Ended'
}

// 获取 用户输入的关键字 进行搜索
let keyWord = ref('')
const type = 0;

// 组件挂载完成后执行的函数  请求数据  
onMounted(() => {
  // 转换项目状态
  transformProjectStatus([airdropDtoRef]);

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });
});

onUpdated(() => {
  console.log('airdropDtoRef: ' + airdropDtoRef);
  // 转换项目状态
  transformProjectStatus([airdropDtoRef]);

  // 进入当前组件都会回到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 平滑滚动到顶部  
  });
});

const item = airdropDtoRef;
const toDetailPage = `/sale-datails?saleAddress=${item.airdropAddress}&tokenAddress=${item.tokenAddress}`;
</script>


<template>
  <div class="airdrop-box">

    <!-- photo -->
    <el-row class="thumb">
      <router-link to="/airdrop-datails">
        <el-image style="width: 349px; height: 130px;" :src="item.logoUrl" :alt="item.airdropName" loading="lazy" />
      </router-link>
    </el-row>

    <!-- 项目描述 -->
    <el-row class="launchpads-content">

      <el-col :span="24">

        <el-row class="row-bg" justify="space-between">
          <el-col :span="24">
            <h3><a href="#">{{ item.airdropName }}</a></h3>
          </el-col>
        </el-row>

        <el-row class="row-bg soft-hard-cap" justify="space-between">
          <el-col :span="10">Token</el-col>
          <el-col :span="8"></el-col>
          <el-col :span="6">{{ item.tokenName }}</el-col>
        </el-row>

        <el-row class="row-bg" justify="space-between">
          <el-col :span="7">
            <el-row style="padding-top: 8px;">Begin at :</el-row>
          </el-col>
          <el-col :span="17">
            <el-row justify="end">
              <el-countdown format="DD [days] HH:mm:ss" :value="item.endTimestamp" value-style="font-size: 14px;">
              </el-countdown>
            </el-row>
          </el-col>
        </el-row>

        <el-row class="row-bg" justify="end">
          <el-button type="primary" round class="statusColor"> View Airdrop</el-button>
        </el-row>

      </el-col>

    </el-row>

  </div>
</template>

<style lang="less">
.airdrop-box {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 15px;

  .thumb {
    width: 349px;
    height: 130px;
    overflow: hidden;
    border-radius: 15px 15px 0 0;
  }

  .launchpads-content {
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;

    .demo-progress .el-progress--line {
      margin-bottom: 15px;
      width: 300px;
    }

  }

}

.el-row {
  margin-bottom: 10px;
}
</style>