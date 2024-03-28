<script lang="ts" setup>
import { computed, onBeforeMount, PropType, ref, watch } from 'vue';
import ChooseCandidTypeVue from './ChooseCandidType.vue';
import {
    CandidType,
    SupportedCandidType,
    CandidValue,
    stringifyCandidType,
    BoolCandidType,
    copyCandidTypeWithUndefined,
    FuncCandidType,
    copyCandidType,
    CandidTypeSubitem,
    copyCandidTypeSubitemsWithUndefined,
    TupleCandidType,
    CandidTypeApiItem,
    copyCandidTypeApiItemsWithUndefined,
    CANDID_TYPE_LIST,
    BasicType,
    SubitemsType,
} from '@mora-light/core/types/candid';
import {
    DataResult,
    parseDataResultArrayWithTransform,
    same,
    checkAndExecute,
} from '@mora-light/core/types/common';

const findRecType = (recIds: number[], id: number): number | undefined => {
    for (let i = recIds.length - 1; 0 <= i; i--) {
        if (recIds[i] === id) return recIds[i];
    }
    return undefined;
};

const getInitialCandidTypeValue = (type: CandidType, recIds: number[]): CandidValue => {
    const subitems = type.subitems ?? [];
    switch (type.type) {
        case 'bool':
            return false;
        case 'nat':
        case 'int':
            return { type: 'bigint', value: '0' };
        case 'nat8':
        case 'nat16':
        case 'nat32':
            return 0;
        case 'nat64':
            return { type: 'bigint', value: '0' };
        case 'int8':
        case 'int16':
        case 'int32':
            return 0;
        case 'int64':
            return { type: 'bigint', value: '0' };
        case 'float32':
        case 'float64':
            return 0.0;
        case 'null':
            return null;
        case 'text':
            return '';
        case 'principal':
            return { type: 'principal', value: '' };
        case 'blob':
            return [];
        case 'vec':
            return [];
        case 'opt':
            return [];
        case 'record':
            const record = {};
            subitems.forEach(
                (item) => (record[item.key] = getInitialCandidTypeValue(item.type, recIds)),
            );
            return record;
        case 'variant':
            const variant = {};
            for (let i = 0; i < subitems.length; i++) {
                variant[subitems[i].key] = getInitialCandidTypeValue(subitems[i].type, recIds);
                break;
            }
            return variant;
        case 'tuple':
            return subitems.map((item) => getInitialCandidTypeValue(item.type, recIds));
        case 'rec':
            const found = findRecType(recIds, type.id);
            if (found !== undefined) {
                throw new Error(
                    `ChooseCandidType: recursive object can not be instanced: ${found}`,
                );
            }
            recIds = [...recIds, type.id];
            if (type.subtype === undefined) {
                throw new Error(
                    `ChooseCandidType: recursive object can not be instanced, subtype is undefined: ${stringifyCandidType(
                        type,
                    )}`,
                );
            }
            return getInitialCandidTypeValue(type.subtype, recIds);
        case 'unknown':
            throw new Error(`can not instanced for type unknown`);
        case 'empty':
            throw new Error(`can not instanced for type empty`);
        case 'reserved':
            return null;
        case 'func':
            return {
                type: 'func',
                value: {
                    service: '',
                    method: '',
                },
            };
        case 'service':
            return {
                type: 'service',
                value: '',
            };
    }
};

const getNextId = (recIds: number[]): number => {
    let max = 1;
    for (const id of recIds) if (id >= max) max = id + 1;
    return max;
};

const getType = (type: CandidType, recIds: number[]): SupportedCandidType | string => {
    let _type: SupportedCandidType | string = type.type;
    if (type.type === 'rec') {
        const found = recIds.find((_id) => _id === type.id);
        if (found !== undefined) _type = `${REC_PREFIX}${type.id}`;
    }
    return _type;
};

const getError = (type: CandidType, recIds: number[]): string => {
    if (type.type === 'rec' && type.subtype === undefined) {
        const found = recIds.find((_id) => _id === type.id);
        if (found === undefined) throw new Error(`end rec type must has pre rec type`);
        return '';
    }
    try {
        getInitialCandidTypeValue(type, recIds);
    } catch (e) {
        return `${e}`;
    }
    return '';
};

