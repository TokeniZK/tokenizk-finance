import httpInstance from '@/utils/http'

export function getAllAirdropListAPI() {
  return httpInstance({
    url: '/home/airdrop'
  })
}

export function getMyAirdropListAPI() {
  return httpInstance({
    url: '/home/airdrop'
  })
}

export function getCreatedByYouAirdropsAPI() {
  return httpInstance({
    url: '/home/airdrop'
  })
}

export function getAirdropItemsAPI() {
  return httpInstance({
    url: '/home/banner'
  })
}
