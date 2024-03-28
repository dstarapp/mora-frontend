<script lang="ts" setup>
import { PropType, ref, computed } from 'vue';
import { CanisterActionArg, CanisterActionArgMainRec } from '../../../../../types/parts/canisters';
import { ActionValues } from '../../../../../types/common/value';
import WrappedArgEditingVue from '../WrappedArgEditing.vue';
import {
    RecCandidType,
    RecItem,
    MainRecCandidType,
    findRecType,
} from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

const getMainRecCandidType = (
    type: RecCandidType,
    recItems: RecItem[],
    id: number,
): MainRecCandidType => {
    if (type.subtype !== undefined) return deepClone(type);
    const found = findRecType(recItems, id);
    if (found === undefined) throw new Error('can not find rec type');
    return deepClone(found);
};

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
        type: Object as PropType<RecCandidType>,
        required: true,
    },
    arg: {
        type: Object as PropType<CanisterActionArgMainRec>,
        required: true,
    },
});

const type = computed<MainRecCandidType>(() =>
    getMainRecCandidType(props.type, props.recItems, props.type.id),
);

const emit = defineEmits(['complete']);

const arg = ref<CanisterActionArg>(props.arg.value);

const onExpandComplete = () => {
    const mainRecArg: CanisterActionArgMainRec = {
        type: deepClone(type.value),
        value: arg.value,
    };
    emit('complete', mainRecArg);
};

const onArgComplete = (r: CanisterActionArg) => {
    console.error('rec onArgComplete', r);
    arg.value = r;
    onExpandComplete();
};
</script>

<template>
    <div class="rec-arg-editing-content">
        <WrappedArgEditingVue :values="props.values" :recItems="props.recItems" :type="type.subtype" :arg="arg"
            @complete="onArgComplete" />
    </div>
</template>

<style lang="less" scoped>
@import '../public.less';

.rec-arg-editing-content {
    // width: 100%;
}
</style>
