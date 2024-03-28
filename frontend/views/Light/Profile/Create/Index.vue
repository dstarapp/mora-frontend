<template>
    <div class="create-box">
        <BasicInfoVue :is-loading="isLoading" ref="basicInfoRef" @complete="completeBasicInfo" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import BasicInfoVue from './components/BasicInfo.vue';
import store, { LIGHT } from '@/store';
import { insertLightExperience } from '@/components/light-experience/canisters/experience_manager/apis';
import { useRouter } from 'vue-router';
import { Agent } from '@dfinity/agent';
import { LightBasicInfo } from '@/components/light-experience/types/core';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import debug from '@/utils/debug';
import { SET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import { initialLightExperience } from '@/components/light-experience/types/core';
import { checkLightExperience } from '@/components/light-experience/types/common/checks';

const router = useRouter();

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();

const isLoading = ref(false);
const basicInfoRef = ref<{ setData: (_: LightBasicInfo) => void }>();

const basicInfo = ref<LightBasicInfo>({
    name: '',
    cover: '',
    thumbnail: '',
    categories: [],
    tags: [],
    runnable_planet: { All: null },
    instruction: '',
});

const completeBasicInfo = async (data: LightBasicInfo) => {
    if (data) {
        isLoading.value = true;
        const current_user = await currentUser();
        insertLightExperience(
            agent.value,
            {
                ...data,
                runnable_planet: basicInfo.value.runnable_planet as any,
            },
            {
                experience_json: JSON.stringify(initialLightExperience()),
                core_json: checkLightExperience(initialLightExperience()).ok ?? '',
            },
        )
            .then((d) => {
                if (d.id) {
                    store.dispatch(`${LIGHT}/${SET_USER_EXPERIENCE_CANISTER}`, {
                        userPrincipalId: current_user,
                        canisterId: d.canister_id,
                    });
                    router.push({
                        name: 'lightProfileEdit',
                        params: {
                            id: d.id,
                        },
                    });
                }
            })
            .catch((e) => {
                console.debug('🚀 ~ file: Index.vue:73 ~ completeBasicInfo ~ e:', e);
                ElMessage.error(`${t('plugin.variableTip.createFailed')}${e}`);
            })
            .finally(() => (isLoading.value = false));
    }
};
</script>

<style lang="less" scoped>
.create-box {
    .center();
    width: 100%;
    height: 100%;
    flex-direction: column;
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

.splitpanes--vertical>.splitpanes__splitter:before {
    left: -5px;
    right: -5px;
    height: 100%;
}

.splitpanes--horizontal>.splitpanes__splitter:before {
    top: -5px;
    bottom: -5px;
    width: 100%;
}
</style>
