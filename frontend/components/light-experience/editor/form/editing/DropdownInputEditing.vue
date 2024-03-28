<script lang="ts" setup>
import { ref, PropType, computed, inject, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { InputValue } from '../../../types/parts/inputs';
import { DropdownInputComponentUI } from '../../../types/parts/form/dropdown';
import DropdownInputRenderVue from '../render/DropdownInputRender.vue';
import { CandidType, VariantCandidType } from '@mora-light/core/types/candid';

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<DropdownInputComponentUI>,
        required: true,
    },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;
const visible = ref(true);

const style = reactive<{
    clearable?: boolean;
}>({ ...props.ui.style });
const clearable = ref<'ON' | 'OFF'>(style.clearable ? 'ON' : 'OFF');

const label = ref<string>(props.ui.label ?? '');
const options_value = ref<string>(
    (props.data.input.result as VariantCandidType).subitems.map((item) => item.key).join('\n'),
);
const placeholder = ref<string>(props.ui.placeholder ?? '');
const defaultValue = ref<string>(props.ui.default ?? '');

const trimmed_options_value = computed<string>(() => {
    let value = options_value.value;
    while (true) {
        let v = value;
        v = v.trim();
        if (v.startsWith('\n')) v = v.substring(1);
        if (v.endsWith('\n')) v = v.substring(0, v.length - 1);
        if (v.startsWith('\t')) v = v.substring(1);
        if (v.endsWith('\t')) v = v.substring(0, v.length - 1);
        if (v.startsWith('\r')) v = v.substring(1);
        if (v.endsWith('\r')) v = v.substring(0, v.length - 1);
        if (v === value) break;
        value = v;
    }
    return value;
});
const options = computed(() => trimmed_options_value.value.split('\n').filter((o) => o.trim()));

watch(
    () => label.value,
    () => {
        if (label.value.trim()) props.ui.label = label.value.trim();
        else delete props.ui.label;
    },
);

watch(
    () => clearable.value,
    () => (style.clearable = clearable.value === 'ON'),
);
watch(
    () => [style.clearable],
    () => {
        if (style.clearable) props.ui.style.clearable = style.clearable;
        else delete props.ui.style.clearable;
    },
);

watch(
    () => [placeholder.value, style.clearable],
    () => {
        if (style.clearable && placeholder.value.trim())
            props.ui.placeholder = placeholder.value.trim();
        else delete props.ui.placeholder;
    },
);

watch(
    () => defaultValue.value,
    () => {
        if (defaultValue.value)
            props.ui.default = defaultValue.value;
        else delete props.ui.default;
    },
);

watch(
    () => [props.data, props.ui],
    () => {
        style.clearable = props.ui.style.clearable;
        clearable.value = style.clearable ? 'ON' : 'OFF';

        label.value = props.ui.label ?? '';
        placeholder.value = props.ui.placeholder ?? '';
        defaultValue.value = props.ui.default ?? '';
    },
);

const checkName = computed<'empty' | 'repeated' | ''>(() => {
    const name = props.data.name.trim();
    if (!name) return 'empty';
    if (findExportedValue(name, props.data.id)) return 'repeated';
    return '';
});

const checkOptions = computed<string>(() => {
    if (options.value.length === 0) return "there's at least one option";
    const keys = {};
    for (const option of options.value) {
        if (!option) return 'option can not be empty.';
        if (keys[option] !== undefined) return `option ${option} is already exist.`;
        keys[option] = null;
    }
    return '';
});

watch(
    () => [options.value, checkOptions.value],
    () => {
        if (!options.value.length) {
            defaultValue.value = '';
            setSubitems();
            return;
        }
        if (checkOptions.value) {
            return;
        }
        if (defaultValue.value && !options.value.find((o) => o === defaultValue.value)) {
            defaultValue.value = '';
        }
        setSubitems();
    },
);

watch(
    () => [style.clearable, options.value, defaultValue.value],
    () => {
        if (!options.value.length) {
            defaultValue.value = '';
            return;
        }
        if (checkOptions.value) {
            return;
        }
        if (!style.clearable && !defaultValue.value) {
            defaultValue.value = options.value[0];
        }
    },
);

const setSubitems = () => {
    (props.data.input.result as VariantCandidType).subitems = options.value.map((key) => ({
        key,
        type: { type: 'null' },
    }));
};

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');
const onClose = () => {
    visible.value = false;
    emit('complete');
};
const onComplete = () => {
    if (!props.data.name.trim()) {
        ElMessage.error(t('plugin.formPreview.form.variableNameEmpty'));
        return;
    }

    switch (checkName.value) {
        case 'empty':
            ElMessage.error(t('plugin.formPreview.form.variableNameEmpty'));
            return;
        case 'repeated':
            ElMessage.error(t('plugin.generic.duplication'));
            return;
    }

    if (!props.ui.label) {
        ElMessage.error(t('plugin.formPreview.form.labelEmpty'));
        return;
    }

    visible.value = false;
    emit('complete', props.data);
};
</script>

