<script lang="ts" setup>
import { PropType, ref, watch, nextTick } from 'vue';
import { InputValue } from '../../../types/parts/inputs';
import { TextInputComponentUI } from '../../../types/parts/form/text';

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
        type: Object as PropType<TextInputComponentUI>,
        required: true,
    },
});

const refresh = ref(true);

watch(
    () => props.ui.style,
    () => {
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);

const value = ref<string>(props.ui.default ?? '');

watch(
    () => [props.data, props.ui],
    () => {
        value.value = props.ui.default ?? '';
    },
);
</script>

<template>
    <div class="text-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <template v-if="refresh">
                <el-input resize="none" v-model="value" :disabled="props.disabled" :type="props.ui.style.type"
                    :autosize="{
                    minRows: props.ui.style.minRows,
                    maxRows: props.ui.style.autosize ? undefined : props.ui.style.minRows,
                }" :placeholder="props.ui.placeholder" />
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.text-input-render-content {
    width: 100%;

    .con {
        display: flex;
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

        :deep(.el-input),
        :deep(.el-textarea) {
            display: flex;
            flex: 1;

            &.is-disabled {
                .el-input__wrapper {
                    background-color: #fff;
                    box-shadow: none;
                    @apply dark:(bg-dark-300);
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
                min-height: 36px;

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
