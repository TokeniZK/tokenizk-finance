import httpInstance from '@/utils/http'
/**
 * 获取所有Launchpads的API
 * 
 * @returns http请求实例     privateSalesMyContributions
 */
export function getPrivateSalesMyContributionsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}
