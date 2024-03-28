<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
    NAT8_MAX,
    NAT16_MAX,
    NAT32_MAX,
    NAT_MIN,
    INT8_MAX,
    INT8_MIN,
    INT16_MAX,
    INT16_MIN,
    INT32_MAX,
    INT32_MIN,
    FLOAT32_REGEX,
    FLOAT64_REGEX,
    NAT64_MAX,
    INT64_MAX,
    INT64_MIN,
    CandidType,
    CandidValue,
} from '@mora-light/core/types/candid';
import { isPrincipal } from '@mora-light/core/types/candid';
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { getPlaceholder } from '../common';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';

type SupportSubtype =
    | 'nat'
    | 'nat8'
    | 'nat16'
    | 'nat32'
    | 'nat64'
    | 'int'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'float32'
    | 'float64'
    | 'null'
    | 'text'
    | 'principal';

const SubtypeList = [
    'text',
    'principal',
    'null',
    'nat',
    'nat8',
    'nat16',
    'nat32',
    'nat64',
    'int',
    'int8',
    'int16',
    'int32',
    'int64',
    'float32',
    'float64',
];

const subtype = ref<SupportSubtype>('nat');
const length = ref(1);
const stringValue = ref<string[]>(['']);
const numberValue = ref<number[]>([0]);

const numberMax = ref<number>(0);
const numberMin = ref<number>(0);

watch(
    () => subtype.value,
    () => {
        length.value = 1;
        stringValue.value = [''];
        numberValue.value = [0];

        const mm = reload();
        numberMax.value = mm.max;
        numberMin.value = mm.min;

        for (let i = 0; i < length.value; i++) {
            stringValue.value[i] = '';
            numberValue.value[i] = 0;
        }
    },
);

watch(
    () => length.value,
    () => {
        for (let i = 0; i < length.value; i++) {
            if (stringValue.value[i] === undefined) stringValue.value[i] = '';
            if (numberValue.value[i] === undefined) numberValue.value[i] = 0;
        }
    },
);

const reload = (): { max: number; min: number } => {
    switch (subtype.value) {
        case 'nat8':
            return { max: Number(NAT8_MAX), min: Number(NAT_MIN) };
        case 'nat16':
            return { max: Number(NAT16_MAX), min: Number(NAT_MIN) };
        case 'nat32':
            return { max: Number(NAT32_MAX), min: Number(NAT_MIN) };
        case 'int8':
            return { max: Number(INT8_MAX), min: Number(INT8_MIN) };
        case 'int16':
            return { max: Number(INT16_MAX), min: Number(INT16_MIN) };
        case 'int32':
            return { max: Number(INT32_MAX), min: Number(INT32_MIN) };
    }
    return { max: 0, min: 0 };
};

const emit = defineEmits(['complete']);

