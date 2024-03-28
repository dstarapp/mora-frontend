<script lang="ts" setup>
import { ref, inject, nextTick, computed, Ref } from 'vue';
import { DataShow, getInitialDataShow } from '../../types/parts/show';
import { ConstantValue } from '../../types/parts/constants';
import { PropValue } from '../../types/parts/props';
import { InputValue } from '../../types/parts/inputs';
import { SupportedAction } from '../../types/core';
import { ActionValues } from '../../types/common/value';
import { deepClone } from '@mora-light/core/types/common';
import ShowRenderVue from './ShowRender.vue';
import ShowEditingVue from './ShowEditing.vue';
import { SupportedShowName } from '@mora-light/core/types/transmit';
import { t } from '@/i18n';
import { getInitialShowView, TrimmedUnionTransmitShowView } from '../../types/parts/shows';

const getShowViewValue = (
    newType: SupportedShowName,
    _oldType?: SupportedShowName,
    old?: TrimmedUnionTransmitShowView,
): TrimmedUnionTransmitShowView => {
    const r = getInitialShowView(newType);

    if (old === undefined) return r;

    return r;
};

const constants = inject<Ref<ConstantValue[]>>('CONSTANTS')!;
const prop_sources = inject<Ref<PropValue[]>>('PROP_SOURCES')!;
const inputs = inject<Ref<InputValue[]>>('INPUTS')!;
const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;

const values = computed<ActionValues>(() => {
    return {
        constants: constants.value,
        props: prop_sources.value,
        inputs: inputs.value,
        actions: actions.value,
    };
});

const shows = inject<Ref<DataShow[]>>('SHOWS')!;
const pushShow = inject<(show: DataShow) => void>('SHOWS_PUSH')!;
const deleteShow = inject<(index: number) => void>('SHOWS_DELETE')!;
const replaceShow = inject<(index: number, show: DataShow) => void>('SHOWS_REPLACE')!;
const moveShow = inject<(ov: number, nv: number) => void>('SHOWS_MOVE')!;

const current = ref<DataShow | undefined>();
const editingDialogTitle = ref('');

const onAddShow = (name: SupportedShowName) => {
    const view = getShowViewValue(name);
    const value = getInitialDataShow(view);
    switch (name) {
        case 'TextView':
            editingDialogTitle.value = t('plugin.editingContent.title');
            break;
        case 'BoolView':
            editingDialogTitle.value = 'Tips';
            break;
        case 'ImageView':
            editingDialogTitle.value = 'Image';
            break;
        case 'TableView':
            editingDialogTitle.value = 'Table';
            break;
        case 'VecView':
            editingDialogTitle.value = 'List';
            break;
        case 'OptView':
            editingDialogTitle.value = 'Option';
            break;
        case 'RecordView':
            editingDialogTitle.value = 'Multi';
            break;
        case 'VariantView':
            editingDialogTitle.value = 'Enumerate';
            break;
        case 'TupleView':
            editingDialogTitle.value = 'Tuple';
            break;
    }
    onEditShow(value);
};
const onEditShow = (value: DataShow) => {
    current.value = undefined;
    nextTick(() => (current.value = deepClone(value)));
};
const onDeleteShow = (index: number) => {
    if (0 <= index && index < shows.value.length) deleteShow(index);
};

const onComplete = (r: DataShow | undefined) => {
    if (r === undefined) {
        current.value = undefined;
        return;
    }
    const value = shows.value.find((v) => v.id === r.id);
    if (value === undefined) {
        pushShow(r);
    } else {
        replaceShow(
            shows.value.findIndex((v) => v.id === r.id),
            r,
        );
    }

    console.error('shows', shows.value);
};

const isFullId = ref('');
const onFull = (value: DataShow) => {
    if (value.id === isFullId.value) {
        isFullId.value = '';
        return;
    }
    isFullId.value = value.id;
};

const onUp = (index: number) => {
    if (index === 0) {
        return;
    }
    moveShow(index, index - 1);
};

const onDown = (index: number) => {
    if (index === inputs.value.length - 1) {
        return;
    }
    moveShow(index, index + 1);
};
</script>

