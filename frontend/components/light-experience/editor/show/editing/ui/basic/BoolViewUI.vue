<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const customTrueText = ref<string>(props.ui.customTrueText ?? 'true');
const customFalseText = ref<string>(props.ui.customFalseText ?? 'false');

const checkCustomTrueText = computed(() => !!customTrueText.value);
const checkCustomFalseText = computed(() => !!customFalseText.value);

watch(
    () => [customTrueText.value, customFalseText.value],
    () => {
        if (checkCustomTrueText.value && checkCustomFalseText.value) onUIChanged();
    },
);

const emit = defineEmits(['uiChanged']);

const onUIChanged = () => {
    emit('uiChanged', {
        ...props.ui,
        customTrueText: customTrueText.value,
        customFalseText: customFalseText.value,
    });
};
</script>

<template>
    <div class="bool-view-ui">
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.trueTextLabel') }}</div>
            <div class="textInput">
                <el-input maxlength="50" v-model="customTrueText"
                    :placeholder="$t('plugin.formPreview.form.trueText')" />
                <div class="state">
                    <i v-if="!checkCustomTrueText" class="iconfont icon-failed"></i>
                    <i v-else class="iconfont icon-chose"></i>
                </div>
            </div>
            <div class="error-text" v-if="!checkCustomTrueText">
                {{ $t('plugin.formPreview.form.wrongTrueText') }}
            </div>
        </div>
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.falseTextLabel') }}</div>
            <div class="textInput">
                <el-input maxlength="50" v-model="customFalseText"
                    :placeholder="$t('plugin.formPreview.form.falseTextPlaceholder')" />
                <div class="state">
                    <i v-if="!checkCustomFalseText" class="iconfont icon-failed"></i>
                    <i v-else class="iconfont icon-chose"></i>
                </div>
            </div>
            <div class="error-text" v-if="!checkCustomFalseText">
                {{ $t('plugin.formPreview.form.wrongFalseText') }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.bool-view-ui {
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

        .textInput {
            width: 100%;
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #dddddd;
            border-radius: 8px;
            @apply dark:(border-dark-100 bg-dark-300);

            :deep(.el-input) {
                border: none;
            }
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
}
</style>
