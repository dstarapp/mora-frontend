<template>
    <el-dialog class="w700" :title="$t('editor.editorAlt.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="inputBox">
            <i class="iconfont icon-plugin-edit"></i>
            <el-input type="text" :maxlength="140" v-model="altVal"
                :placeholder="$t('editor.editorAlt.altPlaceholder')" />
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

export default defineComponent({
    name: 'ImagesEditorAlt',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: Object },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const altVal = ref();

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const confirm = () => {
            if (!altVal.value) {
                props.insertCallback({
                    path: props.componentDefaultValue.path,
                    imageData: {
                        ...props.componentDefaultValue.str,
                        alt: '',
                    },
                });
            } else {
                props.insertCallback({
                    path: props.componentDefaultValue.path,
                    imageData: {
                        ...props.componentDefaultValue.str,
                        alt: encodeURIComponent(altVal.value.replace(/"/g, '&quot;')),
                    },
                });
            }
            setTimeout(() => {
                dialogVisible.value = false;
            }, 300);
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        onMounted(() => {
            if (
                props.componentDefaultValue &&
                props.componentDefaultValue.imageData &&
                props.componentDefaultValue.imageData.alt
            ) {
                altVal.value = decodeURIComponent(
                    props.componentDefaultValue.imageData.alt,
                ).replace(/&quot;/g, '"');
            }
        });

        return {
            dialogVisible,
            altVal,
            cancel,
            handleClose,
            confirm,
            afterClose,
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
    .height(60);
    @apply dark:(bg-dark-300);

    .iconfont {
        display: flex;
        .height(60);
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
</style>
