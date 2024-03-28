<script lang="ts" setup>
import { PropType } from 'vue';
import { InputValue } from '../../types/parts/inputs';
import TextInputRenderVue from './render/TextInputRender.vue';
import NumberInputRenderVue from './render/NumberInputRender.vue';
import SwitchInputRenderVue from './render/SwitchInputRender.vue';
import DropdownInputRenderVue from './render/DropdownInputRender.vue';
import TimeInputRenderVue from './render/TimeInputRender.vue';

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
});
</script>

<template>
    <div class="form-render-content">
        <template v-if="props.data.ui.type === 'TextInputComponent'">
            <TextInputRenderVue :disabled="true" :data="props.data" :ui="props.data.ui" />
        </template>
        <template v-if="props.data.ui.type === 'NumberInputComponent'">
            <NumberInputRenderVue :disabled="true" :data="props.data" :ui="props.data.ui" />
        </template>
        <template v-if="props.data.ui.type === 'SwitchInputComponent'">
            <SwitchInputRenderVue :disabled="true" :data="props.data" :ui="props.data.ui" />
        </template>
        <template v-if="props.data.ui.type === 'DropdownInputComponent'">
            <DropdownInputRenderVue :disabled="true" :data="props.data" :ui="props.data.ui" />
        </template>
        <template v-if="props.data.ui.type === 'TimeInputComponent'">
            <TimeInputRenderVue :disabled="true" :data="props.data" :ui="props.data.ui" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.form-render-content {
    width: 100%;
    :deep(.text-input-render-content),
    :deep(.number-input-render-content),
    :deep(.dropdown-input-render-content),
    :deep(.time-input-render-content),
    :deep(.switch-input-render-content) {
        .con {
            .label {
                @apply !w-25 !text-left !justify-start;
            }
        }
    }
    :deep(.switch-input-render-content) {
        .con {
            @apply !justify-start;
        }
    }
}
</style>
