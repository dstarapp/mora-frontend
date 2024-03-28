<template>
    <div class="profile-collect">
        <div class="profile-collect-screening">
            <p>
                {{ $t('plugin.profileUser.total1') }}
                {{ pageData.all }}
                {{ $t('plugin.profileUser.total2') }}
            </p>
            <span>
                <div class="refresh" @click="refresh">
                    <i class="iconfont icon-refresh"></i>
                </div>
            </span>
        </div>

        <div class="profile-collect-wrapper">
            <div class="profile-collect-content" v-if="isSkeleton">
                <div class="item" v-for="i in pageData.size" :key="i">
                    <SkeletonVue />
                </div>
            </div>
            <div class="profile-collect-content" v-else-if="pageData.data.length">
                <div class="item" v-for="item in pageData.data" :key="`${item.id}`">
                    <ListVue :listData="(item as ExperienceUserCollection)" />
                </div>
            </div>
            <template v-else>
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <span class="create">
                        {{ $t('plugin.collect.noData') }}
                    </span>
                </div>
            </template>
        </div>

        <div v-if="pageData.all" class="page">
            <div class="bottom">
                <Pagination :total="pageData.all" :currentPage="pageData.page" :pageSize="pageData.size" @next="next"
                    @prev="prev" @goPage="goPage" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, watch, reactive, ref } from 'vue';
import Pagination from '@/components/Pagination.vue';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import { ExperienceUserCollection } from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { queryCollections } from '@/components/light-experience/canisters/experience_worker/apis';
import { GET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import ListVue from './components/List.vue';
import SkeletonVue from './components/Skeleton.vue';
import { PageData } from '@/components/light-experience/canisters/common';

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();
watch(
    () => agent.value,
    (nv, ov) => {
        if (ov && nv) window.location.reload();
        else if (nv) load(nv);
    },
);

const userCanisters = computed<Record<string, string>>(
    () => store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`],
);
const userCanister = async (): Promise<string> => {
    const current_user = await currentUser();
    return userCanisters.value[current_user];
};

const isSkeleton = ref(true);

const pageData = reactive<{
    page: number;
    size: number;
    data: ExperienceUserCollection[];
    all: number;
}>({
    page: 1,
    size: 6,
    data: [],
    all: 0,
});

const prev = () => {
    pageData.page = pageData.page - 1;
    if (agent.value) load(agent.value);
};

const next = () => {
    pageData.page = pageData.page + 1;
    if (agent.value) load(agent.value);
};

const goPage = (num) => {
    pageData.page = parseInt(num);
    if (agent.value) load(agent.value);
};

const load = (agent: Agent) => {
    isSkeleton.value = true;
    userCanister().then((user_canister) => {
        if (!user_canister) {
            pageData.page = 1;
            pageData.data = [];
            pageData.all = 0;
            isSkeleton.value = false;
            return;
        }
        queryCollections(user_canister, agent, {
            page: pageData.page,
            size: pageData.size,
        })
            .then((d: PageData<ExperienceUserCollection>) => {
                pageData.page = d.page;
                pageData.data = d.data;
                pageData.all = d.all;
            })
            .catch((e) => {
                console.error('queryAllExperiences error', e);
            })
            .finally(() => {
                isSkeleton.value = false;
            });
    });
};

const refresh = () => {
    if (!agent.value) {
        return;
    }
    pageData.page = 1;
    pageData.data = [];
    pageData.all = 0;
    load(agent.value);
};

onMounted(() => {
    if (agent.value) load(agent.value);
});
</script>

<style scoped lang="less">
@import url('./components/list.less');

.profile-collect {
    @apply dark:(bg-dark-600);
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 24px 40px 15px 40px;

    .profile-collect-screening {
        display: flex;
        justify-content: space-between;
        height: 40px;
        margin-bottom: 10px;

        p {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 16px;
            height: 40px;
            color: #000000;
            @apply dark:(text-light-900);
        }

        span {
            display: flex;

            :deep(.el-select) {
                width: 160px;

                .el-input {
                    height: 40px;

                    .el-input__wrapper {
                        padding: 0 11px;
                        border-width: 1px;
                        border-radius: 8px;
                        border-color: #ddd;

                        &:hover {
                            border-color: #34d399;
                            background-color: #fff;
                        }

                        .el-input__inner {
                            text-align: center;
                            height: 34px !important;
                            font-size: 14px;
                            color: #000000;
                            @apply dark: (text-light-900/80);
                        }
                    }

                    &.is-focus {
                        .el-input__wrapper {
                            border-color: #34d399;
                        }
                    }
                }
            }

            .refresh {
                .center();
                height: 40px;
                width: 40px;
                border: 1px solid #dddddd;
                border-radius: 10px;
                margin-left: 18px;
                color: #999999;
                font-size: 18px;
                cursor: pointer;
                @apply dark:(border-dark-100);
            }
        }
    }

    .profile-content {
        display: flex;
        flex: 1;
    }

    .profile-collect-wrapper {
        overflow-y: scroll;
        // padding: 0 40px;
        .noScrollbar();
        flex: 1;

        .profile-collect-content {
            display: grid;
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
            align-items: start;
            grid-gap: 28px 53px;
            grid-auto-rows: minmax(0, max-content);
            padding: 18px 0 28px 0;

            .item {
                @apply bg-white rounded-2xl overflow-hidden transition duration-300 hover: (shadow shadow-xl transition duration-300 cursor-pointer dark:(shadow-black)) dark:(bg-dark-300);
                display: flex;
                flex-direction: column;

                &:last-child:nth-child(3n + 2) {
                    margin-right: calc((100% - $width) / 2);
                }
            }
        }
    }

    .no-data {
        @apply w-full h-full py-15 flex items-center justify-center flex-col;

        i {
            @apply text-7xl text-gray-300 dark:(text-light-900/60);
        }

        .create {
            @apply py-2 text-base text-gray-400 dark:(text-light-900/50);
            border-radius: 6px;
            height: 32px;
            padding: 0 50px;
            font-weight: 400;
            margin-top: 15px;
            cursor: pointer;
            .center();
        }
    }

    .page {
        padding: 0 40px;
        margin-top: 10px;
    }

    .bottom {
        display: flex;
        width: 100%;
        // justify-content: flex-end;
        align-items: flex-end;
    }
}
</style>
