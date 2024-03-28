<script lang="ts" setup>
import { PropType, ref, computed, watch, nextTick } from 'vue';
import {
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionArgRecord,
    getInitialCanisterActionArg,
} from '../../../../../types/parts/canisters';
import {
    ActionValues,
    findExportedValueNameByActionValues,
} from '../../../../../types/common/value';
import ChooseValueDialogVue from '../../../../modules/values/ChooseValueDialog.vue';
import WrappedArgEditingVue from '../WrappedArgEditing.vue';
import {
    RecordCandidType,
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
        type: Object as PropType<RecordCandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgForce | CanisterActionArgRecord>,
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

const length = computed<number>(() => props.type.subitems.length);
const args = ref<CanisterActionArg[]>(
    props.arg.subitems ??
    (() => {
        const subitems: CanisterActionArg[] = [];
        for (let i = 0; i < length.value; i++) {
            subitems[i] = getInitialCanisterActionArg(
                props.type.subitems[i].type,
                props.recItems,
            );
        }
        return subitems;
    })(),
);
const refresh = ref(true);

const onExpandComplete = () => {
    const recordArg: CanisterActionArgRecord = {
        type: deepClone(props.type),
        subitems: args.value,
    };
    emit('complete', recordArg);
};

watch(
    () => expand.value,
    () => {
        if (expand.value && id.value) id.value = '';
        if (expand.value) {
            args.value = (() => {
                const subitems: CanisterActionArg[] = [];
                for (let i = 0; i < length.value; i++) {
                    subitems[i] = getInitialCanisterActionArg(
                        props.type.subitems[i].type,
                        props.recItems,
                    );
                }
                return subitems;
            })();
        }
        onExpandComplete();
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);

const onArgItemComplete = (index: number, r: CanisterActionArg) => {
    args.value[index] = r;
    onExpandComplete();
};
</script>

<template>
    <div class="record-arg-editing-content">
        <div class="main-type">
            <!-- <span class="type"> {{ unwrapCandidType(props.type) }} </span> -->
            <span class="type">
                {{ props.type.type }}
                <i>Record { {{ props.type.subitems.length }} fields}</i>
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
                <i :class="{ open: !expand }" class="iconfont icon-plugin-aup"></i>
            </span>
        </div>
        <div class="expand-list" v-if="expand">
            <div class="items" v-if="refresh">
                <div class="item" v-for="i in length">
                    <span>{{ props.type.subitems[i - 1].key }}</span>
                    <WrappedArgEditingVue :values="props.values" :recItems="props.recItems"
                        :type="props.type.subitems[i - 1].type" :arg="args[i - 1]"
                        @complete="(r) => onArgItemComplete(i - 1, r)" />
                </div>
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

.record-arg-editing-content {
    // width: 100%;
}
</style>
