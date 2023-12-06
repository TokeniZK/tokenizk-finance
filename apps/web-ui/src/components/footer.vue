<template>
  <div id="footerView">

    <el-row class="row-bg" justify="space-evenly">
      <el-col :span="6">
        <div class="grid-content ep-bg-purple" />
        <el-row>
          <el-col>
            <el-row>
              <img style="width: 180px" src="../assets/logo.svg" alt="Element logo" />
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

      <el-col :span="6">
        <el-row class="row-bg" ustify="space-evenly">

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

    </el-row>

    <el-row>
      <div class="copyright">
        <span>Copyright © 2023 TokeniZK. All Rights Reserved.</span>
      </div>
    </el-row>

  </div>
</template>

<style lang="less" scoped>
#footerView {
  margin-left: -32px;
  color: #fff;
  padding-top: 100px;
  padding-bottom: 100px;
  background-color: #03142c;


  // footer区域 flex布局 4-4-4
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
