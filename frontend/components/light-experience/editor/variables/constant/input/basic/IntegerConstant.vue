<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { getPlaceholder } from '../common';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import {
    INT16_MAX,
    INT16_MIN,
    INT32_MAX,
    INT32_MIN,
    INT8_MAX,
    INT8_MIN,
    NAT16_MAX,
    NAT32_MAX,
    NAT8_MAX,
    NAT_MIN,
} from '@mora-light/core/types/candid';

const props = defineProps({
    type: {
        type: String as PropType<'nat8' | 'nat16' | 'nat32' | 'int8' | 'int16' | 'int32'>,
        required: true,
    },
});

const value = ref<number>(0);

const max = ref<number>(0);
const min = ref<number>(0);

const reload = () => {
    value.value = 0;
    switch (props.type) {
        case 'nat8':
            max.value = Number(NAT8_MAX);
            min.value = Number(NAT_MIN);
            break;
        case 'nat16':
            max.value = Number(NAT16_MAX);
            min.value = Number(NAT_MIN);
            break;
        case 'nat32':
            max.value = Number(NAT32_MAX);
            min.value = Number(NAT_MIN);
            break;
        case 'int8':
            max.value = Number(INT8_MAX);
            min.value = Number(INT8_MIN);
            break;
        case 'int16':
            max.value = Number(INT16_MAX);
            min.value = Number(INT16_MIN);
            break;
        case 'int32':
            max.value = Number(INT32_MAX);
            min.value = Number(INT32_MIN);
            break;
    }
};

watch(
    () => props.type,
    () => reload(),
    { immediate: true },
);

const emit = defineEmits(['complete']);

const submit = () => {
    if (!value.value && value.value !== 0) {
        ElMessage.error(t('plugin.internalVariable.defaultValueEmpty'));
        return;
    }

    const constant: ConstantValueConstant = {
        result: { type: props.type },
        value: Number(value.value),
    };

    emit('complete', constant);
};

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};
</script>

<template>
    <div class="integer-constant-content">
        <el-input-number
            v-model="value"
            :controls="false"
            :max="Number(max)"
            :min="Number(min)"
            :placeholder="getPlaceholder(props.type)"
            @keydown="channelInputLimit"
        />
        <div class="submit" @click="submit">
            <i class="iconfont icon-plugin-add"></i>
        </div>
    </div>
</template>

<style lang="less" scoped>
.integer-constant-content {
    width: 100%;
    height: 100%;
    display: flex;

    :deep(> .el-input-number) {
        margin: 0;
        display: flex;
        flex: 1;
        border-radius: 8px 0 0 8px;
        border: 1px solid #e8e8e8;
        @apply dark: (border-dark-100);

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
    }

    > .submit {
        .center();
        width: 40px;
        border-radius: 0 8px 8px 0;
        border: 1px solid #e8e8e8;
        border-left: none;
        cursor: pointer;
        @apply dark: (border-dark-100);

        i {
            color: #4c4f6b;
            font-size: 16px;
            @apply dark: (text-light-900/60);
        }
    }
}
</style>
