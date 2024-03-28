<script lang="ts" setup>
import { PropType, ref, computed, watch, nextTick } from 'vue';
import {
    CanisterActionArg,
    CanisterActionArgForce,
    CanisterActionArgVariant,
    getInitialCanisterActionArg,
} from '../../../../../types/parts/canisters';
import {
    ActionValues,
    findExportedValueNameByActionValues,
} from '../../../../../types/common/value';
import ChooseValueDialogVue from '../../../../modules/values/ChooseValueDialog.vue';
import WrappedArgEditingVue from '../WrappedArgEditing.vue';
import {
    VariantCandidType,
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
        type: Object as PropType<VariantCandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgForce | CanisterActionArgVariant>,
        required: true,
    },
});

const needs = (type: CandidType): CandidType | undefined => {
    if (isSameCandidType(type, props.type)) return props.type;
    return undefined;
};

const expand = ref<boolean>(props.arg.id === undefined);
const emit = defineEmits(['complete']);
const hasItems = computed(() => props.type.subitems.length > 0);

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

const getInitialSelect = () => {
    if (hasItems.value) return props.type.subitems[0].key;
    return '';
};
const getInitialArg = (): CanisterActionArg => {
    for (let i = 0; i < props.type.subitems.length; i++) {
        if (props.type.subitems[i].key === select.value) {
            return getInitialCanisterActionArg(props.type.subitems[i].type, props.recItems);
        }
    }
    return getInitialCanisterActionArg(props.type, props.recItems, true);
};
const options = computed<string[]>(() => props.type.subitems.map((item) => item.key));
const select = ref<string>(props.arg.constant ?? getInitialSelect());
const subtype = computed<CandidType | undefined>(() => {
    for (let i = 0; i < props.type.subitems.length; i++) {
        if (props.type.subitems[i].key === select.value) {
            return deepClone(props.type.subitems[i].type);
        }
    }
    return undefined;
});
const arg = ref<CanisterActionArg>(props.arg.value ?? getInitialArg());
const refresh = ref(true);

const onExpandComplete = () => {
    const variantArg: CanisterActionArgVariant = {
        type: deepClone(props.type),
        constant: select.value,
        value: arg.value,
    };
    emit('complete', variantArg);
};
watch(
    () => expand.value,
    () => {
        if (expand.value && id.value) id.value = '';
        if (expand.value) {
            select.value = getInitialSelect();
            arg.value = getInitialArg();
        }
        onExpandComplete();
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);
watch(
    () => select.value,
    () => {
        expand.value = true;
        arg.value = getInitialArg();
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
    <div class="variant-arg-editing-content">
        <div class="main-type">
            <!-- <span class="type"> {{ unwrapCandidType(props.type) }} </span> -->
            <span class="type">
                {{ props.type.type }}
                <i>Variant { {{ props.type.subitems.length }} fields}</i>
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
            <div class="input" v-if="expand">
                <el-select v-model="select" placement="bottom-start" size="small" filterable default-first-option>
                    <el-option v-for="o in options" :value="o">{{ o }}</el-option>
                </el-select>
            </div>
        </div>
        <div class="expand-list" v-if="expand">
            <div class="items" v-if="refresh && select && subtype">
                <WrappedArgEditingVue :values="props.values" :recItems="props.recItems" :type="subtype" :arg="arg"
                    @complete="onArgComplete" />
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

.variant-arg-editing-content {
    // width: 100%;
    flex-shrink: 0;
}
</style>
