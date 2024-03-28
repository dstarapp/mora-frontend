<script lang="ts" setup>
import { PropType, ref, watch, inject, computed } from 'vue';
import { CanisterAction } from '../../../types/parts/canisters';
import { CanisterActionCurrentEditingState } from '../../../types/common/state';
import { isPrincipal } from '../../../canisters/canister';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { createCandidUIActor } from '../../../canisters/candidUI';
import { createHackActor } from '../../../canisters/hack';
import { Principal } from '@dfinity/principal';
import { canister_module_hash_and_time } from '../../../canisters/status';
import {
    getEmptyTupleCandidType,
    CandidType,
    isSameCandidType,
} from '@mora-light/core/types/candid';
import { DataSource } from '@mora-light/core/types/source';
import { ActionValues, findExportedValueNameByActionValues } from '../../../types/common/value';
import { checkCanisterActionId } from '../../../types/common/checks';
import ChooseValueDialogVue from '../../modules/values/ChooseValueDialog.vue';
import CandidPreviewVue from './CandidPreview.vue';

const getCanisterIdName = (source: DataSource | undefined): string => {
    if (!source) return '';
    switch (source.source) {
        case 'prop':
            return source.prop.name ?? '';
    }
    return '';
};
const getCanisterIdLabel = (source: DataSource | undefined): string => {
    if (!source) return '';
    switch (source.source) {
        case 'prop':
            return source.prop.label ?? '';
    }
    return '';
};
const getCanisterIdTip = (source: DataSource | undefined): string => {
    if (!source) return '';
    switch (source.source) {
        case 'prop':
            return source.prop.tip ?? '';
    }
    return '';
};
const checkId = (id: string, values: ActionValues): boolean => {
    if (!id) return true;
    const name = findExportedValueNameByActionValues(values, id, { type: 'principal' });
    if (name) return true;
    return false;
};
const findBoundName = (id: string, values: ActionValues): string => {
    if (!id) return '';
    const name = findExportedValueNameByActionValues(values, id, { type: 'principal' });
    return name;
};

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CanisterAction>,
        required: true,
    },
    analysisDID: {
        type: Function,
        required: true,
    },
});

const refreshActions = inject<() => void>('ACTIONS_REFRESH')!;

const setCurrentEditing =
    inject<(state: CanisterActionCurrentEditingState | undefined) => void>('SET_CURRENT_EDITING')!;

const collapse = ref(false);
const loading = ref(false);

const fixed = ref<boolean>(props.action.canister.canister_id.fixed);
const canisterId = ref<string>(props.action.canister.canister_id.value ?? '');
const canisterIdName = ref<string>(getCanisterIdName(props.action.canister.canister_id.source));
const canisterIdLabel = ref<string>(getCanisterIdLabel(props.action.canister.canister_id.source));
const canisterIdTip = ref<string>(getCanisterIdTip(props.action.canister.canister_id.source));
const checkedName = computed(() => checkCanisterActionId(canisterIdName.value, props.values));
const id = ref<string>((props.action.canister.canister_id as any).id ?? '');
const checkedId = computed(() => checkId(id.value, props.values));
if (!checkId(id.value, props.values)) id.value = '';
const boundName = computed(() => findBoundName(id.value, props.values));
watch(
    () => props.action.canister.canister_id,
    () => {
        fixed.value = props.action.canister.canister_id.fixed;
        canisterId.value = props.action.canister.canister_id.value ?? '';
        canisterIdName.value = getCanisterIdName(props.action.canister.canister_id.source);
        canisterIdLabel.value = getCanisterIdLabel(props.action.canister.canister_id.source);
        canisterIdTip.value = getCanisterIdTip(props.action.canister.canister_id.source);
        id.value = (props.action.canister.canister_id as any).id ?? '';
        if (!checkId(id.value, props.values)) id.value = '';
    },
);

watch(
    () => fixed.value,
    () => {
        props.action.canister.canister_id.fixed = fixed.value;
        if (fixed.value) {
            delete props.action.canister.canister_id.source;
            delete props.action.canister.canister_id['id'];
            id.value = '';
        }
        refreshActions();
    },
);

