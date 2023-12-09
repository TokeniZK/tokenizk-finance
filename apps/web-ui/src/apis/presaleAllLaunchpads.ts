import httpInstance from '@/utils/http'
function getAllLaunchpadsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}