import { ref } from "vue"
import { defineStore } from 'pinia'

export const  useNavMenuItemActivation = defineStore('navMenuActivation', () => {

    // 导航菜单项状态 管理
    const activeIndex = ref('1')
  
    function setActiveIndex(menuActiveIndex: string) {
        activeIndex.value = menuActiveIndex
      return activeIndex
    }
  
    return {
        activeIndex,setActiveIndex
    }
  
  })
  