const getId = (type: CandidType, recIds: number[]): number => {
    if (type.type === 'rec') return type.id;
    return getNextId(recIds);
};

const CANDID_TYPE_BOOL: BoolCandidType = { type: 'bool' };
const CANDID_TYPE_TUPLE_EMPTY: CandidType = { type: 'tuple', subitems: [] };
const CANDID_TYPE_FUNC: FuncCandidType = {
    type: 'func',
    annotations: [],
    argTypes: { type: 'tuple', subitems: [] },
    retTypes: { type: 'tuple', subitems: [] },
};

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    fixed: {
        type: Boolean,
        required: false,
    },
    recIds: {
        type: Array as PropType<number[]>,
        default: [],
    },
    initial: {
        type: Object as PropType<CandidType>,
        required: true,
    },
});

const REC_PREFIX = 'rec # ';

const typeRef = ref<HTMLElement>();
const itemsRefs = ref<HTMLElement[]>([]);
const apisRefs = ref<HTMLElement[]>([]);

let checkedDisabled: boolean = props.disabled;
let checkedFixed: boolean = props.fixed;
let checkedRecIds: number[] = props.recIds;

const type = ref<SupportedCandidType | string>(getType(props.initial, props.recIds));
const error = ref(getError(props.initial, props.recIds));
const subtype = ref<CandidType>(
    copyCandidTypeWithUndefined(props.initial.subtype) ?? copyCandidType(CANDID_TYPE_BOOL),
);
const subitems = ref<CandidTypeSubitem[]>(
    copyCandidTypeSubitemsWithUndefined(props.initial.subitems) ?? [],
);
const id = ref<number>(getId(props.initial, props.recIds));
const annotationQuery = ref<boolean>(!!props.initial.annotations?.length);
const argTypes = ref<TupleCandidType>(
    copyCandidType(props.initial.argTypes ?? CANDID_TYPE_TUPLE_EMPTY),
);
const retTypes = ref<TupleCandidType>(
    copyCandidType(props.initial.retTypes ?? CANDID_TYPE_TUPLE_EMPTY),
);
const apis = ref<CandidTypeApiItem[]>(
    copyCandidTypeApiItemsWithUndefined(props.initial.apis) ?? [],
);

let subtypeResult: DataResult<CandidType> = { ok: subtype.value };
let subitemsResults: DataResult<CandidType>[] = parseDataResultArrayWithTransform(
    subitems.value,
    (item) => copyCandidType(item.type),
);
let argTypesResult: DataResult<TupleCandidType> = { ok: argTypes.value };
let retTypesResult: DataResult<TupleCandidType> = { ok: retTypes.value };
let apisResults: DataResult<FuncCandidType>[] = parseDataResultArrayWithTransform(
    apis.value,
    (item) => copyCandidType(item.func),
);

const list = computed<(SupportedCandidType | string)[]>(() => {
    let list = [...CANDID_TYPE_LIST];
    if (!props.disabled) {
        list = list.filter(
            (t) =>
                ![
                    'unknown',
                    'empty',
                    // "reserved",
                ].includes(t),
        );
    }
    return [...list, ...props.recIds.map((_id) => `${REC_PREFIX}${_id}`)];
});

const hasSubtype = computed(() => ['blob', 'vec', 'opt'].includes(type.value));
const hasItems = computed(() => ['record', 'variant', 'tuple'].includes(type.value));

const validateKeys = computed(() => {
    const keys: string[] = [];
    for (let i = 0; i < subitems.value.length; i++) {
        const key = subitems.value[i].key.trim();
        if (key && !keys.includes(key)) {
            keys[i] = key;
        } else {
            keys[i] = '';
        }
    }
    return keys;
});

const hasRecSubtype = computed(() => {
    if (type.value !== 'rec') return false;
    id.value = getId(props.initial, props.recIds);
    const found = props.recIds.find((_id) => _id === id.value);
    return found === undefined;
});

