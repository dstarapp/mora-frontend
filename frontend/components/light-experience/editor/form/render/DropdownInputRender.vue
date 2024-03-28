<script lang="ts" setup>
import { PropType, ref, watch, nextTick } from 'vue';
import { InputValue } from '../../../types/parts/inputs';
import { DropdownInputComponentUI } from '../../../types/parts/form/dropdown';

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
        type: Object as PropType<DropdownInputComponentUI>,
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
    <div class="dropdown-input-render-content">
        <div class="con">
            <div class="label">
                {{ props.ui.label ?? '' }}
            </div>
            <el-select v-model="value" :disabled="props.disabled" :clearable="props.ui.style.clearable"
                :placeholder="$t('plugin.formPreview.form.defaultValue')">
                <el-option v-for="subitem in props.data.input.result['subitems'] ?? []" :key="subitem.key"
                    :label="subitem.key" :value="subitem.key" />
            </el-select>
        </div>
    </div>
</template>

<style lang="less" scoped>
.dropdown-input-render-content {
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

        :deep(.el-select) {
            width: 100%;

            .el-input {
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
                        text-align: left !important;
                        font-size: 14px;
                        @apply dark:(text-light-900/80);
                    }
                }
            }

            .el-input {
                overflow: hidden;
                text-align: left;
            }

            .el-input__wrapper {
                border: none;
                border-radius: 0;
            }
        }
    }
}
</style>
