<script lang="ts" setup>
import { inject, Ref } from 'vue';
import { ConstantValue } from '../../../types/parts/constants';
import InputConstantVue from './InputConstant.vue';
import {
    CandidBigInt,
    CandidPrincipal,
    CandidType,
    CandidValue,
} from '@mora-light/core/types/candid';

const props = defineProps({
    editing: { type: Boolean, required: true },
    onEditing: { type: Function, required: true },
});

const constants = inject<Ref<ConstantValue[]>>('CONSTANTS')!;
const pushConstant = inject<(v: ConstantValue) => void>('CONSTANTS_PUSH')!;
const deleteConstant = inject<(index: number) => void>('CONSTANTS_DELETE')!;

const onAddConstant = (value: ConstantValue) => pushConstant(value);

const onDeleteConstant = (index: number) => {
    if (0 <= index && index < constants.value.length) deleteConstant(index);
};

const valueTip = (type: CandidType, value: CandidValue): string | number | null => {
    switch (type.type) {
        case 'nat':
        case 'int':
        case 'nat64':
        case 'int64':
            return (value as CandidBigInt).value;
        case 'nat8':
        case 'nat16':
        case 'nat32':
        case 'int8':
        case 'int16':
        case 'int32':
            return value as number;
        case 'null':
            return value as null;
        case 'text':
            return value as string;
        case 'principal':
            return (value as CandidPrincipal).value;
        case 'vec':
            switch (type.subtype.type) {
                case 'nat':
                case 'int':
                case 'nat64':
                case 'int64':
                    return `[${(value as CandidValue[])
                        .map((v) => valueTip(type.subtype, v))
                        .join(',')}]`;
            }
            return JSON.stringify((value as CandidValue[]).map((v) => valueTip(type.subtype, v)));
    }
    return JSON.stringify(value);
};
</script>

<template>
    <div class="constant-value-content">
        <InputConstantVue :editing="props.editing" :onEditing="props.onEditing" @complete="onAddConstant" />
        <div class="items">
            <template v-if="constants.length">
                <div class="item" v-for="(item, index) in constants" :key="item.id">
                    <el-tooltip effect="dark" placement="bottom" :disabled="item.constant.result.type === 'null'">
                        <template #content>
                            <p class="tooltip-content w-75 text-center">
                                {{ valueTip(item.constant.result, item.constant.value) }}
                            </p>
                        </template>
                        <div>
                            <b>{{ index + 1 }}</b>
                            <p>{{ item.name }}</p>
                            <strong>
                                {{ item.constant.result.type }}
                                {{
            item.constant.result.type === 'vec'
                ? ` ${item.constant.result.subtype.type}`
                : ``
        }}
                            </strong>
                            <button @click="onDeleteConstant(index)" class="iconfont icon-plugin-add"></button>
                        </div>
                    </el-tooltip>
                </div>
            </template>
            <template v-else>
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <p>{{ $t('plugin.internalVariable.noData') }}</p>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '../list.less';

.constant-value-content {
    width: 100%;
}
</style>
