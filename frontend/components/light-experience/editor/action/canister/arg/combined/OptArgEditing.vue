<script lang="ts" setup>
import { PropType, ref, computed, watch, nextTick } from 'vue';
import {
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionArgOpt,
    getInitialCanisterActionArg,
} from '../../../../../types/parts/canisters';
import {
    ActionValues,
    findExportedValueNameByActionValues,
} from '../../../../../types/common/value';
import ChooseValueDialogVue from '../../../../modules/values/ChooseValueDialog.vue';
import WrappedArgEditingVue from '../WrappedArgEditing.vue';
import {
    OptCandidType,
    CandidType,
    RecItem,
    isSameCandidType,
} from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

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
        type: Object as PropType<OptCandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgForce | CanisterActionArgOpt>,
        required: true,
    },
});

const needs = (type: CandidType): CandidType | undefined => {
    if (isSameCandidType(type, props.type)) return props.type;
    return undefined;
};

const expand = ref<boolean>(props.arg.id === undefined);
const emit = defineEmits(['complete']);

const id = ref<string>(
    findExportedValueNameByActionValues(props.values, props.arg.id ?? '', props.type)
        ? props.arg.id ?? ''
        : '',
);
const name = computed<string>(() =>
    findExportedValueNameByActionValues(props.values, props.arg.id ?? '', props.type),
);
watch(
    () => id.value,
    () => {

        if (!expand.value) {
            emit('complete', { type: deepClone(props.type), id: id.value });
        }
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
    if (r?.id) expand.value = false;
    id.value = r?.id ?? id.value;
};

const has = ref<boolean>(props.arg.constant === 1);
const arg = ref<CanisterActionArg>(
    props.arg.value ?? getInitialCanisterActionArg(props.type.subtype, props.recItems),
);
const refresh = ref(true);

const onExpandComplete = () => {
    if (has.value) {
        const optArg: CanisterActionArgOpt = {
            type: deepClone(props.type),
            constant: 1,
            value: arg.value,
        };
        emit('complete', optArg);
    } else {
        const optArg: CanisterActionArgOpt = {
            type: deepClone(props.type),
            constant: 0,
        };
        emit('complete', optArg);
    }
};

watch(
    () => expand.value,
    () => {
        if (expand.value && id.value) id.value = '';
        if (expand.value) {
            has.value = true;
            arg.value = getInitialCanisterActionArg(props.type.subtype, props.recItems);
        }
        onExpandComplete();
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);
watch(
    () => has.value,
    () => {
        expand.value = true;
        onExpandComplete();
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
    { immediate: true },
);
const onArgComplete = (r: CanisterActionArg) => {
    arg.value = r;
    onExpandComplete();
};
</script>

<template>
    <div class="opt-arg-editing-content">
        <div class="main-type">
            <!-- <span class="type"> {{ unwrapCandidType(props.type) }} </span> -->
            <span class="type">
                {{ props.type.type }}
            </span>
            <span class="select" @click="onSelectValue">
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
            <span class="expand" @click="expand = !expand">
                <i :class="{ open: expand }" class="iconfont icon-plugin-aup"></i>
            </span>
            <div class="input" v-if="expand">
                <el-switch v-model="has" size="small" active-color="#34d399" inactive-color="#dddddd" />
            </div>
        </div>
        <div class="expand-list" v-if="expand">
            <div class="items" v-if="refresh && has">
                <WrappedArgEditingVue :values="props.values" :recItems="props.recItems" :type="props.type.subtype"
                    :arg="arg" @complete="onArgComplete" />
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

.opt-arg-editing-content {
    // width: 100%;
}
</style>