const validateMethods = computed(() => {
    const methods: string[] = [];
    for (let i = 0; i < apis.value.length; i++) {
        const method = apis.value[i].method.trim();
        if (method && !methods.includes(method)) {
            methods[i] = method;
        } else {
            methods[i] = '';
        }
    }
    return methods;
});

let initialed = false;
onBeforeMount(() => init());
watch(
    () => [props.disabled, props.initial],
    (nv, ov) => {
        if (same(nv, ov)) return;
        init();
    },
);
const init = () => {
    const newCheckedDisabled = props.disabled;
    const newCheckedFixed = props.fixed;
    const newCheckedRecIds = props.recIds;

    const newType = getType(props.initial, newCheckedRecIds);
    const newError = getError(props.initial, newCheckedRecIds);
    const newSubtype =
        copyCandidTypeWithUndefined(props.initial.subtype) ?? copyCandidType(CANDID_TYPE_BOOL);
    const newItems = copyCandidTypeSubitemsWithUndefined(props.initial.subitems) ?? [];
    const newId = getId(props.initial, newCheckedRecIds);
    const newAnnotationQuery = !!props.initial.annotations?.length;
    const newArgTypes = copyCandidType(props.initial.argTypes ?? CANDID_TYPE_TUPLE_EMPTY);
    const newRetTypes = copyCandidType(props.initial.retTypes ?? CANDID_TYPE_TUPLE_EMPTY);
    const newApis = copyCandidTypeApiItemsWithUndefined(props.initial.apis) ?? [];

    const newSubtypeResult = { ok: copyCandidType(newSubtype)! };
    const newItemsResults = parseDataResultArrayWithTransform(
        newItems,
        (item) => copyCandidType(item.type)!,
    );
    const newArgTypesResult = { ok: copyCandidType(newArgTypes)! };
    const newRetTypesResult = { ok: copyCandidType(newRetTypes)! };
    const newApisResults = parseDataResultArrayWithTransform(newApis, (item) =>
        copyCandidType(item.func),
    );

    if (
        initialed &&
        same(checkedDisabled, newCheckedDisabled) &&
        same(checkedFixed, newCheckedFixed) &&
        same(checkedRecIds, newCheckedRecIds) &&
        same(type.value, newType) &&
        same(error.value, newError) &&
        same(subtype.value, newSubtype) &&
        same(subitems.value, newItems) &&
        same(id.value, newId) &&
        same(annotationQuery.value, newAnnotationQuery) &&
        same(argTypes.value, newArgTypes) &&
        same(retTypes.value, newRetTypes) &&
        same(apis.value, newApis) &&
        same(subtypeResult, newSubtypeResult) &&
        same(subitemsResults, newItemsResults) &&
        same(argTypesResult, newArgTypesResult) &&
        same(retTypesResult, newRetTypesResult) &&
        same(apisResults, newApisResults)
    ) {
        return;
    }

    checkedDisabled = newCheckedDisabled;
    checkedFixed = newCheckedFixed;
    checkedRecIds = newCheckedRecIds;

    type.value = newType;
    error.value = newError;
    subtype.value = newSubtype;
    subitems.value = newItems;
    id.value = newId;
    annotationQuery.value = newAnnotationQuery;
    argTypes.value = newArgTypes;
    retTypes.value = newRetTypes;
    apis.value = newApis;

    subtypeResult = newSubtypeResult;
    subitemsResults = newItemsResults;
    argTypesResult = newArgTypesResult;
    retTypesResult = newRetTypesResult;
    apisResults = newApisResults;

    initialed = true;

    changed();
};

const refreshTupleKeys = () => {
    if (type.value !== 'tuple') return;

    for (let i = 0; i < subitems.value.length; i++) {
        subitems.value[i].key = `_${i}_`;
    }
};

watch(
    () => type.value,
    (nv, ov) => {
        if (same(nv, ov)) return;

        // console.error("choose type", ov, "->", nv);

        if (ov === 'tuple' && ['record', 'variant'].includes(nv)) {
            for (let i = 0; i < subitems.value.length; i++) subitems.value[i].key = `key${i}`;
        } else if (['record', 'variant'].includes(ov) && nv === 'tuple') {
            refreshTupleKeys();
        }

        if (nv === 'blob') {
            subtype.value = { type: 'nat8' };
            subtypeResult = { ok: { type: 'nat8' } };
        }

        if (nv === 'rec') id.value = getNextId(props.recIds);
        if (nv.startsWith(REC_PREFIX)) id.value = parseInt(nv.substring(REC_PREFIX.length));

        changed();
    },
);

