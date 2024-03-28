<template>
    <el-dialog class="w700" :title="$t('editor.codeBlock.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <el-select class="select" :teleported="false" :filterable="true" v-model="languageValue"
            :placeholder="$t('editor.codeBlock.language')" size="large">
            <el-option v-for="item in languageList" :key="item.text" :label="item.text" :value="item.value" />
        </el-select>

        <el-input class="textarea" v-model="code" type="textarea" resize="none"
            :placeholder="$t('editor.codeBlock.code')" />

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.codeBlock.cancel') }}
            </div>
            <div class="confirm" @click="confirm">
                {{ $t('editor.codeBlock.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { codeLangs } from './codeLangs';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';

export default defineComponent({
    name: 'CodeBlock',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: String },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const languageValue = ref();
        const languageList = ref(codeLangs);
        const code = ref();

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (!languageValue.value) {
                ElMessage.error(t('editor.codeBlock.noLanguageValue'));
                return;
            }
            if (!code.value) {
                ElMessage.error(t('editor.codeBlock.noCodeValue'));
                return;
            }

            props.insertCallback &&
                props.insertCallback({
                    language: languageValue.value,
                    code: code.value,
                });

            dialogVisible.value = false;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        onMounted(() => {
            if (props.componentDefaultValue?.trim()) {
                code.value = props.componentDefaultValue;
            }
        });

        return {
            languageValue,
            languageList,
            code,
            dialogVisible,
            handleClose,
            afterClose,
            confirm,
            cancel,
        };
    },
});
</script>

<style scoped lang="less">
.select {
    width: 100%;

    :deep(.el-input) {
        .el-input__wrapper {
            background: @bg-color-grey;
            .border-radius(10);

            .el-input__inner {
                text-align: left;
                .font-size(14);
            }

            .el-input__suffix {
                .el-input__suffix-inner {
                    .el-select__caret {
                        color: @text-color-grey;
                    }
                }
            }
        }
    }
}

.textarea {
    background: @bg-color-grey;
    .border-radius(10);
    .margin(30);
    @apply dark:(bg-dark-300);

    :deep(.el-textarea__inner) {
        .padding(11, 23, 11, 23);
        .height(285);
        .font-size(14);
    }
}

.mora-button {
    display: flex;
    .padding(0, 50, 0, 50);
    .margin(38, 0, 0, 0);

    div {
        .border-radius(10);
        .center();
        .height(45);
        min-height: 45px;
        flex: 1;
        font-style: normal;
        font-weight: 350;
        .font-size(16);
        .line-height(19);
        cursor: pointer;
        transition: @transition;
    }

    .cancel {
        .margin(0, 30, 0, 0);
        border: 1px solid @border-color;
        color: @text-fcolor;
    }

    .confirm {
        background: @bg-color-body-active;
        color: @text-color-inverse;

        &.loading {
            transition: @transition;
            background: @bg-color-body-loading;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {}
</style>
