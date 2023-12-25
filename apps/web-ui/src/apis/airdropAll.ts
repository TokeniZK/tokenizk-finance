import httpInstance from '@/utils/http'

export function getAllAirdropListAPI() {
  return httpInstance({
    url: '/airdrop/airdrop'
  })
}

export function getMyAirdropListAPI() {
  return httpInstance({
    url: '/airdrop/my-airdrop'
  })
}

export function getCreatedByYouAirdropsAPI() {
  return httpInstance({
    url: '/airdrop/create-by-you-airdrop'
  })
}

export function getAirdropItemsAPI() {
  return httpInstance({
    url: '/airdrop/airdrop-items'
  })
}
