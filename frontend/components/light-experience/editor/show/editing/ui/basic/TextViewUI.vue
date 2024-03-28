<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const textAlign = ref<'left' | 'center' | 'right'>(props.ui.textAlign ?? 'left');
const fontSize = ref<string>(props.ui.fontSize ?? '14px');
const color = ref<string>(props.ui.color ?? '#000000');
const fontSizeOption = ref<string[]>([
    '12px',
    '14px',
    '18px',
    '22px',
    '24px',
    '32px',
    '36px',
    '40px',
    '48px',
    '56px',
]);

watch(
    () => [textAlign.value, fontSize.value, color.value],
    () => onUIChanged(),
);

const emit = defineEmits(['uiChanged']);

const onUIChanged = () => {
    emit('uiChanged', {
        ...props.ui,
        textAlign: textAlign.value,
        fontSize: fontSize.value,
        color: color.value,
    });
};
</script>

<template>
    <div class="text-view-ui">
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.alignment') }}</div>
            <div class="tab-switch">
                <span @click="textAlign = 'left'" :class="{ current: textAlign === 'left' }">
                    {{ $t('plugin.formPreview.form.left') }}
                </span>
                <span @click="textAlign = 'center'" :class="{ current: textAlign === 'center' }">
                    {{ $t('plugin.formPreview.form.center') }}
                </span>
                <span @click="textAlign = 'right'" :class="{ current: textAlign === 'right' }">
                    {{ $t('plugin.formPreview.form.right') }}
                </span>
            </div>
        </div>
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.fontSize') }}</div>
            <div class="font-size">
                <el-select v-model="fontSize">
                    <el-option v-for="item in fontSizeOption" :key="item" :label="item" :value="item" />
                </el-select>
            </div>
        </div>
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.color') }}</div>
            <div class="color-picker">
                <el-color-picker v-model="color" size="large" />
            </div>
            <div class="state"></div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.text-view-ui {
    width: 100%;
    display: flex;
    flex-direction: column;

    .item {
        display: flex;
        margin-bottom: 30px;
        position: relative;
        align-items: center;
    }

    .label {
        font-size: 14px;
        color: #666666;
        width: 105px;
        text-align: left;
        margin-right: 20px;
        line-height: 38px;
        flex-shrink: 0;
        @apply dark:(text-light-900/60);
    }

    .tab-switch {
        width: 100%;
        flex: 1;
        display: flex;
        position: relative;
        height: 38px;

        span {
            .center();
            cursor: pointer;
            flex: 1;
            border-top: 1px solid #dddddd;
            border-bottom: 1px solid #dddddd;
            box-sizing: border-box;
            font-weight: 400;
            font-size: 14px;
            color: #000000;
            @apply dark:(border-dark-100 bg-dark-300 text-light-900/80);

            &:first-child {
                border-radius: 8px 0 0 8px;
                border-left: 1px solid #dddddd;
                @apply dark:(border-dark-100);
            }

            &:last-child {
                border-radius: 0 8px 8px 0;
                border-right: 1px solid #dddddd;
                @apply dark:(border-dark-100);
            }

            &.current {
                border: none;
                background: #5ae28e;
                color: #000000;
            }
        }
    }

    .font-size {
        width: 100%;

        :deep(.el-input) {
            border: 1px solid #dddddd;
            border-radius: 6px;
            @apply dark:(border-dark-100);

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
    }

    .state {
        height: 32px;
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-shrink: 0;

        .icon-failed {
            color: #e47470;
            font-size: 18px;
        }

        .icon-chose {
            color: #35d49a;
            font-size: 18px;
        }
    }
}
</style>
