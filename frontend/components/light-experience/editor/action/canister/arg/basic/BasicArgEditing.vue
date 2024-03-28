<script lang="ts" setup>
import { PropType, ref, computed, watch } from 'vue';
import { CanisterActionArgForce } from '../../../../../types/parts/canisters';
import {
    ActionValues,
    findExportedValueNameByActionValues,
} from '../../../../../types/common/value';
import ChooseValueDialogVue from '../../../../modules/values/ChooseValueDialog.vue';
import { CandidType, isSameCandidType, unwrapCandidType } from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgForce>,
        required: true,
    },
});

const needs = (type: CandidType): CandidType | undefined => {
    if (isSameCandidType(type, props.type)) return props.type;
    return undefined;
};

const id = ref<string>(
    findExportedValueNameByActionValues(props.values, props.arg.id, props.type) ? props.arg.id : '',
);
const name = computed<string>(() =>
    findExportedValueNameByActionValues(props.values, props.arg.id, props.type),
);

const emit = defineEmits(['complete']);

watch(
    () => id.value,
    () => {
        emit('complete', { type: deepClone(props.type), id: id.value });
    },
    { immediate: true },
);

const chooseValueShow = ref(false);
const onSelectValue = () => (chooseValueShow.value = true);
const onDeleteValue = () => {
    id.value = '';
};
const onChooseValueComplete = (r: { id: string; type: CandidType } | undefined) => {
    chooseValueShow.value = false;
    id.value = r?.id ?? id.value;
};
</script>

<template>
    <div class="basic-arg-editing-content">
        <div class="main-type">
            <span class="type">
                {{ unwrapCandidType(props.type) }}
            </span>
            <span class="select" v-if="!id && !name" @click="onSelectValue">
                <i class="iconfont icon-plugin-add"></i>
            </span>
            <div class="add-success" v-if="id && name">
                <span class="name">
                    {{ name }}
                </span>
                <span class="delete" @click="onDeleteValue">
                    <i class="iconfont icon-failed"></i>
                </span>
            </div>
        </div>
        <template v-if="chooseValueShow">
            <ChooseValueDialogVue :show="chooseValueShow" :values="props.values" :chosen="[]" :needs="needs"
                @complete="onChooseValueComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
@import '../public.less';

.basic-arg-editing-content {
    width: 100%;
}
</style>
