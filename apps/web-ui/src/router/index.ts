import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'

import Home from '@/views/Home/index.vue'

import PreSales from '@/views/PreSales/pre-Sales.vue'
import AllLaunchpads from '@/views/PreSales/components/all-launchpads.vue'
import MyContributions from '@/views/PreSales/components/my-contributions.vue'
import SaleDetails from '@/views/PreSales/components/sale-details.vue'

// import PrivateSales from '@/views/PrivateSales/private-sales.vue'
// import AllPrivateSales from '@/views/PrivateSales/components/all-private-sales.vue'
// import PrivateSalesMyContributions from '@/views/PrivateSales/components/private-sales-my-contributions.vue'
// import PrivateSalesDetails from '@/views/PrivateSales/components/private-sales-details.vue'

import AirdropList from '@/views/AirDrop/airdrop-List.vue'
import AllAirdrops from '@/views/AirDrop/components/all-airdrops.vue'
import MyAirdrops from '@/views/AirDrop/components/my-airdrops.vue'
import AirdropDetails from '@/views/AirDrop/components/airdrop-details.vue'

import CreateZkToken from '@/views/Boot/create-basic-zktoken.vue'
import CreateTokenSale from '@/views/Boot/create-token-sale.vue'
import CreatePrivateSale from '@/views/Boot/create-private-sale.vue'
import CreateAirdrop from '@/views/Boot/create-new-airdrop.vue'

import Wallet from '@/views/Wallet/wallet.vue'

import MyLaunches from '@/views/Mylaunches/my-launches.vue'
import MyLaunchesTokens from '@/views/Mylaunches/components/my-launches-tokens.vue'
import MyLaunchesSales from '@/views/Mylaunches/components/my-launches-sales.vue'
import MyLaunchesAirdrops from '@/views/Mylaunches/components/my-launches-airdrops.vue'

import CreateLock from '@/views/create-Lock.vue'
import CreateZkNFT from '../views/create-zkNFT.vue'
import Services from '../views/Services.vue'
import Team from '../views/Team.vue'
import FAQ from '../views/FAQ.vue'
import Comments from '../views/Comments.vue'
import AddFans from '../views/Add-fans.vue'
import PraiseAndCollection from '@/views/Praise-and-Collection.vue'
import PrivateMessage from '../views/Private-Message.vue'
import SystemNotifications from '../views/System-Notifications.vue'
// import MessageSettings from '../views/Message-Settings.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '',
                component: Home
            },
            {
                path: '/sales',
                component: PreSales,
                children: [
                    {
                        path: '',
                        component: AllLaunchpads
                    },
                    {
                        path: '/sales/my-contributions',
                        component: MyContributions
                    }
                ]
            },
            {
                path: '/sale-datails',
                component: SaleDetails
            },
            {
                path: '/airdrop-list',
                component: AirdropList,
                children: [
                    {
                        path: '',
                        component: AllAirdrops
                    },
                    {
                        path: '/airdrop-list/my-airdrop',
                        component: MyAirdrops
                    }
                ]
            },
            {
                path: '/airdrop-datails',
                component: AirdropDetails
            },
            {
                path: '/wallet',
                component: Wallet
            },
            {
                path: '/my-launches',
                component: MyLaunches,
                children: [
                    {
                        path: '',
                        component: MyLaunchesTokens
                    },
                    {
                        path: '/my-launches/sales',
                        component: MyLaunchesSales
                    },
                    {
                        path: '/my-launches/airdrops',
                        component: MyLaunchesAirdrops
                    }
                ]
            },
            {
                path: '/create-zk-token',
                component: CreateZkToken
            },
            {
                path: '/create-token-sale',
                component: CreateTokenSale
            },
            {
                path: '/create-private-sale',
                component: CreatePrivateSale
            },
            {
                path: '/create-new-airdrop',
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
            // {
            //     path: '/message-settings',
            //     component: MessageSettings
            // },

        ]
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router


