<template>
    <Skeleton v-if="isLoading" />
    <div class="box" v-else>
        <div class="baseinfo">
            <div class="left">
                <div class="plugin-logo">
                    <img :src="getImagesUrl(pluginData.info_json.thumbnail)" />
                </div>
                <div class="plugin-info">
                    <span>{{ pluginData.info_json.name }}</span>
                    <span>{{ pluginData.info_json.categories.toString() }}</span>
                    <span>{{ $t('plugin.details.pluginID') }}{{ pluginData.id }}</span>
                </div>
            </div>
            <button class="collect" @click="collect" v-if="agent">
                <i class="iconfont" :class="isCollect ? 'icon-collection-1' : 'icon-collection'"></i>
                {{ isCollect ? 'Collected' : 'Collect' }}
            </button>
        </div>
        <div class="moreinfo">
            <div class="left">
                <div class="title">{{ $t('plugin.details.description') }}</div>
                <div class="content">
                    <img v-if="pluginData.info_json.cover" :src="getImagesUrl(pluginData.info_json.cover)" alt="" />
                    <p>
                        {{ pluginData.info_json.instruction }}
                    </p>
                </div>

                <div class="timebox">
                    <div class="list" v-if="pluginData.auditor">
                        <div class="time">
                            <span>{{ $t('plugin.details.createTime') }}</span>
                            <span>
                                {{
        moment(Math.trunc(Number(pluginData.created) / 1000000)).format(
            'MMMM Do YYYY, h:mm:ss a',
        )
    }}
                            </span>
                        </div>
                        <el-tooltip :teleported="false" effect="dark" :content="pluginData.auditor.toString()"
                            placement="top">
                            <div class="avatar">
                                <img v-if="pluginData.userAvatar" :src="getImagesUrl(pluginData.userAvatar)" />
                                <img v-else src="@/assets/svg/defaultAvatar.svg" />
                            </div>
                        </el-tooltip>
                    </div>
                    <div class="list" v-if="pluginData.auditor">
                        <div class="time">
                            <span>{{ $t('plugin.details.reviewTime') }}</span>
                            <span>
                                {{
        moment(Math.trunc(Number(pluginData.audited) / 1000000)).format(
            'MMMM Do YYYY, h:mm:ss a',
        )
    }}
                            </span>
                        </div>
                        <el-tooltip effect="dark" :teleported="false" :content="pluginData.auditor.toString()"
                            placement="top">
                            <div class="avatar">
                                <img v-if="pluginData.auditorAvatar" :src="getImagesUrl(pluginData.auditorAvatar)" />
                                <img v-else src="@/assets/svg/defaultAvatar.svg" />
                            </div>
                        </el-tooltip>
                    </div>
                </div>

                <template v-if="isCanisterExist">
                    <div class="title">{{ $t('plugin.details.actions') }}</div>
                    <div class="actions">
                        <template v-for="(item, idx) in moduleHashes" :key="idx">
                            <div class="item">
                                <span>
                                    {{ item.canister_id }} ->
                                    {{ item.method }}
                                </span>
                                <i class="iconfont" :class="isShow === idx ? 'icon-plugin-aup' : 'icon-plugin-adown'
        " @click="handleClick(idx)"></i>
                            </div>
                            <div class="modulehash" v-if="isShow === idx">
                                <h4>{{ $t('plugin.details.hash') }}</h4>
                                <div class="list">
                                    <div class="hash">{{ item.module_hash }}</div>
                                    <div class="status" v-if="item.module_hash !== item.latest_module_hash">
                                        {{ $t('plugin.details.changed') }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>

                <div class="title">{{ $t('plugin.details.json') }}</div>
                <div class="json" v-if="pluginData.core_json">
                    {{ JSON.stringify(pluginData.core_json, null, 2) }}
                </div>
            </div>

            <div class="right">
                <div class="timebox">
                    <div class="list" v-if="pluginData.auditor">
                        <div class="time">
                            <span>{{ $t('plugin.details.createTime') }}</span>
                            <span>
                                {{
        moment(Math.trunc(Number(pluginData.created) / 1000000)).format(
            'MMMM Do YYYY, h:mm:ss a',
        )
    }}
                            </span>
                        </div>
                        <el-tooltip effect="dark" :teleported="false" :content="pluginData.auditor.toString()"
                            placement="top">
                            <div class="avatar">
                                <img v-if="pluginData.userAvatar" :src="getImagesUrl(pluginData.userAvatar)" />
                                <img v-else src="@/assets/svg/defaultAvatar.svg" />
                            </div>
                        </el-tooltip>
                    </div>
                    <div class="list" v-if="pluginData.auditor">
                        <div class="time">
                            <span>{{ $t('plugin.details.reviewTime') }}</span>
                            <span>
                                {{
        moment(Math.trunc(Number(pluginData.audited) / 1000000)).format(
                                'MMMM Do YYYY, h:mm:ss a',
                                )
                                }}
                            </span>
                        </div>
                        <el-tooltip effect="dark" :teleported="false" :content="pluginData.auditor.toString()"
                            placement="top">
                            <div class="avatar">
                                <img v-if="pluginData.auditorAvatar" :src="getImagesUrl(pluginData.auditorAvatar)" />
                                <img v-else src="@/assets/svg/defaultAvatar.svg" />
                            </div>
                        </el-tooltip>
                    </div>
                </div>

                <div class="share" v-if="pluginData.info_json.name">
                    <div class="title">{{ $t('plugin.details.share') }}</div>
                    <div class="item">
                        <i class="iconfont icon-link" @click="linkShare"></i>
                        <i class="iconfont icon-twitter" @click="twitterShare"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import PreviewCode from '../plugin/PreviewCode.vue';
import { copyText } from '@/utils/functions';
import { useRouter, useRoute } from 'vue-router';
import { queryExecutingExperience } from '@/components/light-experience/canisters/core_worker/apis';
import { queryCollection } from '@/components/light-experience/canisters/experience_worker/apis';
import {
    LightExecutingQueryResult,
    LightExecutingQueryValue,
} from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import {
    lightExperienceCollect,
    lightExperienceCollectDelete,
} from '@/components/light-experience/canisters/experience_manager/apis';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import { Principal } from '@dfinity/principal';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { LightBasicInfo } from '@/components/light-experience/types/core';
import { getImagesUrl } from '@/utils/functions';
import moment from 'moment';
import { getAvatar } from '@/utils/getAvatar';
import Skeleton from './components/Skeleton.vue';
import { findAllCanisterInfo, findCanisterDataSources } from '@mora-light/core/types';
import { GET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import { canister_status } from '@/components/light-experience/canisters/status';

const route = useRoute();
const router = useRouter();
const lightDetailsCanisterId = ref<string>(route.params.canisterId as string);
const lightDetailsHash = ref<string>(route.params.hash as string);

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();
const userCanisters = computed<Record<string, string>>(
    () => store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`],
);
const userCanister = async (): Promise<string> => {
    const current_user = await currentUser();
    return userCanisters.value[current_user] ?? '';
};

// loading
const isLoading = ref(true);

const isFrozen = ref(false);
const isCollect = ref<Boolean>(false);

const pluginData = ref<{
    id: string;
    info_json: LightBasicInfo;
    created: BigInt | null;
    updated: BigInt | null;
    auditor: Principal | undefined;
    auditorAvatar: string;
    audited: BigInt | null;
    user: Principal | undefined;
    userAvatar: string;
    core_json: {
        data: any[];
    };
}>({
    id: '',
    info_json: {
        name: '',
        cover: '',
        thumbnail: '',
        categories: [],
        tags: [],
        runnable_planet: { All: null },
        instruction: '',
    },
    created: null,
    updated: null,
    auditor: undefined,
    auditorAvatar: '',
    audited: null,
    user: undefined,
    userAvatar: '',
    core_json: {
        data: [],
    },
});

const moduleHashes = ref<
    {
        canister_id: string;
        method: string;
        module_hash: string;
        updated: number;
        latest_module_hash: string;
        latest_updated: number;
    }[]
>([]);

const collect = async () => {
    if (!isCollect.value) {
        isCollect.value = true;
        await lightExperienceCollect(agent.value, pluginData.value.id);
    } else {
        isCollect.value = false;
        await lightExperienceCollectDelete(agent.value, pluginData.value.id);
    }
};

const isCanisterExist = ref<boolean>(false);

const isShow = ref(-1);
const handleClick = (n: number) => {
    if (isShow.value === n) {
        isShow.value = -1;
    } else {
        isShow.value = n;
    }
};

// share
const twitterShare = () => {
    if (!pluginData.value.info_json.name) {
        return;
    }
    let url = location.href;
    let title = pluginData.value.info_json.name;
    const twitter = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    window.open(twitter, '_blank');
};

const linkShare = () => {
    copyText(location.href);
};

// modules hash is change
const isCanisterHashChange = async (canister_id: string, module_hash: string) => {
    let res = await canister_status(Principal.fromText(canister_id));
    return !(res.module_hash === module_hash);
};

const init = () => {
    if (!lightDetailsCanisterId.value || !lightDetailsHash.value) {
        ElMessage.error(t('plugin.details.nonexistence'));
        router.push({
            name: 'lightHome',
        });
        return;
    }

    queryExecutingExperience(lightDetailsCanisterId.value, lightDetailsHash.value)
        .then(async (res: LightExecutingQueryResult) => {
            if (res['none'] === null) {
                ElMessage.error(t('plugin.details.nonexistence'));
                router.push({
                    name: 'lightHome',
                });
            } else if (res['frozen'] === null) {
                isFrozen.value = true;
            } else if (res['value']) {
                let value: LightExecutingQueryValue = res['value'];
                let data: any = { ...value };
                data.info_json = JSON.parse(value.info_json);
                data.core_json = JSON.parse(value.core_json);
                pluginData.value = data;
                isCanisterExist.value = findAllCanisterInfo(data.core_json).length > 0;
                getAvatar(value.creator).then((res) => {
                    if (res) {
                        pluginData.value.userAvatar = res;
                    }
                });
                getAvatar(value.auditor).then((res) => {
                    if (res) {
                        pluginData.value.auditorAvatar = res;
                    }
                });
                moduleHashes.value = findCanisterDataSources(data.core_json.data)
                    .filter((c) => c.canister.canister_id.fixed)
                    .map((c) => {
                        return {
                            canister_id: c.canister.canister_id.value!,
                            method: c.canister.method.name,
                            module_hash: c.canister.info.module_hash,
                            updated: c.canister.info.updated,
                            latest_module_hash: c.canister.info.module_hash,
                            latest_updated: c.canister.info.updated,
                        };
                    });
                moduleHashes.value.forEach((item) => {
                    canister_status(Principal.fromText(item.canister_id)).then((d) => {
                        // console.error('xxx', item.canister_id, d);
                        item.latest_module_hash = d.module_hash;
                        item.latest_updated = d.time.getTime() * 1000000;
                    });
                });
            }
        })
        .finally(() => {
            isLoading.value = false;
        });
};

const getIsCollection = async () => {
    const user_canister = await userCanister();

    queryCollection(user_canister, agent.value, pluginData.value.id)
        .then((res: Boolean) => {
            isCollect.value = res;
        })
        .catch((err) => {
            console.error(err);
        });
};

onMounted(() => {
    init();
});

watch(
    () => [agent.value, pluginData.value],
    (n) => {
        if (agent.value && pluginData.value.id) {
            getIsCollection();
        }
    },
    {
        immediate: true,
    },
);
</script>

<style scoped lang="less">
.box {
    @apply w-full max-w-250 mx-auto;

    .baseinfo {
        @apply w-full mt-10 flex justify-between items-center <lg:(px-10) <sm:(px-5 mt-5);

        .left {
            @apply flex items-center;

            .plugin-logo {
                @apply w-20 h-20 rounded-2xl border-3 border-white overflow-hidden <lg:(w-18 h-18) <sm:(w-15 h-15) dark:(border-dark-100);

                img {
                    @apply w-full h-full;
                }
            }

            .plugin-info {
                @apply ml-5 flex flex-col justify-between <sm:(ml-3);

                span {
                    &:nth-child(1) {
                        @apply text-xl font-bold max-w-80 truncate <lg:(text-lg) <sm:(text-base max-w-35);
                    }

                    &:nth-child(2) {
                        @apply py-1 font-bold text-sm text-green-500 <lg:(py-2px) <sm:(text-xs);
                    }

                    &:nth-child(3) {
                        @apply text-sm text-dark-50 <sm:(text-xs) dark:(text-light-900/80);
                    }
                }
            }
        }

        .collect {
            @apply border-none flex items-center justify-center px-5 py-2 rounded-xl text-sm transition duration-300 text-black;
            background: linear-gradient(to right, #34d399, #7cee83);

            &:hover {
                @apply transition duration-300 text-black shadow-lg shadow-green-500/30 cursor-pointer;
            }

            i {
                @apply text-lg mr-1;
            }
        }
    }

    .moreinfo {
        @apply w-full mt-8 bg-white rounded-2xl px-8 pt-2 pb-8 flex justify-between <sm:(px-5 pt-0 mt-5) dark:(bg-dark-800);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);

        .left {
            @apply flex-1;
            overflow-x: scroll;

            .title {
                @apply w-full block text-xl text-black font-bold py-6 <sm:(text-lg py-4) dark:(text-light-900);
            }

            .content {
                @apply w-full;

                img {
                    @apply w-full;
                }

                p {
                    @apply text-base py-4 text-dark-500 <sm:(text-sm) dark:(text-light-900/80);
                }
            }

            .timebox {
                @apply w-full border border-light-700 rounded-2xl px-4 py-3 mt-1 mb-3 hidden <lg:(block);

                .list {
                    @apply w-full flex items-center justify-between;

                    &:first-child {
                        @apply pb-3 border-b border-dashed border-light-800;
                    }

                    &:last-child {
                        @apply pt-3;
                    }

                    .time {
                        @apply flex-1;

                        span {
                            @apply w-full block;

                            &:first-child {
                                @apply font-bold text-sm;
                            }

                            &:last-child {
                                @apply text-xs text-gray-500 pt-2px;
                            }
                        }
                    }

                    .avatar {
                        @apply w-10 h-10 rounded-full border border-light-600 p-2px bg-white;

                        img {
                            @apply w-full h-full rounded-full;
                        }
                    }
                }
            }

            .actions {
                @apply w-full rounded-xl px-4 py-3 mb-5 border border-light-900 dark:(border-dark-100);

                .item {
                    @apply w-full flex items-center justify-between;

                    span {
                        @apply text-green-500 <sm:(text-sm);
                    }

                    i {
                        @apply text-gray-400 text-2xl hover:(cursor-pointer);
                    }
                }

                .modulehash {
                    @apply w-full mt-2;

                    h4 {
                        @apply w-full block text-gray-400 text-xs;
                    }

                    .list {
                        @apply w-full flex justify-between items-center text-sm pt-1;

                        .hash {
                            @apply flex-1 break-all text-dark-50 <sm:(leading-4 pb-1 text-xs) dark:(text-light-900/80);
                        }

                        .status {
                            @apply text-red-400 ml-2 text-xs;
                        }
                    }
                }
            }

            :deep(.json) {
                @apply w-full break-all overflow-hidden whitespace-pre p-5 rounded-xl border border-gray-200 bg-gray-100 dark:(bg-dark-500 border-dark-100);

                .code-toolbar {
                    div {
                        @apply my-0;
                    }

                    &>.toolbar {
                        @apply top-2 right-2;

                        &>.toolbar-item {
                            &>button {
                                @apply bg-gray-600 text-white py-1 px-2;
                                box-shadow: none;
                            }
                        }
                    }
                }
            }
        }

        .right {
            @apply w-60 ml-18 <lg:(hidden);

            .timebox {
                @apply w-full border border-light-700 rounded-2xl px-4 py-3 mt-18 dark:(border-dark-100);

                .list {
                    @apply w-full flex items-center justify-between;

                    &:first-child {
                        @apply pb-3 border-b border-dashed border-light-800 dark:(border-dark-100);
                    }

                    &:last-child {
                        @apply pt-3;
                    }

                    .time {
                        @apply flex-1;

                        span {
                            @apply w-full block;

                            &:first-child {
                                @apply font-bold text-sm dark:(text-light-900/80);
                            }

                            &:last-child {
                                @apply text-xs text-gray-500 pt-2px;
                            }
                        }
                    }

                    .avatar {
                        @apply w-10 h-10 rounded-full border border-light-600 p-2px bg-white dark:(border-dark-50 bg-dark-500);

                        img {
                            @apply w-full h-full rounded-full;
                        }
                    }
                }
            }

            .share {
                @apply mt-10 w-full;

                .title {
                    @apply w-full block font-bold pb-4;
                }

                .item {
                    @apply flex w-full items-center;

                    i {
                        @apply flex items-center justify-center border border-light-800 w-12 h-12 mr-4 rounded-xl text-gray-400 dark:(border-dark-100);

                        &.icon-link,
                        &.icon-twitter {
                            @apply transition duration-300 hover:(cursor-pointer transition duration-300);
                        }

                        &.icon-link {
                            @apply hover:(bg-green-500 text-white border-green-500);
                        }

                        &.icon-twitter {
                            @apply hover:(bg-blue-500 text-white border-blue-500);
                        }
                    }
                }
            }
        }
    }
}
</style>
