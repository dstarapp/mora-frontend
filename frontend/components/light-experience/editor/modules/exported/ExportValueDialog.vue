<script lang="ts" setup>
import { inject, PropType, ref, watch } from 'vue';
import CodeMirror from '@/components/CodeMirror.vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { CandidType, unwrapCandidType } from '@mora-light/core/types/candid';
import { Transform } from '@mora-light/core/types/transform';
import { DataResult, deepClone } from '@mora-light/core/types/common';
import { findTransformToCandidType } from '@mora-light/core/types/transform';
import CandidTypeDialogVue from '../types/CandidTypeDialog.vue';
import DebugCodeDialogVue from '../debug/DebugCodeDialog.vue';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    id: { type: String, required: true },
    name: { type: String, required: true },
    transform: {
        type: Object as PropType<Transform>,
        required: false,
    },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const origin = ref<boolean>(props.transform === undefined);
const code = ref<string>(props.transform?.transform.code ?? '');
const to = ref<CandidType>(findTransformToCandidType(props.transform) ?? { type: 'bool' });

const name = ref<string>(props.name);

const editingTypeShow = ref(false);
const onTypeChanged = (r: DataResult<CandidType>) => {
    if (r.ok !== undefined) {
        to.value = r.ok;
    }
};
const onEditType = () => (editingTypeShow.value = true);
const onTypeComplete = (r: CandidType | undefined) => {
    editingTypeShow.value = false;
    if (r === undefined) return;
    to.value = r;
};

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onComplete = () => {
    if (findExportedValue(name.value.trim(), props.id) !== undefined) {
        ElMessage.error(
            `${t('plugin.generic.variableName1')}${name.value}${t('plugin.generic.variableName2')}`,
        );
        return;
    }

    if (!name.value.trim()) {
        emit('complete');
        return;
    }

    emit('complete', {
        name: name.value.trim(),
        transform:
            origin.value || !code.value.trim()
                ? undefined
                : {
                    from: deepClone(props.type),
                    transform: {
                        type: 'function',
                        code: code.value,
                    },
                    to: to.value,
                },
    });
};

watch(
    () => origin.value,
    (nv) => {
        if (!nv && code.value.trim() === '') {
            code.value = '    result = false;';
        }
    },
);

const onCodeMirrorChanged = (input_code: string) => {
    code.value = input_code;
};

const showFromType = ref(false);
const onViewFrom = () => (showFromType.value = true);
const onCloseViewFrom = () => (showFromType.value = false);

const showDebugDialog = ref(false);
const onViewDebugDialog = () => (showDebugDialog.value = true);
const onCloseViewDebugDialog = (code?: string, to?: CandidType) => {
    showDebugDialog.value = false;
    if (code) onCodeMirrorChanged(code);
    if (to) onTypeComplete(to);
};
</script>

