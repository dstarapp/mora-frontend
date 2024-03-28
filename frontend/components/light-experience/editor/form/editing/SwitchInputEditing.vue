<script lang="ts" setup>
import { ref, PropType, computed, inject, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { InputValue } from '../../../types/parts/inputs';
import { SwitchInputComponentUI } from '../../../types/parts/form/switch';
import SwitchInputRenderVue from '../render/SwitchInputRender.vue';

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<SwitchInputComponentUI>,
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

const inlinePrompt = ref<'ON' | 'OFF'>(props.ui.style.inlinePrompt ? 'ON' : 'OFF');
const activeText = ref<string>(props.ui.style.activeText ?? '');
const inactiveText = ref<string>(props.ui.style.inactiveText ?? '');
watch(
    () => inlinePrompt.value,
    (nv) => {
        if (nv === 'ON') props.ui.style.inlinePrompt = true;
        else delete props.ui.style.inlinePrompt;
    },
);
watch(
    () => activeText.value,
    (nv) => {
        if (nv) props.ui.style.activeText = nv;
        else delete props.ui.style.activeText;
    },
);
watch(
    () => inactiveText.value,
    (nv) => {
        if (nv) props.ui.style.inactiveText = nv;
        else delete props.ui.style.inactiveText;
    },
);

const label = ref<string>(props.ui.label ?? '');
watch(
    () => label.value,
    (nv) => {
        if (nv.trim()) props.ui.label = nv.trim();
        else delete props.ui.label;
    },
);
const defaultValue = ref<boolean>(props.ui.default ?? false);
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
        inlinePrompt.value = props.ui.style.inlinePrompt ? 'ON' : 'OFF';
        activeText.value = props.ui.style.activeText ?? '';
        inactiveText.value = props.ui.style.inactiveText ?? '';

        label.value = props.ui.label ?? '';
        defaultValue.value = props.ui.default ?? false;
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

    visible.value = false;
    emit('complete', props.data);
};
</script>

<template>
    <div class="switch-input-editing-content">
        <el-dialog :title="`${$t('plugin.formPreview.list.switch')} ${$t('plugin.formPreview.list.edit')}`"
            v-model="visible" :before-close="() => (visible = false)" @closed="onDialogClose" class="dialog-form">
            <div class="dialog-form">
                <transition name="fade">
                    <div class="prev" v-if="props.ui.label">
                        <h2>{{ $t('plugin.formPreview.effectPreview') }}</h2>
                        <SwitchInputRenderVue :disabled="true" :data="props.data" :ui="props.ui" />
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
                                {{ $t('plugin.formPreview.form.inlinePrompt') }}
                            </div>
                            <div class="con !border-transparent !bg-transparent">
                                <el-radio-group v-model="inlinePrompt">
                                    <el-radio-button label="ON" />
                                    <el-radio-button label="OFF" />
                                </el-radio-group>
                            </div>
                            <div class="state"> </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.activeText') }}
                            </div>
                            <div class="con">
                                <el-input maxlength="20" v-model="activeText"
                                    :placeholder="$t('plugin.formPreview.form.activeText')" />
                                <div class="state"> </div>
                            </div>
                            <div class="error-text"> </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.inactiveText') }}
                            </div>
                            <div class="con">
                                <el-input maxlength="20" v-model="inactiveText"
                                    :placeholder="$t('plugin.formPreview.form.inactiveText')" />
                                <div class="state"> </div>
                            </div>
                            <div class="error-text"> </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.defaultValue') }}
                            </div>
                            <div class="con !border-transparent !bg-transparent">
                                <el-switch v-model="defaultValue" active-color="#34D399" inline-prompt />
                                <div class="state"> </div>
                            </div>
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

.switch-input-editing-content {
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
