<template>
    <div v-if="!lightExperience" class="profile-audit">
        <div class="profile-audit-total" v-if="isInit">
            <p>
                {{ $t('plugin.profileUser.total1') }}
                {{ pageData.all }}
                {{ $t('plugin.profileUser.total2') }}
            </p>
            <span>
                <div class="frozen" @click="isShowFrozen = true">
                    {{ $t('plugin.profileUser.frozen') }}
                </div>
                <div class="refresh" @click="refresh">
                    <i class="iconfont icon-refresh"></i>
                </div>
            </span>
        </div>
        <div class="profile-audit-wrapper">
            <div class="profile-audit-content" v-if="isSkeleton">
                <div class="item" v-for="item in 6">
                    <el-skeleton animated>
                        <template #template>
                            <div class="img-box">
                                <el-skeleton-item variant="image" class="w-full h-52" />
                            </div>
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
            <div class="profile-audit-content" v-else-if="pageData.data.length">
                <div class="item" v-for="item in pageData.data" :key="`${item.id}`">
                    <div class="img-box">
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
                            <div class="category">
                                {{ item.editing_info.categories[0] }}
                            </div>
                            <div class="btn-box">
                                <button class="editBtn" @click="onAudit(item as LightExperienceManager)">
                                    {{ $t('plugin.audit.audit') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template v-else>
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <span class="create">
                        {{ $t('plugin.audit.noData2') }}
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

    <EditLightVue v-show="lightExperience" ref="lightExperienceRef" />

    <FrozenVue :show="isShowFrozen" @complete="completeFrozen" />

    <template v-if="isShowReject">
        <AuditRejectVue :show="isShowReject" :lightID="auditId" :info="basicInfo" :content="content" :status="status!"
            @complete="completeRejectAudit" />
    </template>

    <template v-if="isShowPreview">
        <PreviewVue :show="isShowPreview" :data="previewData!" @close="onPreviewClose" />
    </template>

    <BasicInfoVue :disabled="true" :show="isShowBasicInfo" @complete="completeBasicInfo" ref="basicInfoRef" />
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed, watch, onUnmounted } from 'vue';
import { LightExperienceManager } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import Pagination from '@/components/Pagination.vue';
import EditLightVue from '@/components/light-experience/editor/EditLight.vue';
import { getImagesUrl } from '@/utils/functions';
import { findAuditingExperiences } from '@/components/light-experience/canisters/experience_manager/apis';
import { useRouter, useRoute } from 'vue-router';
import bus from 'vue3-eventbus';
import {
    LightBasicInfo,
    LightExperience,
    initialBasicInfo,
    initialLightExperience,
} from '@/components/light-experience/types/core';
import { checkLightExperience } from '@/components/light-experience/types/common/checks';
import { lightExperienceDone } from '@/components/light-experience/canisters/experience_manager/apis';
import PreviewVue from '../Editor/components/Preview.vue';
import BasicInfoVue from '../Editor/components/BasicInfo.vue';
import { LightCoreContent } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import AuditRejectVue from './components/AuditReject.vue';
import FrozenVue from './components/Frozen.vue';
import {
    LightExperienceStatus,
    LightExperienceWorker,
} from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { deepClone } from '@mora-light/core/types/common';
import { t } from '@/i18n';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ElLoading } from 'element-plus';
import { StringResult } from '@mora-light/core/types/common';
import { findLightExperience } from '@/components/light-experience/canisters/experience_manager/apis';
import { LightExecutingQueryResult } from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import { Principal } from '@dfinity/principal';
import { audit_info } from '@/components/light-experience/types/common/auditing';

const route = useRoute();
const router = useRouter();
const agent = computed<Agent>(() => store.state.agent);
const lightExperienceRef = ref<{ setExperience: (_: LightExperience) => void }>();

