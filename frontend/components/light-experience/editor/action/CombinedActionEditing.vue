<script lang="ts" setup>
import { PropType, ref, computed, watch, inject, reactive, shallowRef } from 'vue';
import { ActionValues, findExportedValueByActionValues } from '../../types/common/value';
import { CombinedAction } from '../../types/parts/combined';
import { v4 as uuid } from 'uuid';
import ChooseValueDialogVue from '../modules/values/ChooseValueDialog.vue';
import CandidTypeDialogVue from '../modules/types/CandidTypeDialog.vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { findTransformToCandidType, isValidVariableName } from '@mora-light/core/types/transform';
import {
    CandidType,
    CandidTypeSubitem,
    TupleCandidType,
    isSameCandidType,
    parseTuple,
} from '@mora-light/core/types/candid';
import CodeMirror from '@/components/CodeMirror.vue';
import { DataResult, deepClone } from '@mora-light/core/types/common';
import { CandidValue } from '@mora-light/core/types/candid';
import DebugCodeDialogVue from '../modules/debug/DebugCodeDialog.vue';

type ArgType =
    | { index: number; id: string; name: string; type: CandidType; alias: string }
    | { index: number; id: string; name?: undefined; type?: undefined; alias?: undefined };

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CombinedAction>,
        required: true,
    },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const getInitialCandidTypeValue = (type: CandidType): CandidValue => {
    switch (type.type) {
        case 'bool':
            return true;
        case 'nat':
        case 'int':
        case 'nat8':
        case 'nat16':
        case 'nat32':
        case 'nat64':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'int64':
            return 0;
        case 'float32':
        case 'float64':
            return 0.0;
        case 'null':
            return 'null';
        case 'text':
            return '';
        case 'principal':
            return 'aaaaa-aa';
        case 'blob':
            return '[]';
        case 'vec':
            return '[]';
        case 'opt':
            return '[]';
        case 'record':
            return '{}';
        case 'variant':
            return '{}';
        case 'tuple':
            return false;
        case 'rec':
            return false;
        case 'unknown':
            return false;
        case 'empty':
            return false;
        case 'reserved':
            return 'null';
        case 'func':
            return false;
        case 'service':
            return false;
    }
};

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);
const chooseValueShow = ref(false);

const args = computed<ArgType[]>(() => {
    const args: ArgType[] = [];
    for (let i = 0; i < props.action.arg.subitems.length; i++) {
        const force = props.action.arg.subitems[i];
        const found = findExportedValueByActionValues(props.values, force.id);
        if (found === undefined) {
            args[i] = {
                index: i + 1,
                id: force.id,
            };
        } else {
            args[i] = {
                index: i + 1,
                id: force.id,
                name: found.name,
                type: found.type,
                alias: ((): string => {
                    let alias = '';
                    if (props.action.arg.subitems.length === 1) {
                        alias = 'data';
                        if (isValidVariableName(found.name)) alias = alias + ' | ' + found.name;
                    } else {
                        alias = `data[${i}]`;
                        if (isValidVariableName(found.name)) alias = alias + ' | ' + found.name;
                    }
                    return alias;
                })(),
            };
        }
    }

    return args;
});
const onDeleteArg = (arg: ArgType) => {
    const index = arg.index - 1;
    if (0 <= index && index < props.action.arg.subitems.length) {
        props.action.arg.type.subitems.splice(index, 1);
        for (let i = 0; i < props.action.arg.type.subitems.length; i++)
            props.action.arg.type.subitems[i].key = `_${i}_`;
        props.action.arg.subitems.splice(index, 1);
    }
    if (props.action.arg.subitems.length === 1) props.action.transform.child = 1;
    else delete props.action.transform.child;
};
const onAddArg = () => (chooseValueShow.value = true);
const onChooseValueComplete = (r: { id: string; type: CandidType; name: string } | undefined) => {
    chooseValueShow.value = false;
    if (r === undefined) return;
    props.action.arg.type.subitems.push({
        key: `_${props.action.arg.type.subitems.length}_`,
        type: deepClone(r.type),
    });
    props.action.arg.subitems.push({ type: deepClone(r.type), id: r.id, name: r.name });
    if (props.action.arg.subitems.length === 1) props.action.transform.child = 1;
    else delete props.action.transform.child;
};

