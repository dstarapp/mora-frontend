import { t } from '@/i18n';
import lights from './modules/lights';

const routerList = [
    {
        path: '/',
        redirect: {
            name: 'home',
        },
    },

    {
        path: '/go',
        redirect: {
            name: 'home',
        },
    },

    {
        path: '/home',
        name: 'home',
        component: () => import('@/views/Home/Index.vue'),
        redirect: {
            name: 'homeIndex',
        },
        children: [
            {
                path: '/',
                name: 'homeIndex',
                component: () => import('@/views/Home/Index/Index.vue'),
                meta: {
                    keepAlive: true,
                    type: 'home',
                    title: t('router.title.home'),
                },
            },
            {
                path: '/transfer',
                name: 'homeTransfer',
                component: () => import('@/views/Home/Index/Transfer.vue'),
                meta: {
                    type: 'home',
                },
            },
            {
                path: '/search/:keyword',
                name: 'homeSearch',
                component: () => import('@/views/Home/Search/Index.vue'),
                meta: {
                    type: 'home',
                    title: t('router.title.homeSearch'),
                },
            },
        ],
    },

    ...lights,

    {
        path: '/planet',
        name: 'browser',
        component: () => import('@/views/Browser/Index.vue'),
        meta: {
            title: t('router.title.browser'),
            type: 'browser',
            flexibleDisabled: true,
        },
        children: [
            {
                path: ':id',
                name: 'browserHome',
                component: () => import('@/views/Browser/Home/Index.vue'),
                meta: {
                    title: t('router.title.browser'),
                    type: 'browser',
                    flexibleDisabled: true,
                },
            },
            {
                path: ':id/:articleId',
                name: 'browserArticle',
                component: () => import('@/views/Browser/Article/Index.vue'),
                meta: {
                    title: t('router.title.browserArticle'),
                    type: 'browser',
                    flexibleDisabled: true,
                },
            },
        ],
    },

    {
        path: '/rover',
        name: 'rover',
        component: () => import('@/views/Rover/Index.vue'),
        redirect: {
            name: 'roverPlanet',
        },
        children: [
            {
                path: 'planet',
                name: 'roverPlanet',
                component: () => import('@/views/Rover/Planet/Index.vue'),
                meta: {
                    title: t('router.title.roverPlanet'),
                },
            },
            {
                path: 'nft',
                name: 'roverNft',
                component: () => import('@/views/Rover/Nft/Index.vue'),
                meta: {
                    title: t('router.title.roverNft'),
                },
            },
            {
                path: 'subscriptions',
                name: 'roverPlanetSubscriptions',
                component: () => import('@/views/Rover/Subscriptions/Index.vue'),
                meta: {
                    title: t('router.title.roverPlanetSubscriptions'),
                },
            },
            {
                path: 'planetDetail/:id',
                name: 'roverPlanetDetail',
                component: () => import('@/views/Rover/Subscriptions/Detail.vue'),
                meta: {
                    title: t('router.title.roverPlanetDetail'),
                },
            },
            {
                path: 'setting',
                name: 'roverSetting',
                component: () => import('@/views/Rover/Setting/Index.vue'),
                meta: {
                    title: t('router.title.roverSetting'),
                },
            },
            {
                path: 'claim',
                name: 'roverClaim',
                component: () => import('@/views/Rover/Claim/Index.vue'),
                meta: {
                    title: t('router.title.roverClaim'),
                },
            },
            {
                path: 'collection',
                name: 'roverCollection',
                component: () => import('@/views/Rover/Collection/Index.vue'),
                meta: {
                    title: t('router.title.roverCollection'),
                },
            },
            {
                path: 'wallet',
                name: 'roverWallet',
                component: () => import('@/views/Rover/Wallet/Index.vue'),
                meta: {
                    title: t('router.title.roverWallet'),
                },
            },
            {
                path: 'deposit/:coin',
                name: 'roverDeposit',
                component: () => import('@/views/Rover/Wallet/Deposit.vue'),
                meta: {
                    title: t('router.title.roverWallet'),
                },
            },
            {
                path: 'withdraw/:coin',
                name: 'roverWithdraw',
                component: () => import('@/views/Rover/Wallet/Withdraw.vue'),
                meta: {
                    title: t('router.title.roverWallet'),
                },
            },
            {
                path: 'Candy',
                name: 'roverCandy',
                component: () => import('@/views/Rover/Candy/Index.vue'),
                meta: {
                    title: t('router.title.roverCandy'),
                },
            },
            {
                path: 'Inscriptions',
                name: 'roverInscriptions',
                component: () => import('@/views/Rover/Inscriptions/Index.vue'),
                meta: {
                    title: t('router.title.roverInscriptions'),
                },
            },
        ],
    },

    {
        path: '/mplanet',
        name: 'mplanet',
        component: () => import('@/views/Planet/Index.vue'),
        redirect: {
            name: 'planetDashboard',
        },
        children: [
            {
                path: 'dashboard/:id',
                name: 'planetDashboard',
                component: () => import('@/views/Planet/Dashboard/Index.vue'),
                meta: {
                    title: t('router.title.planetDashboard'),
                },
            },
            {
                path: 'content/:id',
                name: 'planetContent',
                component: () => import('@/views/Planet/Content/Index.vue'),
                meta: {
                    title: t('router.title.planetContent'),
                },
            },
            {
                path: 'comment/:id/:articleId',
                name: 'planetComment',
                component: () => import('@/views/Planet/Content/Comments.vue'),
                meta: {
                    title: t('router.title.planetComment'),
                },
            },
            {
                path: 'subscription/:id',
                name: 'planetSubscription',
                component: () => import('@/views/Planet/Subscription/Index.vue'),
                meta: {
                    title: t('router.title.planetSubscription'),
                },
            },
            {
                path: 'planetSettings/:id',
                name: 'planetPlanetSettings',
                component: () => import('@/views/Planet/PlanetSettings/Index.vue'),
                meta: {
                    title: t('router.title.planetPlanetSettings'),
                },
            },
            {
                path: 'editor/:id',
                name: 'planetEditor',
                component: () => import('@/views/Planet/Editor/Index.vue'),
                meta: {
                    title: t('router.title.planetEditor'),
                },
            },
        ],
    },

    {
        path: '/A386C19963314405',
        name: 'adminTool',
        component: () => import('@/views/AdminTool/Index.vue'),
        children: [
            {
                path: 'official',
                name: 'official',
                component: () => import('@/views/AdminTool/Official/Index.vue'),
            },
            {
                path: 'invitationCode',
                name: 'invitationCode',
                component: () => import('@/views/AdminTool/InvitationCode/Index.vue'),
            },
            {
                path: 'audit',
                name: 'audit',
                component: () => import('@/views/AdminTool/Audit/Index.vue'),
            },
            {
                path: 'lightCode',
                name: 'lightCode',
                component: () => import('@/views/AdminTool/LightCode/Index.vue'),
            },
        ],
    },

    {
        path: '/partnerTool',
        name: 'partnerTool',
        component: () => import('@/views/PartnerTool/Index.vue'),
        redirect: {
            name: 'partnerToolDashboard',
        },
        children: [
            {
                path: 'dashboard',
                name: 'partnerToolDashboard',
                component: () => import('@/views/PartnerTool/Dashboard/Index.vue'),
            },
        ],
    },

    {
        path: '/:catchAll(.*)',
        name: '404',
        component: () => import('@/views/Found/Index.vue'),
        meta: {
            title: t('router.title.404'),
            type: 'found',
        },
    },
];

export { routerList };
