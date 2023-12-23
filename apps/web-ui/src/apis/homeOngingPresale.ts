import httpInstance from '@/utils/http'

// 获取 Ongoing 的 presale 项目

export function getOngoingPresaleAPI() {
  return httpInstance({
    url: '/home/banner'
  })
}
