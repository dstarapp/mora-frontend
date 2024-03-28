<template>
    <el-dialog class="noHeader" v-model="dialogVisible" :before-close="handleClose" @closed="afterClose">
        <div class="tab">
            <p @click="tabSwitch(1)" :class="{ active: currentTab === 1 }">
                {{ $t('editor.imagesUpload.upload') }}
                <span></span>
            </p>
            <p @click="tabSwitch(2)" :class="{ active: currentTab === 2 }">
                {{ $t('editor.imagesUpload.list') }}
                <span></span>
            </p>
        </div>
        <template v-if="currentTab === 1">
            <div class="upload" :class="{ isUpload: imageUrl }">
                <el-upload class="avatar-uploader" :show-file-list="false" :before-upload="beforeAvatarUpload"
                    :http-request="uploadFile" :disabled="imageUrl && isUploadLoading" :drag="true">
                    <div v-if="!imageUrl" class="avatar-uploader-icon">
                        <i class="iconfont icon-add"></i>
                        <p>{{ $t('editor.imagesUpload.imagesDrag') }}</p>
                    </div>
                    <div v-if="imageUrl" class="uploadPreview" v-loading="isUploadLoading">
                        <img :src="imageUrl" ref="imageDom" />
                    </div>
                </el-upload>
            </div>

            <div class="tipsBox" v-show="isUploadLoading">
                <p class="tips">{{ $t('editor.imagesUpload.imagesUploadTips') }}</p>

                <span class="tips2">
                    <i class="iconfont icon-attention"></i>
                    <p class="tips">{{ $t('editor.imagesUpload.imagesUploadTips2') }}</p>
                </span>
            </div>

            <div class="mora-button" v-show="!isUploadLoading">
                <div class="cancel" @click="cancel">
                    {{ $t('editor.imagesUpload.imagesUploadBtn.cancel') }}
                </div>
                <div class="confirm" :class="{ loading: isLoading, disable: isUploadLoading }" @click="confirm">
                    <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                    {{ $t('editor.imagesUpload.imagesUploadBtn.confirm') }}
                </div>
            </div>
        </template>

        <template v-else>
            <div class="imglist" v-if="pictureHistoryList.length">
                <div class="item" :class="{ active: currentImgId === index }"
                    v-for="(item, index) in pictureHistoryList" :key="index" @click="ImgClick(index, $event)">
                    <img :src="item" alt="" />
                </div>
            </div>
            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <span>{{ $t('editor.imagesUpload.nodata') }}</span>
            </div>
            <div class="mora-button">
                <div class="cancel" @click="cancel">
                    {{ $t('editor.imagesUpload.imagesUploadBtn.cancel') }}
                </div>
                <div class="confirm" @click="addImagesHistory"
                    :class="{ disable: currentImgId === -1 || !naturalWidth }">
                    <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                    {{ $t('editor.imagesUpload.imagesUploadBtn.confirm') }}
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import type { UploadProps } from 'element-plus';
import { imageCompress } from '@/utils/imagesCompression';
import { Upload } from '@/request/axios/http';
import CONFIG from '@/assets/config';
import { imagesIsUpload } from '@/utils/functions';
import store from '@/store';
import bus from 'vue3-eventbus';

