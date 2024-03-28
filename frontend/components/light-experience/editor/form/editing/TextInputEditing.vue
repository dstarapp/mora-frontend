<script lang="ts" setup>
import { ref, PropType, computed, inject, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { InputValue } from '../../../types/parts/inputs';
import { TextInputComponentUI } from '../../../types/parts/form/text';
import TextInputRenderVue from '../render/TextInputRender.vue';
import { isPrincipal } from '@mora-light/core/types/candid';

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};

type SupportedType =
    | { type: 'text' }
    | { type: 'principal' }
    | { type: 'vec'; subtype: { type: 'nat8' } };
type SupportedShowType = 'Text' | 'Principal' | 'Account ID';
type SupportedStyle = 'text' | 'textarea';
type SupportedShowStyle = 'Single Line' | 'Textarea';

const wrapType = (type: SupportedType): SupportedShowType => {
    switch (type.type) {
        case 'text':
            return 'Text';
        case 'principal':
            return 'Principal';
        case 'vec':
            return 'Account ID';
    }
};
const unwrapType = (type: SupportedShowType): SupportedType => {
    switch (type) {
        case 'Text':
            return { type: 'text' };
        case 'Principal':
            return { type: 'principal' };
        case 'Account ID':
            return { type: 'vec', subtype: { type: 'nat8' } };
    }
};

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<TextInputComponentUI>,
        required: true,
    },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;
const visible = ref(true);
const checkName = computed<'empty' | 'repeated' | ''>(() => {
    const name = props.data.name.trim();
    if (!name) return 'empty';
    if (findExportedValue(name, props.data.id)) return 'repeated';
    return '';
});

const supportedTypeList = ref<SupportedShowType[]>(['Text', 'Principal', 'Account ID']);
const currentType = ref<SupportedShowType>(wrapType(props.data.input.result as SupportedType));
watch(
    () => currentType.value,
    () => {
        props.data.input.result = unwrapType(currentType.value);
    },
);

const style = reactive<
    | {
        type: 'text';
        autosize?: undefined;
        minRows?: undefined;
    }
    | {
        type: 'textarea';
        autosize: boolean;
        minRows: number;
    }
>({ ...props.ui.style });
const supportedStyleList = ref<{ label: SupportedShowStyle; value: SupportedStyle }[]>([
    { label: 'Single Line', value: 'text' },
    { label: 'Textarea', value: 'textarea' },
]);
const autosize = ref<'ON' | 'OFF'>(style.autosize ? 'ON' : 'OFF');
watch(
    () => [style.type, style.autosize, style.minRows],
    () => {
        switch (style.type) {
            case 'text':
                props.ui.style = { type: 'text' };
            case 'textarea':
                style.autosize = style.autosize ?? true;
                style.minRows = style.minRows ?? 1;
                autosize.value = style.autosize ? 'ON' : 'OFF';
                props.ui.style = {
                    type: 'textarea',
                    autosize: style.autosize,
                    minRows: style.minRows,
                };
        }
    },
);
watch(
    () => autosize.value,
    () => (style.autosize = autosize.value === 'ON'),
);
watch(
    () => style.type,
    () => (currentType.value = 'Text'),
);

