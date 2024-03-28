<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';
import ChooseCandidTypeVue from './ChooseCandidType.vue';
import CodeMirror from '@/components/CodeMirror.vue';
import { CandidType, unwrapCandidType, wrapCandidType } from '@mora-light/core/types/candid';
import { DataResult, deepClone } from '@mora-light/core/types/common';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const current = ref<'choosing' | 'inputting'>('choosing');

const type = ref<CandidType>(deepClone(props.type));
const typeError = ref<string>();
const text = ref<string>(unwrapCandidType(type.value));

const typeResult = ref<DataResult<CandidType>>({ ok: type.value });

const textResult = computed(() => wrapCandidType(text.value));
const showTextResult = computed(() => {
    return textResult.value.err ?? 'success';
});

const onTab = (tab: 'choosing' | 'inputting') => {
    if (current.value === tab) return;
    // if (tab === 'choosing') {
    //     if (textResult.value.ok !== undefined) type.value = deepClone(textResult.value.ok);
    // }
    current.value = tab;
};

const onTypeChanged = (r: DataResult<CandidType>) => {
    typeResult.value = r;
    if (r.ok !== undefined) {
        type.value = r.ok;
        text.value = unwrapCandidType(r.ok);
    }
};

watch(
    () => text.value,
    () => {
        if (textResult.value.ok !== undefined && current.value === 'inputting') {
            type.value = deepClone(textResult.value.ok);
        }
    },
);

const passed = computed(() => {
    switch (current.value) {
        case 'choosing':
            return typeResult.value.ok !== undefined;
        case 'inputting':
            return textResult.value.ok !== undefined;
    }
    return false;
});

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onConfirm = () => {
    if (!passed.value) return;
    emit('complete', type.value);
};

const onCodeMirrorChanged = (code: string) => {
    let obj = wrapCandidType(code);
    if (obj.ok !== undefined) {
        type.value = obj.ok;
        typeError.value = '';
    } else {
        typeError.value = obj.err;
    }
};
</script>

<template>
    <div class="candid-type-dialog-content">
        <el-dialog :class="{ 'w828 column': current === 'inputting' }"
            :title="props.disabled ? 'View Candid Type' : $t('plugin.combinedAction.title2')" v-model="show"
            @closed="onDialogClose">
            <div class="tabs">
                <span :class="{ current: current === 'choosing' }" @click="onTab('choosing')">
                    {{ $t('plugin.combinedAction.ui') }}
                </span>
                <span :class="{ current: current === 'inputting' }" @click="onTab('inputting')">
                    {{ $t('plugin.combinedAction.input') }}
                </span>
            </div>
            <div class="contents">
                <template v-if="current === 'choosing'">
                    <div class="choosing">
                        <ChooseCandidTypeVue :disabled="props.disabled" :fixed="false" :recIds="[]" :initial="type"
                            @changed="onTypeChanged" />
                    </div>
                </template>
                <template v-if="current === 'inputting'">
                    <div class="code">
                        <CodeMirror :code="text" :mirrorClass="'fixed-height-530'" :disabled="props.disabled"
                            @changed="onCodeMirrorChanged" />
                        <p class="tip" v-if="typeError">
                            {{ typeError }}
                        </p>
                    </div>
                </template>
            </div>

            <div class="button-box">
                <div>
                    <div class="cancel" @click="onDialogClose">
                        {{ $t('plugin.generic.cancel') }}
                    </div>
                    <div class="btn" v-if="passed && !props.disabled" @click="onConfirm">
                        {{ $t('plugin.generic.confirm') }}
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.candid-type-dialog-content {
    width: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-dialog__body) {
        overflow-y: scroll;
        max-height: 80vh;
    }

    .tabs {
        display: flex;
        width: 100%;
        overflow: hidden;

        span {
            .center();
            flex: 1;
            font-weight: 400;
            font-size: 14px;
            color: #000000;
            height: 36px;
            cursor: pointer;
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

            &.current {
                background: #5ae28e;
                border: none;
                color: #000000;
            }
        }
    }

    .contents {
        margin-top: 27px;
        display: flex;
        text-align: left;
        height: calc(100% - 170px);
        overflow-y: auto;
        min-width: 100%;

        .choosing {
            display: flex;
            width: 100%;
        }

        .code {
            display: flex;
            width: 100%;
            flex-direction: column;
            height: calc(100vh - 400px);
            overflow-y: auto;

            :deep(.vue-codemirror) {
                width: 100%;
            }

            .tip {
                font-size: 14px;
                color: @color-error;
                .ellipsis();
            }
        }
    }

    .button-box {
        width: 100%;
        margin-top: 27px;

        div {
            display: flex;
            flex: 1;

            .cancel {
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
                width: 155px;
                height: 40px;
                background: linear-gradient(90deg, #34d399, #7cee83);
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
