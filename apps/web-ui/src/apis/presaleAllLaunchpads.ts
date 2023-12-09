import httpInstance from '@/utils/http'
export function getAllLaunchpadsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}