const label = ref<string>(props.ui.label ?? '');
watch(
    () => label.value,
    (nv) => {
        if (nv.trim()) props.ui.label = nv.trim();
        else delete props.ui.label;
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
const checkPrincipalDefault = computed(() => {
    if (currentType.value !== 'Principal') return true;
    if (!props.ui.default) return true;
    return isPrincipal(props.ui.default);
});
const checkAccountDefault = computed(() => {
    if (currentType.value !== 'Account ID') return true;
    if (!props.ui.default) return true;
    return /^[0-9a-fA-F]{64}$/.test(props.ui.default);
});
watch(
    () => defaultValue.value,
    (nv) => {
        if (checkPrincipalDefault.value && checkAccountDefault.value)
            props.ui.default = nv;
        else delete props.ui.default;
    },
);

watch(
    () => [props.data, props.ui],
    () => {
        currentType.value = wrapType(props.data.input.result as SupportedType);

        style.type = props.ui.style.type;
        style.autosize = props.ui.style.autosize;
        style.minRows = props.ui.style.minRows;
        autosize.value = style.autosize ? 'ON' : 'OFF';

        label.value = props.ui.label ?? '';
        placeholder.value = props.ui.placeholder ?? '';
        defaultValue.value = props.ui.default ?? '';
    },
);

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
    if (!checkPrincipalDefault.value) {
        ElMessage.error(t('plugin.formPreview.form.defaultValuePrincipalError'));
        return;
    }
    if (!checkAccountDefault.value) {
        ElMessage.error(t('plugin.formPreview.form.defaultValueAccountError'));
        return;
    }

    visible.value = false;
    emit('complete', props.data);
};
</script>

<template>
    <div class="text-input-editing-content">
        <el-dialog :title="`${$t('plugin.formPreview.list.textInputComponent')} ${$t(
            'plugin.formPreview.list.edit',
        )}`" v-model="visible" :before-close="() => (visible = false)" @closed="onDialogClose" class="dialog-form">
            <div class="dialog-form">
                <transition name="fade">
                    <div class="prev" v-if="props.ui.label">
                        <h2>{{ $t('plugin.formPreview.effectPreview') }}</h2>
                        <TextInputRenderVue :disabled="true" :data="props.data" :ui="props.ui" />
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
                                {{ $t('plugin.formPreview.form.selectType') }}
                            </div>
                            <div class="con">
                                <el-select v-model="currentType" :placeholder="$t('plugin.formPreview.form.selectType')"
                                    :disabled="props.ui.style.type === 'textarea'">
                                    <el-option v-for="item in supportedTypeList" :key="item" :label="item"
                                        :value="item" />
                                </el-select>
                            </div>
                            <div class="state">
                                <i v-if="!currentType" class="iconfont icon-failed"></i>
                            </div>
                            <div class="error-text">
                                {{
            !currentType
                ? $t('plugin.formPreview.form.selectTypeEmpty')
                : ''
        }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.inputType') }}
                            </div>
                            <div class="con">
                                <el-select v-model="style.type" :placeholder="$t('plugin.formPreview.form.inputType')">
                                    <el-option v-for="item in supportedStyleList" :key="item.label" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </div>
                            <div class="state"></div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.placeholder') }}
                            </div>
                            <div class="con">
                                <el-input v-model="placeholder"
                                    :placeholder="$t('plugin.formPreview.form.placeholder')" />
                            </div>
                            <div class="state"></div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.defaultValue') }}
                            </div>
                            <div class="con">
                                <el-input v-model="defaultValue"
                                    :placeholder="$t('plugin.formPreview.form.defaultValue')" />
                            </div>
                            <div class="state">
                                <i v-if="!checkPrincipalDefault || !checkAccountDefault"
                                    class="iconfont icon-failed"></i>
                            </div>
                            <div class="error-text">
                                <template v-if="!checkPrincipalDefault">
                                    {{ $t('plugin.formPreview.form.defaultValuePrincipalError') }}
                                </template>
                                <template v-if="!checkAccountDefault">
                                    {{ $t('plugin.formPreview.form.defaultValueAccountError') }}
                                </template>
                            </div>
                        </div>
                        <div class="item" v-if="style.type === 'textarea'">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.autoSize') }}
                            </div>
                            <div class="con !border-none !bg-transparent">
                                <el-radio-group v-model="autosize">
                                    <el-radio-button label="ON" />
                                    <el-radio-button label="OFF" />
                                </el-radio-group>
                            </div>
                            <div class="state"></div>
                        </div>
                        <div class="item" v-if="style.type === 'textarea'">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.minRows') }}
                            </div>
                            <div class="con">
                                <el-input-number :controls="false" :min="1" :max="10" v-model="style.minRows"
                                    :placeholder="$t('plugin.formPreview.form.defaultValue')"
                                    @keydown="channelInputLimit" />
                                <div class="state"></div>
                            </div>
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

.text-input-editing-content {
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
                        @apply dark:(border-dark-100 text-light-900/60 bg-dark-300);
                    }

                    &.is-active {
                        span {
                            background: #5ae28e;
                            border-color: #5ae28e;
                            color: #000000;
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
}
</style>
