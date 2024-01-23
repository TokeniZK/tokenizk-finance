<template>
  <el-row class="row-bg mainFunctionIntroduction" justify="center">

    <el-col :span="1"></el-col>

    <el-col :span="18">

      <el-row class="row-bg" justify="space-between">

        <el-col :span="6" class="category-box">
          <el-row justify="center"> 
            
            <i class="iconfont icon-a-InvestmentCastingCustomization"></i>
            
          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">customization </h4>
          </el-row>
          <el-row class="category-text" justify="center">Easily customize your own tokens to create token sales</el-row>
        </el-col>

        <el-col :span="6" class="category-box">
          <el-row justify="center">

            <i class="iconfont icon-launchpad1"></i>

          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">Launchpad</h4>
          </el-row>
          <el-row class="category-text" justify="center">With just a few clicks, you can create a launchpad using the
            token you cast</el-row>
        </el-col>

        <el-col :span="6" class="category-box">
          <el-row justify="center">

            <i class="iconfont icon-presale"></i>

          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">Present Presale</h4>
          </el-row>
          <el-row class="category-text" justify="center">Intuitive display,easy selection of favorite Presales</el-row>
        </el-col>

      </el-row>

      <el-row class="row-bg" justify="space-between">

        <el-col :span="6" class="category-box">
          <el-row justify="center">

            <i class="iconfont icon-airdrop"></i>
            <i class="iconfont icon-lock-clock"></i>

          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">Airdrop and Locker</h4>
          </el-row>
          <el-row class="category-text" justify="center">Easily customize your own tokens to create token sales</el-row>
        </el-col>

        <el-col :span="6" class="category-box">
          <el-row justify="center">

            <i class="iconfont icon-qidongzhaopinguanli"></i>

          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">Management Manager</h4>
          </el-row>
          <el-row class="category-text" justify="center">This portal helps you easily update the content of
            launchpad.</el-row>
        </el-col>

        <el-col :span="6" class="category-box">
          <el-row justify="center">

            <i class="iconfont icon-strategy"></i>

          </el-row>
          <el-row justify="center">
            <h4 class="lasthead">Branding brand strategy</h4>
          </el-row>
          <el-row class="category-text" justify="center">Add logos, social links, descriptions, and lists on
            TokeniZK</el-row>
        </el-col>

      </el-row>

    </el-col>

    <el-col :span="1"></el-col>

  </el-row>
</template>

<style lang="less" scoped>
.mainFunctionIntroduction {
  margin-bottom: 100px;
  width: 100%;
  padding-top: 200px;
  height: 700px;
  background-color: #f7f7f7;

  .category-box {
    margin-bottom: 50px;
    padding: 30px 20px;
    width: 400px;
    height: 220px;
    text-align: center;
    background-color: #fff;
    // border-radius: 180px;

    .icon-launchpad1,
    .icon-strategy,
    .icon-a-InvestmentCastingCustomization,
    .icon-airdrop,
    .icon-lock-clock,
    .icon-qidongzhaopinguanli,
    .icon-presale
 {
      font-size: 50px;
      color: #00FFC2;
    }

    .category-text {
      font-size: 14px;
    }
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 20px;
  }

  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
}
</style>