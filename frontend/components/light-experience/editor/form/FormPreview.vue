<script lang="ts" setup>
import { ref, inject, nextTick, Ref } from 'vue';
import {
    getInitialInputValueComponent,
    InputValue,
    InputValueComponentType,
} from '../../types/parts/inputs';
import FormRenderVue from './FormRender.vue';
import FormEditingVue from './FormEditing.vue';
import { TriggerMode } from '@mora-light/core/types/trigger';
import { deepClone } from '@mora-light/core/types/common';

const trigger = inject<Ref<TriggerMode>>('TRIGGER')!;

const inputs = inject<Ref<InputValue[]>>('INPUTS')!;
const pushInput = inject<(value: InputValue) => void>('INPUTS_PUSH')!;
const deleteInput = inject<(index: number) => void>('INPUTS_DELETE')!;
const replaceInput = inject<(index: number, value: InputValue) => void>('INPUTS_REPLACE')!;
const moveInput = inject<(ov: number, nv: number) => void>('INPUTS_MOVE')!;

const current = ref<InputValue | undefined>();

const onAddInput = (type: InputValueComponentType) => {
    const value = getInitialInputValueComponent(type);
    current.value = value;
};
const onEditInput = (value: InputValue) => {
    current.value = undefined;
    nextTick(() => (current.value = deepClone(value)));
};
const onDeleteInput = (index: number) => {
    if (0 <= index && index < inputs.value.length) deleteInput(index);
};

const onComplete = (r: InputValue | undefined) => {
    if (r === undefined) {
        current.value = undefined;
        return;
    }
    const value = inputs.value.find((v) => v.id === r.id);
    if (value === undefined) {
        pushInput(r);
    } else {
        replaceInput(
            inputs.value.findIndex((v) => v.id === r.id),
            r,
        );
    }

    // console.error('inputs', inputs);
};

const onUp = (index: number) => {
    if (index === 0) {
        return;
    }
    moveInput(index, index - 1);
};

const onDown = (index: number) => {
    if (index === inputs.value.length - 1) {
        return;
    }
    moveInput(index, index + 1);
};
</script>

<template>
    <div class="form-preview-content">
        <div class="inner-content">
            <div class="box">
                <div class="left">
                    <div class="item" @click="onAddInput('TextInputComponent')">
                        <i class="iconfont icon-plugin-input"></i>
                        {{ $t('plugin.formPreview.list.textInputComponent') }}
                    </div>
                    <div class="item" @click="onAddInput('NumberInputComponent')">
                        <i class="iconfont icon-plugin-num"></i>
                        {{ $t('plugin.formPreview.list.numberInputComponent') }}
                    </div>
                    <div class="item" @click="onAddInput('SwitchInputComponent')">
                        <i class="iconfont icon-plugin-switch"></i>
                        {{ $t('plugin.formPreview.list.switch') }}
                    </div>
                    <div class="item" @click="onAddInput('DropdownInputComponent')">
                        <i class="iconfont icon-plugin-select"></i>
                        {{ $t('plugin.formPreview.list.dropdown') }}
                    </div>
                    <div class="item" @click="onAddInput('TimeInputComponent')">
                        <i class="iconfont icon-plugin-time"></i>
                        {{ $t('plugin.formPreview.list.time') }}
                    </div>
                    <!-- <div class="item" @click="onAddInput('array')">
                        <i class="iconfont icon-plugin-array"></i>
                        {{ $t('plugin.formPreview.list.array') }}
                    </div> -->
                </div>
                <div class="right">
                    <div class="box" v-if="inputs.length">
                        <div class="form-data-box">
                            <div class="item" v-for="(item, index) in inputs" :key="item.id">
                                <FormRenderVue :data="item" />
                                <span>
                                    <i @click="onEditInput(item)" class="iconfont icon-plugin-edit"></i>
                                    <i class="iconfont icon-back-left up" @click="onUp(index)"></i>
                                    <i class="iconfont icon-back-left down" @click="onDown(index)"></i>
                                    <i @click="onDeleteInput(index)" class="iconfont icon-delete"></i>
                                </span>
                            </div>
                            <div class="item">
                                <div class="submit" v-if="trigger['text']">
                                    {{ trigger['text'] }}
                                </div>
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
            <FormEditingVue :data="current" @complete="onComplete" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.form-preview-content {
    width: 100%;
    height: 100%;

    >.inner-content {
        height: calc(100% - 38px);

        >.box {
            display: flex;
            justify-content: space-between;
            flex: 1;
            height: 100%;

            .left {
                width: 180px;
                border-right: 1px solid #e8e8e8;
                overflow-y: scroll;
                flex-wrap: wrap;
                justify-content: inherit;
                padding: 0 0 0 15px;
                .scrollbar();
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
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 0 20px;
                        overflow-x: auto;
                        justify-content: center;

                        .item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin: 10px 0;
                            padding: 0;
                            width: 550px;

                            &:last-child {
                                margin-bottom: 25px;
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
                                margin-left: 10px;

                                i {
                                    font-size: 14px;
                                    color: #999;
                                    width: 38px;
                                    height: 38px;
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
                            width: 388px;
                            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                            border-radius: 8px;
                            font-weight: 400;
                            font-size: 16px;
                            color: #000;
                            height: 40px;
                            .center();
                            cursor: not-allowed;
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
