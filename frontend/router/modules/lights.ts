const lights = [
    {
        path: '/light',
        name: 'light',
        component: () => import('@/views/Light/Index.vue'),
        redirect: {
            name: 'lightHome',
        },
        children: [
            {
                path: 'home',
                name: 'lightHome',
                component: () => import('@/views/Light/Home/Index.vue'),
                meta: {
                    type: 'light',
                },
            },
            {
                path: 'detail/:canisterId/:hash',
                name: 'lightDetails',
                component: () => import('@/views/Light/Details/Index.vue'),
                meta: {
                    type: 'light',
                },
            },
        ],
    },
    {
        path: '/light/profile',
        name: 'lightProfile',
        component: () => import('@/views/Light/Profile/Index.vue'),
        redirect: {
            name: 'lightProfileUser',
        },
        children: [
            {
                path: 'user',
                name: 'lightProfileUser',
                component: () => import('@/views/Light/Profile/User/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'collect',
                name: 'lightProfileCollect',
                component: () => import('@/views/Light/Profile/Collect/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'create',
                name: 'lightProfileCreate',
                component: () => import('@/views/Light/Profile/Create/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'edit/:id',
                name: 'lightProfileEdit',
                component: () => import('@/views/Light/Profile/Editor/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'notice',
                name: 'lightProfileNotice',
                component: () => import('@/views/Light/Profile/Notice/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'audit',
                name: 'lightProfileAudit',
                component: () => import('@/views/Light/Profile/Audit/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            {
                path: 'auditCode',
                name: 'lightProfileAuditCode',
                component: () => import('@/views/Light/Profile/AuditCode/Index.vue'),
                meta: {
                    type: 'LightProfile',
                },
            },
            // {
            //     path: 'index',
            //     name: 'lightProfileIndex',
            //     component: () => import('@/views/Light/Profile/Index/Index.vue'),
            //     meta: {
            //         type: 'LightProfile',
            //     },
            // },
            // {
            //     path: 'mock',
            //     name: 'lightProfileMock',
            //     component: () => import('@/views/Light/Profile/Mock/Index.vue'),
            //     meta: {
            //         type: 'LightProfile',
            //     },
            // },
        ],
    },
];

export default lights;
