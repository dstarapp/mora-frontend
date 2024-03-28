<script lang="ts" setup>
import { inject } from 'vue';
import { ConstantValue } from '../../../types/parts/constants';
import WrappedConstantInputVue from './input/WrappedConstantInput.vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';

const props = defineProps({
    editing: { type: Boolean, required: true },
    onEditing: { type: Function, required: true },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const emit = defineEmits(['complete']);

const onComplete = (value: ConstantValue) => {
    if (findExportedValue(value.name, value.id) !== undefined) {
        ElMessage.error(
            `${t('plugin.generic.variableName1')}${value}${t('plugin.generic.variableName2')}`,
        );
        return;
    }

    emit('complete', value);
    props.onEditing(false);
};
</script>

<template>
    <div class="input-constant-content">
        <div class="add-constant-button" v-if="!props.editing" @click="props.onEditing(true)">
            {{ $t('plugin.internalVariable.addConstant.btn') }}
            <i class="iconfont icon-plugin-add"></i>
        </div>
        <div class="input-constant" v-else>
            <WrappedConstantInputVue @complete="onComplete" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.input-constant-content {
    margin-bottom: 10px;
    width: 100%;

    .add-constant-button {
        .center();
        border: 1px solid #dddddd;
        border-radius: 8px;
        margin: 6px 0 14px 0;
        height: 25px;
        font-size: 12px;
        color: #999;
        height: 36px;
        cursor: pointer;
        transition: @transition;
        @apply dark:(border-dark-100);

        i {
            color: #4d4f69;
            font-size: 16px;
            margin-left: 6px;
            @apply dark:(text-indigo-300/80);
        }

        &:hover {
            border-color: #35d49a;
            transition: @transition;
            color: #35d49a;

            i {
                color: #35d49a;
            }
        }
    }

    .input-constant {
        display: flex;
        flex-direction: column;

        .icon-plugin-add {
            position: absolute;
            right: 15px;
            top: 12px;
            color: #999999;
            transform: rotate(45deg);
            cursor: pointer;
        }
    }
}
</style>
