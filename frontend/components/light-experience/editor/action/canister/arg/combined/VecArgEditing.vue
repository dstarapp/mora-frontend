<script lang="ts" setup>
import { PropType, ref, computed, watch, nextTick } from 'vue';
import {
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionArgVec,
    getInitialCanisterActionArg,
} from '../../../../../types/parts/canisters';
import {
    ActionValues,
    findExportedValueNameByActionValues,
} from '../../../../../types/common/value';
import ChooseValueDialogVue from '../../../../modules/values/ChooseValueDialog.vue';
import WrappedArgEditingVue from '../WrappedArgEditing.vue';
import {
    CandidType,
    VecCandidType,
    RecItem,
    isSameCandidType,
} from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';
import { v4 as uuid } from 'uuid';

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
        type: Object as PropType<VecCandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgForce | CanisterActionArgVec>,
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

const length = ref<number>(props.arg.constant ?? 0);
const args = ref<CanisterActionArg[]>(props.arg.subitems ?? []);
const refresh = ref(true);

const onExpandComplete = () => {
    if (length.value === 0) {
        const vecArg: CanisterActionArgVec = {
            type: deepClone(props.type),
            constant: 0,
        };
        emit('complete', vecArg);
    }
    const subitems: CanisterActionArg[] = [];
    for (let i = 0; i < length.value; i++) {
        if (args.value[i] !== undefined) subitems[i] = args.value[i]!;
        else subitems[i] = getInitialCanisterActionArg(props.type.subtype, props.recItems);
    }
    const vecArg: CanisterActionArgVec = {
        type: deepClone(props.type),
        constant: length.value,
        subitems,
        using: uuid(),
    };
    emit('complete', vecArg);
};

watch(
    () => expand.value,
    () => {
        if (expand.value && id.value) {
            id.value = '';
            length.value = 0;
            args.value = [];
            onExpandComplete();
        }
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);
watch(
    () => length.value,
    () => {
        for (let i = 0; i < length.value; i++) {
            if (args.value[i] === undefined) {
                args.value[i] = getInitialCanisterActionArg(props.type.subtype, props.recItems);
            }
        }
        onExpandComplete();
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
    { immediate: true },
);
const onArgItemComplete = (index: number, r: CanisterActionArg) => {
    args.value[index] = r;
    onExpandComplete();
};
</script>

<template>
    <div class="vec-arg-editing-content">
        <div class="main-type">
            <!-- <span class="type">
                {{ unwrapCandidType(props.type) }}
            </span> -->
            <!-- {{ props }} -->
            <span class="type">
                {{ props.type.type }}
                <i v-if="props?.type?.subtype?.subitems?.length">
                    Vec { {{ props?.type?.subtype?.subitems?.length }} fields}
                </i>
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
                <div class="add" @click="length += 1" v-if="length < 100"> + </div>
                <div class="decrease" @click="length -= 1" v-if="length > 0"> - </div>
            </div>
        </div>
        <div class="expand-list" v-if="expand">
            <div class="items" v-if="refresh">
                <template v-if="length">
                    <div class="item" v-for="i in length">
                        <span>{{ i }}.</span>
                        <WrappedArgEditingVue :values="props.values" :recItems="props.recItems"
                            :type="props.type.subtype" :arg="args[i - 1] ??
                    getInitialCanisterActionArg(props.type.subtype, props.recItems)
                    " @complete="(r) => onArgItemComplete(i - 1, r)" />
                    </div>
                </template>
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

.vec-arg-editing-content {
    width: 100%;
}
</style>
