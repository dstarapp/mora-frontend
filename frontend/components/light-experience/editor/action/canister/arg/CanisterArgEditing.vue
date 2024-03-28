<script lang="ts" setup>
import { PropType, computed, inject, nextTick, ref, watch } from 'vue';
import { CanisterAction, CanisterActionArg } from '../../../../types/parts/canisters';
import { ActionValues } from '../../../../types/common/value';
import WrappedArgEditingVue from './WrappedArgEditing.vue';

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

const type = computed(() => props.action.canister.method.arg.subitems[props.index].type);
const arg = computed(() => props.action.arg.subitems[props.index]);

const onComplete = (r: CanisterActionArg) => {
    props.action.arg.subitems[props.index] = r;

    refreshActions();
};

const show = ref(true);
watch(
    () => [props.index],
    () => {
        show.value = false;
        nextTick(() => (show.value = true));
    },
);
</script>

<template>
    <div class="canister-arg-editing-content" v-if="show">
        <WrappedArgEditingVue
            :values="props.values"
            :recItems="[]"
            :type="type"
            :arg="arg"
            @complete="onComplete"
        />
    </div>
</template>

<style lang="less" scoped>
.canister-arg-editing-content {
    height: calc(100% - 30px);
    @apply w-full px-4 py-2 overflow-auto;
    .pscrollbar();
}
</style>