export default defineComponent({
    name: 'ImagesUpload',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: [File, String] },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const addressVal = ref();
        const isLoading = ref(false);
        const imageUrl = ref();
        const isUploadLoading = ref(true);
        const linkVal = ref('');
        const imageDom = ref();
        const naturalWidth = ref();
        const pictureHistoryList: any = inject('pictureHistoryList', null);
        let imagesInfo: {
            filename?: string;
            reqTime?: number;
            src?: string;
        } = {};

        const handleClose = () => {
            if (imageUrl.value && isUploadLoading.value) {
                ElMessage.error(t('planetTips.insufficient.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const uploadFile = () => { };

        const beforeAvatarUpload: UploadProps['beforeUpload'] = async (rawFile) => {
            if (!imagesIsUpload(rawFile)) {
                return false;
            }
            try {
                isUploadLoading.value = true;
                imageUrl.value = URL.createObjectURL(rawFile);
                let fileData;
                if (rawFile.type !== 'image/gif') {
                    fileData = await imageCompress(rawFile);
                } else {
                    fileData = rawFile;
                }
                let name = fileData.name;
                imagesInfo = {
                    filename: name,
                    reqTime: new Date().getTime(),
                };

                Upload(fileData, imagesInfo)
                    .then((res: any) => {
                        const imgUrl = `${CONFIG.imgBaseUrl}${res}`;
                        imageUrl.value = imgUrl;
                        imageDom.value.onload = (e) => {
                            naturalWidth.value = Number(imageDom.value.naturalWidth);
                            imagesInfo.src = imgUrl;
                            isUploadLoading.value = false;
                        };
                        bus.emit('addPictureHistory', imgUrl);
                    })
                    .catch(() => {
                        isUploadLoading.value = false;
                        imagesInfo.src = ``;
                        ElMessage.error(t('editor.imagesUpload.imagesUploadFail'));
                    });
                return true;
            } catch {
                isUploadLoading.value = false;
            }
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (isUploadLoading.value) {
                return false;
            }
            isLoading.value = true;
            store.state.editor_ref.focus();
            if (!store.state.editor_ref.isEmpty()) {
                store.state.editor_ref.restoreSelection();
            }

            const node1 = {
                type: 'thingImage',
                src: imagesInfo.src,
                mode: 'full',
                children: [{ text: '' }],
            };
            store.state.editor_ref.insertNode(node1);

            setTimeout(() => {
                dialogVisible.value = false;
            }, 300);
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const currentTab = ref(1);
        const tabSwitch = (num: number) => {
            currentTab.value = num;
        };
        const currentImgId = ref(-1);

        const ImgClick = (id: number, event) => {
            if (currentImgId.value !== id) {
                currentImgId.value = id;
                naturalWidth.value = event.target.naturalWidth;
            } else {
                currentImgId.value = -1;
                naturalWidth.value = 0;
            }
        };

        const addImagesHistory = () => {
            if (currentImgId.value === -1 || !naturalWidth.value) {
                return;
            }
            isLoading.value = true;
            let url = pictureHistoryList.value[currentImgId.value];
            store.state.editor_ref.focus();
            if (!store.state.editor_ref.isEmpty()) {
                store.state.editor_ref.restoreSelection();
            }

            const node1 = {
                type: 'thingImage',
                src: url,
                mode: 'full',
                children: [{ text: '' }],
            };
            store.state.editor_ref.insertNode(node1);

            setTimeout(() => {
                dialogVisible.value = false;
                isLoading.value = false;
            }, 300);
        };

        onMounted(() => {
            if (props.componentDefaultValue) {
                beforeAvatarUpload(props.componentDefaultValue);
            }
        });

        return {
            dialogVisible,
            addressVal,
            isLoading,
            imageUrl,
            isUploadLoading,
            linkVal,
            imageDom,
            pictureHistoryList,
            currentTab,
            currentImgId,
            naturalWidth,
            handleClose,
            afterClose,
            cancel,
            confirm,
            beforeAvatarUpload,
            uploadFile,
            tabSwitch,
            ImgClick,
            addImagesHistory,
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
        display: flex;
        flex-direction: column;
        margin: 0 15px;

        span {
            @apply w-1/3 h-5px rounded-full bg-transparent mx-auto mt-2 block;
        }

        &.active {
            color: @text-color;
            transition: @transition;
            position: relative;
            @apply dark: (text-light-900);

            span {
                @apply bg-purple-500;
            }
        }
    }
}

.imglist {
    @apply w-full max-h-100 mt-10 overflow-y-auto grid grid-cols-4 gap-3;
    .scrollbar();

    .item {
        @apply w-full h-29 rounded-2xl overflow-hidden p-2px border-2 border-transparent cursor-pointer transition duration-300;

        img {
            @apply w-full h-full rounded-xl object-cover opacity-80;
        }

        &.active {
            @apply border-purple-500 transition duration-300;

            img {
                @apply opacity-100;
            }
        }
    }
}

.noData {
    @apply w-full pt-15 pb-10 flex items-center justify-center flex-col;

    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }

    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
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

.upload {
    display: flex;
    .margin(40, 0, 0, 0);
    // background: #FBFBFB;
    border: 2px dashed #dddddd;
    .border-radius(15);
    .height(140);
    transition: @transition;

    .avatar-uploader {
        width: 100%;

        :deep(.el-upload) {
            border: 0;
            background: none;

            .el-upload-dragger {
                .center();
                height: 100%;
                padding: 0;
                border: 0;

                &:hover {
                    border: 0;
                }
            }
        }
    }

    .avatar-uploader-icon {
        display: flex;
        width: 100%;
        flex-direction: column;

        i {
            .font-size(28);
        }

        p {
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .line-height(19);
            color: @text-color-grey;
            .margin(24, 0, 0, 0);
        }
    }

    &:hover {
        box-shadow: inset -5px -5px 8px rgba(0, 0, 0, 0.1), inset 5px 5px 8px rgba(0, 0, 0, 0.1);
        transition: @transition;
    }

    &.isUpload {
        border: 0;
        height: auto;
        min-height: auto;
        max-height: none;

        &:hover {
            box-shadow: none;
        }
    }
}

.tipsBox {
    display: flex;
    flex-direction: column;
    width: 100%;

    .tips {
        font-style: normal;
        font-weight: 400;
        .font-size(14);
        .line-height(17);
        color: @text-color-grey;
        .margin(20, 0, 0, 0);
    }

    .tips2 {
        .margin(30, 0, 0, 0);
        display: flex;

        .icon-attention {
            .font-size(16);
            color: #cccccc;
        }

        .tips {
            text-align: left;
            .margin(5, 0, 10, 8);
        }
    }
}

.linkInput {
    display: flex;
    width: calc(100% - 40px);
    // .padding(0, 20, 0, 20);
    .margin(50, 20, 0, 20);
    height: 45px;
    background: @bg-color-grey;
    .border-radius(10);
    @apply dark: (bg-dark-300);

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

.mora-button {
    display: flex;
    .padding(0, 5, 0, 5);
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
