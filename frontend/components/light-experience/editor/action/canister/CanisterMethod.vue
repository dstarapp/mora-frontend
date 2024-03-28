<script lang="ts" setup>
import { PropType, ref, computed, inject, onMounted } from 'vue';
import { CanisterAction, getInitialCanisterActionArg } from '../../../types/parts/canisters';
import { CanisterActionCurrentEditingState } from '../../../types/common/state';
import { FuncClass, Type } from '@dfinity/candid/lib/cjs/idl';
import { createActor, parseTypes } from '../../../canisters/canister';
import { Actor } from '@dfinity/agent';
import { parseTuple, getInitialCandidTypeValue } from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';
import { ElMessage } from 'element-plus';

const props = defineProps({
    action: {
        type: Object as PropType<CanisterAction>,
        required: true,
    },
});

const refreshActions = inject<() => void>('ACTIONS_REFRESH')!;

const setCurrentEditing =
    inject<(state: CanisterActionCurrentEditingState | undefined) => void>('SET_CURRENT_EDITING')!;

const collapse = ref(false);

const options = ref<{ name: string; func: FuncClass }[]>([]);

const name = computed(() => props.action.canister.method.name);
const currentName = ref(
    name.value && options.value.find((o) => o.name === name.value) ? name.value : '',
);
const annotation = computed<'query' | 'update' | ''>(() => {
    const option = options.value.find((o) => o.name === name.value);
    if (option === undefined) return '';
    return option.func.annotations.includes('query') ? 'query' : 'update';
});

const onMethodNameChanged = () => {
    const option = options.value.find((o) => o.name === currentName.value);
    if (option === undefined) return;

    props.action.canister.method.name = currentName.value;

    const func = option.func;

    // console.error('func', func);

    const args = parseTypes(func.argTypes as Type[]);
    props.action.canister.method.arg = parseTuple(args);
    const results = parseTypes(func.retTypes as Type[]);
    props.action.canister.method.result = parseTuple(results);
    // props.action.canister.method.child = findAloneType(
    //     props.action.canister.method.result,
    // ).child;
    delete props.action.canister.method.child;

    setCurrentEditing(undefined);

    try {
        getInitialCandidTypeValue(parseTuple(args), [], []);
    } catch (e) {
        props.action.canister.method.name = '';
        ElMessage.error(`Invalid method: ${currentName.value} (arg type is invalid)`);
        return;
    }
    props.action.arg = {
        type: parseTuple(args),
        subitems: args.map((arg) => getInitialCanisterActionArg(arg, [])),
    };
    try {
        getInitialCandidTypeValue(parseTuple(results), [], []);
    } catch (e) {
        props.action.canister.method.name = '';
        ElMessage.error(`Invalid method: ${currentName.value} (result type is invalid)`);
        return;
    }
    props.action.result = {
        type: parseTuple(results),
        subitems: results.map((result) => {
            return {
                type: deepClone(result),
                exported: {
                    id: '',
                    name: '',
                },
            };
        }),
    };

    refreshActions();
};

// watch(
//     () => props.action.canister.candid.javascript,
//     () => analysisDID(),
// );

const analysisDID = async () => {
    if (props.action.canister.candid.javascript && props.action.canister.canister_id) {
        let methodList = await parseOptions(
            props.action.canister.candid.javascript,
            props.action.canister.canister_id.value
                ? props.action.canister.canister_id.value
                : 'aaaaa-aa',
        );
        options.value = methodList;
        if (methodList.length && !currentName.value) {
            if (!name.value) currentName.value = methodList[0].name;
            else currentName.value = name.value;
            onMethodNameChanged();
        }
    }

    refreshActions();
};

defineExpose({ analysisDID });

const parseOptions = async (javascript: string, canisterId: string) => {
    const code = `data:text/javascript;charset=utf-8,${encodeURIComponent(javascript)}`;
    const candid = await eval(`import("${code}")`);
    // console.error("candid", candid);

    const actor: any = createActor(candid.idlFactory, canisterId);
    // console.error("actor", actor);

    let types = Actor.interfaceOf(actor)._fields;
    // console.error("types", types);

    const options = Object.entries(Object.fromEntries(types))
        .map((item) => {
            return {
                name: item[0],
                func: item[1],
            };
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1));
    // console.error("options", options.value);
    if (options[0] && options[0]?.name === '__get_candid_interface_tmp_hack') {
        options.shift();
    }
    return options;
};

onMounted(async () => {
    let methodList = await parseOptions(
        props.action.canister.candid.javascript,
        props.action.canister.canister_id.value
            ? props.action.canister.canister_id.value
            : 'aaaaa-aa',
    );
    options.value = methodList;
    currentName.value =
        name.value && options.value.find((o) => o.name === name.value) ? name.value : '';
});
</script>

<template>
    <div class="title2">
        <div class="left">
            {{ $t('plugin.actionEditor.chooseMethod') }}
        </div>
        <div class="right">
            <i @click="collapse = !collapse" class="iconfont" :class="{
                'icon-plugin-aup': !collapse,
                'icon-plugin-adown': collapse,
            }"></i>
        </div>
    </div>
    <div class="box" :class="{ hide: collapse }">
        <div class="item">
            <div class="t-box">
                <p>{{ $t('plugin.actionEditor.method') }}</p>
                <span v-if="name && annotation">
                    {{ annotation === 'query' ? 'Query' : 'Update' }}
                </span>
            </div>
            <el-select v-model="currentName" filterable default-first-option
                :placeholder="$t('plugin.actionEditor.chooseMethod')" @change="onMethodNameChanged">
                <el-option v-for="option in options" :key="option.name" :label="option.name" :value="option.name" />
            </el-select>
        </div>
    </div>
</template>

<style lang="less" scoped>
.box {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    height: 70px;
    transition: @transition;

    .item {
        margin: 0 16px;
        display: flex;
        flex-direction: column;
        position: relative;

        .t-box {
            display: flex;
            justify-content: space-between;
            align-items: center;

            p {
                color: #666666;
                font-size: 12px;
                @apply dark: (text-light-900/60);
            }

            span {
                border: 1px solid #999999;
                border-radius: 20px;
                height: 16px;
                padding: 0 5px;
                .center();
                font-size: 12px;
                color: #666666;
                pointer-events: none;
                @apply dark: (border-dark-100 text-light-900/60);
            }
        }

        :deep(.el-select) {
            margin: 8px 0 0 0;

            .el-input {
                .el-input__wrapper {
                    padding: 0 11px;
                    border-width: 1px;
                    border-radius: 8px;

                    &:hover {
                        border-color: #34d399;
                        background-color: #fff;
                    }

                    .el-input__inner {
                        text-align: left;
                        height: 34px !important;
                        font-size: 14px;
                        color: #000000;
                        @apply dark: (text-light-900/80);
                    }
                }

                &.is-focus {
                    .el-input__wrapper {
                        border-color: #34d399;
                    }
                }
            }
        }

        &:nth-child(2) {
            margin-top: 10px;
        }
    }

    &.hide {
        height: 0px;
        transition: @transition;
    }
}
</style>