const code = ref<string>(props.action.transform.transform.code);


const executeRes = ref<{ state?: 1 | 2; result?: any; error?: any }>({});
const onCodeMirrorChanged = (code: string) => {
    props.action.transform.transform.code = code;
};

const type = ref<CandidType>(findTransformToCandidType(props.action.transform)!.subitems![0].type);
const editingTypeShow = ref(false);
const onTypeChanged = (r: DataResult<CandidType>) => {
    if (r.ok !== undefined) {
        type.value = r.ok;
        onType(type.value);
    }
};
const onType = (newType: CandidType) => {
    // console.error('onType', newType);
    props.action.transform.to = {
        type: 'tuple',
        subitems: [{ key: '_0_', type: deepClone(newType) }],
    };
    type.value = findTransformToCandidType(props.action.transform)!.subitems![0].type;
    props.action.result.type.subitems[0].type = deepClone(newType);
    props.action.result.subitems![0] = {
        type: deepClone(newType),
        exported: {
            id: props.action.result.subitems![0].exported?.id ?? '',
            name: props.action.result.subitems![0].exported?.name ?? '',
        },
    };
};
const onEditType = () => (editingTypeShow.value = true);
const onTypeComplete = (r: CandidType | undefined) => {
    editingTypeShow.value = false;
    if (r === undefined) return;
    onType(r);
};

const name = ref<string>(props.action.result.subitems![0].exported?.name ?? '');
watch(
    () => name.value,
    () => {
        if (props.action.result.subitems![0].exported) {
            props.action.result.subitems![0].exported.name = name.value.trim();
            if (
                props.action.result.subitems![0].exported.name &&
                !props.action.result.subitems![0].exported.id
            ) {
                props.action.result.subitems![0].exported.id = uuid();
            }
        }
    },
);

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onComplete = () => {
    if (
        findExportedValue(
            props.action.result.subitems![0].exported?.name ?? '',
            props.action.result.subitems![0].exported?.id ?? '',
        ) !== undefined
    ) {
        ElMessage.error(
            `${t('plugin.generic.variableName1')}${props.action.result.subitems![0].exported?.name
            }${t('plugin.generic.variableName2')}`,
        );
        return;
    }
    emit('complete', props.action);
};

const showDebugDialog = ref(false);
const onViewDebugDialog = () => (showDebugDialog.value = true);
const onCloseViewDebugDialog = (code?: string, to?: CandidType) => {
    showDebugDialog.value = false;
    if (code) onCodeMirrorChanged(code);
    if (to) onTypeComplete(to);
};
const debugFrom = computed<TupleCandidType>(() =>
    parseTuple(args.value.filter((arg) => arg.type !== undefined).map((arg) => arg.type!)),
);
const debugNames = computed<string[]>(() =>
    args.value.filter((arg) => arg.type !== undefined).map((arg) => arg.name!),
);
const debugValues = computed<(CandidValue | undefined)[]>(() =>
    args.value
        .filter((arg) => arg.type !== undefined)
        .map((arg) => {
            const found = findExportedValueByActionValues(props.values, arg.id);
            if (found === undefined) return undefined;
            if (found.from.type !== 'constant') return undefined;
            if (!isSameCandidType(found.from.constant.result, arg.type!)) return undefined;
            return deepClone(found.from.constant.value);
        }),
);
const debugCount = computed(() => debugFrom.value.subitems.length);
</script>

