import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PreSales from '../views/pre-Sales.vue'
import PrivateSales from '../views/private-Sales.vue'
import AirdropList from '../views/airdrop-list.vue'
import CreateZkToken from '../views/create-zkToken.vue'
import CreateFairLaunch from '../views/create-fair-launch.vue'
import CreateNormalLaunch from '../views/create-normal-launch.vue'
import CreatePrivateSale from '../views/create-private-sale.vue'
import CreateAirdrop from '../views/create-airdrop.vue'
import CreateLock from '../views/create-lock.vue'
import CreateZkNFT from '../views/create-zkNFT.vue'
import Services from '../views/Services.vue'
import Team from '../views/Team.vue'
import FAQ from '../views/FAQ.vue'
import Comments from '../views/Comments.vue'
import AddFans from '../views/Add-fans.vue'
import PraiseAndCollection from '../views/praise-and-collection.vue'
import PrivateMessage from '../views/Private-Message.vue'
import SystemNotifications from '../views/System-Notifications.vue'
import MessageSettings from '../views/Message-Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/',
      name: 'pre-Sales',
      component: PreSales
    },
    {
      path: '/',
      name: 'private-Sales',
      component: PrivateSales
    },
    {
      path: '/',
      name: 'airdrop-list',
      component: AirdropList
    },
    {
      path: '/',
      name: 'create-ZkToken',
      component: CreateZkToken
    },
    {
      path: '/',
      name: 'create-Fair-Launch',
      component: CreateFairLaunch
    },
    {
      path: '/',
      name: 'create-Normal-Launch',
      component: CreateNormalLaunch
    },
    {
      path: '/',
      name: 'create-Private-Sale',
      component: CreatePrivateSale
    },
    {
      path: '/',
      name: 'create-Airdrop',
      component: CreateAirdrop
    },
    {
      path: '/',
      name: 'create-Lock',
      component: CreateLock
    },
    {
      path: '/',
      name: 'create-zkNFT',
      component: CreateZkNFT
    },
    {
      path: '/',
      name: 'services',
      component: Services
    },
    {
      path: '/',
      name: 'team',
      component: Team
    },
    {
      path: '/',
      name: 'faq',
      component: FAQ
    },
    {
      path: '/',
      name: 'comments',
      component: Comments
    },
    {
      path: '/',
      name: 'add-fans',
      component: AddFans
    },
    {
      path: '/',
      name: 'praise-and-collection',
      component: PraiseAndCollection
    },
    {
      path: '/',
      name: 'private-message',
      component: PrivateMessage
    },
    {
      path: '/',
      name: 'system-notifications',
      component: SystemNotifications
    },
    {
      path: '/',
      name: 'message-settings',
      component: MessageSettings
    },
  ]
})

export default router
