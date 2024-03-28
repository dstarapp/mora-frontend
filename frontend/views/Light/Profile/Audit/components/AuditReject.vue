<template>
    <el-dialog style="width: 596px" class="headerMargin" :title="$t('plugin.audit.reject')" v-model="props.show"
        @closed="onDialogClose">
        <div class="audit-reject-box">
            <el-input v-model="reason" type="textarea" resize="none" maxlength="500"
                :placeholder="$t('plugin.audit.rejectPlaceholder')" />
            <div class="reject" :class="{ disabled: isLoading || !reason }" @click="onReject">
                <img v-if="isLoading" src="@/assets/svg/loading.svg" alt="" />
                {{ $t('plugin.generic.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, PropType } from 'vue';
import { lightExperienceRejected } from '@/components/light-experience/canisters/experience_manager/apis';
import { Agent } from '@dfinity/agent';
import { StringResult } from '@mora-light/core/types/common';
import { LightBasicInfo } from '@/components/light-experience/types/core';
import store, { LIGHT } from '@/store';
import { LightExperienceStatus } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import { LightCoreContent } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    lightID: {
        type: String,
        required: true,
    },
    info: {
        type: Object as PropType<LightBasicInfo>,
        required: true,
    },
    content: {
        type: Object as PropType<{
            experience_json: string;
            core_json_result: StringResult<string>;
        }>,
        required: true,
    },
    status: {
        type: Object as PropType<LightExperienceStatus>,
        required: true,
    },
});

const agent = computed<Agent>(() => store.state.agent);

const reason = ref<string>('');
const isLoading = ref(false);

const onDialogClose = () => emit('complete');

const emit = defineEmits(['complete']);

const onReject = () => {
    if (isLoading.value) {
        return;
    }
    if (!reason.value) {
        return;
    }
    isLoading.value = true;
    // let str: LightCoreContent = {
    //     id: props.lightID,
    //     info_json: JSON.stringify(props.info),
    //     core_json: props.content.core_json_result.ok as string,
    //     experience_json: props.content.experience_json,
    // };
    lightExperienceRejected(
        agent.value,
        props.lightID,
        props.status['Auditing']?.hash ?? '',
        reason.value,
    )
        .then((res) => {
            emit('complete', true);
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            isLoading.value = false;
        });
};
</script>

<style lang="less" scoped>
.audit-reject-box {
    display: flex;
    flex-direction: column;

    :deep(.el-input),
    :deep(.el-textarea) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);

        .el-input__inner,
        .el-textarea__inner {
            color: #666;
            text-align: left;
            font-size: 14px;
            padding: 16px 20px;
            @apply dark:(text-light-900/80);
            height: 161px;
        }
    }

    .reject {
        width: 100%;
        height: 48px;
        margin-top: 30px;
        background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
        border-radius: 10px;
        .center();
        font-weight: 400;
        font-size: 16px;
        color: #000000;
        cursor: pointer;

        img {
            margin-right: 5px;
        }

        &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
</style>
