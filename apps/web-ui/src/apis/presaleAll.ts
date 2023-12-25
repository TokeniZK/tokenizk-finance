import httpInstance from '@/utils/http'

export function getOngoingPresaleAPI() {
  return httpInstance({
    url: '/presale/ongoing-presale'
  })
}

export function getAllLaunchpadsAPI() {
  return httpInstance({
    url: '/presale/all-launchpads'
  })
}

export function getMyContributionsAPI() {
  return httpInstance({
    url: '/presale/my-contribution'
  })
}
