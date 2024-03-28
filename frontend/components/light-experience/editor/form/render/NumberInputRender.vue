<script lang="ts" setup>
import { PropType, ref, watch, nextTick } from 'vue';
import { InputValue } from '../../../types/parts/inputs';
import { NumberInputComponentUI } from '../../../types/parts/form/number';
import BigIntInputRenderVue from './numbers/BigIntInputRender.vue';
import IntegerInputRenderVue from './numbers/IntegerInputRender.vue';
import FloatInputRenderVue from './numbers/FloatInputRender.vue';

const props = defineProps({
    disabled: {
        type: Boolean,
        required: true,
    },
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<NumberInputComponentUI>,
        required: true,
    },
});

const refresh = ref(true);

watch(
    () => props.ui.style,
    () => {
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);
</script>

<template>
    <div class="number-input-render-content">
        <template v-if="refresh">
            <template v-if="['nat', 'int', 'nat64', 'int64'].includes(props.ui.style.type)">
                <BigIntInputRenderVue :disabled="props.disabled" :data="props.data" :ui="(props.ui as any)" />
            </template>
            <template v-else-if="['nat8', 'nat16', 'nat32', 'int8', 'int16', 'int32'].includes(
            props.ui.style.type,
        )
            ">
                <IntegerInputRenderVue :disabled="props.disabled" :data="props.data" :ui="(props.ui as any)" />
            </template>
            <template v-else-if="['float32', 'float64'].includes(props.ui.style.type)">
                <FloatInputRenderVue :disabled="props.disabled" :data="props.data" :ui="(props.ui as any)" />
            </template>
        </template>
    </div>
</template>

<style lang="less" scoped>
.number-input-render-content {
    width: 100%;
}
</style>