<template>
    <div class="show-preview-content">
        <div class="inner-content">
            <div class="box">
                <div class="left" v-if="shows.length < 1">
                    <div class="item" @click="onAddShow('TextView')">
                        <i class="iconfont icon-plugin-input"></i>
                        {{ t('plugin.formPreview.list.text') }}
                    </div>
                    <div class="item" @click="onAddShow('BoolView')">
                        <i class="iconfont icon-plugin-tips"></i>
                        {{ 'Tips' }}
                    </div>
                    <div class="item" @click="onAddShow('ImageView')">
                        <i class="iconfont icon-genImg2"></i>
                        {{ 'Image' }}
                    </div>
                    <div class="item" @click="onAddShow('TableView')">
                        <i class="iconfont icon-editor-table"></i>
                        {{ 'Table' }}
                    </div>
                    <div class="item" @click="onAddShow('VecView')">
                        <i class="iconfont icon-plugin-list"></i>
                        {{ 'List' }}
                    </div>
                    <!-- <div class="item" @click="onAddShow('OptView')">
                        <i class="iconfont icon-plugin-list"></i>
                        {{ 'Option' }}
                    </div> -->
                    <div class="item" @click="onAddShow('RecordView')">
                        <i class="iconfont icon-plugin-multi"></i>
                        {{ 'Multi' }}
                    </div>
                    <!-- <div class="item" @click="onAddShow('VariantView')">
                        <i class="iconfont icon-plugin-multi"></i>
                        {{ 'Enumerate' }}
                    </div> -->
                    <!-- <div class="item" @click="onAddShow('TupleView')">
                        <i class="iconfont icon-plugin-multi"></i>
                        {{ 'Tuple' }}
                    </div> -->
                </div>
                <div class="right">
                    <div class="box" v-if="shows.length">
                        <div class="form-data-box">
                            <div class="item" v-for="(item, index) in shows" :key="item.id"
                                :class="{ full: isFullId === item.id }">
                                <ShowRenderVue :values="values" :show="item" />
                                <span>
                                    <i @click="onFull(item)" class="iconfont icon-free" :class="{
                    ['icon-plugin-zoomout']: isFullId === item.id,
                    ['icon-plugin-fullscreen']: isFullId !== item.id,
                }"></i>
                                    <i @click="onEditShow(item)" class="iconfont icon-plugin-edit"></i>
                                    <!-- <i class="iconfont icon-back-left up" @click="onUp(index)"></i>
                                    <i
                                        class="iconfont icon-back-left down"
                                        @click="onDown(index)"
                                    ></i> -->
                                    <i @click="onDeleteShow(index)" class="iconfont icon-delete"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="no-data" v-else>
                        <i class="iconfont icon-plugin-click"></i>
                        <p>{{ $t('plugin.formPreview.insert.noData') }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="current !== undefined">
            <ShowEditingVue :title="editingDialogTitle" :values="values" :data="current" @complete="onComplete" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.show-preview-content {
    width: 100%;
    height: 100%;

    .inner-content {
        height: calc(100% - 38px);

        .box {
            display: flex;
            justify-content: space-between;
            flex: 1;
            height: 100%;

            .left {
                width: 180px;
                border-right: 1px solid #e8e8e8;
                overflow-y: auto;
                flex-wrap: wrap;
                justify-content: inherit;
                padding: 0 0 0 15px;
                .pscrollbar();
                flex-shrink: 0;
                @apply dark: (border-dark-100);

                .item {
                    float: left;
                    display: flex;
                    align-items: center;
                    width: 150px;
                    height: 40px;
                    background: #f3f3f3;
                    border-radius: 6px;
                    margin-top: 17px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666666;
                    transition: @transition;
                    @apply dark: (bg-dark-300 text-light-900/80);

                    i {
                        font-size: 16px;
                        margin-right: 7px;
                        margin-left: 11px;

                        &.icon-genImg2 {
                            font-size: 14px;
                        }
                    }

                    &.active {
                        background: #4c4f6b;
                        color: #ffffff;
                        transition: @transition;
                    }
                }
            }

            .right {
                .center();
                flex: 1;
                width: 100%;
                height: 100%;
                overflow: hidden;

                .box {
                    display: flex;
                    width: 100%;
                    flex-direction: column;
                    align-self: stretch;
                    height: 100%;

                    :deep(.form-data-box) {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px 0;
                        overflow-x: auto;
                        justify-content: center;
                        height: 100%;

                        .item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0;
                            width: 400px;
                            flex-direction: column;
                            background: white;
                            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
                            border-radius: 12px;
                            transition: @transition;
                            @apply max-h-125 overflow-y-auto dark:(bg-dark-300 shadow-black);

                            &.full {
                                transition: @transition;
                                width: calc(100% - 60px);
                                padding: 0 30px;
                            }

                            &.drag {
                                background: #f2f3fc;
                            }

                            .con {
                                .el-input {
                                    border: 1px solid #dddddd;
                                    border-radius: 6px;
                                    @apply dark: (border-dark-100);

                                    .el-input__wrapper {
                                        height: 36px;
                                        line-height: 36px;
                                        border-radius: 6px;

                                        .el-input__inner {
                                            color: #666;
                                            text-align: left;
                                            font-size: 14px;
                                            border: none;
                                        }
                                    }
                                }

                                .el-textarea {
                                    padding: 0;
                                }

                                .el-input-number {
                                    margin: 0;
                                    border: none;

                                    .el-input__wrapper {
                                        .el-input__inner {
                                            text-align: center;
                                        }
                                    }

                                    span {
                                        margin: 1px 1px 0 1px;

                                        i {
                                            &:hover {
                                                background: none !important;
                                                color: #999;
                                            }
                                        }
                                    }

                                    .el-input-number__decrease {
                                        border-radius: 6px 0 0 6px;
                                        height: 36px;
                                    }

                                    .el-input-number__increase {
                                        height: 36px;
                                        border-radius: 0 6px 6px 0;
                                    }
                                }

                                .label {
                                    width: 105px;
                                    text-align: right;
                                    margin-right: 25px;
                                    margin-bottom: 0;
                                    padding-bottom: 0;
                                }

                                .switch-box {
                                    justify-content: start;

                                    .el-switch {
                                        span {
                                            margin-left: 0;
                                        }
                                    }
                                }

                                .el-select {
                                    .el-input {
                                        height: 38px;

                                        .el-input__wrapper {
                                            .el-input__inner {
                                                text-align: center;
                                            }

                                            &>span {
                                                i {
                                                    width: auto;

                                                    &:hover {
                                                        background: none;
                                                        color: #999;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                .el-date-editor {
                                    height: 38px;

                                    span {
                                        margin: 1px 1px 0 1px;

                                        i {
                                            &:hover {
                                                background: none !important;
                                                color: #999;
                                            }
                                        }
                                    }
                                }

                                .array {
                                    .arrayList {
                                        span {
                                            margin-left: 0;
                                        }
                                    }
                                }
                            }

                            .arr,
                            .input-box {
                                flex: 1;

                                .label {
                                    padding-top: 11px;
                                }
                            }

                            >span {
                                display: flex;
                                height: 100%;
                                margin: 15px;

                                i {
                                    font-size: 14px;
                                    color: #999;
                                    width: 32px;
                                    height: 32px;
                                    padding: 0 8px;
                                    cursor: pointer;
                                    border-radius: 8px;
                                    .center();
                                    transition: @transition;

                                    &:hover {
                                        color: white;
                                        background-color: #4c4f6b;
                                        transition: @transition;
                                    }

                                    &.icon-plugin-edit {
                                        font-weight: bold;
                                    }

                                    &.up {
                                        transform: rotate(90deg);
                                    }

                                    &.down {
                                        transform: rotate(-90deg);
                                    }

                                    &.icon-exchange {
                                        transform: rotate(90deg);
                                        margin-left: 0;
                                        font-size: 12px;
                                    }

                                    &.icon-delete {
                                        font-size: 18px;
                                        margin-left: 0;
                                    }
                                }
                            }
                        }

                        .submit {
                            width: 400px;
                            background: #806ef2;
                            border-radius: 8px;
                            font-weight: 400;
                            font-size: 16px;
                            color: #ffffff;
                            display: flex;
                            height: 40px;
                            .center();
                            margin-top: 20px;
                        }
                    }
                }

                .no-data {
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    i {
                        color: #666666;
                        font-size: 24px;
                    }

                    p {
                        font-weight: 400;
                        color: #666666;
                        margin-top: 5px;
                    }
                }
            }
        }
    }
}
</style>
