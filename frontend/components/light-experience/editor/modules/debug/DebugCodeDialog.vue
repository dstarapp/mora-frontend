<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';
import {
    CandidType,
    CandidValue,
    TupleCandidType,
    findChildType,
    getInitialCandidTypeValue,
    unwrapCandidType,
} from '@mora-light/core/types/candid';
import { isValidVariableName, doTransform, Transform } from '@mora-light/core/types/transform';
import { deepClone, DataResult } from '@mora-light/core/types/common';
import CandidTypeDialogVue from '../types/CandidTypeDialog.vue';
import CodeMirrorVue from '@/components/CodeMirror.vue';
import { ConstantInput as ConstantInputVue } from '@mora-light/vue';
import { ElMessage } from 'element-plus';

type ArgumentItem = {
    name: string;
    alias: string;
    type: CandidType;
    value: CandidValue | undefined;
    input: CandidValue;
};

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    from: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    child: {
        type: Number,
        required: false,
    },
    names: {
        type: Array as PropType<string[]>,
        required: true,
    },
    values: {
        type: Array as PropType<(CandidValue | undefined)[]>,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    to: {
        type: Object as PropType<CandidType>,
        required: true,
    },
});

const show = ref(props.show);

watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const showFromType = ref(false);
const onViewFrom = () => (showFromType.value = true);
const onCloseViewFrom = () => (showFromType.value = false);

const showToType = ref(false);
const onViewTo = () => (showToType.value = true);
const onCloseViewTo = (r?: CandidType) => {
    showToType.value = false;
    if (r) to.value = r;
};

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete', undefined);

const onComplete = (code?: string, to?: CandidType) => emit('complete', code, to);

const onConfirm = () => onComplete(code.value, to.value);

const onCodeMirrorChanged = (input_code: string) => (code.value = input_code);

// debug

const from = computed(() => deepClone(findChildType(props.from, props.child ?? 0)));
const code = ref(props.code);
const to = ref(deepClone(props.to));
watch(
    () => props.to,
    () => (to.value = deepClone(props.to)),
);

const args = ref<ArgumentItem[]>([]);

const errorMessage = ref<string>('');
const result = ref<CandidValue | undefined>();

watch(
    () => [props.from, props.child, props.names, props.values],
    () => {
        if (props.child === undefined) {
            let name = props.names[0] ?? '';
            if (name && !isValidVariableName(name)) name = '';
            const type = deepClone(props.from);
            const value = props.values[0];
            args.value = [
                {
                    name,
                    alias: name ? `data | ${name}` : `data`,
                    type,
                    value,
                    input: getInitialCandidTypeValue(type, [], []),
                },
            ];
        } else if (props.child === 1) {
            if (props.from.type !== 'tuple' || props.from.subitems.length !== 1)
                throw new Error('wrong type 1');
            let name = props.names[0] ?? '';
            if (name && !isValidVariableName(name)) name = '';
            const type = deepClone(props.from as TupleCandidType).subitems[0].type;
            const value = props.values[0];
            args.value = [
                {
                    name,
                    alias: name ? `data | ${name}` : `data`,
                    type,
                    value,
                    input: getInitialCandidTypeValue(type, [], []),
                },
            ];
        } else {
            if (props.from.type !== 'tuple') throw new Error('wrong type 2');
            args.value = [];
            const from = deepClone(props.from as TupleCandidType);
            for (let i = 0; i < from.subitems.length; i++) {
                const subitem = from.subitems[i];
                let name = props.names[i] ?? '';
                if (name && !isValidVariableName(name)) name = '';
                const type = subitem.type;
                const value = props.values[i];
                args.value[i] = {
                    name,
                    alias: name ? `data[${i}] | ${name}` : `data[${i}]`,
                    type,
                    value,
                    input: getInitialCandidTypeValue(type, [], []),
                };
            }
        }

        console.error('test args init', props.child, args.value);
    },
    { immediate: true },
);

const argTip = (arg: ArgumentItem): string => {
    //     return `type: ${unwrapCandidType(arg.type)}\n
    // alias: ${arg.alias}`;
    return arg.alias;
};

const onValueChanged = (i: number, value: DataResult<CandidValue>) => {
    if (value.ok) {
        args.value[i].input = value.ok;
    }
};

const ready = computed(() => {
    for (const arg of args.value) {
        if (arg.value !== undefined) continue;
        if (arg.input !== undefined) continue;
        return false;
    }
    return true;
});

