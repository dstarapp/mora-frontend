<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { InputValue } from '../../../../types/parts/inputs';

type BigIntInputComponentUI = {
    type: 'NumberInputComponent';
    style: {
        type: 'nat' | 'int' | 'nat64' | 'int64';
        min?: string;
        max?: string;
        decimal?: undefined;
    };
    label?: string;
    placeholder?: string;
    default?: string;
};

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
        type: Object as PropType<BigIntInputComponentUI>,
        required: true,
    },
});

const value = ref<string>(props.ui.default ?? '');

watch(
    () => [props.data, props.ui],
    () => {
        value.value = props.ui.default ?? '';
    },
);

</script>

<template>
    <div class="number-bigint-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <el-input v-model="value" :disabled="props.disabled" :placeholder="ui.placeholder" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.number-bigint-input-render-content {
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

        :deep(.el-input) {
            display: flex;
            flex: 1;
            border: 1px solid #dddddd;
            border-radius: 8px;
            @apply dark:(border-dark-100);

            &.is-disabled {
                .el-input__wrapper {
                    background: none;
                    box-shadow: none;
                }
            }

            .el-input__wrapper {
                padding: 0 10px !important;
                height: 36px;
                line-height: 36px;
                border-radius: 8px;

                .el-input__inner {
                    color: #666;
                    text-align: left;
                    font-size: 14px;
                    border: none !important;
                    @apply dark:(text-light-900/80);
                }
            }
        }
    }
}

.dark {
    .number-bigint-input-render-content {
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
