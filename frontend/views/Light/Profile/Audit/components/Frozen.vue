<template>
    <el-dialog style="width: 596px" :title="$t('plugin.audit.frozen.title')" v-model="props.show"
        @closed="onDialogClose">
        <div class="frozen-box">
            <el-input v-model="lightId" type="text" :placeholder="$t('plugin.audit.frozen.lightIdPlaceholder')" />
            <el-input v-model="reason" type="textarea" resize="none" maxlength="500"
                :placeholder="$t('plugin.audit.frozen.frozenPlaceholder')" />
            <div class="submit" @click="onFrozen" :class="{ disabled: isLoading }">
                <img v-if="isLoading" src="@/assets/svg/loading.svg" alt="" />
                {{ $t('plugin.profileUser.frozen') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, PropType } from 'vue';
import { Agent } from '@dfinity/agent';
import store from '@/store';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { lightExperienceFrozen } from '@/components/light-experience/canisters/experience_manager/apis';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
});

const agent = computed<Agent>(() => store.state.agent);
const isLoading = ref(false);

const reason = ref();

const lightId = ref();

const onDialogClose = () => emit('complete');

const emit = defineEmits(['complete']);

const onFrozen = () => {
    if (isLoading.value) {
        return;
    }
    if (!lightId.value) {
        ElMessage.error(t('plugin.audit.frozen.lightIdError'));
        return;
    }
    if (!reason.value) {
        ElMessage.error(t('plugin.audit.frozen.reasonError'));
        return;
    }
    isLoading.value = true;

    lightExperienceFrozen(agent.value, lightId.value, reason.value)
        .then((res) => {
            ElMessage.success(t('plugin.audit.frozen.success'));
            emit('complete');
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
.frozen-box {
    display: flex;
    flex-direction: column;

    :deep(.el-input) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);

        &.is-disabled {
            .el-input__wrapper {
                box-shadow: none;
            }
        }

        .el-input__wrapper {
            padding: 0 10px;
            height: 36px;
            line-height: 36px;
            border-radius: 6px;

            .el-input__inner {
                color: #666;
                text-align: left;
                font-size: 14px;
                @apply dark:(text-light-900/80);
            }
        }
    }

    :deep(.el-textarea) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        margin-top: 15px;
        @apply dark:(border-dark-100);

        .el-input__inner,
        .el-textarea__inner {
            height: 161px;
        }
    }

    .submit {
        .center();
        background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
        height: 44px;
        border-radius: 10px;
        margin-top: 15px;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        color: #000000;
        cursor: pointer;

        img {
            width: 16px;
            height: 16px;
            margin-right: 5px;
        }

        &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
</style>
