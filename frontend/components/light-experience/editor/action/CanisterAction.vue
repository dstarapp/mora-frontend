<script lang="ts" setup>
import { computed, PropType, ref, nextTick } from 'vue';
import { CanisterAction } from '../../types/parts/canisters';
import { ActionValues } from '../../types/common/value';
import CanisterIdVue from './canister/CanisterId.vue';
import CanisterMethodVue from './canister/CanisterMethod.vue';
import CanisterArgVue from './canister/CanisterArg.vue';
import CanisterResultVue from './canister/CanisterResult.vue';
import CanisterIdentityVue from './canister/CanisterIdentity.vue';
import { CanisterIdSource } from '@mora-light/core/types/source';

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

const methodRef = ref<{ analysisDID: () => Promise<void> }>();

const canisterId = computed<
    | CanisterIdSource
    | {
        fixed: false;
        value?: undefined;
        source?: undefined;
        id: string;
    }
>(() => props.action.canister.canister_id);

const step = ref<'button' | 'editing'>(
    canisterId.value.fixed && !canisterId.value.value ? 'button' : 'editing',
);

const analysisDID = () => nextTick(() => methodRef.value?.analysisDID());

const onEditing = () => {
    step.value = 'editing';
    analysisDID();
};

defineExpose({
    analysisDID,
});
</script>

<template>
    <div class="canister-action-content">
        <div v-if="step === 'button'" @click="onEditing" class="add-canister-id">
            <i class="iconfont icon-plugin-add"></i>
            <p>{{ $t('plugin.actionEditor.addCanister') }}</p>
        </div>
        <div v-if="step === 'editing'" class="canister-editing">
            <!-- canister id input -->
            <div class="canister-id">
                <CanisterIdVue :values="props.values" :action="props.action" :analysisDID="analysisDID" />
            </div>
            <!-- Choose Method -->
            <div class="choose-method" v-if="props.action.canister.candid.javascript">
                <CanisterMethodVue :action="props.action" ref="methodRef" />
            </div>
            <!-- Input Args -->
            <div class="args" v-if="props.action.canister.method.name">
                <CanisterArgVue :values="props.values" :action="props.action" />
            </div>
            <!-- Return Args -->
            <div class="results" v-if="props.action.canister.method.name">
                <CanisterResultVue :values="props.values" :action="props.action" />
            </div>
            <!-- Choose Identity -->
            <div class="identity" v-if="props.action.canister.method.name">
                <CanisterIdentityVue :values="props.values" :action="props.action" />
            </div>
        </div>
    </div>
</template>

<style lang="less">
.canister-action-content {
    width: 100%;
    height: 100%;
    flex-direction: column;
    display: flex;

    .add-canister-id {
        .center();
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 10px;
        height: 48px;
        margin: 16px 16px 0 16px;
        cursor: pointer;
        transition: @transition;

        &:hover {
            background-color: #34d399;
            border: 1px solid #34d399;
            transition: @transition;

            i,
            p {
                color: #000000;
                transition: @transition;
            }
        }

        i {
            font-size: 16px;
            color: #c9c9c9;
            margin-right: 16px;
            transition: @transition;
        }

        p {
            font-size: 14px;
            color: #666666;
            transition: @transition;
        }
    }

    .canister-editing {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding-bottom: 50px;
        .pscrollbar();

        .title2 {
            display: flex;
            width: 100%;
            padding: 8px 0;

            .left {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #000000;
                @apply dark: (text-light-900/80);

                &::before {
                    content: '';
                    background: linear-gradient(180deg, #35d49a 0%, #7def84 100%);
                    width: 5px;
                    height: 14px;
                    display: inline-block;
                    margin-right: 11px;
                }
            }

            .right {
                display: flex;
                flex: 1;
                justify-content: flex-end;

                i {
                    margin-right: 15px;
                    font-size: 16px;
                    color: #999999;
                    cursor: pointer;
                }
            }
        }

        .canister-id {
            display: flex;
            width: 100%;
            flex-direction: column;
            // padding-bottom: 10px;

            &:hover {
                background: #f9f9f9;
                transition: @transition;
                @apply dark: (bg-dark-300);
            }
        }

        .choose-method {
            display: flex;
            width: 100%;
            flex-direction: column;
            background: #fff;
            transition: @transition;
            @apply dark: (bg-dark-500);

            &:hover {
                background: #f9f9f9;
                transition: @transition;
                @apply dark: (bg-dark-300);
            }
        }

        .args,
        .results {
            display: flex;
            width: 100%;
            flex-direction: column;
            background: #fff;
            @apply dark: (bg-dark-500);

            &:hover {
                background: #f9f9f9;
                transition: @transition;
                @apply dark: (bg-dark-300);
            }
        }

        .identity {
            display: flex;
            width: 100%;
            flex-direction: column;
            background: #fff;
            transition: @transition;
            @apply dark: (bg-dark-500);

            &:hover {
                background: #f9f9f9;
                transition: @transition;
                @apply dark: (bg-dark-300);
            }
        }

        .triggerMethod {
            display: flex;
            width: 100%;
            flex-direction: column;
            background: #fff;
            transition: @transition;
            @apply dark: (bg-dark-500);

            .box {
                display: flex;
                flex-direction: column;
                width: 100%;
                overflow: hidden;
                height: 65px;
                transition: @transition;

                .item {
                    margin: 0 16px;
                    display: flex;
                    flex-direction: column;
                    position: relative;

                    :deep(.el-select) {
                        .el-input {
                            .el-input__wrapper {
                                padding: 0 11px;
                                border-width: 1px;
                                border-radius: 8px;

                                &:hover {
                                    border-color: #34d399;
                                    background-color: #fff;
                                }

                                .el-input__inner {
                                    text-align: left;
                                    height: 34px !important;
                                    font-size: 14px;
                                    color: #000000;
                                    @apply dark: (text-light-900/80);
                                }
                            }

                            &.is-focus {
                                .el-input__wrapper {
                                    border-color: #34d399;
                                }
                            }
                        }
                    }
                }

                &.hide {
                    height: 0px;
                    transition: @transition;
                }
            }

            &:hover {
                background: #f9f9f9;
                transition: @transition;
                @apply dark: (bg-dark-300);
            }
        }
    }
}
</style>
