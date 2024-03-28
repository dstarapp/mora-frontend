<script lang="ts" setup>
import { ref } from 'vue';
import { ConstantValueConstant } from '../../../../../types/parts/constants';
import { getPlaceholder } from '../common';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';

const way = ref<'hex' | 'utf-8' | 'base64'>('hex');
const value = ref<string>('');

const emit = defineEmits(['complete']);

const submit = () => {
    if (!value.value) {
        ElMessage.error(t('plugin.internalVariable.defaultValueEmpty'));
        return;
    }
    const parsed = parse(way.value, value.value.trim());
    if (parsed === undefined) {
        ElMessage.error(t('plugin.variableTip.valueError'));
        return;
    }

    const constant: ConstantValueConstant = {
        result: { type: 'blob', subtype: { type: 'nat8' } },
        value: parsed,
    };

    emit('complete', constant);
};

const parse = (way: 'hex' | 'utf-8' | 'base64', value: string): number[] | undefined => {
    switch (way) {
        case 'hex':
            return parseHex(value);
        case 'utf-8':
            return parseUtf8(value);
        case 'base64':
            return parseBase64(value);
    }
    return undefined;
};

const parseHex = (value: string): number[] | undefined => {
    const parse = (c: string): number => {
        switch (c) {
            case '0':
                return 0;
            case '1':
                return 1;
            case '2':
                return 2;
            case '3':
                return 3;
            case '4':
                return 4;
            case '5':
                return 5;
            case '6':
                return 6;
            case '7':
                return 7;
            case '8':
                return 8;
            case '9':
                return 9;
            case 'a':
                return 10;
            case 'b':
                return 11;
            case 'c':
                return 12;
            case 'd':
                return 13;
            case 'e':
                return 14;
            case 'f':
                return 15;
            case 'A':
                return 10;
            case 'B':
                return 11;
            case 'C':
                return 12;
            case 'D':
                return 13;
            case 'E':
                return 14;
            case 'F':
                return 15;
            default:
                throw new Error('wrong code: ' + c);
        }
    };

    if (value.length % 2 !== 0) return undefined;
    for (let i = 0; i < value.length; i++) {
        const c = value.charAt(i);
        try {
            parse(c);
        } catch (e) {
            return undefined;
        }
    }

    const hex: number[] = [];
    for (let i = 0; i < value.length / 2; i++) {
        const c1 = value.charAt(i * 2);
        const c2 = value.charAt(i * 2 + 1);
        hex.push(parse(c1) * 16 + parse(c2));
    }
    return hex;
};

const parseUtf8 = (value: string): number[] | undefined => {
    const utf8: number[] = [];
    for (var i = 0; i < value.length; i++) {
        const c = value.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10ffff) {
            utf8.push(((c >> 18) & 0x07) | 0xf0);
            utf8.push(((c >> 12) & 0x3f) | 0x80);
            utf8.push(((c >> 6) & 0x3f) | 0x80);
            utf8.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00ffff) {
            utf8.push(((c >> 12) & 0x0f) | 0xe0);
            utf8.push(((c >> 6) & 0x3f) | 0x80);
            utf8.push((c & 0x3f) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007ff) {
            utf8.push(((c >> 6) & 0x1f) | 0xc0);
            utf8.push((c & 0x3f) | 0x80);
        } else {
            utf8.push(c & 0xff);
        }
    }
    return utf8;
};
const parseBase64 = (value: string): number[] | undefined => {
    let utf8 = Buffer.from(value, 'base64').toString('utf8');
    if (Buffer.from(utf8, 'utf-8').toString('base64') !== value) {
        return undefined;
    }
    return parseUtf8(utf8);
};
</script>

<template>
    <div class="blob-constant-content">
        <el-select v-model="way" size="large">
            <el-option :key="'hex'" :label="'hex'" :value="'hex'" />
            <el-option :key="'utf-8'" :label="'utf-8'" :value="'utf-8'" />
            <el-option :key="'base64'" :label="'base64'" :value="'base64'" />
        </el-select>
        <div class="blob-constant-right">
            <el-input v-model="value" :placeholder="getPlaceholder('blob')" />
            <div class="submit" @click="submit">
                <i class="iconfont icon-plugin-add"></i>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.blob-constant-content {
    width: 100%;
    height: 100%;
    display: flex;

    :deep(> .el-select) {
        display: flex;
        flex: 1;
        margin-right: 15px;

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

    >.blob-constant-right {
        display: flex;
        flex: 1.8;

        :deep(> .el-input) {
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
            @apply dark: (border-dark-100);

            i {
                color: #4c4f6b;
                font-size: 16px;
                @apply dark: (text-light-900/60);
            }
        }
    }
}
</style>
