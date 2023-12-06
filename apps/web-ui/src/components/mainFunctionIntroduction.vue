<template>
  <el-col class="mainFunctionIntroduction">
    <el-row>
      <el-col :span="8">1</el-col>
      <el-col :span="8">2</el-col>
      <el-col :span="8">3</el-col>
    </el-row>

    <el-row>
      <el-col :span="8">4</el-col>
      <el-col :span="8">5</el-col>
      <el-col :span="8">6</el-col>
    </el-row>
  </el-col>
</template>

<style lang="less" scoped>
.mainFunctionIntroduction {
  padding-top: 200px;
  padding-left: 350px;
  height: 600px;
  background-color: #fff;

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