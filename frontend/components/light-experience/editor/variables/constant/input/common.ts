import { t } from '@/i18n';

export type SupportedBasicType =
    | 'bool'
    | 'nat'
    | 'int'
    | 'nat8'
    | 'nat16'
    | 'nat32'
    | 'nat64'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'float32'
    | 'float64'
    | 'null'
    | 'text'
    | 'principal';

export type SupportedType = SupportedBasicType | 'blob' | 'vec';

export const SupportedTypeList = [
    'text',
    'principal',
    'bool',
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
    'null',
    'blob',
    'vec',
];

export const getPlaceholder = (
    type:
        | 'null'
        | 'text'
        | 'principal'
        | 'nat'
        | 'int'
        | 'nat8'
        | 'nat16'
        | 'nat32'
        | 'nat64'
        | 'int8'
        | 'int16'
        | 'int32'
        | 'int64'
        | 'float32'
        | 'float64'
        | 'blob',
): string => {
    const placeholderList = {
        null: t('plugin.internalVariable.addConstant.constantName'),
        text: t('plugin.internalVariable.addConstant.defaultValue'),
        principal: t('plugin.internalVariable.addConstant.principal'),
        nat: t('plugin.internalVariable.addConstant.nat'),
        nat8: t('plugin.internalVariable.addConstant.nat8'),
        nat16: t('plugin.internalVariable.addConstant.nat16'),
        nat32: t('plugin.internalVariable.addConstant.nat32'),
        nat64: t('plugin.internalVariable.addConstant.nat64'),
        int: t('plugin.internalVariable.addConstant.int'),
        int8: t('plugin.internalVariable.addConstant.int8'),
        int16: t('plugin.internalVariable.addConstant.int16'),
        int32: t('plugin.internalVariable.addConstant.int32'),
        int64: t('plugin.internalVariable.addConstant.int64'),
        float32: t('plugin.internalVariable.addConstant.float32'),
        float64: t('plugin.internalVariable.addConstant.float64'),
    };

    let str = placeholderList[type];

    if (str) return placeholderList[type];

    return t('plugin.internalVariable.addConstant.defaultValue');
};
