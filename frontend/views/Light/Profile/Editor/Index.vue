<template>
    <div class="error" v-if="content?.core_json_result?.err">
        <i class="iconfont icon-failed"></i>
        {{ content.core_json_result.err }}
    </div>

    <div class="create-box">
        <BasicInfoVue
            :show="step === 'basic-info'"
            @complete="completeBasicInfo"
            ref="basicInfoRef"
        />
        <EditLightVue @changed="onExperienceChanged" ref="lightExperienceRef" />

        <template v-if="isShowPreview && previewData">
            <PreviewVue :show="isShowPreview" :data="previewData" @close="onPreviewClose" />
        </template>
        <template v-if="id">
            <SubmitAuditVue
                :show="isShowSubmitAudit"
                :info="basicInfo"
                :lightID="id"
                :content="content"
                @complete="completeSubmitAudit"
            />
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, onMounted, reactive, computed, watch, provide } from 'vue';
import BasicInfoVue from './components/BasicInfo.vue';
import PreviewVue from './components/Preview.vue';
import SubmitAuditVue from './components/SubmitAudit.vue';
import EditLightVue from '@/components/light-experience/editor/EditLight.vue';
import bus from 'vue3-eventbus';
import {
    LightBasicInfo,
    LightExperience,
    initialBasicInfo,
    initialLightExperience,
} from '@/components/light-experience/types/core';
import store, { LIGHT } from '@/store';
import {
    insertLightExperience,
    lightExperienceEditing,
} from '@/components/light-experience/canisters/experience_manager/apis';
import { LightCoreContent } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import { GET_USER_EXPERIENCE_CANISTER, SET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import { useRouter, useRoute } from 'vue-router';
import { checkLightExperience } from '@/components/light-experience/types/common/checks';
import { Agent } from '@dfinity/agent';
import {
    queryExperience,
    updateExperience,
} from '@/components/light-experience/canisters/experience_worker/apis';
import { ElMessage } from 'element-plus';
import {
    initialUserExperienceCanister,
    isExperienceEditing,
    isExperienceRejected,
} from '@/components/light-experience/canisters/common';
import { LightExperienceStatus } from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { deepClone, isSame } from '@mora-light/core/types/common';
import { StringResult } from '@mora-light/core/types/common';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';
import { LightExecutingQueryResult } from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import { LightExperienceWorker } from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { Principal } from '@dfinity/principal';

const route = useRoute();
const router = useRouter();

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();
watch(
    () => agent.value,
    (nv, ov) => {
        if (ov && nv) window.location.reload();
        else if (nv) init();
    },
);
const userCanisters = computed<Record<string, string>>(
    () => store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`],
);
const userCanister = async (): Promise<string> => {
    const current_user = await currentUser();
    return userCanisters.value[current_user] ?? '';
};

const basicInfoRef = ref<{ setData: (_: LightBasicInfo) => void }>();
const lightExperienceRef = ref<{ setExperience: (_: LightExperience) => void }>();

const step = ref<'' | 'basic-info' | 'editor'>('editor');

const submitting = ref(false);

const id = ref<string>();

const status = ref<LightExperienceStatus | undefined>();

const basicInfo = ref<LightBasicInfo>(initialBasicInfo());

const content = ref<{ experience_json: string; core_json_result: StringResult<string> }>({
    experience_json: JSON.stringify(initialLightExperience()),
    core_json_result: checkLightExperience(initialLightExperience()),
});

const light_experience = ref<LightExperienceWorker>();

const updated = ref(0);
const uploaded = ref(0);
let timerId = 0;

const init = async () => {
    const current_user = await currentUser();
    const user_canister = await userCanister();
    console.info('current user', current_user);
    console.info('user_canister', user_canister);
    initialUserExperienceCanister(current_user, (canister_id: string) => {
        if (id.value !== undefined && user_canister !== canister_id)
            setTimeout(queryExperienceById, 33);
    });

    basicInfo.value = initialBasicInfo();
    content.value.experience_json = JSON.stringify(initialLightExperience());
    content.value.core_json_result = checkLightExperience(initialLightExperience());

    if (route.params['id'] !== undefined) {
        id.value = route.params['id'] as string;
        if (user_canister) {
            bus.emit('plugin-header-switch');
            step.value = 'editor';
            queryExperienceById();
        }
    }
};

const queryExperienceById = async () => {
    if (id.value === undefined) return;
    const user_canister = await userCanister();
    queryExperience(user_canister, agent.value, id.value)
        .then((d) => {
            console.error('queryExperience', d, JSON.parse(d.editing_content.experience_json));

            if (!isExperienceEditing(d.status)) {
                return;
            }
            light_experience.value = d;
            status.value = d.status;
            const info: LightBasicInfo = d.editing_info;
            basicInfo.value = info;
            basicInfoRef.value?.setData(deepClone(info));
            content.value = {
                experience_json: d.editing_content.experience_json,
                core_json_result: checkLightExperience(
                    JSON.parse(d.editing_content.experience_json),
                ),
            };
            // console.error('content.value', content.value);
            lightExperienceRef.value?.setExperience(JSON.parse(content.value.experience_json));
        })
        .catch((e) => {
            console.error('queryExperience', id.value, e);
            router.push({ name: 'lightProfileUser' });
        });
};

onMounted(() => {
    bus.on('plugin-basic-info', onBasicInfo);
    bus.on('plugin-preview', preview);
    bus.on('plugin-submit', submitPlugin);
    bus.on('plugin-save', saveDraft);

    // console.error('mounted', agent.value);
    if (agent.value) init();

    clearTimeout(timerId);
    timerId = Number(setTimeout(upload, 1000));
});

onUnmounted(() => {
    bus.off('plugin-basic-info', onBasicInfo);
    bus.off('plugin-preview', preview);
    bus.off('plugin-submit', submitPlugin);
    bus.off('plugin-save', saveDraft);
    clearTimeout(timerId);
});

const completeBasicInfo = (data: LightBasicInfo) => {
    if (data) {
        if (!isSame(basicInfo.value, data)) {
            basicInfo.value = deepClone(data);
            updateInfo();
        }
        basicInfo.value = deepClone(data);
    }

    if (step.value !== 'editor') {
        bus.emit('plugin-header-switch');
        step.value = 'editor';
    }
};

const upload = () => {
    let timeoutNum = store.state.light_save_timeout;
    if (timeoutNum === null) {
        return;
    }
    if (timeoutNum < CONFIG.autosavedInterval) {
        store.commit('SET_LIGHT_SAVE_TIMEOUT', timeoutNum + 1);
        clearTimeout(timerId);
        timerId = Number(setTimeout(upload, 1000));
    } else {
        store.commit('SET_LIGHT_SAVE_TIMEOUT', 0);
        if (updated.value === 0 || updated.value <= uploaded.value) {
            timerId = Number(setTimeout(upload, 1000));
            return;
        } else {
            uploaded.value = updated.value;
            updateInfo();
        }
    }
};

const updateInfo = () => {
    if (submitting.value) {
        return;
    }
    store.commit('SET_LIGHT_SAVE_TIMEOUT', null);
    clearTimeout(timerId);
    console.error('updateInfo', new Date());
    submitting.value = true;
    if (id.value === undefined) {
        insertLightExperience(
            agent.value,
            {
                ...basicInfo.value,
                runnable_planet: basicInfo.value.runnable_planet as any,
            },
            {
                experience_json: content.value.experience_json,
                core_json: content.value.core_json_result.ok ?? '',
            },
        )
            .then((d) => {
                console.error('insertLightExperience success', basicInfo.value, content.value, d);
                id.value = d.id;
                currentUser().then((current_user: string) => {
                    store.dispatch(`${LIGHT}/${SET_USER_EXPERIENCE_CANISTER}`, {
                        userPrincipalId: current_user,
                        canisterId: d.canister_id,
                    });
                });
                // uploaded.value = new Date().getTime();
                ElMessage.success(t('plugin.editor.newSubmitting'));
            })
            .catch((e) => {
                console.error('insertLightExperience error: ', basicInfo.value, content.value, e);
            })
            .finally(() => (submitting.value = false));
    } else if (status.value && isExperienceRejected(status.value)) {
        lightExperienceEditing(agent.value, id.value, [
            [
                {
                    ...basicInfo.value,
                    runnable_planet: basicInfo.value.runnable_planet as any,
                    tags: [],
                },
                {
                    experience_json: content.value.experience_json,
                    core_json: content.value.core_json_result.ok ?? '',
                },
            ],
        ])
            .then(() => {
                console.error('update success');
                uploaded.value = new Date().getTime();
                setTimeout(() => {
                    store.commit('SET_LIGHT_SAVE_TIMEOUT', 0);
                    timerId = Number(setTimeout(upload, 1000));
                }, CONFIG.autosavedDoneInterval);
            })
            .catch((e) => {
                console.error('updateExperience error: ', basicInfo.value, content.value, e);
            })
            .finally(() => (submitting.value = false));
    } else {
        userCanister()
            .then((user_canister) => {
                return updateExperience(
                    user_canister,
                    agent.value,
                    id.value!,
                    {
                        ...basicInfo.value,
                        runnable_planet: basicInfo.value.runnable_planet as any,
                        tags: [],
                    },
                    {
                        experience_json: content.value.experience_json,
                        core_json: content.value.core_json_result.ok ?? '',
                    },
                );
            })
            .then(() => {
                console.error('update success');
                uploaded.value = new Date().getTime();
                setTimeout(() => {
                    store.commit('SET_LIGHT_SAVE_TIMEOUT', 0);
                    timerId = Number(setTimeout(upload, 1000));
                }, CONFIG.autosavedDoneInterval);
            })
            .catch((e) => {
                console.error('updateExperience error: ', basicInfo.value, content.value, e);
            })
            .finally(() => (submitting.value = false));
    }
};

const onBasicInfo = () => {
    step.value = 'basic-info';
};

const isShowPreview = ref(false);
const previewData = ref<LightExecutingQueryResult>();
const preview = async () => {
    if (content.value.core_json_result.err) {
        ElMessage.error(`Light is invalid: ${content.value.core_json_result.err}`);
        return;
    }
    let returnInput = JSON.parse(content.value.experience_json)?.shows;
    if (!returnInput.length) {
        ElMessage.error(t('plugin.actionEditor.returnInputEmpty'));
        return;
    }
    const current_user = await currentUser();
    previewData.value = {
        value: {
            hash: '',
            id: id.value ?? '',
            created: light_experience.value?.created ?? BigInt(`${new Date().getTime() * 1000000}`),
            creator: Principal.fromText(current_user),
            updated: light_experience.value?.updated ?? BigInt(`${new Date().getTime() * 1000000}`),
            info_json: JSON.stringify(basicInfo.value),
            core_json: content.value.core_json_result.ok!,
            audited: BigInt(`${new Date().getTime() * 1000000}`),
            auditor: Principal.fromText('aaaaa-aa'),
        },
    };
    isShowPreview.value = true;
};
const onPreviewClose = () => {
    isShowPreview.value = false;
};

const isShowSubmitAudit = ref(false);
const submitPlugin = () => {
    if (content.value.core_json_result.err) {
        ElMessage.error(content.value.core_json_result.err);
    } else {
        if (updated.value > uploaded.value) {
            ElMessage.error('Please save draft.');
        } else if (submitting.value) {
            ElMessage.error('Please waiting for saving draft.');
        } else {
            isShowSubmitAudit.value = true;
        }
    }
};
const completeSubmitAudit = () => {
    isShowSubmitAudit.value = false;
};

const saveDraft = () => {
    updateInfo();
};

const onExperienceChanged = (experience_json: string, core_json_result: StringResult<string>) => {
    console.error('onExperienceChanged');
    // console.error('content.value', content.value);
    // console.error('experience_json1', content.value.experience_json);
    // console.error('core_json1', content.value.core_json);
    // console.error('experience_json2', experience_json);
    // console.error('core_json2', core_json);
    if (
        content.value.experience_json === experience_json &&
        JSON.stringify(content.value.core_json_result) === JSON.stringify(core_json_result)
    ) {
        return;
    }
    console.error('onExperienceChanged 2');
    content.value.experience_json = experience_json;
    content.value.core_json_result = core_json_result;
    updated.value = new Date().getTime();
};
</script>

<style lang="less" scoped>
.create-box {
    .center();
    width: 100%;
    height: 100%;
    flex-direction: column;
}

.error {
    position: absolute;
    color: @color-error;
    left: 300px;
    top: 10px;
    height: 32px;
    .center();
    border: 1px solid #f96161;
    border-radius: 8px;
    padding: 0 10px;
    box-sizing: border-box;
    font-size: 14px;

    .icon-failed {
        font-size: 16px;
        color: #f87373;
        margin-right: 8px;
    }
}
</style>
<style>
.splitpanes__splitter {
    background-color: #e8e8e8;
    position: relative;
    @apply dark: (bg-dark-100);
}

.splitpanes__splitter:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    transition: opacity 0.4s;
    opacity: 0;
    z-index: 1;
}

.splitpanes__splitter:hover:before {
    opacity: 1;
}

.splitpanes--vertical > .splitpanes__splitter:before {
    left: -5px;
    right: -5px;
    height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
    top: -5px;
    bottom: -5px;
    width: 100%;
}
</style>