const onCanisterIdChanged = () => {
    if (canisterId.value) {
        props.action.canister.canister_id.value = canisterId.value;
    } else if (!fixed.value) {
        delete props.action.canister.canister_id.value;
    }

    setCurrentEditing(undefined);
    resetInfo();
    resetCandid();
    resetMethod();

    refreshActions();
};

watch(() => canisterId.value, onCanisterIdChanged);

watch(
    () => [canisterIdName.value, canisterIdLabel.value, canisterIdTip.value, id.value],
    () => {
        if (fixed.value || (!canisterIdName.value && !id.value)) {
            delete props.action.canister.canister_id.source;
            delete props.action.canister.canister_id['id'];
            refreshActions();
        } else if (id.value && checkedId.value) {
            delete props.action.canister.canister_id.source;
            props.action.canister.canister_id['id'] = id.value;
            refreshActions();
        } else if (!id.value && !checkedName.value) {
            props.action.canister.canister_id.source = {
                source: 'prop',
                prop: {
                    result: { type: 'principal' },
                    name: canisterIdName.value,
                },
            };
            delete props.action.canister.canister_id['id'];
            if (canisterIdLabel.value)
                props.action.canister.canister_id.source.prop.label = canisterIdLabel.value;
            if (canisterIdTip.value)
                props.action.canister.canister_id.source.prop.tip = canisterIdTip.value;
            refreshActions();
        }
    },
);

const didSource = ref<'online' | 'local'>(props.action.canister.candid.custom ? 'local' : 'online');

watch(
    () => didSource.value,
    (nv) => {
        didFile.value = '';
        setCurrentEditing(undefined);
        resetInfo();
        resetCandid();
        resetMethod();

        refreshActions();

        if (nv === 'online') retrieveData();
    },
);

const didFile = ref<string>(
    props.action.canister.candid.custom ? props.action.canister.candid.did : '',
);
const onCandidFileChanged = (e: any) => {
    if (!e.target.files[0]) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = async function () {
        let content = new Uint8Array((reader as any).result);
        let didText = '';
        for (let i = 0; i < content.length; i++) {
            didText += String.fromCharCode(content[i]);
        }

        didFile.value = didText;

        setCurrentEditing(undefined);
        resetInfo();
        resetCandid();
        resetMethod();

        refreshActions();

        retrieveData();
    };
    reader.onerror = () => {
        console.error('error');
    };
};

const retrieveData = async () => {
    if (loading.value) return;

    if (
        props.action.canister.canister_id.fixed &&
        !isPrincipal(props.action.canister.canister_id.value)
    ) {
        ElMessage.error(t('plugin.actionEditor.canisterIdError'));
        return;
    } else if (
        !props.action.canister.canister_id.fixed &&
        props.action.canister.canister_id.value &&
        !isPrincipal(props.action.canister.canister_id.value)
    ) {
        ElMessage.error(t('plugin.actionEditor.canisterIdError'));
        return;
    }

    if (didSource.value === 'online' && props.action.canister.canister_id.value) {
        props.action.canister.candid.did = '';
        loading.value = true;
        try {
            let did = await getCandidFromCanister(props.action.canister.canister_id.value);
            if (!did) {
                loading.value = false;
                return;
            }
            props.action.canister.candid.did = did;
        } catch (e) {
            console.error('getCandidFromCanister', e);
            ElMessage.error('get candid from canister failed');
            loading.value = false;
            return;
        }
        props.action.canister.candid.custom = false;
        let javascript = await getCandidJsFromCanister(props.action.canister.candid.did);
        loading.value = false;
        if (javascript === undefined) return;
        props.action.canister.candid.javascript = javascript;
        props.analysisDID();
    } else {
        if (!didFile.value) {
            ElMessage.error(t('plugin.actionEditor.canisterIdFileError'));
            return;
        }
        props.action.canister.candid.did = didFile.value;
        props.action.canister.candid.custom = true;
        loading.value = true;
        let javascript = await getCandidJsFromCanister(props.action.canister.candid.did);
        loading.value = false;
        if (javascript === undefined) return;
        props.action.canister.candid.javascript = javascript;
        props.analysisDID();
    }

    if (props.action.canister.canister_id.value) {
        canister_module_hash_and_time(
            Principal.fromText(props.action.canister.canister_id.value),
        ).then((res) => {
            props.action.canister.info.module_hash = res.module_hash;
            props.action.canister.info.updated = res.time.getTime();
        });
    }

    refreshActions();
};

