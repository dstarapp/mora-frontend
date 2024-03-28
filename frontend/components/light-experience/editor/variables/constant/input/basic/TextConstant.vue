<script lang="ts" setup>
import { ref } from 'vue';
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { getPlaceholder } from '../common';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';

const value = ref<string>('');

const emit = defineEmits(['complete']);

const submit = () => {
    if (!value.value) {
        ElMessage.error(t('plugin.internalVariable.defaultValueEmpty'));
        return;
    }

    const constant: ConstantValueConstant = {
        result: { type: 'text' },
        value: value.value,
    };

    emit('complete', constant);
};
</script>

<template>
    <div class="text-constant-content">
        <el-input v-model="value" :placeholder="getPlaceholder('text')" />
        <div class="submit" @click="submit">
            <i class="iconfont icon-plugin-add"></i>
        </div>
    </div>
</template>

<style lang="less" scoped>
.text-constant-content {
    width: 100%;
    height: 100%;
    display: flex;

    :deep(> .el-input) {
        display: flex;
        flex: 1;
        border-radius: 8px 0 0 8px;
        border: 1px solid #e8e8e8;
        @apply dark:(border-dark-100);

        .el-input__wrapper {
            padding: 0 10px;
            height: 36px;
            line-height: 36px;
            background: none !important;

            .el-input__inner {
                color: #666;
                text-align: left;
                font-size: 14px;
                @apply dark: (text-light-900/80);
            }
        }

        .el-input__wrapper {
            padding: 0 14px;
        }
    }

    > .submit {
        .center();
        width: 40px;
        border-radius: 0 8px 8px 0;
        border: 1px solid #e8e8e8;
        border-left: none;
        cursor: pointer;
        @apply dark:(border-dark-100);

        i {
            color: #4c4f6b;
            font-size: 16px;
            @apply dark: (text-light-900/60);
        }
    }
}
</style>
