import httpInstance from '@/utils/http'

function getAirdropList(params: any) {
  return httpInstance({
    url: '/home/airdrop'
  })
}
