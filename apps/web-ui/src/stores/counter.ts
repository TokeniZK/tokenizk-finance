import { ref, computed } from 'vue'
// import axios from 'axios'
// const API_URL = 'http://geek.itheima.net/v1_0/channels'

// 1、导入一个方法 defineStore
import { defineStore } from 'pinia'

// 5、按需导出
export const useCounterStore = defineStore('counter', () => {

  // 2、定义数据（state）
  const count = ref(0)

  // 6、Pinia 中 getters 直接 使用 computed 函数 进行模拟 
  const doubleCount = computed(() => count.value * 2)

  // 7、定义异步 action
  // const list = ref([]);
  // const getList = async () => {
  //   const res = await axios.get(API_URL)
  //   console.log(res);

  //   list.value = res.data.data.channels;
  // }

  // 3、定义修改数据的方法 （action 同步 + 异步）
  function increment() {
    count.value++
  }

  // 4、以对象的方式 return 供组件使用
  return {
    count, doubleCount, increment,
    // list,
    // getList
  }
})
