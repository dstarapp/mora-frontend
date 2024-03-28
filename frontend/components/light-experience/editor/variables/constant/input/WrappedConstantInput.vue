<script lang="ts" setup>
import { ref, inject } from 'vue';
import { SupportedType, SupportedTypeList } from './common';
import { v4 as uuid } from 'uuid';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { ConstantValue, ConstantValueConstant } from '../../../../types/parts/constants';
import BoolConstantVue from './basic/BoolConstant.vue';
import BigIntConstantVue from './basic/BigIntConstant.vue';
import IntegerConstantVue from './basic/IntegerConstant.vue';
import FloatConstantVue from './basic/FloatConstant.vue';
import NullConstantVue from './basic/NullConstant.vue';
import TextConstantVue from './basic/TextConstant.vue';
import PrincipalConstantVue from './basic/PrincipalConstant.vue';
import BlobConstantVue from './basic/BlobConstant.vue';
import VecConstantVue from './combined/VecConstant.vue';

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const type = ref<SupportedType>('bool');
const name = ref<string>('');

const getConstantSourceData = (
    constant: ConstantValueConstant,
    name: string,
): ConstantValue | undefined => {
    if (!name) {
        ElMessage.error(t('plugin.internalVariable.addConstant.submitError'));
        return undefined;
    }
    const id = uuid();
    if (findExportedValue(name, id) !== undefined) {
        ElMessage.error(
            `${t('plugin.generic.variableName1')}${name}${t('plugin.generic.variableName2')}`,
        );
        return undefined;
    }
    return {
        id,
        name,
        type: 'constant',
        constant,
    };
};

const emit = defineEmits(['complete']);

const onComplete = (constant: ConstantValueConstant, innerName?: string) => {
    let value: ConstantValue | undefined = getConstantSourceData(constant, innerName ?? name.value);
    if (value === undefined) return;
    emit('complete', value);
};
</script>

<template>
    <div class="wrapped-constant-input-content">
        <div class="add-item">
            <el-select filterable default-first-option v-model="type"
                :placeholder="$t('plugin.internalVariable.selectType')" size="large">
                <el-option v-for="item in SupportedTypeList" :key="item" :label="item" :value="item" />
            </el-select>
            <el-input v-if="type !== 'null'" v-model="name"
                :placeholder="$t('plugin.internalVariable.addConstant.constantName')" />
        </div>
        <template v-if="type === 'bool'">
            <BoolConstantVue @complete="onComplete" />
        </template>
        <template v-else-if="type === 'null'">
            <NullConstantVue @complete="onComplete" />
        </template>
        <template v-else-if="type === 'text'">
            <TextConstantVue @complete="onComplete" />
        </template>
        <template v-else-if="type === 'principal'">
            <PrincipalConstantVue @complete="onComplete" />
        </template>
        <template v-else-if="['nat', 'int', 'nat64', 'int64'].includes(type)">
            <BigIntConstantVue :type="(type as any)" @complete="onComplete" />
        </template>
        <template v-else-if="['nat8', 'nat16', 'nat32', 'int8', 'int16', 'int32'].includes(type)">
            <IntegerConstantVue :type="(type as any)" @complete="onComplete" />
        </template>
        <template v-else-if="['float32', 'float64'].includes(type)">
            <FloatConstantVue :type="(type as any)" @complete="onComplete" />
        </template>
        <template v-else-if="type === 'blob'">
            <BlobConstantVue @complete="onComplete" />
        </template>
        <template v-else-if="type === 'vec'">
            <VecConstantVue @complete="onComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.wrapped-constant-input-content {
    width: 100%;

    >.add-item {
        display: flex;
        width: 100%;
        margin-bottom: 10px;
        margin-top: 4px;

        :deep(.el-select) {
            display: flex;
            flex: 1;
            margin: 0;

            .select-trigger {
                width: 100%;
            }

            .el-input .el-input__wrapper {
                border: 0;
                border-radius: 5px;

                .el-input__suffix-inner {
                    i {
                        color: #333;
                        font-size: 16px;
                        @apply dark:(text-light-900/80);
                    }
                }
            }

            .el-input {
                border: 1px solid #e8e8e8;
                border-radius: 6px;
                @apply dark: (border-dark-100);

                .el-input__wrapper {
                    padding: 0 10px;
                    height: 36px;
                    line-height: 36px;

                    .el-input__inner {
                        color: #666;
                        text-align: center;
                        font-size: 14px;
                        @apply dark: (text-light-900/80);
                    }
                }
            }
        }

        :deep(> .el-input) {
            display: flex;
            flex: 1.8;
            border-radius: 8px;
            margin-left: 13px;
            border: 1px solid #e8e8e8;
            @apply dark:(border-dark-100);

            .el-input__wrapper {
                padding: 0 10px;
                height: 36px;
                line-height: 36px;
                border-radius: 6px;

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
    }
}
</style>
