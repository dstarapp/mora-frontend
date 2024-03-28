<script lang="ts" setup>
import { PropType, ref, nextTick, watch } from 'vue';
import { CanisterActionArg } from '../../../../types/parts/canisters';
import { ActionValues } from '../../../../types/common/value';
import { CandidType, RecItem, MainRecCandidType } from '@mora-light/core/types/candid';
import BasicArgEditingVue from './basic/BasicArgEditing.vue';
import VecArgEditingVue from './combined/VecArgEditing.vue';
import OptArgEditingVue from './combined/OptArgEditing.vue';
import RecordArgEditingVue from './combined/RecordArgEditing.vue';
import VariantArgEditingVue from './combined/VariantArgEditing.vue';
import TupleArgEditingVue from './combined/TupleArgEditing.vue';
import RecArgEditingVue from './combined/RecArgEditing.vue';
import { same } from '@mora-light/core/types/common';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    recItems: {
        type: Array as PropType<RecItem[]>,
        required: true, // The type that once appeared
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArg>,
        required: true,
    },
});

const refresh = ref(true);
watch(
    () => props.type,
    (nv, ov) => {
        if (same(nv, ov)) return;
        console.error('wrapped argument', props.type);
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);

const emit = defineEmits(['complete']);

const onComplete = (r: CanisterActionArg) => {
    emit('complete', r);
};
</script>

<template>
    <div class="wrapped-arg-editing-content" v-if="refresh">
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
            <BasicArgEditingVue :values="props.values" :type="props.type" :arg="(props.arg as any)"
                @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'vec'">
            <VecArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type"
                :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'opt'">
            <OptArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type"
                :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'record'">
            <RecordArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type"
                :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'variant'">
            <VariantArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type"
                :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'tuple'">
            <TupleArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type"
                :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-if="props.type.type === 'rec'">
            <RecArgEditingVue :values="props.values" :recItems="props.type.subtype !== undefined
            ? [...props.recItems, { id: props.type.id!, type: props.type as MainRecCandidType }]
            : props.recItems
        " :type="props.type" :arg="(props.arg as any)" @complete="onComplete" />
        </template>
        <template v-else-if="['rec', 'unknown', 'empty', 'reserved', 'func', 'service'].includes(props.type.type)
        ">
            <BasicArgEditingVue :values="props.values" :type="props.type" :arg="(props.arg as any)"
                @complete="onComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.wrapped-arg-editing-content {
    width: 100%;
    display: flex;
}
</style>
