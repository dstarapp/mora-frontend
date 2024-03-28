<script lang="ts" setup>
import { PropType, ref, computed, inject, watch } from 'vue';
import { CanisterAction } from '../../../types/parts/canisters';
import { ActionValues } from '../../../types/common/value';
import { CanisterActionCurrentEditingState } from '../../../types/common/state';
import { checkCanisterActionResults } from '../../../types/common/checks';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CanisterAction>,
        required: true,
    },
});

const current = ref<number>();

const setCurrentEditing =
    inject<(state: CanisterActionCurrentEditingState | undefined) => void>('SET_CURRENT_EDITING')!;

const resetCurrentEditing =
    inject<(state: CanisterActionCurrentEditingState) => void>('RESET_CURRENT_EDITING')!;

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const collapse = ref(false);

const length = computed(() => props.action.canister.method.result.subitems.length);

const checks = computed<(boolean | undefined)[]>(() =>
    checkCanisterActionResults(props.action, findExportedValue),
);

const onEditResult = (index: number) => {
    current.value = index;
    setCurrentEditing({
        id: props.action.id,
        type: 'result',
        index,
        values: props.values,
    });
};

watch(
    () => props.values,
    () => {
        if (current.value !== undefined) {
            resetCurrentEditing({
                id: props.action.id,
                type: 'result',
                index: current.value,
                values: props.values,
            });
        }
    },
);
</script>

<template>
    <div class="title2">
        <div class="left">
            {{ $t('plugin.actionEditor.returnArgs') }}
        </div>
        <div class="right">
            <i
                @click="collapse = !collapse"
                class="iconfont"
                :class="{
                    'icon-plugin-aup': !collapse,
                    'icon-plugin-adown': collapse,
                }"
            ></i>
        </div>
    </div>
    <div
        class="box"
        :class="{
            hide: collapse,
            'no-args': !length,
        }"
    >
        <template v-for="(child, index) in action.canister.method.result.subitems" :key="index">
            <div class="item">
                <span>
                    <p>{{ `${index + 1}.` }}</p>
                    <p>{{ child.type.type }}</p>
                    <i>
                        {{
                            child.type.subitems
                                ? `{${child.type.subitems.length}` +
                                  $t('plugin.actionEditor.fields') +
                                  '}'
                                : ''
                        }}
                    </i>
                    <template v-if="checks[index]">
                        <strong class="iconfont icon-chose"></strong>
                    </template>
                    <template v-else-if="checks[index] === false">
                        <strong class="iconfont icon-attention"></strong>
                    </template>
                    <b @click="onEditResult(index)">
                        {{ $t('plugin.actionEditor.export') }}
                    </b>
                </span>
            </div>
        </template>
        <p v-if="!length">
            {{ $t('plugin.actionEditor.noArgs') }}
        </p>
    </div>
</template>

<style lang="less" scoped>
.title2 {
    align-items: center;

    strong {
        .center();
        color: #999999;
        border: 1px solid #dddddd;
        border-radius: 26px;
        height: 15px;
        margin-left: 6px;
        padding: 0 2px;
        @apply dark: (border-dark-100 text-light-900/80);

        i {
            transform: scale(0.8);
            font-style: normal;
        }
    }
}

.box {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    transition: @transition;

    &.no-args {
        display: flex;
        align-items: center;
        height: 28px !important;

        > p {
            font-size: 14px;
            color: #999;
        }
    }

    .item {
        padding: 0 16px;
        display: flex;
        flex-direction: column;
        position: relative;
        display: flex;
        width: 100%;

        span {
            display: flex;
            align-items: center;
            margin-bottom: 15px;

            p {
                font-size: 14px;
                color: #000000;
                @apply dark: (text-light-900);
            }

            i {
                font-size: 12px;
                color: #999999;
                font-style: normal;
                margin-left: 6px;
                margin-right: 6px;
                @apply dark: (text-light-900/50);
            }

            .icon-attention {
                font-size: 16px;
                color: #bbb;
                .center();
                @apply dark: (text-light-900/30);
            }

            .icon-chose {
                font-size: 14px;
                color: #35d49a;
                .center();
            }

            b {
                margin-left: auto;
                font-size: 14px;
                color: #35d49a;
                cursor: pointer;
                font-weight: normal;
            }
        }
    }

    &.hide {
        height: 0px !important;
        transition: @transition;
    }
}
</style>
