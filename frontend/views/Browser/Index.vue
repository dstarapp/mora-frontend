<template>
    <Header />
    <router-view :key="route.fullPath" v-if="planetCanisterAnonymous" />
    <component :is="isComponent" :componentData="componentData" @componentClose="componentClose" />
    <span v-if="route.name !== 'browserHome'" @click="openHome" class="backmora">
        <img v-if="isPrivate" src="@/assets/svg/home.svg" />
        <img v-else src="@/assets/svg/logos.svg" />
    </span>
</template>

<script lang="ts">
import Header from './plugin/Header.vue';
import { useRoute, useRouter } from 'vue-router';
import { defineComponent, ref, onMounted, provide, watch, onUnmounted } from 'vue';
import store from '@/store';
import debug from '@/utils/debug';
import bus from 'vue3-eventbus';
import CONFIG from '@/assets/config';
import Subscribe from './plugin/Subscribe.vue';
import UnSubscribe from './plugin/UnSubscribe.vue';
import FreeSubscribe from './plugin/FreeSubscribe.vue';
import History from '@/utils/History';
import { getImagesUrl } from '@/utils/functions';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';

export default defineComponent({
    components: { Header, Subscribe, UnSubscribe, FreeSubscribe },
    props: {},
    name: 'Browser',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isComponent = ref();
        const componentData = ref();
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);
        const browserPlanetID: any = ref(
            window?.__PRIVATE_CONFIG__?.planet
                ? window?.__PRIVATE_CONFIG__?.planet
                : route.params.id,
        );
        const planetCanisterAnonymous = ref();
        const planetCanister = ref();
        const browserPlanetUserData = ref();
        const isLoading = ref();
        const historyList: any = ref([]);
        const history = new History();
        const getMyPlanetsBaseDataLoading = ref(false);
        const myPlanetsBaseList: any = ref([]);

        const openHome = () => {
            if (CONFIG.indexPageLink) {
                window.open(CONFIG.indexPageLink);
                return;
            }
            if (window.history.state.back === '/') {
                window.history.back();
            } else {
                router.push({
                    name: 'homeIndex',
                });
            }
        };

        const getPlanetDataAnonymous = async () => {
            try {
                let res = await planetCanisterAnonymous.value.getPlanetBase();
                browserPlanetUserData.value = res;
            } catch (err) {
                debug('error', err);
            }
        };

        const getMyPlanetsBaseData = () => {
            if (getMyPlanetsBaseDataLoading.value) {
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
                    const planetCanister = await createActor(item.canister, planetFactory);
                    let planetData: any = await planetCanister.getPlanetBase();
                    planetData.canister = planetData.canister.toString();
                    myPlanetsBaseList.value[index] = planetData;
                });
            } catch (err) {
                debug('error', err);
            }
        };

        const clientCanister = () => {
            try {
                planetCanister.value = createActor(
                    browserPlanetID.value,
                    planetFactory,
                    store.state.agent,
                );
            } catch (err) {
                debug('error', err);
            }

            history.init(
                store.state.user_principal ? store.state.user_principal : '',
                browserPlanetID.value,
            );
            let his = history.getLocal();
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

        const removeHistory = (item) => {
            history.removeLocal(item);
            historyList.value.map((child, index) => {
                if (child.id === item.id) {
                    historyList.value.splice(index, 1);
                }
            });
        };

        const getPlanetCanister = () => {
            return planetCanister.value;
        };

        const componentClose = (isRefresh = false) => {
            isComponent.value = undefined;
            if (isRefresh) {
                bus.emit('browserSubscribeRefresh');
            }
        };

        const browserOpenComponent = (val) => {
            isComponent.value = val.type;
            componentData.value = {
                expireTime: val.expireTime,
                subType: val.subType,
                hideFree: val.hideFree,
            };
        };

        const init = async () => {
            if (!browserPlanetID.value) {
                return;
            }
            try {
                planetCanisterAnonymous.value = await createActor(
                    browserPlanetID.value,
                    planetFactory,
                );
                getPlanetDataAnonymous();
            } catch (err) {
                router.push({ path: '/404' });
                debug('error ', err);
            }

            if (store.state.agent) {
                clientCanister();
            }
        };

        watch(
            () => store.state.planets_data,
            (val: any) => {
                if (store.state.planets_data.length) {
                    getMyPlanetsBaseData();
                }
            },
            {
                immediate: true,
            },
        );

        watch(
            () => route.params.id,
            (val: any) => {
                if (val) {
                    if (route.params.id !== browserPlanetID.value) {
                        browserPlanetUserData.value = '';
                        browserPlanetID.value = window?.__PRIVATE_CONFIG__?.planet
                            ? window?.__PRIVATE_CONFIG__?.planet
                            : route.params.id;
                        init();
                        store.commit('SET_CURRENT_OPEN_PLANET', browserPlanetID.value);
                    }
                }
            },
            {
                deep: true,
            },
        );

        watch(
            () => store.state.agent,
            (val: any) => {
                if (val) {
                    clientCanister();
                }
            },
        );

        onUnmounted(() => {
            bus.off('browserOpenComponent', browserOpenComponent);
            bus.off('removeHistory', removeHistory);
        });

        onMounted(async () => {
            if (!browserPlanetID.value) {
                router.push({ path: '/404' });
                return;
            }
            browserPlanetID.value = window?.__PRIVATE_CONFIG__?.planet
                ? window?.__PRIVATE_CONFIG__?.planet
                : route.params.id;
            store.commit('SET_CURRENT_OPEN_PLANET', browserPlanetID.value);
            init();
            bus.on('browserOpenComponent', browserOpenComponent);
            bus.on('removeHistory', removeHistory);
        });

        provide('browserPlanetID', browserPlanetID);
        provide('planetCanister', planetCanister);
        provide('planetCanisterAnonymous', planetCanisterAnonymous);
        provide('getPlanetCanister', getPlanetCanister);
        provide('browserPlanetUserData', browserPlanetUserData);
        provide('historyList', historyList);
        provide('myPlanetsBaseList', myPlanetsBaseList);

        return {
            CONFIG,
            route,
            isLoading,
            historyList,
            isComponent,
            browserPlanetUserData,
            planetCanisterAnonymous,
            componentData,
            isPrivate,
            componentClose,
            openHome,
            getMyPlanetsBaseData,
        };
    },
});
</script>

<style scoped lang="less">
.banner {
    @apply w-full h-70 overflow-hidden <lg:(max-h-70) <md:(max-h-55) <sm:(max-h-45);

    img {
        @apply w-full h-full object-cover;
    }
}

.contain {
    @apply flex justify-between mx-auto mt-5 w-full <sm:(px-4) <md:(px-8) <xl:(px-10) xl:(px-25) 2xl:(w-400);

    .article-box {
        @apply flex-1;
    }
}

.el-menu {
    @apply justify-center;
}

:deep(.el-menu--horizontal) {
    &>.el-menu-item {
        &.is-active {
            @apply border-b-2 !border-b-blue-500 !text-blue-500;
        }
    }

    &>.el-sub-menu {
        .el-sub-menu__title {
            &:hover {
                @apply !text-blue-500;
            }
        }
    }
}

:deep(.el-sub-menu) {
    @apply sm(mx-5);
}

.backmora {
    @apply fixed left-5 bottom-5 cursor-pointer <sm:(left-4 bottom-15);
    z-index: 20;

    img {
        @apply w-9;
    }
}
</style>
