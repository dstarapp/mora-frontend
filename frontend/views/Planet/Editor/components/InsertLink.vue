<template>
    <el-dialog :title="!isEditor ? $t('editor.insertLink.title') : $t('editor.insertLink.editorTitle')"
        v-model="dialogVisible" :before-close="handleClose" @closed="afterClose">
        <div class="inputBox" v-if="!isEditor">
            <i class="iconfont icon-text"></i>
            <el-input v-model="textVal" :placeholder="$t('editor.insertLink.textPlaceholder')" />
        </div>

        <div class="inputBox">
            <i class="iconfont icon-editor-link"></i>
            <el-input v-model="linkVal" :placeholder="$t('editor.insertLink.linkPlaceholder')" />
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.insertLink.cancel') }}
            </div>
            <div class="confirm" @click="confirm">
                {{ $t('editor.insertLink.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { isUrl } from '@/utils/functions';
import { t } from '@/i18n';

export default defineComponent({
    name: 'InsertLink',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: String },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const textVal = ref();
        const linkVal = ref();
        const isEditor = ref(false);

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (!textVal.value) {
                ElMessage.error(t('editor.insertLink.textError'));
                return;
            }
            if (!linkVal.value) {
                ElMessage.error(t('editor.insertLink.linkEmpty'));
                return;
            }

            if (!isUrl(linkVal.value)) {
                ElMessage.error(t('editor.insertLink.linkError'));
                return false;
            }
            props.insertCallback &&
                props.insertCallback({
                    text: textVal.value,
                    link: linkVal.value,
                });
            dialogVisible.value = false;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        onMounted(() => {
            if (typeof props.componentDefaultValue === 'string') {
                textVal.value = props.componentDefaultValue;
            } else if (typeof props.componentDefaultValue === 'object') {
                isEditor.value = true;
                let url = props.componentDefaultValue.url;
                let text = props.componentDefaultValue.children[0].text;
                textVal.value = text;
                linkVal.value = url;
            }
        });

        return {
            textVal,
            linkVal,
            dialogVisible,
            isEditor,
            handleClose,
            afterClose,
            confirm,
            cancel,
        };
    },
});
</script>

<style scoped lang="less">
.inputBox {
    display: flex;
    .margin(0, 19, 26, 19);
    background: @bg-color-grey;
    .border-radius(10);
    .height(45);
    @apply dark:(bg-dark-300);

    .iconfont {
        display: flex;
        .height(45);
        align-items: center;
        .margin(0, 0, 0, 19);
        .font-size(18);
        color: @text-fcolor;
    }

    :deep(.el-input) {
        .el-input__wrapper {
            .padding(0, 14, 0, 14);

            .el-input__inner {
                height: 100%;
            }
        }
    }
}

.mora-button {
    display: flex;
    .padding(0, 19, 0, 19);
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
