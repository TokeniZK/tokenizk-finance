<template>
  <el-row>
    <el-col :span="24" justify="center" align="middle">

      <el-row class="row-bg">
        <el-col :span="9">
          <h1>Current Presales</h1>
        </el-col>
      </el-row>

      <el-row style="margin-bottom:30px ;" justify="center">
        <el-col :span="9">
          <router-link to="/pre-Sales/all-launchpads">All launchpads</router-link>
        </el-col>
        <el-col :span="9">
          <router-link to="/pre-Sales/my-contributions">My Contributions</router-link>
        </el-col>
      </el-row>

      <!-- 三级路由出口组件 -->
      <el-row>
        <el-col :span="24">
          <router-view />
        </el-col>
      </el-row>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>