const onSubtypeChanged = (r: DataResult<CandidType>) => {
    subtypeResult = r;

    if (r.ok !== undefined) subtype.value = r.ok;

    changed();
};

const onItemKeyChanged = () => changed();
const onItemTypeChanged = (i: number, r: DataResult<CandidType>) => {
    subitemsResults[i] = r;

    if (r.ok !== undefined) subitems.value[i].type = r.ok;

    changed();
};
const onPushItem = () => {
    const newType: CandidType = copyCandidType(
        type.value === 'variant' ? { type: 'null' } : CANDID_TYPE_BOOL,
    );

    subitems.value.push({ key: `key${subitems.value.length}`, type: newType });
    subitemsResults[subitems.value.length - 1] = { ok: newType };

    refreshTupleKeys();

    changed();
};
const onDeleteItem = (i: number) => {
    if (subitems.value.length > i) {
        subitems.value.splice(i, 1);
        subitemsResults.splice(i, 1);
    }

    refreshTupleKeys();

    changed();
};

const onAnnotationQueryChanged = () => {
    annotationQuery.value = !annotationQuery.value;

    changed();
};

const onArgTypesChanged = (r: DataResult<TupleCandidType>) => {
    argTypesResult = r;

    if (r.ok !== undefined) argTypes.value = r.ok;

    changed();
};

const onRetTypesChanged = (r: DataResult<TupleCandidType>) => {
    retTypesResult = r;

    if (r.ok !== undefined) retTypes.value = r.ok;

    changed();
};

const onApiMethodChanged = () => changed();
const onApiFuncChanged = (i: number, r: DataResult<FuncCandidType>) => {
    apisResults[i] = r;

    if (r.ok !== undefined) apis.value[i].func = r.ok;

    changed();
};
const onPushApi = () => {
    const newFunc: FuncCandidType = copyCandidType(CANDID_TYPE_FUNC);

    apis.value.push({ method: `method${apis.value.length}`, func: newFunc });
    apisResults[apis.value.length - 1] = { ok: newFunc };

    changed();
};
const onDeleteApi = (i: number) => {
    if (apis.value.length > i) {
        apis.value.splice(i, 1);
        apisResults.splice(i, 1);
    }

    changed();
};

const produce = (): DataResult<CandidType> => {
    if (!initialed) return { err: { message: 'choose candid type has not been initial.' } };

    let realType = type.value;
    if (realType.startsWith(REC_PREFIX)) realType = 'rec';

    let ok: CandidType = { type: realType as BasicType };

    if (hasSubtype.value) {
        if (subtypeResult.err !== undefined) return { err: subtypeResult.err };
        switch (realType) {
            case 'blob':
                ok = { type: realType, subtype: { type: 'nat8' } };
                break;
            case 'vec':
                ok = { type: realType, subtype: subtypeResult.ok };
                break;
            case 'opt':
                ok = { type: realType, subtype: subtypeResult.ok };
                break;
        }
    } else if (hasItems.value) {
        const passedKeys: string[] = [];
        const newItems: CandidTypeSubitem[] = [];
        for (let i = 0; i < subitems.value.length; i++) {
            const key = subitems.value[i].key.trim();
            if (!key) {
                return { err: { message: 'key can not be empty', el: itemsRefs.value[i] } };
            }

            if (passedKeys.includes(key)) {
                return { err: { message: 'key can not assign twice', el: itemsRefs.value[i] } };
            }

            const r = subitemsResults[i];
            if (r.err !== undefined) return { err: r.err };
            newItems.push({ key, type: r.ok });

            passedKeys.push(key);
        }

        ok = { type: realType as SubitemsType, subitems: newItems };
    } else if (realType === 'rec') {
        const found = props.recIds.find((_id) => _id === id.value);
        if (found !== undefined) {
            ok = { type: realType, subtype: undefined, id: id.value };
        } else {
            if (subtypeResult.err !== undefined) return { err: subtypeResult.err };
            ok = { type: realType, subtype: subtypeResult.ok, id: id.value };
        }
    } else if (realType === 'func') {
        let annotations = [...(props.initial.annotations ?? [])];
        if (annotationQuery.value) {
            if (!annotations.includes('query')) annotations.push('query');
        } else {
            if (annotations.includes('query'))
                annotations = annotations.filter((a) => a !== 'query');
        }
        if (argTypesResult.err !== undefined) return { err: argTypesResult.err };
        if (retTypesResult.err !== undefined) return { err: retTypesResult.err };
        ok = {
            type: realType,
            annotations: annotations as [] | ['query'],
            argTypes: argTypesResult.ok,
            retTypes: retTypesResult.ok,
        };
    } else if (realType === 'service') {
        const passedMethods: string[] = [];
        const newApis: CandidTypeApiItem[] = [];
        for (let i = 0; i < apis.value.length; i++) {
            const method = apis.value[i].method.trim();
            if (!method) {
                return { err: { message: 'method can not be empty', el: apisRefs.value[i] } };
            }

            if (passedMethods.includes(method)) {
                return { err: { message: 'method can not assign twice', el: apisRefs.value[i] } };
            }

            const r = apisResults[i];
            if (r.err !== undefined) return { err: r.err };
            newApis.push({ method, func: r.ok });

            passedMethods.push(method);
        }

        ok = { type: realType, apis: newApis };
    }

    error.value = getError(ok, props.recIds);
    if (error.value) {
        return { err: { message: error.value, el: typeRef.value } };
    }

    return { ok };
};

