import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConnectStatusStore = defineStore('connectStatus', () => {

  // Auro Wallet 连接状态 管理
  let cnState = ref(true)

  function setConnectStatus() {
    return cnState
  }

  return {
    cnState, setConnectStatus
  }

})
