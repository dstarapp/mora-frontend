<template>
    <div class="main">
        <Nav />
        <div class="content">
            <Header />
            <div class="box">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, provide, watch, onMounted, onUnmounted, computed } from 'vue';
import Header from './plugin/Header.vue';
import Nav from './plugin/Nav.vue';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import debug from '@/utils/debug';
import { GET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import { queryMessages } from '@/components/light-experience/canisters/experience_worker/apis';
import { PageData } from '@/components/light-experience/canisters/common';
import { LightExperienceMessage } from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';

export default defineComponent({
    components: { Header, Nav },
    props: {},
    name: 'LightProfile',
    setup() {
        const getMyPlanetsBaseDataLoading = ref(false);
        const myPlanetsBaseList: any = ref([]);
        const planetCanister = ref();

        const noticeData = ref<PageData<LightExperienceMessage> | false>(false);

        const agent = computed<Agent>(() => store.state.agent);
        const currentUser = async (): Promise<string> =>
            (await agent.value.getPrincipal()).toText();
        const userCanisters = computed<Record<string, string>>(
            () => store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`],
        );
        const userCanister = async (): Promise<string> => {
            const current_user = await currentUser();
            return userCanisters.value[current_user] ?? '';
        };

        const getNoticeList = async () => {
            const user_canister = await userCanister();
            if (!user_canister) {
                store.commit('SET_LIGHT_READ_NUM', 0);
                noticeData.value = { all: 0, data: [], page: 1, size: 999 };
                return;
            }
            userCanister()
                .then((user_canister) => { })
                .then(() => {
                    queryMessages(user_canister, agent.value, {
                        page: 1,
                        size: 999,
                    })
                        .then((res: PageData<LightExperienceMessage>) => {
                            noticeData.value = res;
                            let num = 0;
                            noticeData.value.data.map((item) => {
                                if (!item.read) {
                                    num++;
                                }
                            });
                            store.commit('SET_LIGHT_READ_NUM', num);
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                        .finally(() => { });
                })
                .catch((e) => { });
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
                    planetCanister.value = await createActor(item.canister, planetFactory);
                    let planetData: any = await planetCanister.value.getPlanetBase();
                    planetData.canister = planetData.canister.toString();
                    myPlanetsBaseList.value[index] = planetData;
                });
            } catch (err) {
                debug('error', err);
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

        let timeout;
        onMounted(() => {
            getMyPlanetsBaseData();

            getNoticeList();
            timeout = setInterval(() => {
                getNoticeList();
            }, 15000);
        });

        onUnmounted(() => {
            clearInterval(timeout);
        });

        provide('myPlanetsBaseList', myPlanetsBaseList);
        provide('planetCanister', planetCanister);
        provide('noticeData', noticeData);

        return {};
    },
});
</script>

<style scoped lang="less">
.main {
    display: flex;
    height: 100vh;
    background-color: #f3f3f3;
    @apply dark: (bg-dark-900);

    .content {
        display: flex;
        flex-direction: column;
        flex: 1;
        margin: 0 15px 15px 15px;
        height: calc(100vh - 15px);

        .box {
            display: flex;
            height: 100%;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            @apply dark: (bg-dark-500);
        }
    }
}
</style>
