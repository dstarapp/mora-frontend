<script lang="ts" setup>
import { ref, PropType, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { NAT64_MAX, INT64_MAX, INT64_MIN } from '@mora-light/core/types/candid';

const checkInput = (v: string, type: 'nat' | 'int' | 'nat64' | 'int64'): string => {
    let changed = false;

    if (v.trim() !== v) {
        v = v.trim();
        changed = true;
    }

    let vv = '';
    for (let i = 0; i < v.length; i++) {
        const c = v.charAt(i);
        if (i === 0 && ['int', 'int64'].includes(type) && c === '-') {
            vv = vv + c;
            continue;
        }
        switch (c) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                vv = vv + c;
                break;
        }
    }
    if (vv !== v) changed = true;

    if (changed) return vv;
    return v;
};

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
    ui: {
        type: Object as PropType<BigIntInputComponentUI>,
        required: true,
    },
});

const type = ref<'nat' | 'int' | 'nat64' | 'int64'>(props.ui.style.type);
const max = ref<string>(props.ui.style.max ?? '');
const min = ref<string>(props.ui.style.min ?? '');

const maximum = ref<string | undefined>(undefined);
const minimum = ref<string | undefined>(undefined);

const reload = () => {
    switch (props.ui.style.type) {
        case 'nat':
            maximum.value = undefined;
            minimum.value = '0';
            break;
        case 'int':
            maximum.value = undefined;
            minimum.value = undefined;
            break;
        case 'nat64':
            maximum.value = NAT64_MAX;
            minimum.value = '0';
            break;
        case 'int64':
            maximum.value = INT64_MAX;
            minimum.value = INT64_MIN;
            break;
    }
};

watch(
    () => props.ui.style.type,
    () => reload(),
    { immediate: true },
);

const checkMax = computed(() => {
    if (!max.value) return true;
    if (maximum.value !== undefined && BigInt(maximum.value) < BigInt(max.value)) return false;
    if (minimum.value !== undefined && BigInt(max.value) < BigInt(minimum.value)) return false;
    return true;
});

const checkMin = computed(() => {
    if (!min.value) return true;
    if (maximum.value !== undefined && BigInt(maximum.value) < BigInt(min.value)) return false;
    if (minimum.value !== undefined && BigInt(min.value) < BigInt(minimum.value)) return false;
    return true;
});

const checkMaxMin = computed(() => {
    if (!max.value) return true;
    if (!min.value) return true;
    return BigInt(min.value) <= BigInt(max.value);
});
const checkMaxInput = () => {
    const maxInput = max.value;
    const r = checkInput(maxInput, type.value);
    if (r !== maxInput) max.value = r;
};
const checkMinInput = () => {
    const minInput = min.value;
    const r = checkInput(minInput, type.value);
    if (r !== minInput) min.value = r;
};
watch(
    () => max.value,
    (nv) => {
        if (nv.trim() && checkMax.value && checkMaxMin.value)
            props.ui.style.max = nv.trim();
        else delete props.ui.style.max;
    },
);
watch(
    () => min.value,
    (nv) => {
        if (nv.trim() && checkMin.value && checkMaxMin.value)
            props.ui.style.min = nv.trim();
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
const defaultValue = ref<string>(props.ui.default ?? '');
const checkDefaultInput = () => {
    const defaultInput = defaultValue.value;
    const r = checkInput(defaultInput, type.value);
    if (r !== defaultInput) defaultValue.value = r;
};
const checkDefault = computed(() => {
    if (!defaultValue.value) return true;
    if (!checkMax.value) return false;
    if (!checkMin.value) return false;
    if (!checkMaxMin.value) return false;
    const maxText = max.value ? max.value : maximum.value;
    const minText = min.value ? min.value : minimum.value;
    if (maxText !== undefined && BigInt(maxText) < BigInt(defaultValue.value)) return false;
    if (minText !== undefined && BigInt(defaultValue.value) < BigInt(minText)) return false;
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
        max.value = props.ui.style.max ?? '';
        min.value = props.ui.style.min ?? '';

        placeholder.value = props.ui.placeholder ?? '';
        defaultValue.value = props.ui.default ?? '';
    },
);

const complete = (): BigIntInputComponentUI | undefined => {
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
            <el-input v-model="min" :placeholder="$t('plugin.internalVariable.min')" @input="checkMinInput" />
        </div>
        <div class="state"></div>
    </div>
    <div class="item">
        <div class="label">
            {{ $t('plugin.internalVariable.max') }}
        </div>
        <div class="con">
            <el-input v-model="max" :placeholder="$t('plugin.internalVariable.max')" @input="checkMaxInput" />
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
            <el-input v-model="defaultValue" :placeholder="$t('plugin.formPreview.form.defaultValue')"
                @keydown="checkDefaultInput" />
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
