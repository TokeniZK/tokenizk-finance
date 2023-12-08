<template>
  <el-row class="row-bg mainFunctionIntroduction" justify="center">

    <el-col :span="18">

      <el-row class="row-bg" justify="center">
        <el-col :span="6">1</el-col>
        <el-col :span="6">2</el-col>
        <el-col :span="6">3</el-col>
      </el-row>

      <el-row class="row-bg" justify="center">
        <el-col :span="6">4</el-col>
        <el-col :span="6">5</el-col>
        <el-col :span="6">6</el-col>
      </el-row>

    </el-col>

  </el-row>
</template>

<style lang="less" scoped>
.mainFunctionIntroduction {
  padding-top: 200px;
  height: 600px;
  background-color: #f7f7f7;

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 4px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
}
</style>