const emit = defineEmits(['changed']);

const changed = () =>
    checkAndExecute(
        (!hasItems.value || itemsRefs.value.filter((v) => !!v).length >= subitems.value.length) &&
            (type.value !== 'service' ||
                apisRefs.value.filter((v) => !!v).length >= apis.value.length),
        () => emit('changed', produce()),
        changed,
    );
</script>

<template>
    <div class="choose-candid-type-content">
        <div class="type">
            <el-select
                filterable
                default-first-option
                v-model="type"
                :disabled="disabled || props.fixed"
                ref="typeRef"
            >
                <el-option v-for="(item, i) in list" :key="i" :value="item">
                    {{ item }}
                </el-option>
            </el-select>
            <span v-if="hasItems">
                {{ $t('plugin.chooseCandidType.length') }}: {{ subitems.length }}
            </span>
            <span class="rec-id" v-if="type === 'rec'"> {{ `# ${id}` }} </span>
            <span class="error" v-if="type === 'unknown'">
                {{ $t('plugin.chooseCandidType.methods') }}
            </span>
            <span class="error" v-if="type === 'empty'">
                {{ $t('plugin.chooseCandidType.methods') }}
            </span>
            <span v-if="type === 'reserved'">
                {{ $t('plugin.chooseCandidType.reserved') }}
            </span>
            <span v-if="type === 'service'">
                {{ apis.length }} {{ $t('plugin.chooseCandidType.methods') }}
            </span>
            <span class="error" v-if="error">{{ error }}</span>
        </div>

        <div class="subtype" v-if="hasSubtype && type !== 'blob'">
            <span>{{ $t('plugin.chooseCandidType.subtype') }}</span>
            <ChooseCandidTypeVue
                :disabled="disabled"
                :recIds="[...props.recIds]"
                :initial="subtype"
                @changed="onSubtypeChanged"
            />
        </div>

        <div class="items" v-if="hasItems && (subitems.length || !disabled)">
            <div class="item" v-for="(item, i) in subitems" :key="i">
                <div class="main-row">
                    <div class="left">
                        <template v-if="type === 'tuple'">
                            <span class="tuple-span">{{ `${i} ` }} :</span>
                        </template>
                        <template v-else>
                            <el-input
                                type="text"
                                :placeholder="$t('plugin.chooseCandidType.inputKey')"
                                v-model="item.key"
                                :disabled="disabled"
                                @input="onItemKeyChanged"
                            />
                        </template>
                        <ChooseCandidTypeVue
                            :disabled="disabled"
                            :recIds="[...props.recIds]"
                            :initial="item.type"
                            @changed="(r) => onItemTypeChanged(i, r)"
                            :ref="(el: any) => (itemsRefs[i] = el)"
                        />
                    </div>
                    <div class="delete" v-if="!disabled" @click="onDeleteItem(i)">
                        <i class="iconfont icon-failed"></i>
                    </div>
                </div>
                <div class="tip" v-if="!validateKeys[i]">
                    {{ $t('plugin.chooseCandidType.invalidKey') }}
                </div>
            </div>
            <div class="push" v-if="!disabled">
                <i @click="onPushItem" class="iconfont icon-plugin-add"></i>
            </div>
        </div>

        <div class="subtype" v-if="hasRecSubtype">
            <span>{{ $t('plugin.chooseCandidType.subtype') }}</span>
            <ChooseCandidTypeVue
                :disabled="disabled"
                :recIds="[...props.recIds, id]"
                :initial="subtype"
                @changed="onSubtypeChanged"
            />
        </div>

        <div class="func" v-if="type === 'func'">
            <div class="annotation-query">
                <span>{{ $t('plugin.chooseCandidType.annotation') }}</span>
                <div class="checkbox-box">
                    <input
                        :checked="annotationQuery"
                        @change="onAnnotationQueryChanged"
                        type="checkbox"
                        id="queryCheckbox"
                    />
                    <label for="queryCheckbox">{{ $t('plugin.chooseCandidType.query') }}</label>
                </div>
            </div>
            <div class="arg-types">
                <span>{{ $t('plugin.chooseCandidType.parameterType') }}</span>
                <ChooseCandidTypeVue
                    :disabled="disabled"
                    :fixed="true"
                    :recIds="[...props.recIds]"
                    :initial="argTypes"
                    @changed="onArgTypesChanged"
                />
            </div>
            <div class="ret-types">
                <span>{{ $t('plugin.chooseCandidType.resultType') }}</span>
                <ChooseCandidTypeVue
                    :disabled="disabled"
                    :fixed="true"
                    :recIds="[...props.recIds]"
                    :initial="retTypes"
                    @changed="onRetTypesChanged"
                />
            </div>
        </div>

        <div class="service" v-if="type === 'service'">
            <div class="api" v-for="(api, i) in apis" :key="i">
                <div class="main-row">
                    <div class="left">
                        <el-input
                            type="text"
                            :placeholder="$t('plugin.chooseCandidType.methodName')"
                            v-model="api.method"
                            :disabled="disabled"
                            @input="onApiMethodChanged"
                        />

                        <ChooseCandidTypeVue
                            :disabled="disabled"
                            :fixed="true"
                            :recIds="[...props.recIds]"
                            :initial="api.func"
                            @changed="(r) => onApiFuncChanged(i, r)"
                            :ref="(el: any) => (apisRefs[i] = el)"
                        />
                    </div>
                    <div class="delete" v-if="!disabled" @click="onDeleteApi(i)"> - </div>
                </div>
                <div class="tip" v-if="!validateMethods[i]">
                    <span>{{ $t('plugin.chooseCandidType.invalidMethod') }}</span>
                </div>
            </div>
            <div class="push" v-if="!disabled" @click="onPushApi">
                <i @click="onPushItem" class="iconfont icon-plugin-add"></i>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.choose-candid-type-content {
    width: 100%;

    > .type {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        :deep(.el-select) {
            width: 100%;

            .el-input {
                border-radius: 8px;

                .el-input__wrapper {
                    border-radius: 8px;
                    border: 1px solid #dddddd;
                    padding: 0 10px;
                    @apply dark:(border-dark-100);
                }
            }
        }

        > span {
            margin-left: 10px;
            font-size: 12px;
            color: #999999;
            font-weight: 400;
            white-space: nowrap;
            height: 32px;
            display: flex;
            align-items: center;

            &.rec-id {
                margin-left: 10px;
                font-size: 14px;
                white-space: nowrap;
            }

            &.error {
                margin-left: 10px;
                color: red;
                opacity: 0.7;
                white-space: nowrap;
            }
        }
    }

    > div {
        margin-top: 10px;

        &:first-child {
            margin-top: 0;
        }
    }

    > .subtype {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;

        > span {
            margin: 0px 10px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #999999;
        }
    }

    > .items {
        display: flex;
        flex-direction: column;
        margin-top: 0px;
        padding: 15px;
        margin-top: 15px;
        border-radius: 10px;
        flex-shrink: 0;
        border: 1px dashed #ddd;
        @apply dark:(border-dark-50);

        > .item {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            margin-bottom: 10px;

            > .main-row {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;

                > .left {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: flex-start;

                    .tuple-span {
                    }

                    > span {
                        width: 30px;
                        height: 32px;
                        flex-shrink: 0;
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: center;
                        font-size: 12px;
                        color: #666666;
                    }

                    > .colon {
                        width: 15px;
                        flex-shrink: 0;
                        justify-content: flex-start;
                    }

                    > :deep(.el-input) {
                        margin-right: 16px;
                        width: 120px;
                        height: 32px;
                        flex-shrink: 0;

                        .el-input__wrapper {
                            padding: 0 8px;
                            border-radius: 8px;
                        }
                    }
                }

                > .delete {
                    .center();
                    flex-shrink: 0;
                    height: 32px;
                    color: #999999;
                    cursor: pointer;
                    margin-left: 10px;

                    i {
                        font-size: 16px;
                        @apply dark:(text-indigo-300/80);
                    }
                }
            }

            > .tip {
                font-size: 12px;
                line-height: 12px;
                color: @color-error;
            }
        }

        > .push {
            display: flex;
            justify-content: center;
            user-select: none;

            i {
                font-size: 18px;
                color: #4c4f6b;
                cursor: pointer;
                @apply dark:(text-indigo-300/80);
            }
        }
    }

    > .func {
        display: flex;
        flex-direction: column;
        margin-top: 0px;
        padding: 15px;
        margin-top: 15px;
        border-radius: 10px;
        flex-shrink: 0;
        border: 1px solid transparent;

        &:hover {
            border: 1px dashed #e8e8e8;
        }

        .annotation-query {
            display: flex;
            flex-shrink: 0;

            > span {
                font-size: 14px;
            }

            .checkbox-box {
                display: flex;
                flex-shrink: 0;
                align-items: center;
                margin-left: auto;
                cursor: pointer;

                input {
                    float: left;
                    margin-right: 5px;
                }

                label {
                    float: left;
                    margin-right: 5px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    line-height: 14px;
                    cursor: pointer;
                }
            }
        }

        > .arg-types,
        > .ret-types {
            margin-top: 5px;

            > span {
                font-size: 14px;
            }
        }
    }

    > .service {
        padding-left: 10px;

        > .api {
            display: flex;
            flex-direction: column;
            margin-top: 0px;
            padding: 15px;
            margin-top: 15px;
            border-radius: 10px;
            flex-shrink: 0;
            border: 1px solid transparent;

            &:hover {
                border: 1px dashed #e8e8e8;
            }

            > .main-row {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;

                > .left {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: flex-start;

                    .tuple-span {
                    }

                    > span {
                        width: 30px;
                        height: 32px;
                        flex-shrink: 0;
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: center;
                        font-size: 12px;
                        color: #666666;
                    }

                    > .colon {
                        width: 15px;
                        flex-shrink: 0;
                        justify-content: flex-start;
                    }

                    > :deep(.el-input) {
                        margin-right: 16px;
                        width: 120px;
                        height: 32px;
                        border: 1px solid #dddddd;
                        border-radius: 8px;
                        flex-shrink: 0;

                        .el-input__wrapper {
                            padding: 0 8px;
                        }
                    }
                }

                > .delete {
                    .center();
                    flex-shrink: 0;
                    height: 32px;
                    color: #999999;
                    cursor: pointer;
                    margin-left: 10px;

                    i {
                        font-size: 20px;
                    }
                }
            }

            > .tip {
                font-size: 12px;
                line-height: 12px;
                color: @color-error;
            }
        }

        > .push {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            user-select: none;

            i {
                font-size: 25px;
                color: #4c4f6b;
                cursor: pointer;
            }
        }
    }
}
</style>
