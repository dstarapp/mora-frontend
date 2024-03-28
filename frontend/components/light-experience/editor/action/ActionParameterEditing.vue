<script lang="ts" setup>
import { PropType, inject, computed, Ref } from 'vue';
import { CanisterActionCurrentEditingState } from '../../types/common/state';
import { SupportedAction } from '../../types/core';
import CanisterArgEditingVue from './canister/arg/CanisterArgEditing.vue';
import CanisterResultEditingVue from './canister/result/CanisterResultEditing.vue';

const props = defineProps({
    currentEditing: {
        type: Object as PropType<CanisterActionCurrentEditingState>,
        required: false,
    },
});

const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;

const action = computed<SupportedAction | undefined>(() => {
    if (props.currentEditing === undefined) return undefined;
    const id = props.currentEditing.id;
    return actions.value.find((a) => a.id === id);
});
</script>

<template>
    <div class="canister-editing-content">
        <div class="canister-editing-nav" v-if="action">
            <p>
                {{ $t('plugin.editor.action') }}
                <strong>-> {{ action.name }} </strong>
                <strong
                    v-if="
                        ((props.currentEditing?.type === 'arg' && action?.arg?.subitems?.length) ||
                            (props.currentEditing?.type === 'result' &&
                                action?.result?.subitems?.length)) &&
                        typeof props.currentEditing?.index === 'number'
                    "
                >
                    ->
                    {{
                        props.currentEditing.type === 'arg'
                            ? $t('plugin.editor.arg')
                            : $t('plugin.editor.result')
                    }}
                    ->
                    {{
                        `${props.currentEditing.index + 1}.${
                            props.currentEditing.type === 'arg'
                                ? action?.arg?.subitems[props.currentEditing.index]?.type?.type ??
                                  'unknown'
                                : action?.result?.subitems![props.currentEditing.index]?.type
                                      ?.type ?? 'unknown'
                        }`
                    }}
                </strong>
            </p>
        </div>
        <template v-if="props.currentEditing === undefined || action === undefined">
            <div class="no-data">
                <i class="iconfont icon-no"></i>
                <p>{{ $t('plugin.canisterEditing.noData') }}</p>
            </div>
        </template>
        <template v-else-if="action.type === 'canister'">
            <template v-if="props.currentEditing.type === 'arg'">
                <CanisterArgEditingVue
                    :values="props.currentEditing.values"
                    :action="action"
                    :index="props.currentEditing.index"
                />
            </template>
            <template v-if="props.currentEditing.type === 'result'">
                <CanisterResultEditingVue
                    :values="props.currentEditing.values"
                    :action="action"
                    :index="props.currentEditing.index"
                />
            </template>
        </template>
        <template v-else-if="action.type === 'combined'">
            <span>TODO</span>
        </template>
    </div>
</template>

<style lang="less" scoped>
.canister-editing-content {
    width: 100%;
    height: 100%;

    .canister-editing-nav {
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
                @apply dark: (text-light-900);
            }
        }
    }

    .no-data {
        .center();
        width: 100%;
        height: 100%;
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
</style>
