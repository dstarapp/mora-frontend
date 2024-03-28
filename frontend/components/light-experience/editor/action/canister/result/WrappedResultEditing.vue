<script lang="ts" setup>
import { nextTick, PropType, ref, watch } from 'vue';
import { CanisterActionResult } from '../../../../types/parts/canisters';
import { ActionValues } from '../../../../types/common/value';
import BasicResultEditingVue from './basic/BasicResultEditing.vue';
import RecordResultEditingVue from './combined/RecordResultEditing.vue';
import TupleResultEditingVue from './combined/TupleResultEditing.vue';
import { CandidType } from '@mora-light/core/types/candid';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    result: {
        type: Object as PropType<CanisterActionResult>,
        required: true,
    },
});

const refresh = ref(true);
watch(
    () => props.type,
    () => {
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);

const emit = defineEmits(['complete']);

const onComplete = (r: CanisterActionResult) => {
    emit('complete', r);
};
</script>

<template>
    <div class="wrapped-result-editing-content" v-if="refresh">
        <template v-if="[
            'bool',
            'nat',
            'int',
            'nat8',
            'nat16',
            'nat32',
            'nat64',
            'int8',
            'int16',
            'int32',
            'int64',
            'float32',
            'float64',
            'null',
            'text',
            'principal',
        ].includes(props.type.type)
        ">
            <BasicResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
        <template v-else-if="['vec', 'opt'].includes(props.type.type)">
            <BasicResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
        <template v-else-if="props.type.type === 'record'">
            <RecordResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
        <template v-else-if="['variant'].includes(props.type.type)">
            <BasicResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
        <template v-else-if="props.type.type === 'tuple'">
            <TupleResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
        <template v-else-if="['rec', 'unknown', 'empty', 'reserved', 'func', 'service'].includes(props.type.type)
        ">
            <BasicResultEditingVue :values="props.values" :type="props.type" :result="(props.result as any)"
                @complete="onComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.wrapped-result-editing-content {
    width: 100%;
    display: flex;
}
</style>
