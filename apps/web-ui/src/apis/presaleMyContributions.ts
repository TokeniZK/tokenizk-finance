import httpInstance from '@/utils/http'
export function getMyContributionsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}