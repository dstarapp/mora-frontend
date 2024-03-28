<script lang="ts" setup>
import { ref, PropType, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { Float32Decimal, Float64Decimal } from '@mora-light/core/types/candid';

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};

const getDefaultDecimal = (type: 'float32' | 'float64'): 6 | 15 => {
    switch (type) {
        case 'float32':
            return 6;
        case 'float64':
            return 15;
    }
};

type FloatInputComponentUI = {
    type: 'NumberInputComponent';
    style:
    | {
        type: 'float32';
        min?: undefined;
        max?: undefined;
        decimal?: Float32Decimal;
    }
    | {
        type: 'float64';
        min?: undefined;
        max?: undefined;
        decimal?: Float64Decimal;
    };
    label?: string;
    placeholder?: string;
    default?: string;
};

const props = defineProps({
    ui: {
        type: Object as PropType<FloatInputComponentUI>,
        required: true,
    },
});

const type = ref<'float32' | 'float64'>(props.ui.style.type);
const decimal = ref<Float32Decimal | Float64Decimal>(
    props.ui.style.decimal ?? getDefaultDecimal(type.value),
);
const minimum = ref<number>(0);
const maximum = computed(() => getDefaultDecimal(type.value));
watch(
    () => decimal.value,
    (nv) => {
        switch (type.value) {
            case 'float32':
                if (nv !== 6) props.ui.style.decimal = nv;
                else delete props.ui.style.decimal;
                break;
            case 'float64':
                if (nv !== 15) props.ui.style.decimal = nv;
                else delete props.ui.style.decimal;
                break;
        }
    },
);

const placeholder = ref<string>(props.ui.placeholder ?? '');
watch(
    () => placeholder.value,
    (nv) => {
        if (nv.trim()) props.ui.placeholder = nv.trim();
        else delete props.ui.placeholder;
    },
);
const defaultValue = ref<string>(props.ui.default ?? '');
const parsedRegex = computed<string>(() => {
    if (maximum.value === 6) {
        switch (decimal.value) {
            case 0:
                return '^(0|[+-]?(0|([1-9][0-9]*))|[+-]?[1-9][eE][+-]?([1-9]|[1-2][0-9]|[3][0-8]))$';
            case 1:
                return '^(0|[+-]?(0|([1-9][0-9]*))(.[1-9])?|[+-]?[1-9](.[1-9])?[eE][+-]?([1-9]|[1-2][0-9]|[3][0-8]))$';
        }
        return `^(0|[+-]?(0|([1-9][0-9]*))(.[0-9]{0,${decimal.value - 1
            }}[1-9])?|[+-]?[1-9](.[0-9]{0,${decimal.value - 1
            }}[1-9])?[eE][+-]?([1-9]|[1-2][0-9]|[3][0-8]))$`;
    }
    switch (decimal.value) {
        case 0:
            return '^(0|[+-]?(0|([1-9][0-9]*))|[+-]?[1-9][eE][+-]?([1-9]|[1-9][0-9]|[12][0-9][0-9]|30[0-8]))$';
        case 1:
            return '^(0|[+-]?(0|([1-9][0-9]*))(.[1-9])?|[+-]?[1-9](.[1-9])?[eE][+-]?([1-9]|[1-9][0-9]|[12][0-9][0-9]|30[0-8]))$';
    }
    return `^(0|[+-]?(0|([1-9][0-9]*))(.[0-9]{0,${decimal.value - 1}}[1-9])?|[+-]?[1-9](.[0-9]{0,${decimal.value - 1
        }}[1-9])?[eE][+-]?([1-9]|[1-9][0-9]|[12][0-9][0-9]|30[0-8]))$`;
});
const checkDefault = computed(() => {
    if (!defaultValue.value) return true;
    return defaultValue.value.match(parsedRegex.value);
});
watch(
    () => defaultValue.value,
    (nv) => {
        if (checkDefault.value) props.ui.default = nv;
        else delete props.ui.default;
    },
);

watch(
    () => props.ui,
    () => {
        type.value = props.ui.style.type;
        decimal.value = props.ui.style.decimal ?? getDefaultDecimal(type.value);

        placeholder.value = props.ui.placeholder ?? '';
        defaultValue.value = props.ui.default ?? '';
    },
);

const complete = (): FloatInputComponentUI | undefined => {
    if (!props.ui.label) {
        ElMessage.error(t('plugin.formPreview.form.labelEmpty'));
        return undefined;
    }

    if (!checkDefault.value) {
        ElMessage.error(t('plugin.variableTip.defaultError'));
        return undefined;
    }

    return props.ui;
};

defineExpose({ complete });
</script>

<template>
    <div class="item">
        <div class="label">
            {{ $t('plugin.variableTip.decimal') }}
        </div>
        <div class="con">
            <el-input-number v-model="decimal" :controls="false" :max="maximum" :min="minimum"
                :placeholder="$t('plugin.internalVariable.min')" @keydown="channelInputLimit" />
        </div>
        <div class="state"></div>
    </div>
    <div class="item">
        <div class="label">
            {{ $t('plugin.formPreview.form.placeholder') }}
        </div>
        <div class="con">
            <el-input v-model="placeholder" :placeholder="$t('plugin.formPreview.form.placeholder')" />
        </div>
        <div class="state"></div>
    </div>
    <div class="item">
        <div class="label">
            {{ $t('plugin.formPreview.form.defaultValue') }}
        </div>
        <div class="con">
            <el-input v-model="defaultValue" :placeholder="$t('plugin.formPreview.form.defaultValue')" />
        </div>
        <div class="state"> </div>
    </div>
</template>

<style lang="less" scoped>
@import '../public.less';

.item {
    .con {
        width: 100%;
        display: flex;

        :deep(.el-radio-group) {
            .el-radio-button {
                span {
                    color: #000000;
                    font-size: 14px;
                    border-color: #dddddd;
                    box-shadow: none;
                }

                &.is-active {
                    span {
                        background: #5ae28e;
                        border-color: #5ae28e;
                    }
                }

                &:first-child {
                    span {
                        border-right: none;
                    }
                }
            }
        }

        :deep(.el-input) {
            border: none;

            &.is-disabled {
                .el-input__wrapper {
                    box-shadow: none;
                }
            }

            .el-input__wrapper {
                padding: 0 10px;
                height: 36px;
                line-height: 36px;
                border-radius: 6px;

                .el-input__inner {
                    color: #666;
                    text-align: left;
                    font-size: 14px;
                    @apply dark:(text-light-900/80);
                }
            }
        }

        :deep(.el-select) {
            width: 100%;

            .el-input {
                overflow: hidden;
            }

            .el-input__wrapper {
                border: none;
                border-radius: 0;
            }
        }

        :deep(.el-input-number) {
            width: 100%;

            .el-input-number__decrease {
                padding: 0 10px;
            }

            .el-input__wrapper {
                .el-input__inner {
                    color: #666;
                    text-align: left;
                    font-size: 14px;
                }

                .placeholder(#999);
            }
        }
    }
}
</style>