const isSkeleton = ref(true);
const isInit = ref(false);
const pageData = reactive<{
    page: number;
    size: number;
    data: LightExperienceManager[];
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

const refresh = () => {
    if (!agent.value) {
        return;
    }
    pageData.page = 1;
    pageData.data = [];
    pageData.all = 0;
    load(agent.value);
};

const load = (agent: Agent) => {
    isSkeleton.value = true;

    findAuditingExperiences(store.state.agent, {
        page: pageData.page,
        size: pageData.size,
    })
        .then((res) => {
            pageData.page = res.page;
            pageData.data = res.data;
            pageData.all = res.all;
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            isInit.value = true;
            isSkeleton.value = false;
        });
};

const isShowFrozen = ref(false);
const completeFrozen = (data: boolean = false) => {
    isShowFrozen.value = false;
};

const basicInfoRef = ref<{ setData: (_: LightBasicInfo) => void }>();
const basicInfo = ref<LightBasicInfo>(initialBasicInfo());
const status = ref<LightExperienceStatus | undefined>();
const lightExperience = ref<LightExperienceWorker | undefined>();
const content = ref<{ experience_json: string; core_json_result: StringResult<string> }>({
    experience_json: JSON.stringify(initialLightExperience()),
    core_json_result: checkLightExperience(initialLightExperience()),
});
const auditId = ref<string>('');
const onAudit = async (item: LightExperienceManager) => {
    const loadingInstance = ElLoading.service({ fullscreen: true });
    findLightExperience(agent.value, item.user, item.id)
        .then((d) => {
            if (d.length) {
                let res = d[0];
                auditId.value = item.id;
                lightExperience.value = res;
                status.value = res.status;

                const info: LightBasicInfo = res.editing_info;
                basicInfo.value = info;
                basicInfoRef.value?.setData(deepClone(info));

                content.value = {
                    experience_json: res.editing_content.experience_json,
                    core_json_result: checkLightExperience(
                        JSON.parse(res.editing_content.experience_json),
                    ),
                };
                audit_info(info, JSON.parse(res.editing_content.experience_json));
                console.error(
                    'findLightExperience',
                    d[0],
                    (d[0].status as any)?.Auditing?.hash,
                    (d[0].status as any)?.DoneAuditing?.hash,
                );
                console.error(
                    'findLightExperience',
                    JSON.parse(res.editing_content.experience_json),
                );
                setPreviewData(res, item.user);
                lightExperienceRef.value?.setExperience(JSON.parse(content.value.experience_json));
                bus.emit('plugin-header-switch');
            } else {
                ElMessage.error(t('plugin.audit.getAuditError'));
            }
        })
        .catch((e) => {
            console.error('queryExperience', item.id, e);
        })
        .finally(() => {
            loadingInstance.close();
        });
};

const onPass = () => {
    ElMessageBox.confirm(t('plugin.audit.passMessageContent'), t('plugin.audit.passMessageTitle'), {
        confirmButtonText: t('plugin.audit.passMessageConfirm'),
        cancelButtonText: t('plugin.audit.passMessageCancel'),
        confirmButtonClass: 'delConfirm',
        type: 'warning',
        beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                let str: LightCoreContent = {
                    id: auditId.value,
                    info_json: JSON.stringify(basicInfo.value),
                    core_json: content.value.core_json_result.ok as string,
                    experience_json: content.value.experience_json,
                };
                if (!str.core_json) {
                    ElMessage.error(t('plugin.submitAudit.ParameterError'));
                    return;
                }
                lightExperienceDone(store.state.agent, auditId.value as string, str)
                    .then((res) => {
                        instance.confirmButtonLoading = false;
                        done();
                    })
                    .catch((err) => {
                        console.error(err);
                    })
                    .finally(() => { });
            } else {
                done();
            }
        },
    })
        .then(() => {
            load(agent.value);
            onBack();
        })
        .catch(() => { });
};

const isShowReject = ref(false);
const onReject = () => {
    isShowReject.value = true;
};
const completeRejectAudit = (data: boolean = false) => {
    isShowReject.value = false;
    if (data) {
        load(agent.value);
        onBack();
    }
};

const isShowBasicInfo = ref(false);
const onBasicInfo = () => {
    isShowBasicInfo.value = true;
};
const completeBasicInfo = (data: LightBasicInfo) => {
    isShowBasicInfo.value = false;
};

const isShowPreview = ref(false);
const previewData = ref<LightExecutingQueryResult>();
const setPreviewData = (d: LightExperienceWorker, creator: Principal) => {
    previewData.value = {
        value: {
            hash: '',
            id: d.id,
            created: d.created,
            creator,
            updated: d.updated,
            info_json: JSON.stringify(d.editing_info),
            core_json: d.editing_content.core_json,
            audited: BigInt(`${new Date().getTime() * 1000000}`),
            auditor: Principal.fromText('aaaaa-aa'),
        },
    };
};
const onPreview = () => {
    console.error('previewData', previewData.value);
    isShowPreview.value = true;
};
const onPreviewClose = () => {
    isShowPreview.value = false;
};

const onBack = () => {
    lightExperience.value = undefined;
    auditId.value = '';
    bus.emit('plugin-header-switch-close');
};

onMounted(() => {
    bus.on('plugin-pass', onPass);
    bus.on('plugin-reject', onReject);
    bus.on('plugin-back', onBack);
    bus.on('plugin-preview', onPreview);
    bus.on('plugin-basic-info', onBasicInfo);

    if (agent.value) load(agent.value);
});

onUnmounted(() => {
    bus.off('plugin-pass', onPass);
    bus.off('plugin-reject', onReject);
    bus.off('plugin-back', onBack);
    bus.off('plugin-preview', onPreview);
    bus.off('plugin-basic-info', onBasicInfo);
});

watch(
    () => agent.value,
    (nv, ov) => {
        if (ov && nv) window.location.reload();
        else if (nv) load(nv);
    },
);
</script>

<style scoped lang="less">
.profile-audit {
    @apply dark:(bg-dark-600);
    display: flex;
    flex-direction: column;
    padding: 30px 0;
    width: 100%;

    .profile-audit-total {
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

            .frozen {
                .center();
                height: 40px;
                background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                border-radius: 10px;
                width: 80px;
                cursor: pointer;
                color: #000000;
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
                @apply dark:(border-dark-50);
            }
        }
    }

    .profile-audit-wrapper {
        overflow-y: scroll;
        padding: 0 40px;
        .noScrollbar();
        flex: 1;

        .profile-audit-content {
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
                            @apply flex-1 ml-3 pt-7 truncate font-bold;
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

                    .btn-box {
                        display: flex;

                        .editBtn {
                            @apply px-4 rounded-lg text-black transition duration-300 hover:(transition duration-300 transform scale-110);
                            background-image: linear-gradient(to right, #34d399, #7cee83);
                            height: 32px;
                        }
                    }
                }
            }
        }
    }

    .no-data {
        @apply w-full h-full py-20 flex items-center justify-center flex-col;

        i {
            @apply text-7xl text-gray-300 dark:(text-light-900/60);
        }

        .create {
            @apply py-3 text-gray-400 dark:(text-light-900/50);
        }
    }

    .page {
        padding: 0 40px;
        margin-top: 10px;
    }
}
</style>
