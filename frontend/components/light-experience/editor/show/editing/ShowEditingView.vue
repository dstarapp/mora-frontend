<script lang="ts" setup>
import { PropType, ref, computed, watch } from 'vue';
import { ActionValues, findExportedValueByActionValues } from '../../../types/common/value';
import ChooseValueDialogVue from '../../modules/values/ChooseValueDialog.vue';
import { CandidType, isSameCandidType, unwrapCandidType } from '@mora-light/core/types/candid';
import { ElMessage } from 'element-plus';
import {
    TrimmedUnionTransmitShowView,
    doesSupportedType,
    findSupportedSimpleTypes,
} from '../../../types/parts/shows';
import WrappedViewUIVue from './ui/WrappedViewUI.vue';
import { t } from '@/i18n';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    view: {
        type: Object as PropType<TrimmedUnionTransmitShowView>,
        required: true,
    },
});

const visible = ref(true);

const id = ref<string>(props.id);
const name = computed(() => findExportedValueByActionValues(props.values, id.value)?.name ?? '');
const type = computed(() => findExportedValueByActionValues(props.values, id.value)?.type);
const view = ref<TrimmedUnionTransmitShowView>(props.view);
const needs = (type: CandidType): CandidType | undefined => doesSupportedType(view.value, type);
const needs2 = computed<CandidType[]>(() => findSupportedSimpleTypes(view.value));

watch(
    () => view.value,
    () => {
        // console.error('needs', needs.value);
        if (type.value) {
            if (!needs(type.value)) id.value = '';
        }
    },
    { immediate: true },
);

const onDialogClose = () => emit('complete');
const onClose = () => {
    visible.value = false;
    emit('complete');
};

const chooseValueShow = ref(false);
const onSelectValue = () => (chooseValueShow.value = true);
const onChooseValueComplete = (r: { id: string; type: CandidType; name: string } | undefined) => {
    chooseValueShow.value = false;
    id.value = r?.id ?? id.value;
};
const onDeleteValue = () => (id.value = '');

const onViewChanged = (v: TrimmedUnionTransmitShowView) => {
    view.value = v;
    assureUI();
    if (customLabel.value) view.value.constraint.ui!.customLabel = customLabel.value;
};

const assureUI = () => {
    if (view.value.constraint.ui === undefined) {
        view.value.constraint.ui = {};
    }
};

const customLabel = ref(view.value.constraint.ui?.customLabel ?? '');

watch(
    () => customLabel.value,
    () => {
        assureUI();
        view.value.constraint.ui!.customLabel = customLabel.value;
        view.value = { ...view.value };
    },
);

const getType = () => {
    return needs2.value.map((type) => unwrapCandidType(type)).join('\n');
};

const emit = defineEmits(['complete']);

const onComplete = () => {
    // if (!name.value) {
    //     ElMessage.error('must choose a valid value');
    //     return;
    // }

    if (!customLabel.value) {
        ElMessage.error(t('plugin.variableTip.labelError'));
        return;
    }

    visible.value = false;
    emit('complete', { id: id.value, view: view.value });
};
</script>

<template>
    <div class="show-editing-view-content">
        <el-dialog :title="props.title" v-model="visible" :before-close="() => (visible = false)"
            @closed="onDialogClose">
            <div class="dialog-form">
                <div class="ui">
                    <div class="box">
                        <div class="item">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.title') }}
                            </div>
                            <div class="con">
                                <el-input maxlength="20" v-model="customLabel"
                                    :placeholder="$t('plugin.formPreview.form.label')" />
                                <div class="state">
                                    <i v-if="!customLabel" class="iconfont icon-failed"></i>
                                    <i v-else class="iconfont icon-chose"></i>
                                </div>
                            </div>

                            <div class="error-text">
                                {{ !customLabel ? $t('plugin.formPreview.form.labelEmpty') : '' }}
                            </div>
                        </div>

                        <div>
                            <WrappedViewUIVue :view="view" @changed="onViewChanged" />
                        </div>

                        <div class="item variable">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.variable') }}
                            </div>
                            <div class="variableName" v-if="name">
                                {{ name }}
                                <i class="iconfont icon-failed" @click="onDeleteValue"></i>
                            </div>
                            <div @click="onSelectValue" class="choose" v-if="!name">
                                <i class="iconfont icon-plugin-add"></i>
                            </div>
                            <div class="variable-type" v-if="needs2 && needs2.length">
                                <el-tooltip :teleported="false" effect="dark" placement="top">
                                    <i class="iconfont icon-attention"></i>
                                    <template #content>
                                        <div>{{ getType() }}</div>
                                    </template>
                                </el-tooltip>
                            </div>
                            <div class="error-text"> </div>
                        </div>
                        <div class="item" v-if="type">
                            <div class="label">
                                {{ $t('plugin.formPreview.form.choose') }}
                            </div>
                            <div class="con !border-transparent !bg-transparent">
                                {{ unwrapCandidType(type) }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button-box">
                    <div>
                        <div class="cancel" @click="onClose">
                            {{ $t('plugin.formPreview.form.cancel') }}
                        </div>
                        <div class="btn" @click="onComplete">
                            {{ $t('plugin.formPreview.form.confirm') }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
        <template v-if="chooseValueShow">
            <ChooseValueDialogVue :show="chooseValueShow" :values="props.values" :chosen="[]" :needs="needs"
                @complete="onChooseValueComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.show-editing-view-content {
    width: 100%;
    display: flex;

    .dialog-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 26px;

        .ui {
            display: flex;
            flex-direction: column;
            width: 100%;

            .box {}
        }
    }
}

