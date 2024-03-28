<script lang="ts" setup>
import { inject, ref, nextTick, watch, Ref } from 'vue';
import { SupportedAction } from '../../types/core';
import { getInitialCanisterActionValue } from '../../types/parts/canisters';
import { getInitialCombinedActionValue } from '../../types/parts/combined';
import { v4 as uuid } from 'uuid';
import { t } from '@/i18n';
import { CanisterActionCurrentEditingState } from '../../types/common/state';
import TriggerModeVue from '../trigger/TriggerMode.vue';
import { ElMessageBox } from 'element-plus';

const setCurrentEditing =
    inject<(state: CanisterActionCurrentEditingState | undefined) => void>('SET_CURRENT_EDITING')!;

const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;
const pushAction = inject<(action: SupportedAction) => void>('ACTIONS_PUSH')!;
const deleteAction = inject<(index: number) => void>('ACTIONS_DELETE')!;
const refreshActions = inject<() => void>('ACTIONS_REFRESH')!;

const currentActionId = ref<string>(actions.value.length ? actions[0].id : '');

const renamingAction = ref<SupportedAction>();
const actionNameInput = ref<string>('');

const onAddAction = (type: 'canister' | 'combined') => {
    const id = uuid();
    const name = `${t('plugin.editor.action')}${actions.value.length + 1}`;

    let action: SupportedAction;
    if (type === 'canister') {
        action = getInitialCanisterActionValue(id, name);
    } else {
        action = getInitialCombinedActionValue(id, name);
    }

    setCurrentEditing(undefined);

    pushAction(action);

    if (!currentActionId.value) currentActionId.value = action.id;

    nextTick(() => {
        editAction(actions.value[actions.value.length - 1]);
        renameAction(actions.value[actions.value.length - 1]);
    });

};

const onDeleteAction = (index: number) => {
    if (index < 0 || actions.value.length <= index) return;

    ElMessageBox.confirm(
        t('plugin.actionEditor.delMessageContent'),
        t('plugin.actionEditor.delMessageTitle'),
        {
            confirmButtonText: t('plugin.actionEditor.delMessageConfirm'),
            cancelButtonText: t('plugin.actionEditor.delMessageCancel'),
            confirmButtonClass: 'delConfirm',
            type: 'warning',
        },
    )
        .then(() => {
            deleteAction(index);
            if (!actions.value.find((a) => a.id === currentActionId.value)) {

                currentActionId.value = actions.value.length ? actions[0].id : '';
            }
        })
        .catch(() => { });
};


const renameAction = (action: SupportedAction) => {
    renamingAction.value = action;
    actionNameInput.value = action.name;
};

const renameActionCompleted = () => {
    if (!renamingAction.value) return;

    const name = actionNameInput.value.trim();
    if (name) {
        renamingAction.value.name = name;
        refreshActions();
    }

    resetRenamingData();
};

const resetRenamingData = () => {
    renamingAction.value = undefined;
    actionNameInput.value = '';
};

const editAction = (action: SupportedAction) => {
    if (renamingAction.value) return;
    currentActionId.value = action.id;
    setCurrentEditing(undefined);
};

const emit = defineEmits(['currentActionId']);
watch(
    () => currentActionId.value,
    () => emit('currentActionId', currentActionId.value),
    { immediate: true },
);
</script>

<template>
    <div class="action-list-content">
        <div class="title">
            <p>{{ $t('plugin.editor.action') }}</p>
            <i class="iconfont icon-plugin-add"></i>
            <div class="choose-action-box">
                <div @click="onAddAction('canister')">
                    <i class="iconfont icon-maction"></i>
                    {{ $t('plugin.editor.canister') }}
                </div>
                <div @click="onAddAction('combined')">
                    <i class="iconfont icon-naction"></i>
                    {{ $t('plugin.editor.combined') }}
                </div>
            </div>
        </div>
        <div class="content">
            <div class="item" v-for="(action, index) in actions" :key="action.id" @click="editAction(action)"
                @dblclick.stop="renameAction(action)" :class="{
                canister: action.type === 'canister',
                combined: action.type === 'combined',
                current: action.id === currentActionId,
            }">
                <strong>{{ index + 1 }}</strong>
                <template v-if="renamingAction?.id === action.id">
                    <el-input v-model="actionNameInput" v-focus maxlength="20"
                        :placeholder="`${$t('plugin.editor.action')}${index + 1}`"
                        @keydown.enter="renameActionCompleted" @blur="renameActionCompleted" />
                </template>
                <template v-else>
                    <p>{{ action.name }}</p>
                </template>

                <i @click.stop="" class="iconfont icon-more"></i>
                <div class="more">
                    <p @click.stop="renameAction(action)">
                        <i class="iconfont icon-plugin-edit"></i>
                        {{ $t('plugin.editor.rename') }}
                    </p>
                    <p @click.stop="onDeleteAction(index)">
                        <i class="iconfont icon-delete"></i>
                        {{ $t('plugin.editor.delete') }}
                    </p>
                </div>
                <span class="tag" :class="action.type">
                    <i>
                        {{
                action.type === 'canister'
                    ? $t('plugin.editor.tag.t1')
                    : $t('plugin.editor.tag.t2')
            }}
                    </i>
                </span>
            </div>
        </div>
        <div class="trigger">
            <TriggerModeVue />
        </div>
    </div>
</template>

