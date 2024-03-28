<script lang="ts" setup>
import { inject, ref, watch, computed } from 'vue';
import { t } from '@/i18n';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const name = ref(props.name);

const checked = computed(() => name.value && !findExportedValue(name.value, props.id));

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onComplete = () => {
    emit('complete', name.value);
};
</script>

<template>
    <div class="export-identity-dialog-content">
        <el-dialog :title="t('plugin.identity.export.title')" v-model="show" @closed="onDialogClose">
            <div class="export-identity-box">
                <div class="input">
                    <div class="label">
                        {{ t('plugin.identity.export.label') }}
                    </div>
                    <el-input v-model="name" :placeholder="t('plugin.identity.export.placeholder')" />
                    <span v-if="name && !checked">name can not repeat</span>
                </div>
                <div class="button-box">
                    <div>
                        <div class="cancel" @click="onDialogClose">
                            {{ t('plugin.formPreview.form.cancel') }}
                        </div>
                        <div class="btn" :class="{ disabled: !checked }" @click="onComplete">
                            {{ t('plugin.formPreview.form.confirm') }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.export-identity-dialog-content {
    width: 100%;

    .export-identity-box {
        display: flex;
        flex-direction: column;
        padding: 0 30px;
    }

    .input {
        display: flex;
        align-items: center;

        .label {
            width: auto;
            padding-right: 25px;
        }

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
            align-items: center;

            .cancel {
                width: 47%;
                height: 40px;
                background: #eee;
                border-radius: 8px;
                margin: 0;
                .center();
                cursor: pointer;
                flex-shrink: 1;
                transition: @transition;
                @apply dark: (bg-dark-100);

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
