<script setup lang="ts">
// 1、按需导入 useCounterStore 的方法
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia';
// 2、执行 方法 得到 store 实例对象
const counterStore = useCounterStore();
console.log(counterStore);

// 4、直接解构赋值（会响应式丢失）
// const { count, doubleCount } = counterStore
// console.log(count,doubleCount);  0 0

// 5、使用storeToRefs()包裹 （保持响应式更新）, 且它只处理 数据相关的数据，不管 方法
const { count, doubleCount } = storeToRefs(counterStore)
console.log(count, doubleCount); // RefImpl{} , ComputedRefImpl{}

// 6、方法 直接从原来的 counterStore中 解构赋值
const { increment } = counterStore;

</script>

<template>
  <el-col class="banner">

    <el-row>
      <el-row>
        <h1 class="header-span">
          <el-row>Tokenize Creative Ideas,</el-row>
          <el-row>Early Access to Crazy Thinking.</el-row>
        </h1>
      </el-row>

      <el-row>
        <p class="header-text">
          The First Verifiable LaunchPad on Mina, with No-code.
        </p>
      </el-row>
    </el-row>

    <el-row class="box">

      <el-col class="box-left" :span="12">
        <el-row>
          <h2 class="title">Why Choose TokeniZK</h2>
        </el-row>
        <el-row>
          <p class="text"> The Launchpad focusing on ZK-Token for Everyone!</p>
        </el-row>
        <el-row>
          <p class="text">
            A ZK-Token creation, pre-sale, and management platform suitable for
            everyone. Anyone can easily create their own tokens
            and project pre-sales here.
          </p>
        </el-row>
      </el-col>

      <el-col class="box-right" :span="12">
        <el-row>
          <h4 class="lasthead">Complete Toolkit for Token Launch and Sale</h4>
          <p class="text"> Create your own tokens and sales quickly, easily and cheaply</p>
        </el-row>
        <el-row>
          <h4 class="lasthead">No mental burden</h4>
          <p class="text">No need to understand complex zero knowledge proof, code knowledge</p>
        </el-row>
        <el-row>
          <h4 class="lasthead">Verifiable Security Platform</h4>
          <p class="text">Cryptography guarantees data consistency</p>
        </el-row>
      </el-col>

    </el-row>

  </el-col>
</template>

<style lang="less" scoped>
.banner {
  margin: 0;
  margin-top: 80px;
  margin-left: -32px;
  padding: 110px 350px;
  height: 800px;
  background-color: #000;
  width: 1957px;

  .box {
    z-index: 2;
    border-radius: 15px;
    background-color: #161616;
    box-shadow: 0 -5px 30px 1px #00FFC2;
    padding: 50px 80px 50px;
    font-family: Manrope;
    margin-top: 70px;

    .box-left {
      padding-bottom: 10px;

      h2.title {
        padding-bottom: 11px;
        color: #f7f7f7;
        font-size: 35px;
        font-family: Manrope;
      }

      .text {
        font: size 13px;
        ;
        color: #f7f7f7;
      }

    }

    .box-right {
      background-color: rgb(0, 255, 194);
      border-radius: 15px;
      visibility: visible;
      animation-name: fadeInUp;
      padding: 0 15px;

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

  .header-span {
    display: inline-block;
    width: 100%;
    color: #00FFC2;
    font-family: Manrope;
    font-size: 62px;
    line-height: 1.16;
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
</style>
