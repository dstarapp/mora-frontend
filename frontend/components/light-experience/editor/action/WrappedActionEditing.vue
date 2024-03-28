<script lang="ts" setup>
import { computed, inject, Ref, ref, watch, nextTick } from 'vue';
import { ActionValues } from '../../types/common/value';
import { SupportedAction } from '../../types/core';
import { ConstantValue } from '../../types/parts/constants';
import { PropValue } from '../../types/parts/props';
import { InputValue } from '../../types/parts/inputs';
import CanisterActionVue from './CanisterAction.vue';
import CombinedActionVue from './CombinedAction.vue';

const props = defineProps({
    currentActionId: { type: String, required: true },
});

const show = ref(true);

const canisterActionRef = ref<{ analysisDID: () => void }>();

const constants = inject<Ref<ConstantValue[]>>('CONSTANTS')!;
const prop_sources = inject<Ref<PropValue[]>>('PROP_SOURCES')!;
const inputs = inject<Ref<InputValue[]>>('INPUTS')!;
const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;

const action = computed(() => actions.value.find((a) => a.id === props.currentActionId));

const values = computed<ActionValues>(() => {
    const caching: SupportedAction[] = [];
    for (let i = 0; i < actions.value.length; i++) {
        if (actions.value[i].id === props.currentActionId) break;
        caching.push(actions.value[i]);
    }
    return {
        constants: constants.value,
        props: prop_sources.value,
        inputs: inputs.value,
        actions: caching,
    };
});

watch(
    () => props.currentActionId,
    () => {
        nextTick(() => canisterActionRef.value?.analysisDID());
    },
);

watch(
    () => action.value?.id,
    () => {
        show.value = false;
        nextTick(() => {
            show.value = true;
            nextTick(() => canisterActionRef.value?.analysisDID());
        });
    },
);
</script>

<template>
    <div class="wrapped-action-editing-content">
        <div class="title">
            <p>
                {{ $t('plugin.editor.action') }}
                <strong v-if="action">-> {{ action.name }} </strong>
            </p>
        </div>
        <div class="action-editing" v-if="show">
            <template v-if="actions.length === 0 || action === undefined">
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <p>{{ $t('plugin.actionEditor.noData') }}</p>
                </div>
            </template>
            <template v-else-if="action.type === 'canister'">
                <CanisterActionVue :values="values" :action="action" ref="canisterActionRef" />
            </template>
            <template v-else-if="action.type === 'combined'">
                <CombinedActionVue :values="values" :action="action" />
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.wrapped-action-editing-content {
    width: 100%;
    height: 100%;

    >.title {
        font-size: 14px;
        color: #000000;
        padding: 0 12px 0 17px;
        height: 38px;
        line-height: 38px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #e8e8e8;
        @apply dark: (border-dark-100 text-light-900/60);

        p {
            display: flex;
            width: 100%;
            font-size: 14px;
            color: #000000;
            font-weight: 500;
            @apply dark: (text-light-900);

            strong {
                margin-left: 5px;
                color: #000000;
                font-weight: 500;
                @apply dark:(text-light-900);
            }
        }
    }

    >.action-editing {
        .center();
        flex-direction: column;
        height: 100%;
        padding: 0;
        .scrollbar();

        .no-data {
            .center();
            width: 100%;
            flex-direction: column;

            i {
                font-size: 58px;
                color: #dddddd;
                @apply dark: (text-light-900/60);
            }

            p {
                font-size: 14px;
                color: #999;
                margin-top: 12px;
                text-align: center;
                line-height: 24px;
            }
        }
    }
}
</style>
