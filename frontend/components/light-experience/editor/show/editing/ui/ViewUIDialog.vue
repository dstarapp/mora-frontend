<script lang="ts" setup>
import { TrimmedUnionTransmitShowView, getInitialShowView } from '../../../../types/parts/shows';
import { ElMessage } from 'element-plus';
import { ref, PropType, watch, nextTick } from 'vue';
import WrappedViewUIVue from './WrappedViewUI.vue';
import { SupportedShowName } from '@mora-light/core/types/transmit';
import { t } from '@/i18n';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    hasKey: {
        type: Boolean,
        required: true,
    },
    keyName: {
        type: String,
        required: true,
    },
    view: {
        type: Object as PropType<TrimmedUnionTransmitShowView>,
        required: true,
    },
    excludes: {
        type: Array as PropType<SupportedShowName[]>,
        default: [],
    },
});

const isOptional = (view: SupportedShowName): boolean => {
    if (props.excludes.includes(view)) return false;
    return true;
};

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const key = ref(props.keyName ?? '');
const view = ref(props.view);
const name = ref<SupportedShowName>(props.view.constraint.name);
const editingView = ref(true);

watch(
    () => name.value,
    () => {
        // console.error('name changed', name.value);
        editingView.value = false;
        view.value = getInitialShowView(name.value);
        nextTick(() => (editingView.value = true));
    },
);

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');
const onClose = () => {
    emit('complete');
};

const onComplete = () => {
    if (props.hasKey && !key.value.trim()) {
        ElMessage.error(t('plugin.variableTip.nameError'));
        return;
    }

    emit('complete', { key: key.value.trim(), view: view.value });
};

const onViewChanged = (v: TrimmedUnionTransmitShowView) => {
    view.value = v;
};
</script>

<template>
    <div class="view-ui-dialog">
        <el-dialog :title="$t('plugin.formPreview.form.subtype')" v-model="show" @closed="onDialogClose"
            class="dialog-form">
            <div class="dialog-form">
                <div class="item">
                    <div class="label">{{ t('plugin.formPreview.form.subtype') }}</div>
                    <div class="subtype">
                        <el-select v-model="name">
                            <el-option key="TextView" label="Text" value="TextView" v-if="isOptional('TextView')">
                                {{ t('plugin.formPreview.list.text') }}
                            </el-option>
                            <el-option key="BoolView" label="Tips" value="BoolView" v-if="isOptional('BoolView')">
                                {{ t('plugin.formPreview.list.tips') }}
                            </el-option>
                            <el-option key="ImageView" label="Image" value="ImageView" v-if="isOptional('ImageView')">
                                {{ t('plugin.formPreview.list.image') }}
                            </el-option>
                            <el-option key="TableView" label="Table" value="TableView" v-if="isOptional('TableView')">
                                Table
                            </el-option>
                            <el-option key="VecView" label="List" value="VecView" v-if="isOptional('VecView')">
                                List
                            </el-option>
                            <el-option key="OptView" label="Option" value="OptView" v-if="isOptional('OptView')">
                                Option
                            </el-option>
                            <el-option key="RecordView" label="Multi" value="RecordView"
                                v-if="isOptional('RecordView')">
                                Multi
                            </el-option>
                            <el-option key="VariantView" label="Enumerate" value="VariantView"
                                v-if="isOptional('VariantView')">
                                Enumerate
                            </el-option>
                            <el-option key="TupleView" label="Tuple" value="TupleView" v-if="isOptional('TupleView')">
                                Tuple
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div v-if="props.hasKey">
                    <div class="item">
                        <div class="label">{{ t('plugin.formPreview.form.keyName') }}</div>
                        <div class="keyName">
                            <el-input v-model="key" />
                        </div>
                    </div>
                </div>
                <div v-if="editingView">
                    <WrappedViewUIVue :view="view" @changed="onViewChanged" />
                </div>
                <div class="button-box">
                    <div>
                        <div class="cancel" @click="onClose">
                            {{ t('plugin.formPreview.form.cancel') }}
                        </div>
                        <div class="btn" @click="onComplete">
                            {{ t('plugin.formPreview.form.confirm') }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.view-ui-dialog {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 26px;

    .item {
        display: flex;
        margin-bottom: 30px;
        position: relative;
        align-items: center;

        .label {
            font-size: 14px;
            color: #666666;
            width: 105px;
            text-align: left;
            margin-right: 20px;
            line-height: 38px;
            flex-shrink: 0;
            @apply dark:(text-light-900/60);
        }

        .subtype,
        .keyName {
            width: 100%;
            flex: 1;
            display: flex;
            position: relative;
        }

        :deep(.el-input) {
            border: 1px solid #dddddd;
            border-radius: 6px;
            @apply dark:(border-dark-100);

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
    }

    .button-box {
        width: 100%;

        div {
            display: flex;
            justify-content: space-between;

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
}
</style>
