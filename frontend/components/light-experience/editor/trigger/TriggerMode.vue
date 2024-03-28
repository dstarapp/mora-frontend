<script lang="ts" setup>
import { inject, Ref, watch, ref } from 'vue';
import { InputValue } from '../../types/parts/inputs';
import TriggerModeEditingVue from './TriggerModeEditing.vue';
import { TriggerMode } from '@mora-light/core/types/trigger';

const inputs = inject<Ref<InputValue[]>>('INPUTS')!;

const trigger = inject<Ref<TriggerMode>>('TRIGGER')!;
const setTrigger = inject<(mode: TriggerMode) => void>('TRIGGER_SET')!;

watch(
    () => inputs.value,
    () => {
        if (inputs.value.length && trigger.value.type !== 'button') {
            setTrigger({ type: 'button', text: 'Run', loading: false });
        }
    },
);

const showEditing = ref(false);
const onEdit = () => (showEditing.value = true);
const onComplete = (mode: TriggerMode | undefined) => {
    showEditing.value = false;
    if (mode !== undefined) {
        setTrigger(mode);
    }
};
</script>

<template>
    <div class="trigger-mode-content">
        <div class="title">
            <p>Trigger Mode </p>
            <span @click="onEdit">
                <i class="iconfont icon-setting"></i>
            </span>
        </div>
        <div class="trigger-modes">
            <template v-if="trigger.type === 'loading'">
                <i class="iconfont icon-plugin-page"></i>
                <div class="loading">{{ $t('plugin.trigger.type.loading') }}</div>
            </template>
            <template v-if="trigger.type === 'button'">
                <i class="iconfont icon-plugin-btn"></i>
                <div class="button">{{ $t('plugin.trigger.type.button') }}</div>
            </template>
            <template v-if="trigger.type === 'clock'">
                <i class="iconfont icon-plugin-clock"></i>
                <div class="clock">{{ `${trigger.sleep / 1000}s` }}</div>
            </template>
        </div>
    </div>
    <template v-if="showEditing">
        <TriggerModeEditingVue :show="showEditing" :button="inputs.length > 0" :trigger="trigger"
            @complete="onComplete" />
    </template>
</template>

<style lang="less" scoped>
.trigger-mode-content {
    border-top: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 0 15px;
    @apply dark:(border-dark-100);

    .title {
        padding-top: 7px;
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;

        p {
            font-weight: 500;
            font-size: 14px;
            line-height: 25px;
            color: #000000;
            @apply dark:(text-light-900);
        }

        span {
            margin-left: 11px;

            .icon-setting {
                color: #4c4f6b;
                font-size: 14px;
                cursor: pointer;
                @apply dark:(text-light-900/80);
            }
        }
    }

    .trigger-modes {
        display: flex;
        margin-top: 4px;
        width: 100%;

        i {
            color: #999;
            font-size: 14px;
            margin-right: 8px;
            .center();
        }

        div {
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            color: #666666;
            @apply dark:(text-light-900/60);
        }
    }
}
</style>
