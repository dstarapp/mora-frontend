<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const customPreview = ref<boolean>(props.ui.customPreview ?? true);
const customShape = ref<'square' | 'round'>(props.ui.customShape ?? 'square');
const width = ref<string>((props.ui.width ?? '300').replace('px', ''));

const checkWidth = computed(() => `${parseInt(width.value)}` === width.value);

watch(
    () => [customPreview.value, customShape.value, width.value],
    () => {
        if (checkWidth.value) onUIChanged();
    },
);

const emit = defineEmits(['uiChanged']);

const onUIChanged = () => {
    emit('uiChanged', {
        ...props.ui,
        customPreview: customPreview.value,
        customShape: customShape.value,
        width: `${width.value}px`,
    });
};
</script>

<template>
    <div class="image-view-ui">
        <div class="item">
            <div class="label">
                <div>{{ $t('plugin.formPreview.form.preview') }}</div>
            </div>
            <el-switch v-model="customPreview" active-color="#35D49A" />
        </div>
        <div class="item">
            <div class="label">
                <div>{{ $t('plugin.formPreview.form.shape') }}</div>
            </div>
            <div class="tab-switch">
                <span @click="customShape = 'square'" :class="{ current: customShape === 'square' }">
                    {{ $t('plugin.formPreview.form.square') }}
                </span>
                <span @click="customShape = 'round'" :class="{ current: customShape === 'round' }">
                    {{ $t('plugin.formPreview.form.round') }}
                </span>
            </div>
            <div class="error-text"> </div>
        </div>
        <div class="item">
            <div class="label">
                <div>{{ $t('plugin.formPreview.form.width') }}</div>
            </div>
            <div class="width">
                <el-input v-model="width" />
                <div class="state">
                    <i v-if="!checkWidth" class="iconfont icon-failed"></i>
                    <i v-else class="iconfont icon-chose"></i>
                </div>
            </div>
            <div class="error-text">
                {{ !checkWidth ? $t('plugin.formPreview.form.checkWidth') : '' }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.image-view-ui {
    width: 100%;
    display: flex;
    flex-direction: column;

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

    .item {
        display: flex;
        margin-bottom: 30px;
        position: relative;
        align-items: center;

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

        .state {
            margin-left: 10px;
            margin-right: 10px;
            flex-shrink: 0;

            .icon-failed {
                color: #e47470;
                font-size: 16px;
            }

            .icon-chose {
                color: #35d49a;
                font-size: 16px;
            }
        }

        .error-text {
            position: absolute;
            right: 32px;
            bottom: -22px;
            color: #e47470;
            font-size: 12px;
            height: 22px;
            line-height: 22px;
        }
    }

    .width {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100 bg-dark-300);

        :deep(.el-input) {
            border: none;
        }
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
            @apply dark:(text-light-900/60 bg-dark-300);

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
}
</style>
