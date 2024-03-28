<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { getPlaceholder } from '../common';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { NAT64_MAX, INT64_MAX, INT64_MIN } from '@mora-light/core/types/candid';

const props = defineProps({
    type: {
        type: String as PropType<'nat' | 'int' | 'nat64' | 'int64'>,
        required: true,
    },
});

const value = ref<string>('');

let max: string | undefined = undefined;
let min: string | undefined = undefined;

const reload = () => {
    value.value = '';
    switch (props.type) {
        case 'nat':
            max = undefined;
            min = '0';
            break;
        case 'int':
            max = undefined;
            min = undefined;
            break;
        case 'nat64':
            max = NAT64_MAX;
            min = '0';
            break;
        case 'int64':
            max = INT64_MAX;
            min = INT64_MIN;
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
    if (!value.value) {
        ElMessage.error(t('plugin.internalVariable.defaultValueEmpty'));
        return;
    }

    const v = BigInt(value.value);
    if (max !== undefined && BigInt(max) < v) {
        ElMessage.error(t('plugin.variableTip.tooBigError'));

        return;
    }
    if (min !== undefined && v < BigInt(min)) {
        ElMessage.error(t('plugin.variableTip.tooSmallError'));
        return;
    }

    const constant: ConstantValueConstant = {
        result: { type: props.type },
        value: { type: 'bigint', value: `${value.value}` },
    };

    emit('complete', constant);
};

const checkInput = () => {
    let v = value.value;

    let changed = false;

    if (v.trim() !== v) {
        v = v.trim();
        changed = true;
    }

    let vv = '';
    for (let i = 0; i < v.length; i++) {
        const c = v.charAt(i);
        if (i === 0 && ['int', 'int64'].includes(props.type) && c === '-') {
            vv = vv + c;
            continue;
        }
        switch (c) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                vv = vv + c;
                break;
        }
    }
    if (vv !== v) changed = true;

    if (changed) value.value = vv;
};
</script>

<template>
    <div class="bigint-constant-content">
        <el-input v-model="value" :placeholder="getPlaceholder(props.type)" @input="checkInput" />
        <div class="submit" @click="submit">
            <i class="iconfont icon-plugin-add"></i>
        </div>
    </div>
</template>

<style lang="less" scoped>
.bigint-constant-content {
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

    >.submit {
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
            @apply dark: (text-light-900/80);
        }
    }
}
</style>
