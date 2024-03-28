<script lang="ts" setup>
import { ref, PropType, computed, inject, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { InputValue } from '../../../types/parts/inputs';
import { NumberInputComponentUI } from '../../../types/parts/form/number';
import NumberInputRenderVue from '../render/NumberInputRender.vue';
import BigIntInputEditingVue from './numbers/BigIntInputEditing.vue';
import IntegerInputEditingVue from './numbers/IntegerInputEditing.vue';
import FloatInputEditingVue from './numbers/FloatInputEditing.vue';

type SupportedType =
    | { type: 'nat' }
    | { type: 'nat8' }
    | { type: 'nat16' }
    | { type: 'nat32' }
    | { type: 'nat64' }
    | { type: 'int' }
    | { type: 'int8' }
    | { type: 'int16' }
    | { type: 'int32' }
    | { type: 'int64' }
    | { type: 'float32' }
    | { type: 'float64' };
type SupportedShowType =
    | 'Nat'
    | 'Nat8'
    | 'Nat16'
    | 'Nat32'
    | 'Nat64'
    | 'Int'
    | 'Int8'
    | 'Int16'
    | 'Int32'
    | 'Int64'
    | 'Float32'
    | 'Float64';

const wrapType = (type: SupportedType): SupportedShowType => {
    switch (type.type) {
        case 'nat':
            return 'Nat';
        case 'nat8':
            return 'Nat8';
        case 'nat16':
            return 'Nat16';
        case 'nat32':
            return 'Nat32';
        case 'nat64':
            return 'Nat64';
        case 'int':
            return 'Int';
        case 'int8':
            return 'Int8';
        case 'int16':
            return 'Int16';
        case 'int32':
            return 'Int32';
        case 'int64':
            return 'Int64';
        case 'float32':
            return 'Float32';
        case 'float64':
            return 'Float64';
    }
};

const unwrapType = (type: SupportedShowType): SupportedType => {
    switch (type) {
        case 'Nat':
            return { type: 'nat' };
        case 'Nat8':
            return { type: 'nat8' };
        case 'Nat16':
            return { type: 'nat16' };
        case 'Nat32':
            return { type: 'nat32' };
        case 'Nat64':
            return { type: 'nat64' };
        case 'Int':
            return { type: 'int' };
        case 'Int8':
            return { type: 'int8' };
        case 'Int16':
            return { type: 'int16' };
        case 'Int32':
            return { type: 'int32' };
        case 'Int64':
            return { type: 'int64' };
        case 'Float32':
            return { type: 'float32' };
        case 'Float64':
            return { type: 'float64' };
    }
};

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<NumberInputComponentUI>,
        required: true,
    },
});

const uiRef = ref<{ complete: () => NumberInputComponentUI | undefined }>();
const refresh = ref(true);

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;
const visible = ref(true);

const checkName = computed<'empty' | 'repeated' | ''>(() => {
    const name = props.data.name.trim();
    if (!name) return 'empty';
    if (findExportedValue(name, props.data.id)) return 'repeated';
    return '';
});

const supportedTypeList = ref<SupportedShowType[]>([
    'Nat',
    'Nat8',
    'Nat16',
    'Nat32',
    'Nat64',
    'Int',
    'Int8',
    'Int16',
    'Int32',
    'Int64',
    'Float32',
    'Float64',
]);
const currentType = ref<SupportedShowType>(wrapType(props.data.input.result as SupportedType));
watch(
    () => currentType.value,
    () => {

        props.data.input.result = unwrapType(currentType.value);
        props.data.ui.style = { type: unwrapType(currentType.value).type };
        delete props.data.ui.default;

        refresh.value = false;
        nextTick(() => (refresh.value = true));
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

watch(
    () => [props.data, props.ui],
    () => {

        currentType.value = wrapType(props.data.input.result as SupportedType);

        props.ui.style = { ...props.ui.style };
        label.value = props.ui.label ?? '';
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

    if (!uiRef.value) return;
    const ui = uiRef.value.complete();
    if (!ui) return;

    ui.label = props.ui.label;

    visible.value = false;
    emit('complete', props.data);
};
</script>

<template>
    <div class="number-input-editing-content">
        <el-dialog :title="`${$t('plugin.formPreview.list.numberInputComponent')} ${$t(
            'plugin.formPreview.list.edit',
        )}`" v-model="visible" :before-close="() => (visible = false)" @closed="onDialogClose" class="dialog-form">
            <div class="dialog-form">
                <transition name="fade">
                    <div class="prev" v-if="props.ui.label">
                        <h2>{{ $t('plugin.formPreview.effectPreview') }}</h2>
                        <NumberInputRenderVue :disabled="true" :data="props.data" :ui="props.ui" />
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
                                <el-select v-model="currentType"
                                    :placeholder="$t('plugin.formPreview.form.selectType')">
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
                        <template v-if="refresh">
                            <template v-if="['nat', 'int', 'nat64', 'int64'].includes(props.ui.style.type)
            ">
                                <BigIntInputEditingVue :ui="(props.ui as any)" ref="uiRef" />
                            </template>
                            <template v-if="['nat8', 'nat16', 'nat32', 'int8', 'int16', 'int32'].includes(
            props.ui.style.type,
        )
            ">
                                <IntegerInputEditingVue :ui="(props.ui as any)" ref="uiRef" />
                            </template>
                            <template v-if="['float32', 'float64'].includes(props.ui.style.type)">
                                <FloatInputEditingVue :ui="(props.ui as any)" ref="uiRef" />
                            </template>
                        </template>
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

.number-input-editing-content {
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
}
</style>
