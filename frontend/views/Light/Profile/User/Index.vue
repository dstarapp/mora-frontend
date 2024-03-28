<template>
    <div class="profile-user">
        <div class="profile-user-screening" v-if="isInit">
            <p>
                {{ $t('plugin.profileUser.total1') }}
                {{ pageData.all }}
                {{ $t('plugin.profileUser.total2') }}
            </p>
            <span>
                <el-select v-model="type" filterable value-key="key" default-first-option
                    :placeholder="$t('plugin.actionEditor.chooseMethod')" @change="onTypeChanged">
                    <el-option key="All" label="All" value="All" />
                    <el-option key="Draft" label="Draft" value="Draft" />
                    <el-option key="Review" label="Review" value="Review" />
                    <el-option key="Online" label="Online" value="Online" />
                    <el-option key="Offline" label="Offline" value="Offline" />
                </el-select>
                <div class="refresh" @click="refresh">
                    <i class="iconfont icon-refresh"></i>
                </div>
            </span>
        </div>
        <div class="profile-user-wrapper">
            <div class="profile-user-content" v-if="isSkeleton">
                <div class="item" v-for="item in 6">
                    <el-skeleton animated>
                        <template #template>
                            <div class="img-box"><el-skeleton-item variant="image" class="w-full h-52" /></div>
                            <div class="con-box">
                                <div class="info">
                                    <div class="logo">
                                        <el-skeleton-item variant="image" class="w-12 h-12" />
                                    </div>
                                    <div class="plugin-name"><el-skeleton-item variant="text" class="w-30" /></div>
                                </div>
                                <div class="des">
                                    <el-skeleton-item variant="text" />
                                    <el-skeleton-item variant="text" class="w-4/5" />
                                    <el-skeleton-item variant="text" class="w-2/5" />
                                </div>
                                <div class="flex justify-between items-center h-9">
                                    <div class="category">
                                        <el-skeleton-item variant="text" class="w-20" />
                                    </div>
                                    <div class="btn-box">
                                        <el-skeleton-item variant="text" class="w-20 h-8" />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </el-skeleton>
                </div>
            </div>
            <div class="profile-user-content" v-else-if="pageData.data.length">
                <div class="item" v-for="item in pageData.data" :key="`${item.id}`"
                    :class="{ review: isExperienceAuditing(item.status as any) }" v-loading="deleteLoading === item.id"
                    @click="openDetails(item)">
                    <div class="img-box">
                        <div class="tag online" v-if="isExperienceDone(item.status as any)">
                            <i></i>
                            {{ $t('plugin.profileUser.online') }}
                        </div>
                        <div class="tag frozen" v-if="isExperienceFrozen(item.status as any)">
                            <i></i>
                            {{ $t('plugin.profileUser.frozen') }}
                        </div>
                        <div class="tag draft" v-if="isExperienceEditing(item.status as any)">
                            <i class="iconfont icon-plugin-draft"></i>
                            {{ $t('plugin.profileUser.draft') }}
                        </div>

                        <div class="tag reject" v-else-if="isExperienceRejected(item.status as any)
            ">
                            <i class="iconfont icon-attention"></i>
                            {{ $t('plugin.profileUser.reject') }}
                        </div>
                        <el-popconfirm width="250" confirm-button-text="Confirm" cancel-button-text="Cancel"
                            :icon="InfoFilled" icon-color="#F19E38"
                            title="Confirm to delete? Once deleted it cannot be retrieved!"
                            @confirm="onExperienceDelete(item as any)">
                            <template #reference>
                                <div class="delete-btn" v-if="isExperienceEditing(item.status as any)
            ">
                                    <i class="iconfont icon-delete"></i>
                                </div>
                            </template>
                        </el-popconfirm>

                        <img :src="getImagesUrl(item.editing_info.cover)" alt="" />
                    </div>
                    <div class="con-box">
                        <div class="info">
                            <div class="logo">
                                <img :src="getImagesUrl(item.editing_info.thumbnail)" alt="" />
                            </div>
                            <div class="plugin-name">{{ item.editing_info.name }}</div>
                        </div>
                        <div class="des">
                            {{ item.editing_info.instruction }}
                        </div>
                        <div class="flex justify-between items-center h-9">
                            <div class="category" v-if="!isExperienceAuditing(item.status as any)">
                                {{ item.editing_info.categories[0] }}
                            </div>
                            <div class="under-review" v-if="isExperienceAuditing(item.status as any)">
                                <div>
                                    <i class="iconfont icon-chose"></i>
                                    <p>
                                        {{ $t('plugin.profileUser.submit') }}
                                    </p>
                                </div>
                                <em />
                                <div>
                                    <i class="iconfont icon-chose"></i>
                                    <p>
                                        {{ $t('plugin.profileUser.review') }}
                                    </p>
                                </div>
                                <em />
                                <div class="disabled">
                                    <i class="iconfont icon-chose"></i>
                                    <p>
                                        {{ $t('plugin.profileUser.pass') }}
                                    </p>
                                </div>
                            </div>
                            <div class="btn-box">
                                <button class="editBtn" v-if="isExperienceEditing(item.status as any)
            " @click.stop="onEdit(item as any)">
                                    {{ $t('plugin.profileUser.edit') }}
                                </button>
                                <button class="editBtn" :class="{ disabled: banLoading === item.id }"
                                    v-if="isExperienceDone(item.status as any)" @click.stop="onFrozen(item as any)">
                                    <img v-if="banLoading === item.id" src="@/assets/svg/loading.svg" />
                                    {{ $t('plugin.profileUser.frozen') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template v-else>
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <span class="create" @click="onCreate">
                        {{ $t('plugin.btn.create') }}
                    </span>
                </div>
            </template>
        </div>
        <div v-if="isInit && pageData.all" class="page">
            <div class="bottom">
                <Pagination :total="pageData.all" :currentPage="pageData.page" :pageSize="pageData.size" @next="next"
                    @prev="prev" @goPage="goPage" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, watch, reactive, ref } from 'vue';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import { GET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import {
    ExperienceQueryWrappedStatus,
    TrimmedLightExperienceWorker,
} from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { queryExperiences } from '@/components/light-experience/canisters/experience_worker/apis';
import {
    lightExperienceEditing,
    lightExperienceRemoved,
    lightExperienceFrozenByUser,
} from '@/components/light-experience/canisters/experience_manager/apis';
import { getImagesUrl } from '@/utils/functions';
import { useRouter } from 'vue-router';
import {
    isExperienceAuditing,
    isExperienceEditing,
    isExperienceRejected,
    isExperienceDone,
    isExperienceFrozen,
} from '@/components/light-experience/canisters/common';
import Pagination from '@/components/Pagination.vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { t } from '@/i18n';

const router = useRouter();
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
const isInit = ref(false);

const type = ref<'All'>('All');
const status = ref<ExperienceQueryWrappedStatus>({ All: null });
const onTypeChanged = () => {
    status.value = {
        [type.value]: null,
    };
    if (agent.value) load(agent.value);
};

const pageData = reactive<{
    page: number;
    size: number;
    data: TrimmedLightExperienceWorker[];
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
        queryExperiences(user_canister, agent, status.value, {
            page: pageData.page,
            size: pageData.size,
        })
            .then((d) => {
                pageData.page = d.page;
                pageData.data = d.data;
                pageData.all = d.all;
                isInit.value = true;
            })
            .catch((e) => {
                console.error('queryAllExperiences error', e);
            })
            .finally(() => {
                isSkeleton.value = false;
            });
    });
};

