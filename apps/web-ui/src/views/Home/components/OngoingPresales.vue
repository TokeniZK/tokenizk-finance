<template>
  <el-row class="row-bg ongoing-presales">

    <el-col :span="24">

      <el-row>
        <el-col>
          <el-row>
            <h2 class="title"> Ongoing Presales</h2>
          </el-row>
          <el-row>Normal Presale pages work for project team to pre-configure a set of presale rules</el-row>
        </el-col>
        <el-col>
          <el-row class="link">
            <router-link to="/pre-sales" class="main-btn">View All Item</router-link>
          </el-row>
        </el-col>
      </el-row>

      <!-- 轮播图 -->
      <el-row></el-row>

    </el-col>

  </el-row>
</template>

<style>
.ongoing-presales {
  width: 100%;
  height: 610px;
  padding: 0px 0px 120px;
  background-color: #f7f7f7;
}
</style>