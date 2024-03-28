import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import bus from 'vue3-eventbus';
import store from '@/store';
import CONFIG from '@/assets/config';
import { routerList } from './mora';
import { privateRouterList } from './private';

const planet = (window as any)?.__PRIVATE_CONFIG__?.planet;

const routes: Array<RouteRecordRaw> = planet ? privateRouterList : routerList;

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    store.commit('SET_META', CONFIG.meta);
    if (to.meta.title) {
        document.title = to.meta.title as string;
    }
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute('content', 'Mora - Eternal Fellowship');
    }

    if (to?.meta?.flexibleDisabled) {
        bus.emit('isFlexibleDisabled', to?.meta?.flexibleDisabled);
    } else {
        bus.emit('isFlexibleDisabled', false);
    }
    bus.emit('permissionVerify', to);

    if (to?.redirectedFrom?.fullPath === '/go' || to?.query?.from === 'go') {
        localStorage.setItem('source', 'go');
    }
    next();
});

router.afterEach(() => {
    NProgress.done();
});

const preloadAsyncRoutes = async () => {
    for (const route of router.getRoutes()) {
        if (!route.components) continue;
        for (let componentOrImporter of Object.values(route.components)) {
            if (typeof componentOrImporter === 'function') {
                try {
                    await componentOrImporter();
                } catch (err) { }
            }
        }
    }
};

window.addEventListener('load', () => {
    setTimeout(() => {
        preloadAsyncRoutes();
    }, 3000);
});

export default router;
