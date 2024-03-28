<script lang="ts" setup>
import { PropType, ref, watch, nextTick } from 'vue';
import { InputValue } from '../../../types/parts/inputs';
import { TimeInputComponentUI } from '../../../types/parts/form/time';

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
        type: Object as PropType<TimeInputComponentUI>,
        required: true,
    },
});

const refresh = ref(true);

watch(
    () => props.ui.style,
    () => {
        refresh.value = false;
        nextTick(() => (refresh.value = true));
    },
);

const value = ref<string>(props.ui.default ?? '');

watch(
    () => [props.data, props.ui],
    () => {
        value.value = props.ui.default ?? '';
    },
);
</script>

<template>
    <div class="time-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <template v-if="refresh">
                <template v-if="props.ui.style.type === 'year'">
                    <el-date-picker type="year" format="YYYY" v-model="value" :disabled="props.disabled" :placeholder="props.ui.placeholder
                    ? props.ui.placeholder
                    : $t('plugin.formPreview.form.selectTimeYear')
                    " />
                </template>
                <template v-if="props.ui.style.type === 'month'">
                    <el-date-picker type="month" format="YYYY/MM" v-model="value" :disabled="props.disabled"
                        :placeholder="props.ui.placeholder
                    ? props.ui.placeholder
                    : $t('plugin.formPreview.form.selectTimeMonth')
                    " />
                </template>
                <template v-if="props.ui.style.type === 'week'">
                    <el-date-picker type="week" format="YYYY/MM/DD" v-model="value" :disabled="props.disabled"
                        :placeholder="props.ui.placeholder
                    ? props.ui.placeholder
                    : $t('plugin.formPreview.form.selectTimeWeek')
                    " />
                </template>
                <template v-if="props.ui.style.type === 'day'">
                    <el-date-picker type="date" format="YYYY/MM/DD" v-model="value" :disabled="props.disabled"
                        :placeholder="props.ui.placeholder
                    ? props.ui.placeholder
                    : $t('plugin.formPreview.form.selectTimeDay')
                    " />
                </template>
                <template v-if="props.ui.style.type === 'second'">
                    <el-date-picker type="datetime" format="YYYY/MM/DD hh:mm:ss" v-model="value"
                        :disabled="props.disabled" :placeholder="props.ui.placeholder
                    ? props.ui.placeholder
                    : $t('plugin.formPreview.form.selectTimeSecond')
                    " />
                </template>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.time-input-render-content {
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
            border: 1px solid #dddddd;
            border-radius: 6px;
            @apply dark:(border-dark-100);

            &.is-disabled {
                .el-input__wrapper {
                    box-shadow: none;
                    @apply bg-white dark:(bg-dark-300);
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

        :deep(.el-date-editor) {
            height: 100%;
            width: 100%;
        }
    }
}

.dark {
    .text-input-render-content {
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
