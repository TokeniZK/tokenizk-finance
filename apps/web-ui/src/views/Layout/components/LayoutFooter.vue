<template>
  <el-row class="row-bg LayoutFooter" justify="center">

    <el-col :span="24">

      <el-row class="row-bg center">

        <el-col :span="4"></el-col>

        <el-col :span="8">
          <div class="grid-content ep-bg-purple" />
          <el-row>
            <el-col>
              <el-row>
                <img class="footer-logo" src="/src/assets/logo.svg" alt="Element logo" />
              </el-row>
              <el-row>
                <div style="padding: 14px; color: #bec2ce;">
                  <p>
                    TokeniZK Finance is a decentralized launchpad where you could launch your own
                    zk-Token and create your own initial token sale. It provides secure smart contract templates
                    with flexible configuration and complete tool suits for token management, where you could
                    finish all operations simply in several clicks, without knowledge requirement about code &
                    zkp.
                  </p>

                </div>
              </el-row>
              <el-row>
                <div class="bottom">
                  <!-- 没 icon 待做 -->
                </div>
              </el-row>
            </el-col>
          </el-row>
        </el-col>

        <el-col :span="2"></el-col>

        <el-col :span="8">
          <el-row>

            <el-col :span="12">
              <div class="grid-content ep-bg-purple-light" />
              <div class="footer-box">
                <h3 style="padding-bottom: 20px; font-size: 20px; font-family: math;">Contact US</h3>
                <div class="footer-list">
                  <ul>
                    <li class="active"><a href="#0"> About Us </a></li>
                    <li><a href="#0"> Terms </a></li>
                    <li><a href="#0"> Licenses </a></li>
                    <li><a href="#0"> Privacy &amp; Policy </a></li>
                  </ul>
                </div>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="grid-content ep-bg-purple" />
              <div class="footer-box">
                <h3 style="padding-bottom: 20px; font-size: 20px; font-family: math;">Quick Resources</h3>
                <div class="footer-list">
                  <ul>
                    <li class="active"><a href="#0"> Community </a></li>
                    <li><a href="#0"> Blog </a></li>
                    <li><a href="#0"> Forums </a></li>
                    <li><a href="#0"> Meetups </a></li>
                    <li><a href="#0"> Events </a></li>
                  </ul>
                </div>
              </div>
            </el-col>

          </el-row>
        </el-col>

        <!-- <el-col :span="3"></el-col> -->

      </el-row>

      <!-- Copyright Notice -->
      <el-row>
        <div class="copyright">
          <span>Copyright © 2023 TokeniZK. All Rights Reserved.</span>
        </div>
      </el-row>

      <el-row style="height: 60px; background-color: #011025;"></el-row>

      <!-- Back to top -->
      <el-backtop :bottom="100">
        <div style="
        height: 100%;
        width: 100%;
        background-color: #00FFC2;
        box-shadow: var(--el-box-shadow-lighter);
        text-align: center;
        line-height: 40px;
        color: #fff;
        border-radius: 20%;">
          <el-icon>
            <Top />
          </el-icon>
        </div>
      </el-backtop>

    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.LayoutFooter {
  width: 100%;
  padding-top: 100px;
  color: #fff;
  background-color: #03142c;
  bottom: 0;
  left: 0;


  .footer-logo {
    width: 180px;
    background-color: #03142c;
  }

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

  // 底部 logo + 产品描述
  .footer-list {
    ul {
      li {
        padding-top: 8px;
      }
    }
  }

  .footer-list li:active {
    color: #ffffff;
  }

  .copyright {
    margin: 100px auto 0;

    font-size: 13px;
    color: #8a8f9c;
  }

}
</style>