<style lang="less" scoped>
.action-list-content {
    height: 100%;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;

    >.title {
        font-size: 14px;
        color: #000;
        padding: 0 12px 0 17px;
        height: 38px;
        line-height: 38px;
        display: flex;
        justify-content: space-between;
        position: relative;
        font-weight: 500;
        @apply dark: (text-light-900);

        p {
            display: flex;
            width: 100%;
            font-size: 14px;
        }

        >i {
            font-size: 16px;
            cursor: pointer;
            padding-left: 15px;
            @apply dark:(text-indigo-300/80);

            &:hover {
                &+.choose-action-box {
                    display: flex;
                }
            }
        }

        .choose-action-box {
            position: absolute;
            width: 150px;
            background: #fff;
            border: 1px solid #f3f3f3;
            box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05);
            border-radius: 10px;
            z-index: 999;
            right: 13px;
            top: 30px;
            display: none;
            padding: 8px;
            flex-direction: column;
            @apply dark: (bg-dark-800 border-dark-100);

            div {
                width: 100%;
                display: flex;
                font-size: 12px;
                align-items: center;
                cursor: pointer;
                padding: 0 6px;
                border-radius: 6px;
                transition: @transition;
                word-break: break-all;
                .ellipsis();

                i {
                    margin-right: 3px;
                    font-size: 14px;
                    width: 14px;
                    height: 14px;
                    line-height: 14px;

                    &.icon-naction {
                        transform: scale(0.8);
                    }
                }

                &:hover {
                    background-color: #f0f0f0;
                    transition: @transition;
                    @apply dark: (bg-dark-300);
                }
            }

            &:hover {
                display: flex;
            }
        }
    }

    >.content {
        flex-direction: column;
        position: relative;
        padding-top: 17px;
        overflow-y: scroll;
        height: 100%;
        .noScrollbar();

        .item {
            .center();
            background: linear-gradient(180deg, #e3e9ff 0%, #f4f8ff 100%);
            border-radius: 12px;
            height: 60px;
            margin: 0 13px;
            margin-bottom: 30px;
            position: relative;
            cursor: pointer;
            flex-shrink: 1;
            min-width: 40px;
            transition: @transition;

            strong {
                background: #798ef8;
                border: 3px solid #ffffff;
                width: 24px;
                height: 24px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                top: -12px;
                border-radius: 50%;
                font-style: normal;
                font-size: 12px;
                color: #fff;
                @apply dark: (border-dark-500);
            }

            span {
                position: absolute;
                left: 0;
                top: 0;
                .center();
                border-radius: 10px 0px 8px;
                padding: 0 1px;
                height: 13px;

                i {
                    font-size: 10px;
                    color: #fff;
                    transform: scale(0.8);
                    font-style: normal;
                    z-index: 99;
                }

                &.canister {
                    background: #a4adda;
                    @apply dark: (bg-purple-400/30);
                }

                &.combined {
                    background: #97dad7;
                    @apply dark: (bg-emerald-400/30);
                }
            }

            :deep(.el-input) {
                font-size: 14px;
                width: 100%;
                text-align: center;

                .el-input__inner {
                    text-align: center;
                }
            }

            >p {
                font-size: 14px;
                color: #000000;
                padding: 0 5px;
                .ellipsis();
                @apply dark: (text-light-900/80);
            }

            &.canister {
                background: linear-gradient(180deg, #e3e9ff 0%, #f4f8ff 100%);
                border: 2px solid #fff;
                transition: @transition;
                @apply dark: (border-dark-500);
            }

            &.combined {
                background: linear-gradient(180deg, #e4fffd 0%, #f4f8ff 100%);
                border: 2px solid #fff;
                transition: @transition;
                @apply dark: (border-dark-500);

                strong {
                    background: #58d1af;
                }
            }

            &.current,
            &:hover {
                &.canister {
                    transition: @transition;
                    border: 2px solid #ffffff;
                    box-shadow: 0px 5px 8px rgba(92, 146, 251, 0.2);
                    @apply dark: (border-light-900/10 shadow-lg shadow-dark-900);
                }

                &.combined {
                    transition: @transition;
                    border: 2px solid #ffffff;
                    box-shadow: 0px 5px 8px rgba(120, 218, 213, 0.2);
                    @apply dark: (border-light-900/10 shadow-lg shadow-dark-900);
                }
            }

            >i {
                position: absolute;
                font-size: 12px;
                right: 0px;
                bottom: 0px;
                padding-bottom: 5px;
                padding: 0 10px 5px 10px;

                &:hover {
                    &+.more {
                        display: flex;
                    }
                }
            }

            .more {
                display: none;
                flex-direction: column;
                position: absolute;
                background: #ffffff;
                border: 1px solid #f3f3f3;
                box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.05);
                border-radius: 10px;
                right: 0;
                top: 100%;
                padding: 8px;
                z-index: 999;
                @apply dark: (bg-dark-600 border-dark-200);

                p {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #000000;
                    padding: 8px 6px;
                    border-radius: 8px;
                    @apply dark: (text-light-900/80);

                    i {
                        font-size: 12px;
                        color: #666666;
                        margin-right: 8px;
                        @apply dark: (text-light-900/80);
                    }

                    &:last-child {
                        margin-bottom: 0;

                        i {
                            font-size: 15px;
                            margin-right: 6px;
                        }
                    }

                    &:hover {
                        @apply transition duration-300 bg-light-500 dark: (bg-dark-300);
                    }
                }

                &:hover {
                    display: flex;
                }
            }
        }
    }

    >.trigger {
        flex-shrink: 0;
    }
}

.dark {
    .action-list {
        .action-list-content {
            .content {
                .item {
                    &.canister {
                        background: #363f67;
                    }

                    &.combined {
                        background: #455b58;
                    }
                }
            }
        }
    }
}
</style>