const openDetails = (item) => {
    if (isExperienceDone(item.status)) {
        router.push({
            name: 'lightDetails',
            params: {
                canisterId: item.status.Done.canister_id,
                hash: item.status.Done.hash,
            },
        });
    }
};

onMounted(() => {
    if (agent.value) load(agent.value);
});

const onEdit = (item: TrimmedLightExperienceWorker) => {
    if (!isExperienceEditing(item.status)) return;
    if (isExperienceRejected(item.status)) {
        lightExperienceEditing(agent.value, item.id, []).then(() => {
            router.push({ path: '/light/profile/edit/' + item.id });
        });
    } else {
        router.push({ path: '/light/profile/edit/' + item.id });
    }
};

const banLoading = ref();
const onFrozen = (item: TrimmedLightExperienceWorker) => {
    if (banLoading.value) {
        return;
    }

    ElMessageBox.confirm(
        t('plugin.profileUser.messageContent'),
        t('plugin.profileUser.messageTitle'),
        {
            confirmButtonText: t('plugin.profileUser.confirmButtonText'),
            cancelButtonText: t('plugin.profileUser.cancelButtonText'),
            confirmButtonClass: 'delConfirm',
            type: 'warning',
        },
    )
        .then(() => {
            banLoading.value = item.id;
            lightExperienceFrozenByUser(
                agent.value,
                item.id,
                'Your plugin has been taken down by yourself.',
            )
                .then(() => {
                    if (agent.value) load(agent.value);
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    banLoading.value = '';
                });
        })
        .catch(() => { });
};

