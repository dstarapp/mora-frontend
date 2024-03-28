<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';
import { InputValue } from '../../../../types/parts/inputs';
import {
    NAT8_MAX,
    NAT16_MAX,
    NAT32_MAX,
    NAT_MIN,
    INT8_MAX,
    INT8_MIN,
    INT16_MAX,
    INT16_MIN,
    INT32_MAX,
    INT32_MIN,
} from '@mora-light/core/types/candid';

type IntegerInputComponentUI = {
    type: 'NumberInputComponent';
    style: {
        type: 'nat8' | 'nat16' | 'nat32' | 'int8' | 'int16' | 'int32';
        min?: number;
        max?: number;
        decimal?: undefined;
    };
    label?: string;
    placeholder?: string;
    default?: number;
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
        type: Object as PropType<IntegerInputComponentUI>,
        required: true,
    },
});

const value = ref<number | undefined>(props.ui.default);

watch(
    () => [props.data, props.ui],
    () => {
        value.value = props.ui.default;
    },
);

const maximum = ref<number>(0);
const minimum = ref<number>(0);

const max = computed<number>(() => props.ui.style.max ?? maximum.value);
const min = computed<number>(() => props.ui.style.min ?? minimum.value);

const reload = () => {
    switch (props.ui.style.type) {
        case 'nat8':
            maximum.value = Number(NAT8_MAX);
            minimum.value = Number(NAT_MIN);
            break;
        case 'nat16':
            maximum.value = Number(NAT16_MAX);
            minimum.value = Number(NAT_MIN);
            break;
        case 'nat32':
            maximum.value = Number(NAT32_MAX);
            minimum.value = Number(NAT_MIN);
            break;
        case 'int8':
            maximum.value = Number(INT8_MAX);
            minimum.value = Number(INT8_MIN);
            break;
        case 'int16':
            maximum.value = Number(INT16_MAX);
            minimum.value = Number(INT16_MIN);
            break;
        case 'int32':
            maximum.value = Number(INT32_MAX);
            minimum.value = Number(INT32_MIN);
            break;
    }
};

watch(
    () => props.ui.style.type,
    () => reload(),
    { immediate: true },
);

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};
</script>

<template>
    <div class="number-integer-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <el-input-number v-model="value" :disabled="props.disabled" :controls="false" :max="Number(max)"
                :min="Number(min)" :placeholder="ui.placeholder" @keydown="channelInputLimit" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.number-integer-input-render-content {
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

        :deep(.el-input-number) {
            display: flex;
            flex: 1;
            border: 1px solid #dddddd;
            border-radius: 8px;
            @apply dark:(border-dark-100);

            .el-input-number__decrease {
                padding: 0 10px;
            }

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
                    text-align: left !important;
                    font-size: 14px;
                }

                .placeholder(#999);
            }
        }
    }
}

.dark {
    .number-integer-input-render-content {
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
