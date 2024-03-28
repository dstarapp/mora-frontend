import { t } from '@/i18n';

const privateRouterList = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Browser/Index.vue'),
        meta: {
            title: t('router.title.browser'),
            type: 'browser',
            flexibleDisabled: true,
        },
        redirect: {
            name: 'browserHome',
        },
        children: [
            {
                path: '/',
                name: 'browserHome',
                component: () => import('@/views/Browser/Home/Index.vue'),
                meta: {
                    title: t('router.title.browser'),
                    type: 'browser',
                    flexibleDisabled: true,
                },
            },
            {
                path: '/:articleId',
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
            name: 'roverPlanetSubscriptions',
        },
        children: [
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
                path: 'Candy',
                name: 'roverCandy',
                component: () => import('@/views/Rover/Candy/Index.vue'),
                meta: {
                    title: t('router.title.roverCandy'),
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
        path: '/:catchAll(.*)',
        name: '404',
        component: () => import('@/views/Found/Index.vue'),
        meta: {
            title: t('router.title.404'),
            type: 'found',
        },
    },
];

export { privateRouterList };