.item {
    display: flex;
    margin-bottom: 30px;
    position: relative;
    align-items: center;

    :deep(.el-radio-group) {
        .el-radio-button {
            span {
                color: #000000;
                font-size: 14px;
                border-color: #dddddd;
                box-shadow: none;
            }

            &.is-active {
                span {
                    background: #5ae28e;
                    border-color: #5ae28e;
                }
            }

            &:first-child {
                span {
                    border-right: none;
                }
            }
        }
    }

    :deep(.el-input) {
        border: none;

        &.is-disabled {
            .el-input__wrapper {
                box-shadow: none;
            }
        }

        .el-input__wrapper {
            padding: 0 10px;
            height: 36px;
            line-height: 36px;
            border-radius: 6px;

            .el-input__inner {
                color: #666;
                text-align: left;
                font-size: 14px;
                @apply dark:(text-light-900/80);
            }
        }
    }

    :deep(.el-select) {
        width: 100%;

        .el-input {
            overflow: hidden;
        }

        .el-input__wrapper {
            border: none;
            border-radius: 0;
        }
    }

    :deep(.el-input-number) {
        width: 100%;

        .el-input-number__decrease {
            padding: 0 10px;
        }

        .el-input__wrapper {
            .el-input__inner {
                color: #666;
                text-align: left;
                font-size: 14px;
            }

            .placeholder(#999);
        }
    }

    .label {
        font-size: 14px;
        color: #666666;
        width: 105px;
        text-align: left;
        margin-right: 20px;
        line-height: 38px;
        @apply dark:(text-light-900/60);
    }

    .con {
        width: 100%;
        flex: 1;
        display: flex;
        align-items: center;
        position: relative;
        border: 1px solid #ddd;
        border-radius: 8px;
        @apply dark:(border-dark-100 bg-dark-300);
    }

    .variableName {
        .center();
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 8px;
        padding: 0 8px;
        height: 30px;
        @apply dark:(text-light-900/80 bg-transparent border-dark-100);

        i {
            font-size: 14px;
            color: #4c4f6b;
            margin-left: 10px;
            cursor: pointer;
            @apply dark:(text-light-900/60);
        }
    }

    &.variable {
        margin-bottom: 20px;

        .variable-type {
            margin-left: auto;

            .icon-attention {
                cursor: pointer;
                color: rgba(76, 79, 107, 0.5);
                font-size: 18px;
                @apply dark:(text-light-900/60);
            }
        }
    }

    .choose {
        i {
            cursor: pointer;
            color: #4c4f6b;
            @apply dark: (text-indigo-300/60);
        }
    }

    .state {
        margin-left: 10px;
        margin-right: 10px;

        .icon-failed {
            color: #e47470;
        }

        .icon-chose {
            color: #35d49a;
        }
    }

    .error-text {
        position: absolute;
        right: 0;
        bottom: -22px;
        color: #e47470;
        font-size: 12px;
        height: 22px;
        line-height: 22px;
    }
}

.button-box {
    width: 100%;

    div {
        display: flex;
        justify-content: space-around;

        .cancel {
            width: 47%;
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
            width: 47%;
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
        }
    }
}
</style>
