import httpInstance from '@/utils/http'
/**
 * 获取所有Launchpads的API
 * 
 * @returns http请求实例
 */
export function getAllPrivateSalesAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}

export function getPrivateSalesMyContributionsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}
