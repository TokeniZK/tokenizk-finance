<template>
  <el-row class="row-bg Wallet" justify="center">
    <el-col :span="24">
      Wallet组件
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.Wallet {
  width: 100%;
  padding: 10% 20%;

  .form-notes {
    font-size: 12px;
    color: #00c798;
  }

  .tokenTable {
    background-color: #fff;
    padding: 20px;
  }

  .el-form-item {
    margin-bottom: 35px;
  }

  .el-row {
    margin-bottom: 40px;
  }
}
</style>