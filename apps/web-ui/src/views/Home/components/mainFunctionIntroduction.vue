<template>
  <el-row class="row-bg mainFunctionIntroduction" justify="center">

    <el-col :span="1"></el-col>

    <el-col :span="18">

      <el-row class="row-bg" justify="space-between">
        <el-col :span="6" class="category-box">
          <el-row justify="center"><img src="/src/assets/customization.png" alt=""
              style="background-color: #fff;"></el-row>
          <el-row justify="center">
            <h4 class="lasthead">customization </h4>
          </el-row>
          <el-row class="category-text">Easily customize your own tokens to create token sales</el-row>
        </el-col>
        <el-col :span="6" class="category-box">
          <el-row justify="center"> <img src="/src/assets/launchpad.png" alt="" style="background-color: #fff;"></el-row>
          <el-row justify="center">
            <h4 class="lasthead">Launchpad</h4>
          </el-row>
          <el-row class="category-text">With just a few clicks, you can create a launchpad using the token you
            cast</el-row>
        </el-col>
        <el-col :span="6" class="category-box">
          <el-row justify="center"> <img src="/src/assets/present-presale.png" alt=""></el-row>
          <el-row justify="center">
            <h4 class="lasthead">Present Presale</h4>
          </el-row>
          <el-row class="category-text">Intuitive display,easy selection of favorite Presales</el-row>
        </el-col>
      </el-row>

      <el-row class="row-bg" justify="space-between">
        <el-col :span="6" class="category-box">
          <el-row justify="center"><img src="/src/assets/airdropAndLocker.png" alt=""></el-row>
          <el-row justify="center">
            <h4 class="lasthead">Airdrop and Locker</h4>
          </el-row>
          <el-row class="category-text">Easily customize your own tokens to create token sales</el-row>
        </el-col>
        <el-col :span="6" class="category-box">
          <el-row justify="center"> <img src="/src/assets/managementManager.png" alt=""></el-row>
          <el-row justify="center">
            <h4 class="lasthead">Management Manager</h4>
          </el-row>
          <el-row class="category-text">This portal helps you easily update the content of launchpad.</el-row>
        </el-col>
        <el-col :span="6" class="category-box">
          <el-row justify="center"> <img src="/src/assets/brandingBrandStrategy.png" alt=""></el-row>
          <el-row justify="center">
            <h4 class="lasthead">Branding brand strategy</h4>
          </el-row>
          <el-row class="category-text">Add logos, social links, descriptions, and lists on TokeniZK</el-row>
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
    width: 380px;
    height: 200px;
    text-align: center;
    background-color: #fff;
    // border-radius: 180px;

    .category-text {
      font-size: 13px;
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