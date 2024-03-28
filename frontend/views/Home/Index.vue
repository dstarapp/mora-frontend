<template>
    <Header />
    <router-view v-slot="{ Component }">
        <keep-alive :include="keepAliveInclude" :exclude="keepAliveExclude">
            <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
        </keep-alive>
        <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
    </router-view>
    <Footer v-if="isFooter" />
</template>

<script lang="ts">
import { defineComponent, ref, provide, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import store from '@/store';
import bus from 'vue3-eventbus';
import History from '@/utils/History';
import Header from './plugin/Header.vue';
import Footer from './plugin/Footer.vue';
import { getImagesUrl } from '@/utils/functions';
import SearchHistory from './plugin/History';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import debug from '@/utils/debug';

export default defineComponent({
    components: { Header, Footer },
    props: {},
    name: 'Home',
    setup() {
        const route = useRoute();
        const isFooter = ref(false);
        const historyList: any = ref([]);
        const history = new History();
        const searchHistoryList = ref([]);
        let searchHistory = new SearchHistory();
        const getMyPlanetsBaseDataLoading = ref(false);
        const myPlanetsBaseList: any = ref([]);
        const keepAliveInclude = ref('homeIndex');
        const keepAliveExclude = ref('');

        const getMyPlanetsBaseData = () => {
            if (getMyPlanetsBaseDataLoading.value) {
                return;
            }
            if (myPlanetsBaseList.value.length) {
                return;
            }
            getMyPlanetsBaseDataLoading.value = true;
            myPlanetsBaseList.value = store.state.planets_data.map((item) => {
                return {
                    canister: item,
                };
            });

            try {
                myPlanetsBaseList.value.map(async (item, index) => {
                    let planet_cache = store.state.planet_cache;
                    if (planet_cache[item.canister]) {
                        myPlanetsBaseList.value[index] = planet_cache[item.canister];
                        return;
                    }
                    const planetCanister = await createActor(item.canister, planetFactory);
                    let planetData: any = await planetCanister.getPlanetBase();
                    planetData.canister = planetData.canister.toString();
                    let cacheData = {
                        [item.canister]: planetData,
                    };
                    store.commit('SET_PLANET_CACHE', cacheData);
                    myPlanetsBaseList.value[index] = planetData;
                });
            } catch (err) {
                debug('error', err);
            }
        };

        const removeHistory = (item) => {
            history.removeLocal(item);
            historyList.value.map((child, index) => {
                if (child.id === item.id) {
                    historyList.value.splice(index, 1);
                }
            });
        };

        const getHistory = () => {
            history.init(store.state.user_principal ? store.state.user_principal : '');
            let his = history.getLocal();

            if (!his) {
                return;
            }
            let mapItem = his.map((item) => {
                return new Promise(async (resolve) => {
                    const canister = await createActor(item, planetFactory);
                    let res: any = await canister.getPlanetBase();
                    resolve({
                        id: res.canister.toString(),
                        name: res.name,
                        avatar: getImagesUrl(res.avatar),
                    });
                });
            });
            Promise.all(mapItem).then((res) => {
                historyList.value = res;
            });
        };

        const homeOpenFooter = () => {
            isFooter.value = true;
        };

        const homeCloseFooter = () => {
            isFooter.value = false;
        };

        const init = () => {
            getHistory();
            getSearchHistoryLocal();
        };

        const getSearchHistoryLocal = () => {
            if (store.state.user_principal) {
                searchHistory.init(store.state.user_principal);
                searchHistoryList.value = searchHistory.getLocal();
            }
        };

        const searchHistoryClear = () => {
            searchHistory.clearLocal();
            searchHistoryList.value = searchHistory.getLocal();
        };

        const searchHistoryDelete = (item) => {
            searchHistory.removeLocal(item);
            searchHistoryList.value = searchHistory.getLocal();
        };

        const searchHistoryRefresh = () => {
            searchHistoryList.value = searchHistory.getLocal();
        };

        watch(
            () => store.state.planets_data,
            (val: any) => {
                if (val.length) {
                    getMyPlanetsBaseDataLoading.value = false;
                    getMyPlanetsBaseData();
                }
            },
            {
                immediate: true,
            },
        );

        watch(
            () => store.state.agent,
            (val: any) => {
                if (!val) {
                    myPlanetsBaseList.value = [];
                } else {
                    init();
                }
            },
        );

        watch(
            () => store.state.planets_data,
            (val: any) => {
                if (val.length !== myPlanetsBaseList.value.length) {
                    getMyPlanetsBaseDataLoading.value = false;
                    myPlanetsBaseList.value = [];
                    getMyPlanetsBaseData();
                }
            },
        );

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val) {
                    setTimeout(() => {
                        searchHistoryList.value = searchHistory.getLocal();
                    });
                }
            },
            {
                deep: true,
            },
        );

        const clearKeepAliveCache = () => {
            keepAliveInclude.value = '';
            setTimeout(() => {
                keepAliveExclude.value = 'homeIndex';
            }, 0);
        };

        onUnmounted(() => {
            bus.off('homeOpenFooter', homeOpenFooter);
            bus.off('homeCloseFooter', homeCloseFooter);
            bus.off('removeHistory', removeHistory);
            bus.off('updateSearchHistory', getSearchHistoryLocal);
            bus.off('searchHistoryClear', searchHistoryClear);
            bus.off('searchHistoryDelete', searchHistoryDelete);
            bus.off('clearKeepAliveCache', clearKeepAliveCache);
            bus.off('searchHistoryRefresh', searchHistoryRefresh);
        });

        onMounted(async () => {
            bus.on('removeHistory', removeHistory);
            bus.on('homeOpenFooter', homeOpenFooter);
            bus.on('homeCloseFooter', homeCloseFooter);
            bus.on('updateSearchHistory', getSearchHistoryLocal);
            bus.on('searchHistoryClear', searchHistoryClear);
            bus.on('searchHistoryDelete', searchHistoryDelete);
            bus.on('clearKeepAliveCache', clearKeepAliveCache);
            bus.on('searchHistoryRefresh', searchHistoryRefresh);

            init();
        });

        provide('historyList', historyList);
        provide('getHistory', getHistory);
        provide('searchHistory', searchHistory);
        provide('searchHistoryList', searchHistoryList);
        provide('myPlanetsBaseList', myPlanetsBaseList);

        return {
            route,
            isFooter,
            searchHistoryList,
            keepAliveInclude,
            keepAliveExclude,
            removeHistory,
        };
    },
});
</script>

<style scoped lang="less"></style>
