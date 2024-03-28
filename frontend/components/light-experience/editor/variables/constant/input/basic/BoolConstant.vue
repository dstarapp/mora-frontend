<script lang="ts" setup>
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { ref } from 'vue';

const value = ref(false);

const emit = defineEmits(['complete']);

const submit = () => {
    const constant: ConstantValueConstant = {
        result: { type: 'bool' },
        value: value.value,
    };

    emit('complete', constant);
};
</script>

<template>
    <div class="bool-constant-content">
        <div class="bool-box">
            <p>{{ $t('plugin.internalVariable.addConstant.defaultValue') }}</p>
            <el-switch
                v-model="value"
                active-color="#34D399"
                inline-prompt
                active-text="true"
                inactive-text="false"
            />
        </div>
        <div class="submit" @click="submit">
            <i class="iconfont icon-plugin-add"></i>
        </div>
    </div>
</template>

<style lang="less" scoped>
.bool-constant-content {
    width: 100%;
    height: 100%;
    display: flex;
    > .bool-box {
        height: 36px;
        display: flex;
        flex: 1;
        border-radius: 8px 0 0 8px;
        align-items: center;
        border: 1px solid #e8e8e8;
        @apply dark:(border-dark-100);
        p {
            font-size: 14px;
            color: #000000;
            margin-left: 13px;
            margin-right: 10px;
            @apply dark:(text-light-900/80);
        }
    }

    > .submit {
        .center();
        width: 40px;
        height: 36px;
        border-radius: 0 8px 8px 0;
        border: 1px solid #e8e8e8;
        border-left: none;
        cursor: pointer;
        @apply dark:(border-dark-100);
        i {
            color: #4c4f6b;
            font-size: 16px;
            @apply dark:(text-light-900/60);
        }
    }
}
</style>
