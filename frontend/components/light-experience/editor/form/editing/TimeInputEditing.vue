<script lang="ts" setup>
import { ref, PropType, computed, inject, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { InputValue } from '../../../types/parts/inputs';
import { TimeInputComponentUI } from '../../../types/parts/form/time';
import TimeInputRenderVue from '../render/TimeInputRender.vue';

const props = defineProps({
    data: {
        type: Object as PropType<InputValue>,
        required: true,
    },
    ui: {
        type: Object as PropType<TimeInputComponentUI>,
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

const SupportedShowTimeTypes = ref(['year', 'month', 'week', 'day', 'second']);
const SupportedShowTimeUnits = ref(['s', 'ms', 'ns']);

const style = reactive<{
    type: 'year' | 'month' | 'week' | 'day' | 'second';
    unit: 's' | 'ms' | 'ns';
}>({ ...props.ui.style });

watch(
    () => style.type,
    (nv) => {
        defaultValue.value = undefined;
        props.data.ui.style = { type: nv, unit: style.unit };
    },
);
watch(
    () => style.unit,
    (nv) => {
        defaultValue.value = undefined;
        props.data.ui.style = { type: style.type, unit: nv };
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
const placeholder = ref<string>(props.ui.placeholder ?? '');
watch(
    () => placeholder.value,
    (nv) => {
        if (nv.trim()) props.ui.placeholder = nv.trim();
        else delete props.ui.placeholder;
    },
);

const parseValueToDate = (value: string | undefined, unit: 's' | 'ms' | 'ns'): Date | undefined => {
    if (value === undefined) return undefined;
    let timestamp = parseInt(value);
    switch (unit) {
        case 's':
            timestamp *= 1000;
            break;
        case 'ms':
            break;
        case 'ns':
            timestamp /= 1000000;
            break;
    }
    return new Date(timestamp);
};
const defaultValue = ref<Date | undefined>(
    props.ui.default ? parseValueToDate(props.ui.default, style.unit) : undefined,
);
watch(
    () => defaultValue.value,
    (nv) => {
        console.error('time default value', nv);
        if (nv) {
            props.ui.default = ((): string => {
                let timestamp = nv.getTime();
                switch (style.unit) {
                    case 's':
                        timestamp /= 1000;
                        break;
                    case 'ms':
                        break;
                    case 'ns':
                        timestamp *= 1000000;
                        break;
                }
                return `${timestamp}`;
            })();
        } else {
            delete props.ui.default;
        }
    },
);

watch(
    () => [props.data, props.ui],
    () => {
        style.type = props.ui.style.type;
        style.unit = props.ui.style.unit;
        label.value = props.ui.label ?? '';
        defaultValue.value = props.ui.default
            ? parseValueToDate(props.ui.default, style.unit)
            : undefined;
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
    <div class="time-input-editing-content">
        <el-dialog :title="`${$t('plugin.formPreview.list.time')} ${$t('plugin.formPreview.list.edit')}`"
            v-model="visible" :before-close="() => (visible = false)" @closed="onDialogClose" class="dialog-form">
            <div class="dialog-form">
                <transition name="fade">
                    <div class="prev" v-if="props.ui.label">
                        <h2>{{ $t('plugin.formPreview.effectPreview') }}</h2>
                        <TimeInputRenderVue :disabled="true" :data="props.data" :ui="props.ui" />
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
                                {{ $t('plugin.formPreview.form.selectTimeUnit') }}
                            </div>
                            <div class="con">
                                <el-select v-model="style.unit"
                                    :placeholder="$t('plugin.formPreview.form.selectTimeUnit')">
                                    <el-option v-for="item in SupportedShowTimeUnits" :key="item" :label="item"
                                        :value="item" />
                                </el-select>
                            </div>
                            <div class="error-text"> </div>
                        </div>
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.selectTimeType') }}
                            </div>
                            <div class="con">
                                <el-select v-model="style.type"
                                    :placeholder="$t('plugin.formPreview.form.selectTimeType')">
                                    <el-option v-for="item in SupportedShowTimeTypes" :key="item" :label="item"
                                        :value="item" />
                                </el-select>
                            </div>
                            <div class="error-text"> </div>
                        </div>
                        <div class="item">
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
                                <template v-if="style.type === 'year'">
                                    <el-date-picker type="year" format="YYYY" v-model="defaultValue" :placeholder="placeholder
                ? placeholder
                : $t('plugin.formPreview.form.selectTimeYear')
            " />
                                </template>
                                <template v-if="style.type === 'month'">
                                    <el-date-picker type="month" format="YYYY/MM" v-model="defaultValue" :placeholder="placeholder
                ? placeholder
                : $t('plugin.formPreview.form.selectTimeMonth')
            " />
                                </template>
                                <template v-if="style.type === 'week'">
                                    <el-date-picker type="week" format="YYYY/MM/DD" v-model="defaultValue" :placeholder="placeholder
                ? placeholder
                : $t('plugin.formPreview.form.selectTimeWeek')
            " />
                                </template>
                                <template v-if="style.type === 'day'">
                                    <el-date-picker type="date" format="YYYY/MM/DD" v-model="defaultValue" :placeholder="placeholder
                ? placeholder
                : $t('plugin.formPreview.form.selectTimeDay')
            " />
                                </template>
                                <template v-if="style.type === 'second'">
                                    <el-date-picker type="datetime" format="YYYY/MM/DD hh:mm:ss" v-model="defaultValue"
                                        :placeholder="placeholder
                ? placeholder
                : $t('plugin.formPreview.form.selectTimeSecond')
            " />
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

.time-input-editing-content {
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

            :deep(.el-date-editor) {
                height: 100%;
                width: 100%;
            }
        }
    }
}
</style>
