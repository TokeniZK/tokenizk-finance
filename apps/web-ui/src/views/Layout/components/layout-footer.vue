<template>
    <el-row class="LayoutFooter">

        <el-col :span="24">

            <el-row class="row-bg" justify="center">

                <el-col :span="2"></el-col>

                <el-col :span="8" class="footer-left">
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
                                        zk-Token and create your own initial token sale. It provides secure smart contract
                                        templates
                                        with flexible configuration and complete tool suits for token management, where you
                                        could
                                        finish all operations simply in several clicks, without knowledge requirement about
                                        code &
                                        zkp.
                                    </p>

                                </div>
                            </el-row>

                            <el-row>
                                <div style="padding-left:20px ;">

                                    <a href="https://twitter.com/TokeniZK" target="_blank">
                                        <i class="iconfont icon-bird"></i>
                                    </a>

                                    <a href="https://github.com/TokeniZK/tokenizk-finance" target="_blank">
                                        <i class="iconfont icon-GitHub"></i>
                                    </a>

                                    <a href="javascript:void(0);">
                                        <i class="iconfont icon-discord1"></i>
                                    </a>

                                    <a href="javascript:void(0);">
                                        <i class="iconfont icon-facebook"></i>
                                    </a>

                                    <a href="javascript:void(0);">
                                        <i class="iconfont icon-telegram"></i>
                                    </a>

                                    <a href="javascript:void(0);">
                                        <i class="iconfont icon-redditsquare"></i>
                                    </a>



                                </div>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-col>

                <el-col :span="2"></el-col>

                <el-col :span="8" class="footer-right">
                    <el-row>

                        <el-col :span="12">
                            <div class="grid-content ep-bg-purple" />

                            <h3 style="padding-bottom: 20px; font-size: 20px; font-family: math;">Contact US</h3>

                            <div class="footer-list">
                                <ul>
                                    <li class="active"><a href="javascript:void(0);"> About Us </a></li>
                                    <li><a href="javascript:void(0);"> Terms </a></li>
                                    <li><a href="javascript:void(0);"> Licenses </a></li>
                                    <li><a href="javascript:void(0);"> Privacy &amp; Policy </a></li>
                                </ul>
                            </div>

                        </el-col>

                        <el-col :span="12">
                            <div class="grid-content ep-bg-purple" />

                            <h3 style="padding-bottom: 20px; font-size: 20px; font-family: math;">Quick Resources</h3>

                            <div class="footer-list">
                                <ul>
                                    <li class="active"><a href="javascript:void(0);"> Community </a></li>
                                    <li><a href="javascript:void(0);"> Blog </a></li>
                                    <li><a href="javascript:void(0);"> Forums </a></li>
                                    <li><a href="javascript:void(0);"> Meetups </a></li>
                                    <li><a href="javascript:void(0);"> Events </a></li>
                                </ul>
                            </div>

                        </el-col>

                    </el-row>
                </el-col>

            </el-row>

            <!-- Copyright Notice -->
            <el-row>
                <div class="copyright">
                    <span>Copyright © 2023 TokeniZK. All Rights Reserved.</span>
                </div>
            </el-row>

            <el-row style="height: 50px; background-color: #011025;"></el-row>

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

    .footer-left {
        .footer-logo {
            width: 180px;
            background-color: #03142c;
        }

        .icon-discord1,
        .icon-bird,
        .icon-telegram,
        .icon-redditsquare,
        .icon-facebook,
        .icon-GitHub {
            margin-right: 20px;
            font-size: 25px;
            color: #ffffffa7;
        }

        .icon-discord1:hover,
        .icon-bird:hover,
        .icon-telegram:hover,
        .icon-redditsquare:hover,
        .icon-facebook:hover,
        .icon-GitHub:hover {
            margin-right: 20px;
            font-size: 25px;

            color: #00FFC2;
        }

        .el-row {
            margin-bottom: 20px;
        }

    }


    .footer-right {

        .footer-list {
            ul {
                padding-left: 20px;
                list-style-type: circle;

                li {
                    padding-top: 15px;

                    a {
                        color: #ffffffa7;

                    }

                    a:hover {
                        color: #ffffff;
                    }
                }
            }
        }

    }


    .copyright {
        margin: 100px auto 0;
        font-size: 13px;
        color: #8a8f9c;
    }

    .el-row {
        margin-bottom: 0;
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

}
</style>