const deleteLoading = ref();
const onExperienceDelete = (item: TrimmedLightExperienceWorker) => {
    if (!agent.value || !store.state.user_data?.pid) {
        return;
    }
    const id = item.id;
    deleteLoading.value = id;
    lightExperienceRemoved(agent.value, id)
        .then((d) => {
            console.log('🚀 ~ file: Index.vue:309 ~ .then ~ d:', d);
            if (agent.value) load(agent.value);
        })
        .catch((e) => {
            console.error('🚀 ~ file: Index.vue:313 ~ onExperienceDelete ~ e:', e);
        })
        .finally(() => {
            deleteLoading.value = '';
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

const onCreate = () => {
    router.push({ name: 'lightProfileCreate' });
};
</script>

<style lang="less" scoped>
.profile-user {
    @apply dark:(bg-dark-600);
    display: flex;
    flex-direction: column;
    padding: 30px 0;
    width: 100%;

    .profile-user-screening {
        display: flex;
        justify-content: space-between;
        height: 40px;
        padding: 0 40px;
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
                        @apply dark:(border-dark-100);

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

    .profile-user-wrapper {
        overflow-y: scroll;
        padding: 0 40px;
        .noScrollbar();
        flex: 1;

        .profile-user-content {
            display: grid;
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
            align-items: start;
            grid-gap: 28px 53px;
            grid-auto-rows: minmax(0, max-content);
            padding: 18px 0 28px 0;

            .item {
                @apply bg-white rounded-2xl overflow-hidden transition duration-300 hover:(shadow shadow-xl transition duration-300 cursor-pointer dark:(shadow-black)) dark:(bg-dark-300);
                display: flex;
                flex-direction: column;

                &:last-child:nth-child(3n + 2) {
                    margin-right: calc((100% - $width) / 2);
                }

                .img-box {
                    @apply w-full relative;

                    img {
                        @apply w-full;
                        height: 14.4vw;
                    }

                    .tag {
                        @apply flex items-center py-1 px-2 absolute right-2 top-2 rounded-lg text-white text-sm;

                        &.online {
                            background: rgba(0, 0, 0, 0.8);

                            i {
                                width: 8px;
                                height: 8px;
                                background: #35d49a;
                                display: inline-flex;
                                border-radius: 50%;
                            }
                        }

                        &.frozen {
                            background: rgba(0, 0, 0, 0.8);

                            i {
                                width: 8px;
                                height: 8px;
                                background: #979797;
                                display: inline-flex;
                                border-radius: 50%;
                            }
                        }

                        &.review {
                            @apply bg-green-500;
                        }

                        &.draft {
                            @apply bg-dark-600;
                        }

                        &.reject {
                            @apply bg-red-500;
                        }

                        i {
                            @apply mr-1;
                        }
                    }

                    .delete-btn {
                        @apply flex items-center justify-center py-1 px-2 absolute right-2 bottom-2 rounded-lg text-white text-sm;
                        width: 36px;
                        height: 36px;
                        background: #f37575;
                        border-radius: 10px;

                        .icon-delete {
                            font-size: 16px;
                        }
                    }
                }

                &.review {
                    @apply opacity-70 cursor-not-allowed;
                }

                .con-box {
                    @apply w-full p-5 border border-light-700 border-t-transparent rounded-bl-2xl rounded-br-2xl dark:(border-dark-100);

                    .info {
                        @apply w-full -mt-10 flex relative;

                        .logo {
                            @apply w-13 h-13 rounded-xl border-3 border-white overflow-hidden dark:(border-dark-300);

                            img {
                                @apply w-full h-full;
                            }
                        }

                        .plugin-name {
                            @apply flex-1 ml-3 pt-8 truncate font-medium;
                        }
                    }

                    .des {
                        @apply w-full mt-3 mb-5 h-14 text-dark-50/60 text-sm dark:(text-light-900/60);
                        .ellipsisMore(3);
                    }

                    .category {
                        background-image: linear-gradient(to right, #34d399, #7cee83);
                        -webkit-background-clip: text;
                        color: transparent;
                        font-weight: 500;
                    }

                    .under-review {
                        display: flex;

                        em {
                            width: 30px;
                            height: 16px;
                            position: relative;
                            margin: 0 8px;

                            &::after {
                                content: '';
                                border-bottom: 1px dotted #cccccc;
                                width: 100%;
                                height: 1px;
                                position: absolute;
                                left: 0;
                                top: 8px;
                            }
                        }

                        div {
                            .center();
                            height: 16px;

                            i {
                                font-size: 16px;
                                color: #34d399;
                            }

                            p {
                                font-weight: 500;
                                font-size: 16px;
                                color: #000000;
                                margin-left: 6px;
                            }

                            &.disabled {
                                i {
                                    color: #cccccc;
                                }

                                p {
                                    color: #999999;
                                }
                            }
                        }
                    }

                    .btn-box {
                        display: flex;

                        .editBtn {
                            @apply px-4 rounded-lg text-black transition duration-300 hover:(transition duration-300 transform scale-110);
                            background-image: linear-gradient(to right, #34d399, #7cee83);
                            height: 32px;
                            .center();

                            img {
                                width: 16px;
                                height: 16px;
                                margin-right: 5px;
                            }
                        }
                    }
                }
            }
        }
    }

    .no-data {
        @apply w-full h-full py-20 flex items-center justify-center flex-col;

        i {
            @apply text-7xl text-gray-300 dark:(text-light-900/100);
        }

        .create {
            @apply py-3;
            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
            border-radius: 6px;
            height: 32px;
            padding: 0 50px;
            font-weight: 400;
            font-size: 14px;
            color: #000;
            margin-top: 15px;
            cursor: pointer;
            .center();
        }
    }

    .page {
        padding: 0 40px;
        margin-top: 10px;
    }
}
</style>