const submit = () => {
    const type: CandidType = { type: 'vec', subtype: { type: subtype.value } };

    let value: CandidValue[] = [];
    if (subtype.value === 'null') {
        for (let i = 0; i < length.value; i++) value[i] = null;
    } else if (['nat8', 'nat16', 'nat32', 'int8', 'int16', 'int32'].includes(subtype.value)) {
        for (let i = 0; i < length.value; i++) value[i] = numberValue.value[i];
    } else {
        switch (subtype.value) {
            case 'text':
                for (let i = 0; i < length.value; i++) value[i] = stringValue.value[i];
                break;
            case 'principal':
                for (let i = 0; i < length.value; i++) {
                    if (!isPrincipal(stringValue.value[i])) {
                        ElMessage.error(t('plugin.internalVariable.pidError'));
                        return false;
                    }
                    value[i] = {
                        type: 'principal',
                        value: stringValue.value[i],
                    };
                }
                break;
            case 'nat':
            case 'nat64':
            case 'int':
            case 'int64':
                let max: string | undefined = undefined;
                let min: string | undefined = undefined;
                switch (subtype.value) {
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
                for (let i = 0; i < length.value; i++) {
                    const v = BigInt(stringValue.value[i]);
                    if (max !== undefined && BigInt(max) < v) {
                        ElMessage.error(t('plugin.variableTip.tooBigError'));
                        return;
                    }
                    if (min !== undefined && v < BigInt(min)) {
                        ElMessage.error(t('plugin.variableTip.tooSmallError'));
                        return;
                    }
                    value[i] = { type: 'bigint', value: `${v}` };
                }
                break;
            case 'float32':
            case 'float64':
                const regex = subtype.value === 'float32' ? FLOAT32_REGEX : FLOAT64_REGEX;
                for (let i = 0; i < length.value; i++) {
                    if (!stringValue.value[i].trim().match(regex)) {
                        ElMessage.error(t('plugin.variableTip.valueError'));
                        return;
                    }
                    value[i] = parseFloat(stringValue.value[i].trim());
                }
                break;
        }
    }

    const constant: ConstantValueConstant = {
        result: type,
        value: value,
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

const checkInput = (index: number) => {
    if (!['nat', 'int', 'nat64', 'int64'].includes(subtype.value)) return;

    let v = stringValue.value[index];

    let changed = false;

    if (v.trim() !== v) {
        v = v.trim();
        changed = true;
    }

    let vv = '';
    for (let i = 0; i < v.length; i++) {
        const c = v.charAt(i);
        if (i === 0 && ['int', 'int64'].includes(subtype.value) && c === '-') {
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

    if (changed) stringValue.value[index] = vv;
};
</script>

<template>
    <div class="vec-constant-content">
        <div class="subtype-length">
            <el-select v-model="subtype" :placeholder="$t('plugin.internalVariable.selectVecType')" size="large">
                <el-option v-for="item in SubtypeList" :key="item" :label="item" :value="item" />
            </el-select>
            <el-input-number v-model="length" :min="1" :max="100" controls-position="right" />
        </div>
        <div class="value-list">
            <div v-for="(_, index) in length" :key="index">
                <template v-if="subtype === 'null'"></template>
                <template v-else-if="['nat8', 'nat16', 'nat32', 'int8', 'int16', 'int32'].includes(subtype)
                ">
                    <el-input-number :min="Number(numberMin)" :max="Number(numberMax)" :controls="false"
                        v-model="numberValue[index]" :placeholder="getPlaceholder(subtype)"
                        @keydown="channelInputLimit" />
                </template>
                <template v-else>
                    <el-input v-model="stringValue[index]" :placeholder="getPlaceholder(subtype)"
                        @input="() => checkInput(index)" />
                </template>
            </div>
            <div class="submit" @click="submit">
                {{ $t('plugin.internalVariable.add') }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.vec-constant-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    >.subtype-length {
        display: flex;
        width: 100%;
        margin-bottom: 10px;

        :deep(> .el-select) {
            display: flex;
            flex: 1;
            margin: 0;

            .select-trigger {
                width: 100%;
            }

            .el-input .el-input__wrapper {
                border: 0;

                .el-input__suffix-inner {
                    i {
                        color: #333;
                        font-size: 16px;
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
                    border-radius: 5px;

                    .el-input__inner {
                        color: #666;
                        text-align: center;
                        font-size: 14px;
                        @apply dark: (text-light-900/80);
                    }
                }
            }
        }

        :deep(> .el-input-number) {
            display: flex;
            flex: 1;
            border-radius: 8px;
            margin-left: 13px;
            border: 1px solid #e8e8e8;
            @apply dark: (border-dark-100);

            .el-input-number__decrease {
                bottom: 0;
                border: none;
                height: 18px;

                &:hover {
                    color: @text-active;
                }
            }

            .el-input-number__increase {
                top: 0;
                border: none;
                height: 18px;

                &:hover {
                    color: @text-active;
                }
            }

            .el-input__wrapper {
                padding: 0 10px;
                height: 36px;
                line-height: 36px;

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

    >.value-list {
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 14px;
        @apply dark: (border-dark-100);

        >div {
            display: flex;
            flex-direction: column;
        }

        :deep(.el-input) {
            display: flex;
            flex: 1;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #e8e8e8;
            @apply dark: (border-dark-100);

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

        :deep(> .el-input-number) {
            margin: 0;
            display: flex;
            flex: 1;
            border-radius: 8px 0 0 8px;
            border: 1px solid #e8e8e8;

            .el-input__wrapper {
                padding: 0 10px;
                height: 36px;
                line-height: 36px;

                .el-input__inner {
                    color: #666;
                    text-align: left;
                    font-size: 14px;
                    @apply dark: (text-light-900/80);
                }
            }
        }

        .submit {
            .center();
            height: 36px;
            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
            border-radius: 8px;
            font-size: 14px;
            color: #000000;
            cursor: pointer;
        }
    }
}
</style>
