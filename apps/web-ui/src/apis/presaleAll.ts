import httpInstance from '@/utils/http'

export function getOngoingPresaleAPI() {
  return httpInstance({
    url: '/home/banner'
  })
}

export function getAllLaunchpadsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}

export function getMyContributionsAPI() {
  return httpInstance({
    url: '/home/category/head'
  })
}
