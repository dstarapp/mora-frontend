<template>
    <el-dialog class="noHeader" v-model="dialogVisible" :before-close="handleClose" @closed="afterClose">
        <div class="tab">
            <p @click="tabSwitch(2)" :class="{ active: tabIndex === 2 }">
                {{ $t('editor.videoUpload.embed') }}
            </p>
        </div>

        <div class="linkInput" v-if="tabIndex === 1">
            <i class="iconfont icon-link"></i>
            <el-input v-model="linkVal" :placeholder="$t('editor.videoUpload.videoUrlPlaceholder')" />
        </div>

        <div class="embedBox" v-if="tabIndex === 2">
            <el-input class="textarea" v-model="embedVal" type="textarea" resize="none"
                :placeholder="$t('editor.videoUpload.videoEmptyPlaceholder')" />
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.videoUpload.videoUploadBtn.cancel') }}
            </div>
            <div class="confirm" :class="{
        loading: isLoading,
        disable: (tabIndex === 1 && !linkVal) || (tabIndex === 2 && !embedVal),
    }" @click="confirmLink">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('editor.videoUpload.videoUploadBtn.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';
import { ElMessage } from 'element-plus';
import { isUrl } from '@/utils/functions';

export default defineComponent({
    name: 'ImagesUpload',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: File },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const linkVal = ref('');
        const tabIndex = ref(2);
        const embedVal = ref('');

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            isLoading.value = true;
            setTimeout(() => {
                dialogVisible.value = false;
            }, 300);
        };

        const confirmLink = () => {
            if (tabIndex.value === 1) {
                if (!linkVal.value) {
                    ElMessage.error(t('editor.videoUpload.linkEmpty'));
                    return false;
                }
                if (!isUrl(linkVal.value)) {
                    ElMessage.error(t('editor.videoUpload.linkEmpty'));
                    return false;
                }
                isLoading.value = true;
                props.insertCallback(linkVal.value, '');

                setTimeout(() => {
                    dialogVisible.value = false;
                }, 300);
            }

            if (tabIndex.value === 2) {
                if (!embedVal.value) {
                    ElMessage.error(t('editor.videoUpload.videoEmptyEmpty'));
                    return false;
                }
                if (!~embedVal.value.indexOf('iframe') && !~embedVal.value.indexOf('video')) {
                    ElMessage.error(t('editor.videoUpload.videoEmptyEmpty'));
                    return false;
                }

                if (~embedVal.value.indexOf('iframe')) {
                    if (!~embedVal.value.indexOf('width')) {
                        let arr = embedVal.value.split('<iframe');
                        embedVal.value = `<iframe width="560" height="315" ${arr}`;
                    }
                }

                bus.emit('embedVideo', {
                    text: embedVal.value,
                });
                setTimeout(() => {
                    dialogVisible.value = false;
                }, 300);
            }
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const tabSwitch = (index) => {
            if (index === tabIndex.value) {
                return;
            }
            tabIndex.value = index;
        };

        onMounted(() => {
            if (!props.insertCallback) {
                dialogVisible.value = false;
                ElMessage.error(t('editor.videoUpload.videoUploadModelError'));
            }
        });

        return {
            dialogVisible,
            isLoading,
            linkVal,
            tabIndex,
            embedVal,
            handleClose,
            afterClose,
            cancel,
            confirm,
            confirmLink,
            tabSwitch,
        };
    },
});
</script>

<style scoped lang="less">
.tab {
    .center();

    p {
        font-style: normal;
        font-weight: 400;
        .font-size(20);
        color: @text-fcolor;
        cursor: pointer;
        transition: @transition;
        .center();

        &.active {
            color: @text-color;
            transition: @transition;
            position: relative;
            @apply dark:(text-light-900);

            // &::after {
            //   content: "";
            //   position: absolute;
            //   bottom: -20px;
            //   .width(30);
            //   .height(5);
            //   .border-radius(10);
            //   background: @bg-color-body-active;
            // }
        }

        // &:last-child {
        //   .margin(0, 0, 0, 40);
        // }
    }
}

.uploadPreview {
    .center();
    width: 100%;

    img {
        max-width: 100%;
        max-height: 250px;
        width: auto;
        .border-radius(15);
    }

    :deep(.el-loading-mask) {
        .circular {
            .path {
                stroke: @text-active;
            }
        }
    }
}

.linkInput {
    display: flex;
    width: calc(100% - 40px);
    .margin(50, 20, 0, 20);
    height: 45px;
    background: @bg-color-grey;
    .border-radius(10);
    @apply dark:(bg-dark-300);

    i {
        .center();
        .font-size(18);
        color: @text-fcolor;
        width: 45px;
        height: 100%;
    }

    :deep(.el-input) {
        .el-input__wrapper {
            padding-left: 0;
        }
    }
}

.embedBox {
    display: flex;
    width: calc(100% - 40px);
    .margin(30, 20, 0, 20);
    .border-radius(10);

    :deep(.el-textarea) {
        display: flex;
        background: @bg-color-grey;
        .border-radius(10);
        height: 122px;
        @apply dark:(bg-dark-300);
    }
}

.mora-button {
    display: flex;
    .padding(0, 20, 0, 20);
    .margin(30, 0, 0, 0);

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

        &.disable {
            background: @bg-color-body-disable;
            transition: @transition;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {}
</style>
