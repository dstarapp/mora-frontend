<script lang="ts" setup>
import { PropType } from 'vue';
import { InputValue } from '../../types/parts/inputs';
import TextInputEditingVue from './editing/TextInputEditing.vue';
import NumberInputEditingVue from './editing/NumberInputEditing.vue';
import SwitchInputEditingVue from './editing/SwitchInputEditing.vue';
import DropdownInputEditingVue from './editing/DropdownInputEditing.vue';
import TimeInputEditingVue from './editing/TimeInputEditing.vue';

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
});
const emit = defineEmits(['complete']);
const onComplete = (r: InputValue | undefined) => emit('complete', r);
</script>

<template>
    <div class="form-editing-content">
        <template v-if="props.data.ui.type === 'TextInputComponent'">
            <TextInputEditingVue :data="props.data" :ui="props.data.ui" @complete="onComplete" />
        </template>
        <template v-if="props.data.ui.type === 'NumberInputComponent'">
            <NumberInputEditingVue :data="props.data" :ui="props.data.ui" @complete="onComplete" />
        </template>
        <template v-if="props.data.ui.type === 'SwitchInputComponent'">
            <SwitchInputEditingVue :data="props.data" :ui="props.data.ui" @complete="onComplete" />
        </template>
        <template v-if="props.data.ui.type === 'DropdownInputComponent'">
            <DropdownInputEditingVue
                :data="props.data"
                :ui="props.data.ui"
                @complete="onComplete"
            />
        </template>
        <template v-if="props.data.ui.type === 'TimeInputComponent'">
            <TimeInputEditingVue :data="props.data" :ui="props.data.ui" @complete="onComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.form-editing-content {
    width: 100%;
}
</style>