const onTest = async () => {
    if (!ready.value) {
        ElMessage.error('Check arguments please.');
        return;
    }

    console.error('test args', args.value);

    for (const arg of args.value) {
        if (arg.value !== undefined) continue;
        if (arg.input !== undefined) continue;
        ElMessage.error('Check arguments please.');
        errorMessage.value = '';
        result.value = undefined;
        return;
    }

    let fromType: CandidType | undefined = undefined;
    let child: number | undefined = undefined;
    let names: string[] | undefined = undefined;
    let toType: CandidType | undefined = undefined;
    let argument: CandidValue | undefined = undefined;
    if (props.child === undefined) {
        fromType = from.value;
        child = undefined;
        names = props.names;
        toType = to.value;
        argument = args.value[0].value ?? args.value[0].input;
    } else if (props.child === 1) {
        if (props.from.type !== 'tuple' || props.from.subitems.length !== 1)
            throw new Error('wrong type 1');
        fromType = { type: 'tuple', subitems: [{ key: '_0_', type: from.value }] };
        child = 1;
        names = props.names;
        toType = to.value;
        argument = [args.value[0].value ?? args.value[0].input];
    } else {
        if (props.from.type !== 'tuple') throw new Error('wrong type 2');
        fromType = { type: 'tuple', subitems: [] };
        child = 0;
        names = props.names;
        toType = to.value;
        argument = [];
        const from = deepClone(props.from as TupleCandidType);
        for (let i = 0; i < from.subitems.length; i++) {
            fromType.subitems[i] = { key: `_${i}_`, type: args.value[i].type };
            argument[i] = args.value[i].value ?? args.value[i].input;
        }
    }
    if (argument === undefined) {
        ElMessage.error('Check arguments please.');
        return;
    }
    fromType = deepClone(fromType);
    child = child;
    names = deepClone(names);
    toType = deepClone(toType);
    argument = deepClone(argument);
    const transform: Transform = {
        from: fromType,
        transform: {
            type: 'function',
            code: code.value,
        },
        to: toType,
    };
    if (child !== undefined) transform.child = child;
    if (names !== undefined) transform.names = names;

    errorMessage.value = '';
    result.value = undefined;
    try {
        const testResult = await doTransform(transform, argument, false);
        if (testResult.err) {
            errorMessage.value = testResult.err;
        } else {
            result.value = testResult.ok;
        }
    } catch (e) {
        errorMessage.value = `${e}`;
    }
};
</script>

