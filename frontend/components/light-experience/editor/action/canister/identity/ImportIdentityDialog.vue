<script lang="ts" setup>
import { ref, watch, computed, PropType } from 'vue';
import { ActionValues } from '../../../../types/common/value';
import { t } from '@/i18n';

const props = defineProps({
    show: {
        type: Boolean,
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
});

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const options = computed<{ label: string; id: string }[]>(() => {
    const options: { label: string; id: string }[] = [];
    for (const action of props.values.actions) {
        if (
            action.type === 'canister' &&
            action.identity.from === 'host-login' &&
            action.identity.name
        ) {
            options.push({ label: action.identity.name, id: action.identity.id });
        }
    }
    return options;
});

const id = ref(options.value.find((o) => o.id === props.id) ? props.id : '');

const checked = computed(() => !!options.value.find((o) => o.id === id.value));

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onComplete = () => {
    emit('complete', id.value);
};
</script>

<template>
    <div class="import-identity-dialog-content">
        <el-dialog :title="t('plugin.identity.import.title')" v-model="show" @closed="onDialogClose">
            <div class="import-identity-box">
                <div class="input">
                    <div class="label">
                        {{ t('plugin.identity.import.label') }}
                    </div>
                    <el-select v-model="id" :placeholder="t('plugin.identity.import.placeholder')">
                        <el-option v-for="o in options" :label="o.label" :key="o.id" :value="o.id">
                        </el-option>
                    </el-select>
                    <!-- <span v-if="!checked"> must choose a identity</span> -->
                </div>
                <div class="button-box">
                    <div>
                        <div class="cancel" @click="onDialogClose">
                            {{ t('plugin.formPreview.form.cancel') }}
                        </div>
                        <div class="btn" @click="onComplete" :class="{ disabled: !checked }">
                            {{ t('plugin.formPreview.form.confirm') }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.import-identity-dialog-content {
    width: 100%;

    .import-identity-box {
        padding: 0 30px;
    }

    .input {
        display: flex;
        align-items: center;

        .label {
            width: auto;
            padding-right: 25px;
        }

        :deep(.el-select) {
            flex: 1;

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
    }

    .button-box {
        width: 100%;
        margin-top: 30px;
        margin-bottom: 5px;

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

                &.disabled {
                    transition: @transition;
                    @apply opacity-50 pointer-events-none;
                }
            }
        }
    }
}
</style>
