import httpInstance from '@/utils/http'
/**
 * 获取所有Launchpads的API
 * 
 * @returns http请求实例
 */
export function getAllLaunchpadsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}
