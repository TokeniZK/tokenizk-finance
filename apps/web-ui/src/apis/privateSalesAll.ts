import $httpInstance from '@/utils/http'
/**
 * 获取所有Launchpads的API
 * 
 * @returns http请求实例
 */
export function getAllPrivateSalesAPI() {
  return $httpInstance({
    url: '/private-sale/all-private-sales'
  })
}

export function getPrivateSalesMyContributionsAPI() {
  return $httpInstance({
    url: '/private-sale/private-sales-my-contributions'
  })
}