<template>
    <div class="dropdown-input-editing-content">
        <el-dialog :title="`${$t('plugin.formPreview.list.dropdown')} ${$t(
            'plugin.formPreview.list.edit',
        )}`" v-model="visible" :before-close="() => (visible = false)" @closed="onDialogClose" class="dialog-form">
            <div class="dialog-form">
                <transition name="fade">
                    <div class="prev" v-if="props.ui.label">
                        <h2>{{ $t('plugin.formPreview.effectPreview') }}</h2>
                        <DropdownInputRenderVue :disabled="true" :data="props.data" :ui="props.ui" />
                    </div>
                </transition>
                <div class="ui">
                    <div class="box">
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.variableName') }}
                            </div>
                            <div class="con">
                                <el-input maxlength="20" v-model="props.data.name"
                                    :placeholder="$t('plugin.formPreview.form.variableName')" />
                                <div class="state">
                                    <i v-if="!checkName" class="iconfont icon-chose" />
                                    <i v-if="checkName && props.data.name" class="iconfont icon-failed" />
                                </div>
                            </div>

                            <div class="error-text">
                                {{
            checkName === 'empty'
                ? $t('plugin.formPreview.form.variableNameEmpty')
                : checkName === 'repeated'
                    ? $t('plugin.generic.duplication')
                    : ''
        }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.label') }}
                            </div>
                            <div class="con">
                                <el-input maxlength="20" v-model="label"
                                    :placeholder="$t('plugin.formPreview.form.label')" />
                                <div class="state">
                                    <i v-if="!label" class="iconfont icon-failed"></i>
                                </div>
                            </div>
                            <div class="error-text">
                                {{ !label ? $t('plugin.formPreview.form.labelEmpty') : '' }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.optionsTitle') }}
                            </div>
                            <div class="con">
                                <el-input type="textarea" resize="none" v-model="options_value" :autosize="{
            minRows: 3,
        }" :placeholder="$t('plugin.formPreview.form.option')" />
                                <div class="state">
                                    <i v-if="checkOptions" class="iconfont icon-failed"></i>
                                </div>
                            </div>
                            <div class="error-text" v-if="checkOptions">
                                {{ checkOptions }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.clearable') }}
                            </div>
                            <div class="con !border-transparent !bg-transparent">
                                <el-radio-group v-model="clearable">
                                    <el-radio-button label="ON" />
                                    <el-radio-button label="OFF" />
                                </el-radio-group>
                                <div class="state"></div>
                            </div>
                        </div>
                        <div class="item" v-if="style.clearable">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.placeholder') }}
                            </div>
                            <div class="con">
                                <el-input v-model="placeholder"
                                    :placeholder="$t('plugin.formPreview.form.placeholder')" />
                                <div class="state"></div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.defaultValue') }}
                            </div>
                            <div class="con">
                                <template v-if="style.clearable">
                                    <el-select v-model="defaultValue" clearable :placeholder="style.clearable && placeholder
            ? placeholder
            : $t('plugin.formPreview.form.defaultValue')
            ">
                                        <el-option v-for="(option, i) in options" :key="i" :label="option"
                                            :value="option" />
                                    </el-select>
                                </template>
                                <template v-else>
                                    <el-select v-model="defaultValue" :placeholder="style.clearable && placeholder
            ? placeholder
            : $t('plugin.formPreview.form.defaultValue')
            ">
                                        <el-option v-for="(option, i) in options" :key="i" :label="option"
                                            :value="option" />
                                    </el-select>
                                </template>
                            </div>
                            <div class="state"> </div>
                            <div class="error-text"> </div>
                        </div>
                    </div>
                </div>
                <div class="button-box">
                    <div>
                        <div class="cancel" @click="onClose">
                            {{ $t('plugin.formPreview.form.cancel') }}
                        </div>
                        <div class="btn" @click="onComplete">
                            {{ $t('plugin.formPreview.form.confirm') }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
@import './public.less';

.dropdown-input-editing-content {
    width: 100%;

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
                        @apply dark:(border-dark-100 text-light-900/80);
                    }

                    &.is-active {
                        span {
                            background: #5ae28e;
                            border-color: #5ae28e;
                            color: #000;
                        }
                    }

                    &:first-child {
                        span {
                            border-right: none;
                        }
                    }
                }
            }

            :deep(.el-textarea) {
                display: flex;
                flex: 1;

                .el-textarea__inner {
                    border: none;
                    background-color: #fff;
                    padding: 8px;
                    border-radius: 8px;
                    @apply dark: (border-dark-100 bg-dark-300);
                }

                .el-input__wrapper {
                    padding: 0 10px;
                    height: 36px;
                    line-height: 36px;

                    .el-input__inner,
                    .el-textarea__inner {
                        border: 1px solid #dddddd;
                        color: #000;
                        -webkit-text-fill-color: #000;
                        text-align: left;
                        padding: 0 14px;
                        font-size: 14px;
                        height: 36px;
                    }

                    .placeholder(#999);
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
}
</style>
