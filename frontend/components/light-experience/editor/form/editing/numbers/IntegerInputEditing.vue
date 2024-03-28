<script lang="ts" setup>
import { ref, PropType, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
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

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};

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
    ui: {
        type: Object as PropType<IntegerInputComponentUI>,
        required: true,
    },
});

const type = ref<'nat8' | 'nat16' | 'nat32' | 'int8' | 'int16' | 'int32'>(props.ui.style.type);
const max = ref<number | undefined>(props.ui.style.max);
const min = ref<number | undefined>(props.ui.style.min);

const maximum = ref<number>(0);
const minimum = ref<number>(0);

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

const checkMax = computed(() => {
    if (max.value === undefined) return true;
    if (maximum.value < max.value) return false;
    if (max.value < minimum.value) return false;
    return true;
});

const checkMin = computed(() => {
    if (min.value === undefined) return true;
    if (maximum.value < min.value) return false;
    if (min.value < minimum.value) return false;
    return true;
});

const checkMaxMin = computed(() => {
    if (max.value === undefined) return true;
    if (min.value === undefined) return true;
    return min.value <= max.value;
});
watch(
    () => max.value,
    (nv) => {
        if (nv !== undefined && checkMax.value && checkMaxMin.value)
            props.ui.style.max = nv;
        else delete props.ui.style.max;
    },
);
watch(
    () => min.value,
    (nv) => {
        if (nv !== undefined && checkMin.value && checkMaxMin.value)
            props.ui.style.min = nv;
        else delete props.ui.style.min;
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
const defaultValue = ref<number | undefined>(props.ui.default);
const checkDefault = computed(() => {
    if (defaultValue.value === undefined) return true;
    if (!checkMax.value) return false;
    if (!checkMin.value) return false;
    if (!checkMaxMin.value) return false;
    const maxText = max.value !== undefined ? max.value : maximum.value;
    const minText = min.value !== undefined ? min.value : minimum.value;
    if (maxText < defaultValue.value) return false;
    if (defaultValue.value < minText) return false;
    return true;
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
        max.value = props.ui.style.max;
        min.value = props.ui.style.min;

        placeholder.value = props.ui.placeholder ?? '';
        defaultValue.value = props.ui.default;
    },
);

const complete = (): IntegerInputComponentUI | undefined => {

    if (!checkMax.value) {
        ElMessage.error(t('plugin.variableTip.maxError'));
        return undefined;
    }
    if (!checkMin.value) {
        ElMessage.error(t('plugin.variableTip.minError'));
        return undefined;
    }
    if (!checkMaxMin.value) {
        ElMessage.error(t('plugin.variableTip.minThanMaxError'));
        return undefined;
    }

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
            {{ $t('plugin.internalVariable.min') }}
        </div>
        <div class="con">
            <el-input-number v-model="min" :controls="false" :max="maximum" :min="minimum"
                :placeholder="$t('plugin.internalVariable.min')" @keydown="channelInputLimit" />
        </div>
        <div class="state"></div>
    </div>
    <div class="item">
        <div class="label">
            {{ $t('plugin.internalVariable.max') }}
        </div>
        <div class="con">
            <el-input-number v-model="max" :controls="false" :max="maximum" :min="minimum"
                :placeholder="$t('plugin.internalVariable.max')" @keydown="channelInputLimit" />
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
            <el-input-number v-model="defaultValue" :controls="false" :max="maximum" :min="minimum"
                :placeholder="$t('plugin.formPreview.form.defaultValue')" @keydown="channelInputLimit" />
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
