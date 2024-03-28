<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { InputValue } from '../../../types/parts/inputs';
import { SwitchInputComponentUI } from '../../../types/parts/form/switch';

const props = defineProps({
    disabled: {
        type: Boolean,
        required: true,
    },
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<SwitchInputComponentUI>,
        required: true,
    },
});

const value = ref<boolean>(props.ui.default ?? false);

watch(
    () => [props.data, props.ui],
    () => {
        value.value = props.ui.default ?? false;
    },
);
</script>

<template>
    <div class="switch-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <el-switch active-color="#35D49A" v-model="value" :disabled="props.disabled"
                :inline-prompt="props.ui.style.inlinePrompt" :active-text="props.ui.style.activeText"
                :inactive-text="props.ui.style.inactiveText" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.switch-input-render-content {
    width: 100%;

    .con {
        display: flex;
        justify-content: center;
        width: 100%;

        .label {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: auto !important;
            font-size: 14px;
            color: #000;
            text-align: right;
            margin-right: 15px !important;
            flex-shrink: 0;
            @apply dark: (text-light-900/80);
        }

        :deep(.el-switch) {
            &.is-disabled {
                opacity: 1;
            }

            .el-switch__label {
                &.is-active {
                    color: #35d49a;
                }
            }
        }

        :deep(.el-input),
        :deep(.el-textarea) {
            display: flex;
            flex: 1;
            width: 100%;

            &.is-disabled {
                .el-input__wrapper {
                    background-color: #fff;
                    box-shadow: none;
                }

                .el-input__inner,
                .el-textarea__inner {
                    color: #000;
                    -webkit-text-fill-color: #000;
                    .placeholder(#999);
                }

                .placeholder(#999);
            }

            &.el-textarea {
                padding: 0 10px;
            }

            .el-textarea__inner {
                border: 1px solid #dddddd;
                background-color: #fff;
                border-radius: 8px;
                padding: 8px;
                @apply dark: (border-dark-100);
            }

            .el-input__wrapper {
                padding: 0;

                .el-input__inner,
                .el-textarea__inner {
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    color: #000;
                    -webkit-text-fill-color: #000;
                    text-align: left;
                    padding: 0 14px;
                    font-size: 14px;
                    @apply dark: (border-dark-100);

                    &.el-input__inner {
                        height: 100%;
                    }
                }

                .placeholder(#999);
            }
        }

        &.edit {
            // flex-direction: column;

            .label {
                height: auto;
                width: auto;
                white-space: nowrap;
                margin-right: 15px;
                color: #666666;
            }

            :deep(.el-input) {
                flex: auto;
                // height: 36px;

                .el-input__wrapper {
                    padding: 0;

                    .el-input__inner,
                    .el-textarea__inner {
                        border: 1px solid #dddddd;
                        @apply dark: (border-dark-100);
                    }
                }
            }
        }
    }
}

.dark {
    .text-input-render-content {
        .con {

            :deep(.el-input),
            :deep(.el-textarea) {
                .el-input__wrapper {

                    .el-input__inner,
                    .el-textarea__inner {
                        -webkit-text-fill-color: rgba(221, 225, 227, 0.8);
                    }
                }
            }
        }
    }
}
</style>
