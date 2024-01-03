import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConnectStatusStore = defineStore('connectStatus', () => {

  // Auro Wallet 连接状态 管理
  const cnState = ref(true)

  function setConnectStatus(cnState1: boolean) {
    cnState.value = cnState1
    return cnState
  }

  return {
    cnState, setConnectStatus
  }

})