<template>
    <div class="combined-action-editing-content">
        <el-dialog class="w828 column" :title="$t('plugin.combinedAction.title')" v-model="show"
            @closed="onDialogClose">
            <div class="args">
                <div class="arg" :class="{ error: !arg.name }" v-for="arg in args" :key="arg.id">
                    <template v-if="arg.alias">
                        <el-tooltip placement="top" :content="arg.alias">
                            <div class="has-alias">
                                <span class="name">{{ arg.name }}</span>
                                <span class="type">{{ arg.type?.type }}</span>
                            </div>
                        </el-tooltip>
                    </template>
                    <template v-else>
                        <span class="name">{{ arg.name }}</span>
                        <span class="type">{{ arg.type?.type }}</span>
                    </template>
                    <span class="del" @click="onDeleteArg(arg)">
                        <i class="iconfont icon-plugin-add"></i>
                    </span>
                </div>
                <div class="add" @click="onAddArg">
                    <i class="iconfont icon-plugin-add"></i>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <div class="tip"> You can use variable name directly in your code </div>
                <div class="debug">
                    <span @click="onViewDebugDialog">Debug</span>
                </div>
            </div>
            <div class="code">
                <code-mirror :code="`const transform = (data) => {
    let result = undefined;
    // Enter your own code below...
    `" :disabled="true" />
                <code-mirror :code="code" :mirrorClass="'fixed-height-330'" :disabled="false"
                    @changed="onCodeMirrorChanged" />
                <code-mirror :code="`    return result;
};`" :disabled="true" />
            </div>
            <div class="codeRes success" v-if="executeRes.state === 1">
                <i>Result:</i>
                <p>{{
            typeof executeRes.result === 'object'
                ? JSON.stringify(executeRes.result)
                : executeRes.result.toString()
        }}</p>
            </div>
            <!-- <div class="codeRes error" v-if="executeRes.state === 2">
                <i>Error:</i>
                <p>{{ executeRes.error }}</p>
            </div> -->
            <div class="exportVariable">
                <p>
                    {{ $t('plugin.combinedAction.exportVariable') }}
                </p>
                <div>
                    <div class="variable-name">
                        <div class="title">
                            {{ $t('plugin.combinedAction.name') }}
                        </div>
                        <div class="name">
                            <el-input v-model="name" :placeholder="$t('plugin.combinedAction.namePlaceholder')" />
                        </div>
                    </div>

                    <div class="type">
                        <div class="title">
                            {{ $t('plugin.combinedAction.type') }}
                        </div>
                        <div class="basic">
                            {{ type.type }}
                        </div>
                        <div class="edit" @click="onEditType">
                            {{ $t('plugin.combinedAction.edit') }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="button-box">
                <div>
                    <div class="cancel" @click="onDialogClose">
                        {{ $t('plugin.generic.cancel') }}
                    </div>
                    <div class="btn" @click="onComplete">
                        {{ $t('plugin.generic.confirm') }}
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
    <template v-if="chooseValueShow">
        <ChooseValueDialogVue :show="chooseValueShow" :values="props.values"
            :chosen="props.action.arg.subitems.map((subitem) => subitem.id)" :needs="undefined"
            @complete="onChooseValueComplete" />
    </template>
    <template v-if="editingTypeShow">
        <CandidTypeDialogVue :show="editingTypeShow" :type="type" @complete="onTypeComplete" />
    </template>
    <template v-if="showDebugDialog">
        <DebugCodeDialogVue :show="showDebugDialog" :from="deepClone(debugFrom)" :child="debugCount === 1 ? 1 : 0"
            :names="debugNames" :values="debugValues" :code="code" :to="deepClone(type)"
            @complete="onCloseViewDebugDialog" />
    </template>
</template>

<style lang="less" scoped>
.combined-action-editing-content {
    width: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-dialog__body) {
        overflow-y: scroll;
        max-height: 80vh;
    }

    .args {
        display: flex;
        flex-wrap: wrap;

        .arg {
            height: 24px;
            display: flex;
            background: #f3f3f3;
            border-radius: 30px;
            margin-right: 8px;
            margin-bottom: 10px;
            @apply dark:(bg-dark-300);

            .has-alias {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
            }

            &.error {
                border: 1px red solid;
            }

            .name {
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                margin-left: 8px;
                @apply dark:(text-light-900);
            }

            .type {
                font-weight: 400;
                font-size: 12px;
                color: #999999;
                margin-left: 6px;
            }

            .del {
                margin-right: 5px;
                margin-left: 4px;
                font-size: 16px;
                cursor: pointer;

                i {
                    display: flex;
                    color: #999999;
                    transform: rotate(45deg);
                }
            }
        }

        .add {
            .center();
            font-size: 16px;
            height: 24px;
            color: #4c4f6b;
            cursor: pointer;
            @apply dark:(text-indigo-300/80);
        }
    }

    .tip {
        display: flex;
        font-size: 14px;
        color: #999999;
    }

    .debug {
        @apply py-2px px-2 rounded-md bg-dark-500 text-white text-sm cursor-pointer dark:(bg-dark-100);
    }

    .code {
        width: 100%;
        margin-top: 12px;
        text-align: left;
        overflow-y: scroll;
        max-height: calc(100vh - 500px);

        :deep(.line-none) {
            .cm-gutter-lint {
                width: 0;
            }

            .cm-lineNumbers,
            .cm-gutterElement {
                display: none;
            }
        }
    }

    // .codeRes {
    //     display: flex;

    //     i {
    //         font-size: 12px;
    //         font-style: normal;
    //         color: #333;
    //     }
    //     p {
    //         font-size: 12px;
    //         color: #333;
    //         margin-left: 5px;
    //     }

    //     &.error {
    //         p {
    //             color: @color-error;
    //         }
    //     }
    // }

    .exportVariable {
        display: flex;
        margin-top: 32px;

        >p {
            font-weight: 400;
            font-size: 14px;
            color: #666666;
            width: 120px;
            display: flex;
            height: 36px;
            align-items: center;
            @apply dark:(text-light-900/60);
        }

        >div {
            display: flex;
            flex-direction: column;
            flex: 1;

            .type,
            .variable-name {
                display: flex;
                margin-bottom: 16px;

                .title {
                    display: flex;
                    width: 70px;
                    color: #000;
                    height: 36px;
                    align-items: center;
                    font-weight: 400;
                    font-size: 14px;
                    @apply dark:(text-light-900);
                }

                .basic {
                    display: flex;
                    flex: 1;
                    height: 36px;
                    align-items: center;
                    @apply dark:(text-light-900/60);
                }

                .name {
                    display: flex;
                    flex: 1;

                    :deep(.el-input) {
                        border: 1px solid #dddddd;
                        border-radius: 8px;
                        @apply dark:(border-dark-100);

                        .el-input__wrapper {
                            padding: 0 13px;

                            .el-input__inner {
                                height: 36px;
                                color: #000000;
                                @apply dark:(text-light-900);
                            }
                        }
                    }
                }

                .edit {
                    color: #34d399;
                    cursor: pointer;
                    font-size: 14px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }

    .button-box {
        width: 100%;

        div {
            display: flex;
            flex: 1;

            .cancel {
                height: 40px;
                background: rgb(238, 238, 238);
                border-radius: 8px;
                margin: 0;
                .center();
                cursor: pointer;
                flex-shrink: 1;
                @apply dark: (bg-dark-100);
                transition: @transition;
            }

            .btn {
                width: 155px;
                height: 40px;
                background: linear-gradient(90deg, rgb(52, 211, 153), #7cee83);
                border-radius: 8px;
                color: black;
                margin: 0;
                margin-left: 28px;
                .center();
                cursor: pointer;
                flex-shrink: 1;
                transition: @transition;

                &:hover {
                    box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
                    opacity: 0.85;
                    transition: @transition;
                }
            }
        }
    }
}
</style>
