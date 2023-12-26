<template>
  <el-row class="row-bg banner" justify="center">

    <el-col :span="2"></el-col>

    <el-col :span="19">

      <!-- slogan  -->
      <el-row class="row-bg slogan" justify="center">
        <el-col :span="24">
          <el-row class="header-span" justify="center">Tokenize Creative Ideas,</el-row>
          <el-row class="header-span" justify="center">Early Access to Crazy Thinking.</el-row>
          <el-row class="header-text" justify="center">The First Verifiable LaunchPad on Mina, with No-code.</el-row>
        </el-col>
      </el-row>

      <!-- 特效盒子 -->
      <el-row class="row-bg banner-box" justify="center">

        <el-col class="box-left" :span="12">
          <el-row>
            <h2 class="title">Why Choose TokeniZK</h2>
          </el-row>
          <el-row>
            <p class="text"> The Launchpad focusing on ZK-Token for Everyone!</p>
          </el-row>
          <el-row>
            <p class="text">A ZK-Token creation, pre-sale, and management platform suitable </p>
            <p class="text">for everyone. Anyone can easily create their own tokens and </p>
            <p class="text">project pre-sales here.</p>
          </el-row>
        </el-col>

        <el-col class="box-right" :span="12">

          <el-row style="margin: 30px 25px;">
            <h4 class="lasthead">Complete Toolkit for Token Launch and Sale</h4>
            <p class="text"> Create your own tokens and sales quickly, easily and cheaply</p>
          </el-row>
          <el-row style="margin: 30px 25px;">
            <h4 class="lasthead">No mental burden</h4>
            <p class="text">No need to understand complex zero knowledge proof, code knowledge</p>
          </el-row>
          <el-row style="margin: 30px 25px;">
            <h4 class="lasthead">Verifiable Security Platform</h4>
            <p class="text">Cryptography guarantees data consistency</p>
          </el-row>

        </el-col>

      </el-row>

    </el-col>

    <el-col :span="2"></el-col>

  </el-row>
</template>

<style lang="less" scoped>
.banner {
  width: 100%;
  padding-top: 230px;
  height: 800px;
  background-color: #000;
  margin-bottom: 80px;

  .slogan {
    width: 100%;

    .header-span {
      color: #00FFC2;
      font-size: 62px;
      line-height: 1.16;
      font-family: Manrope;
      font-weight: 700;
    }

    .header-text {
      color: #fff;
      font-size: 24.5px;
      line-height: 28px;
      padding: 27px 0px 36px;
      font-family: Manrope;
    }

  }

  // 特效盒子
  .banner-box {
    width: 100%;
    z-index: 2;
    border-radius: 15px;
    background-color: #161616;
    box-shadow: 0 -5px 30px 1px #00FFC2;
    padding: 50px 80px 50px;
    font-family: Manrope;
    margin-top: 70px;
    height: 415px;

    .box-left {
      padding-top: 30px;

      h2.title {
        color: #f7f7f7;
        font-size: 35px;
        font-family: Manrope;
        margin-bottom: 20px;
      }

      .text {
        color: #f7f7f7;
        margin-bottom: 5px;
      }

    }

    .box-right {
      background-color: rgb(0, 255, 194);
      border-radius: 15px;
      visibility: visible;
      animation-name: fadeInUp;
      padding: 0 15px;
      padding-bottom: 10px;

      .lasthead {
        font-size: 20px;
        line-height: 1.5;
        font-weight: 600;
        color: #051c35;
      }

      .text {
        font-size: 13px;
        line-height: 1.66;
        font-weight: 400;
      }

    }
  }

}
</style>