const javascriptVisible = ref(false);

const viewCandid = () => {
    if (props.action.canister.candid.javascript) {
        javascriptVisible.value = true;
    }
};

const onCandidPreviewClose = () => (javascriptVisible.value = false);

const resetInfo = () => {
    props.action.canister.info = {
        module_hash: '',
        updated: 0,
    };
};

const resetCandid = () => {
    props.action.canister.candid = {
        custom: false,
        did: '',
        javascript: '',
    };
};

const resetMethod = () => {
    props.action.canister.method = {
        name: '',
        arg: getEmptyTupleCandidType(),
        result: getEmptyTupleCandidType(),
    };
};

const getCandidFromCanister = async (canisterId: string): Promise<string | undefined> => {
    const actor = createHackActor(canisterId);
    const r = actor.__get_candid_interface_tmp_hack();
    return r;
};

const getCandidJsFromCanister = async (did: string): Promise<string | undefined> => {
    const actor = createCandidUIActor('a4gq6-oaaaa-aaaab-qaa4q-cai');
    const r = await actor.did_to_js(did);
    return r[0];
};

if (!props.action.canister.candid.javascript) retrieveData();

const chooseCanisterIdNeeds = (type: CandidType) =>
    isSameCandidType(type, { type: 'principal' }) ? type : undefined;
const chooseCanisterIdShow = ref(false);
const onChooseCanisterId = () => (chooseCanisterIdShow.value = true);
const onChooseCanisterIdComplete = (
    r: { id: string; type: CandidType; name: string } | undefined,
) => {
    chooseCanisterIdShow.value = false;
    if (r === undefined) return;
    id.value = r.id;
};
</script>

<template>
    <div class="title2">
        <div class="left">
            {{ $t('plugin.addCanister.addCanister') }}
        </div>
        <div class="right flex items-center">
            <el-switch v-model="fixed" inline-prompt style="--el-switch-on-color: #35d49a" active-text="Static"
                inactive-text="Dynamic" size="small" />
            <i @click="collapse = !collapse" class="iconfont ml-2" :class="{
                'icon-plugin-aup': !collapse,
                'icon-plugin-adown': collapse,
            }"></i>
        </div>
    </div>
    <div class="box" :class="{ hide: collapse }">
        <div class="item">
            <p>{{ $t('plugin.actionEditor.id') }}</p>
            <div class="flex-1 mr-4 relative">
                <el-input :disabled="loading" v-model="canisterId"
                    :placeholder="$t('plugin.actionEditor.canisterId')" />
                <span v-if="!fixed" class="text-gray-400 text-xs absolute -bottom-4">
                    Only use canister id to test and get candid file
                </span>
            </div>
        </div>
        <div class="item mt-6" v-if="!fixed">
            <p>Variable name</p>
            <el-input :disabled="loading" v-model="canisterIdName" placeholder="Set to config when import page" />
            <div v-if="!id && checkedName">{{ checkedName }}</div>
            <!-- <div @click="onChooseCanisterId">+</div> -->
            <!-- <div v-if="id && boundName">{{ boundName }}</div> -->
        </div>
        <div class="item" v-if="isPrincipal(canisterId)">
            <p>{{ $t('plugin.actionEditor.candid') }}</p>
            <el-radio-group :disabled="!canisterId || !isPrincipal(canisterId) || loading" v-model="didSource">
                <el-radio label="online">
                    {{ $t('plugin.actionEditor.online') }}
                </el-radio>
                <el-radio label="local">
                    {{ $t('plugin.actionEditor.upload') }}
                </el-radio>
            </el-radio-group>
            <i v-if="didSource === 'local'" class="iconfont" :class="{
                'icon-plugin-upload': !didFile,
                success: didFile,
                'icon-ok': didFile,
            }">
                <input type="file" @change="onCandidFileChanged" />
            </i>
        </div>
        <div class="button-box" v-if="isPrincipal(canisterId) || props.action.canister.candid.javascript">
            <span :class="{ disabled: loading || (didSource === 'local' && !didFile) }" @click="retrieveData"
                v-if="isPrincipal(canisterId)">
                <img v-if="loading" src="@/assets/svg/ploading.svg" />
                {{ $t('plugin.actionEditor.retrieve') }}
            </span>
            <span v-if="props.action.canister.candid.javascript" @click="viewCandid">
                {{ $t('plugin.actionEditor.view') }}
            </span>
        </div>
    </div>
    <template v-if="chooseCanisterIdShow">
        <ChooseValueDialogVue :show="chooseCanisterIdShow" :values="props.values" :chosen="[]"
            :needs="chooseCanisterIdNeeds" @complete="onChooseCanisterIdComplete" />
    </template>
    <template v-if="javascriptVisible">
        <CandidPreviewVue :show="javascriptVisible" :candid="props.action.canister.candid.javascript"
            @close="onCandidPreviewClose" />
    </template>