<template>
    <div class="debug-code-dialog-content">
        <el-dialog class="w828 column" :title="'Debug Code'" v-model="show" @closed="onDialogClose">
            <div class="from">
                <div class="label"> {{ 'From Type' }} </div>
                <div class="type">
                    <span>
                        {{
            unwrapCandidType(from).length > 30 ? from.type : unwrapCandidType(from)
        }}
                    </span>
                    <span class="view" @click="onViewFrom">view</span>
                </div>
            </div>
            <div class="debug-content">
                <div class="code">
                    <CodeMirrorVue :disabled="true" :code="`const transform = (data) => {
        let result = undefined;`" />
                    <CodeMirrorVue :mirrorClass="'fixed-height-250'" :disabled="false" :code="code"
                        @changed="onCodeMirrorChanged" />
                    <CodeMirrorVue :disabled="true" :code="`      return result;
    };`" />
                </div>
                <div class="debug">
                    <div class="arguments">
                        <div class="subtitle">
                            Mock Args {{ args.length > 1 ? ' ' + args.length : '' }}
                        </div>
                        <div class="args">
                            <div v-for="(arg, i) in args" :key="i">
                                <div class="name">
                                    <el-tooltip placement="top" :content="argTip(arg)">
                                        {{ arg.name ? arg.name : arg.alias }}
                                    </el-tooltip>
                                </div>
                                <div class="input">
                                    <ConstantInputVue :initial="{ type: arg.type, value: arg.value ?? arg.input }"
                                        :disabled="arg.value !== undefined"
                                        @changed="(r: DataResult<CandidValue>) => (onValueChanged(i, r))" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="run" @click="onTest">Test</button>
                    <div class="result">
                        <div class="subtitle"> Test Result </div>
                        <div class="inner">
                            <div class="error" v-if="errorMessage">
                                <span>{{ errorMessage }}</span>
                            </div>
                            <div class="waiting-test" v-else-if="result === undefined">
                                <span @click="onTest">
                                    {{ 'Click the test button first' }}
                                </span>
                            </div>
                            <div class="result-value" v-else>
                                <ConstantInputVue :initial="{ type: to, value: result }" :disabled="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="to">
                <div class="label"> {{ 'To Type' }} </div>
                <div class="type">
                    <span>
                        {{ unwrapCandidType(to).length > 30 ? to.type : unwrapCandidType(to) }}
                    </span>
                    <span class="view" @click="onViewTo">view</span>
                </div>
            </div>
            <div class="control">
                <div class="cancel" @click="onDialogClose">
                    {{ $t('plugin.generic.cancel') }}
                </div>
                <div class="confirm" @click="onConfirm">
                    {{ $t('plugin.generic.confirm') }}
                </div>
            </div>
        </el-dialog>
        <template v-if="showFromType">
            <CandidTypeDialogVue :show="showFromType" :type="from" :disabled="true" @complete="onCloseViewFrom" />
        </template>
        <template v-if="showToType">
            <CandidTypeDialogVue :show="showToType" :type="to" :disabled="false" @complete="onCloseViewTo" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.debug-code-dialog-content {
    width: 100%;

    .from,
    .to {
        display: flex;
        height: 36px;
        align-items: center;
        margin-bottom: 20px;

        .label {
            width: 100px;
            text-align: left;
            font-weight: 400;
            font-size: 14px;
            color: #666666;
            @apply dark:(text-light-900/60);
        }

        .type {
            display: flex;
            flex: 1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            font-weight: 400;
            font-size: 16px;
            color: #000000;
            margin-left: 35px;
            @apply dark:(text-light-900);

            width: 100%;

            >.view {
                color: #34d399;
                cursor: pointer;
            }
        }
    }

    .debug-content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;

        .code {
            flex: 1;
            max-height: calc(100vh - 400px);
            overflow-y: auto;

            :deep(.vue-codemirror) {
                .cm-editor {
                    .cm-scroller {
                        .pscrollbar();
                    }
                }
            }
        }

        .debug {
            width: 250px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            margin-left: 20px;
            max-height: calc(100vh - 400px);
            overflow-y: auto;
            .pscrollbar();

            .arguments {
                @apply w-full;
            }

            .subtitle {
                font-weight: 500;
                color: #000000;
                padding-bottom: 5px;
                text-align: left;
                @apply dark:(text-light-900);
            }

            .args {
                >div {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    margin: 5px 0;

                    >.name {
                        @apply w-15 text-sm text-left dark:(text-light-900/60);
                    }

                    :deep(.input) {
                        @apply flex-1;

                        .constant-input-content {

                            .text-input-content,
                            .integer-input-content,
                            .principal-input-content {
                                input {
                                    @apply border-gray-300 rounded-md h-8 text-sm dark:(border-dark-50);
                                }

                                .tip {
                                    @apply break-all;
                                }
                            }

                            .bool-input-content {
                                span {
                                    @apply text-sm;
                                }
                            }

                            .variant-input-content {
                                @apply w-full flex-col;

                                .select {
                                    @apply text-sm;
                                }

                                .record-input-content {
                                    .item {
                                        @apply w-full flex-col;

                                        input {
                                            @apply mt-2 w-full mr-0 border-gray-300 rounded-md h-8 text-sm dark:(border-dark-50);
                                        }
                                    }
                                }
                            }

                            .vec-input-content {
                                .item {
                                    @apply items-center;

                                    .right {
                                        @apply rounded-md dark:(border-dark-100);

                                        .main {
                                            .constant-input-content {
                                                .integer-input-content {
                                                    @apply h-7;
                                                }
                                            }
                                        }

                                        .delete {
                                            >div {
                                                @apply !h-7 dark:(border-dark-100);
                                            }
                                        }
                                    }
                                }

                                .push {
                                    @apply h-7 mt-5px dark:(border-dark-100);
                                }
                            }

                            .record-input-content {
                                .item {
                                    @apply flex-col;

                                    input {
                                        @apply mr-0 w-full mb-2 border-gray-300 rounded-md h-8 text-sm dark:(border-dark-50);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        .run {
            @apply w-full mt-2 flex items-center justify-center bg-green-400 text-black border-none rounded-lg py-2 transition duration-300 hover:(transition duration-300 opacity-80);
        }

        .result {
            width: 100%;
            margin-top: 12px;

            >.inner {
                >.error {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    color: red;

                    >span {
                        width: 100%;
                        border: red solid 1px;
                        border-radius: 5px;
                        padding: 5px;
                    }
                }

                >.waiting-test {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    color: yellowgreen;

                    >span {
                        border-radius: 5px;
                        padding: 5px 20px;
                        @apply text-gray-400 text-sm;
                    }
                }

                >.result-value {
                    width: 100%;

                    :deep(.constant-input-content) {
                        .vec-input-content {
                            .item {
                                @apply items-center;

                                .right {
                                    @apply rounded-md border-gray-200 !justify-between flex-col dark:(border-dark-100);

                                    .main {
                                        .constant-input-content {
                                            .record-input-content {
                                                .item {
                                                    >input {
                                                        @apply w-12;
                                                    }

                                                    input {
                                                        @apply rounded-md border-gray-200 text-sm dark:(border-dark-100);
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    .delete {
                                        @apply w-full ml-0 mt-6px;

                                        div {
                                            @apply h-6 rounded-md border-gray-200 dark:(border-dark-100);
                                        }
                                    }
                                }
                            }

                            .push {
                                @apply h-6 rounded-md border-gray-200 text-sm dark:(border-dark-100);
                            }
                        }
                    }
                }
            }

        }
    }

    .control {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .cancel {
            width: 48%;
            height: 40px;
            background: #eee;
            border-radius: 8px;
            margin: 0;
            .center();
            cursor: pointer;
            flex-shrink: 1;
            @apply dark: (bg-dark-100);

            transition: @transition;

            &:hover {
                box-shadow: 0 0 15px rgba(238, 238, 238, 0.5);
                opacity: 0.85;
                transition: @transition;
            }
        }

        .confirm {
            width: 48%;
            height: 40px;
            background: linear-gradient(90deg, #34d399, #7cee83);
            border-radius: 8px;
            color: black;
            margin: 0;
            margin-left: 20px;
            .center();
            cursor: pointer;
            flex-shrink: 1;
            transition: @transition;

            &:hover {
                box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
                opacity: 0.85;
                transition: @transition;
            }

            &.disabled {
                @apply opacity-50 pointer-events-none;
            }
        }
    }
}
</style>
