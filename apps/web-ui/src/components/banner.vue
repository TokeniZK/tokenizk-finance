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
      <h1 class="header-span">
        <el-row>Tokenize Creative Ideas,</el-row>
        <el-row>Early Access to Crazy Thinking.</el-row>
      </h1>
    </el-row>

    <el-row class="header-text">
      The First Verifiable LaunchPad on Mina, with No-code.
    </el-row>

    <el-row>
      <!-- 3、使用 store 实例对象 中  的 属性 和 方法 -->
      <button @click="increment">{{ count }}</button>
      {{ doubleCount }}

      <el-button type="primary">Primary</el-button>

      <!-- <ul>
        <li v-for="item in counterStore.list" :key="item.id">{{ item.name }}</li>
      </ul> -->

    </el-row>

  </el-col>
</template>

<style lang="less" scoped>
.banner {
  margin: 0 auto;
  padding: 0;
  left: 0;
  right: 0;
  height: 800px;
  text-align: center;
  background-color: #000;

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
