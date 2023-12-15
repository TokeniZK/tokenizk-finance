<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const next = () => {
  if (active.value++ > 2) active.value = 4
}

const prev = () => {
  if (active.value-- < 0) active.value = 0
}
</script>

<template>
  <el-row class="row-bg create-fair-launch" justify="center">
    <el-col :span="24">

      <!-- 步骤条 -->
      <el-row class="row-bg" justify="center">
        <el-steps :active="active" finish-status="success" align-center>

          <el-step title="Verify Token" description="Enter the token address and verify" />

          <el-step title="Fairlaunch Info"
            description="Enter the launchpad information that you want to raise , that should be enter all details about your presale" />

          <el-step title="Add Additional Info " description="Add Additional Info Let people know who you are" />

          <el-step title="Finish" description="Review your information" />
        </el-steps>

        <el-button style="margin-top: 500px" @click="prev">back </el-button>
        <el-button style="margin-top: 500px" @click="next">Next </el-button>
      </el-row>

      


    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.create-fair-launch {
  width: 100%;
  padding: 150px;

  .el-row {
    margin-bottom: 40px;
  }

}
</style>