<template>
    <div class="export-value-dialog-content">
        <el-dialog :title="$t('plugin.export.title')" :class="!origin ? 'w828 column' : 'w700'" v-model="show"
            @closed="onDialogClose">
            <div class="export-value-main">
                <div class="origin-type">
                    <div class="label"> {{ $t('plugin.export.original.title') }} </div>
                    <div class="origin-type-val">
                        <el-tooltip placement="top" :content="'data'">
                            <span>
                                {{
            unwrapCandidType(props.type).length > 30
                ? props.type.type
                : unwrapCandidType(props.type)
        }}
                            </span>
                        </el-tooltip>
                        <span class="view" @click="onViewFrom">view</span>
                    </div>
                </div>
                <div class="covert">
                    <div class="label">{{ $t('plugin.export.covert.title') }}</div>
                    <span class="tabs">
                        <span :class="{ chosen: origin }" @click="origin = true">
                            {{ $t('plugin.export.covert.tabs1') }}
                        </span>
                        <span :class="{ chosen: !origin }" @click="origin = false">
                            {{ $t('plugin.export.covert.tabs2') }}
                        </span>
                    </span>
                </div>
                <template v-if="!origin">
                    <div class="javascript">
                        <div class="code">
                            <code-mirror :code="`const transform = (data) => {
        let result = undefined;`" :disabled="true" />
                            <code-mirror :code="code" :mirrorClass="'fixed-height-250'" :disabled="false"
                                @changed="onCodeMirrorChanged" />
                            <code-mirror :code="`      return result;
    };`" :disabled="true" />
                        </div>
                        <div class="debug">
                            <span @click="onViewDebugDialog">Debug</span>
                        </div>
                    </div>
                    <div class="to">
                        <div class="label">{{ $t('plugin.export.to.title') }}</div>
                        <div class="to-val">
                            <div class="basic">
                                {{ unwrapCandidType(to) }}
                            </div>
                            <div class="btn" @click="onEditType">
                                {{ $t('plugin.export.to.edit') }}
                            </div>
                        </div>
                    </div>
                </template>

                <div class="variable-name">
                    <div class="label">{{ $t('plugin.export.variable.title') }}</div>
                    <div class="variable-name-val">
                        <el-input v-model="name" :placeholder="$t('plugin.export.variable.placeholder')" />
                    </div>
                </div>

                <div class="button-box">
                    <div class="cancel" @click="onDialogClose">
                        {{ $t('plugin.generic.cancel') }}
                    </div>
                    <div class="btn" @click="onComplete" :class="{ disabled: !name }">
                        {{ $t('plugin.generic.confirm') }}
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
    <template v-if="editingTypeShow">
        <CandidTypeDialogVue :show="editingTypeShow" :type="to" @complete="onTypeComplete" />
    </template>
    <template v-if="showFromType">
        <CandidTypeDialogVue :show="showFromType" :type="props.type" :disabled="true" @complete="onCloseViewFrom" />
    </template>
    <template v-if="showDebugDialog">
        <DebugCodeDialogVue :show="showDebugDialog" :from="props.type" :child="undefined" :names="[]" :values="[]"
            :code="code" :to="to" @complete="onCloseViewDebugDialog" />
    </template>
</template>

<style lang="less" scoped>
.export-value-dialog-content {
    width: 100%;

    :deep(.el-dialog__body) {
        height: calc(100% - 55px) !important;
        overflow-y: scroll;
        padding: 20px 50px 40px 50px !important;
    }

    .export-value-main {
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        height: 100%;

        .origin-type,
        .covert,
        .javascript,
        .to,
        .variable-name {
            display: flex;
            height: 36px;
            align-items: center;
            margin-bottom: 27px;

            .label {
                width: 100px;
                text-align: left;
                font-weight: 400;
                font-size: 14px;
                color: #666666;
                @apply dark:(text-light-900/60);
            }

            .origin-type-val {
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

            .tabs {
                display: flex;
                flex: 1;
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                margin-left: 35px;
                height: 36px;
                cursor: pointer;

                span {
                    .center();
                    height: 36px;
                    flex: 1;
                    min-width: 122px;
                    font-weight: 400;
                    font-size: 14px;
                    color: #000000;
                    border: 1px solid #dddddd;
                    border-radius: 8px 0 0 8px;
                    @apply dark:(border-dark-100 text-light-900);

                    &:first-child {
                        border-right: 0;
                    }

                    &:last-child {
                        border-left: 0;
                        border-radius: 0 8px 8px 0;
                        flex: 1;
                    }

                    &.chosen {
                        background: #5ae28e;
                        border: none;
                        @apply text-black;
                    }
                }
            }

            .code {
                width: 100%;
                text-align: left;
                overflow-y: scroll;
                height: calc(100vh - 560px);

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

            .to-val {
                display: flex;
                flex: 1;
                margin-left: 35px;
                justify-content: space-between;
                align-items: center;

                .basic {
                    font-weight: 400;
                    font-size: 16px;
                    color: #000000;
                    @apply dark:(text-light-900);
                }

                .btn {
                    font-weight: 400;
                    font-size: 16px;
                    color: #5ae28e;
                    cursor: pointer;
                }
            }

            .variable-name-val {
                display: flex;
                flex: 1;
                margin-left: 35px;

                :deep(.el-input) {
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    display: flex;
                    flex: 1;
                    height: 36px;
                    @apply dark: (border-dark-100);

                    .el-input__wrapper {
                        padding: 0 10px;
                        border-radius: 6px;

                        .el-input__inner {
                            font-size: 14px;
                            height: 100%;
                            @apply dark:(text-light-900);
                        }
                    }
                }
            }
        }

        .javascript {
            @apply h-auto mb-3 relative;

            .debug {
                @apply right-0 bottom-0 bg-black text-white text-sm absolute py-1 px-2 rounded-tl-md cursor-pointer transition duration-300 hover:(transition duration-300 bg-dark-600);
            }
        }
    }

    .button-box {
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

        .btn {
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
