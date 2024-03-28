<script lang="ts" setup>
import { PropType, computed, inject } from 'vue';
import { ActionValues } from '../../../../types/common/value';
import { CanisterAction, CanisterActionResult } from '../../../../types/parts/canisters';
import WrappedResultEditingVue from './WrappedResultEditing.vue';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CanisterAction>,
        required: true,
    },
    index: {
        type: Number,
        required: true,
    },
});

const refreshActions = inject<() => void>('ACTIONS_REFRESH')!;

const type = computed(() => props.action.canister.method.result.subitems[props.index].type);
const result = computed(() => props.action.result.subitems![props.index]);

const onComplete = (r: CanisterActionResult) => {
    props.action.result.subitems![props.index] = r;

    refreshActions();
};
</script>

<template>
    <div class="canister-result-editing-content">
        <WrappedResultEditingVue
            :values="props.values"
            :type="type"
            :result="result"
            @complete="onComplete"
        />
    </div>
</template>

<style lang="less" scoped>
.canister-result-editing-content {
    height: calc(100% - 30px);
    @apply w-full px-4 py-2 overflow-auto;
    .pscrollbar();
}
</style>
