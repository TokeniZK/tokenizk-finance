import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConnectStatus = defineStore('connectStatus', () => {

  // Auro Wallet 连接状态 管理
  let cnState = ref(false)

  function setConnectStatus() {
    return cnState
  }

  return {
    cnState, setConnectStatus
  }

})