</template>

<style lang="less" scoped>
.box {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    transition: @transition;
    // padding-bottom: 10px;

    &.hide {
        height: 0px;
        transition: @transition;
    }

    .item {
        display: flex;
        height: 36px;
        margin-bottom: 2px;
        align-items: center;
        margin-bottom: 10px;

        p {
            display: flex;
            height: 36px;
            width: 60px;
            align-items: center;
            margin-left: 16px;
            font-size: 12px;
            color: #666666;
            flex-shrink: 1;
            @apply dark: (text-light-900/60);
        }

        i {
            background: #f9f9f9;
            border: 1px solid #dddddd;
            border-radius: 4px;
            width: 26px;
            height: 24px;
            color: #999999;
            .center();
            cursor: pointer;
            position: relative;
            font-size: 12px;
            @apply dark:(bg-dark-300 border-dark-100);

            &::before {
                cursor: pointer;
            }

            input {
                opacity: 0;
                position: absolute;
                left: 0;
                top: 0;
                z-index: 2;
                width: 100%;
                height: 100%;
                font-size: 0;
                cursor: pointer;
            }

            &.success {
                color: #34d399;
            }
        }

        :deep(.el-input) {
            border: 1px solid #dddddd;
            border-radius: 8px;
            margin-right: 16px;
            display: flex;
            flex: 1;
            height: 36px;
            @apply transition duration-300 hover:(transition duration-300 border-green-500 dark:(border-green-500)) dark: (border-dark-100);

            .el-input__wrapper {
                padding: 0 10px;
                border-radius: 6px;

                .el-input__inner {
                    font-size: 14px;
                    height: 100%;
                }
            }
        }

        :deep(.el-radio-group) {
            .el-radio {
                margin-right: 15px;

                &.is-checked {
                    .el-radio__inner {
                        background: #34d399;
                        border-color: #34d399;
                    }
                }

                .el-radio__label {
                    color: #000000;
                    font-size: 14px;
                    padding-left: 6px;
                    @apply dark: (text-light-900/80);
                }
            }
        }
    }

    .button-box {
        display: flex;
        margin: 0 16px 10px 16px;

        span {
            .center();
            background: linear-gradient(90deg, rgb(52, 211, 153) 2.69%, #7cee83 96.86%);
            border-radius: 8px;
            height: 35px;
            font-size: 14px;
            color: #000000;
            flex: 1;
            cursor: pointer;
            transition: @transition;

            &.disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            img {
                margin-right: 10px;
                width: 15px;
            }

            &:nth-child(2) {
                background: rgb(232, 232, 232);
                margin-left: 16px;
                @apply dark: (bg-dark-50 text-light-900);

                &:hover {
                    box-shadow: 0 0 15px rgba(232, 232, 232, 0.5);
                    opacity: 0.85;
                    transition: @transition;
                }
            }

            &:hover {
                box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
                opacity: 0.85;
                transition: @transition;
            }
        }
    }
}
</style>
