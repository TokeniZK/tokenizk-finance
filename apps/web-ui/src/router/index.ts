import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import PreSales from '@/views/PreSales/pre-sales.vue'
import AllLaunchpads from '@/views/PreSales/components/AllLaunchpads.vue'
import MyContributions from '@/views/PreSales/components/MyContributions.vue'
import PresaleDetails from '@/views/PreSales/presale-details.vue'

import PrivateSales from '../views/PrivateSales/private-sales.vue'
import AllPrivateSales from '../views/PrivateSales/components/AllPrivateSales.vue'
import MyPrivateSalesContributions from '../views/PrivateSales/components/MyPrivateSalesContributions.vue'

import AirdropList from '../views/AirDrop/airdrop-List.vue'
import CreateZkToken from '../views/Boot/create-ZkToken.vue'
import CreateFairLaunch from '../views/Boot/create-fair-launch.vue'
import CreateNormalLaunch from '../views/Boot/create-normal-launch.vue'
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
      component: Layout,
      children: [
        {
          path: '',
          component: Home
        },
        {
          path: '/pre-sales',
          component: PreSales,
          children: [
            {
              path: '',
              component: AllLaunchpads
            },
            {
              path: '/pre-sales/my-contributions',
              component: MyContributions
            }
          ]
        },
        {
          path: '/presale-datails',
          component: PresaleDetails
        },
        {
          path: '/private-sales',
          component: PrivateSales,
          children: [
            {
              path: '',
              component: AllPrivateSales
            },
            {
              path: '/private-sales/my-contributions',
              component: MyPrivateSalesContributions
            }
          ]
        },
        {
          path: '/airdrop-list',
          component: AirdropList
        },
        {
          path: '/create-zk-token',
          component: CreateZkToken
        },
        {
          path: 'create-fair-launch',
          component: CreateFairLaunch
        },
        {
          path: '/create-normal-launch',
          component: CreateNormalLaunch
        },
        {
          path: '/create-private-sale',
          component: CreatePrivateSale
        },
        {
          path: '/create-airdrop',
          component: CreateAirdrop
        },
        {
          path: '/create-lock',
          component: CreateLock
        },
        {
          path: '/create-zk-nft',
          component: CreateZkNFT
        },
        {
          path: '/services',
          component: Services
        },
        {
          path: '/team',
          component: Team
        },
        {
          path: '/faq',
          component: FAQ
        },
        {
          path: '/comments',
          component: Comments
        },
        {
          path: '/add-fans',
          component: AddFans
        },
        {
          path: '/praise-and-collection',
          component: PraiseAndCollection
        },
        {
          path: '/private-message',
          component: PrivateMessage
        },
        {
          path: '/system-notifications',
          component: SystemNotifications
        },
        {
          path: '/message-settings',
          component: MessageSettings
        },

      ]
    },
  ]
})

export default router


