<template>
    <el-dialog class="noHeader" v-model="dialogVisible" :before-close="handleClose" @closed="afterClose">
        <div class="imgCuttitle">
            {{ title }}
            <span>
                {{ subtitle }}
            </span>
        </div>

        <div class="curbox" v-loading="!createCropperEnd">
            <div :style="{ height: `${cuttingBoxHeight ? cuttingBoxHeight : 300}px` }" class="cropper" v-if="isShow">
                <vue-cropper ref="cropperDom" mode="cover" :img="option.img" :output-size="option.outputSize"
                    :output-type="option.outputType" :info="option.info" :info-true="option.infoTrue"
                    :full="option.full" :fixed="option.fixed" :fixed-number="option.fixedNumber"
                    :can-move="option.canMove" :can-move-box="option.canMoveBox" :fixed-box="option.fixedBox"
                    :original="option.original" :auto-crop="option.autoCrop" :center-box="option.centerBox"
                    :high="option.high" :max-img-size="option.max" @crop-moving="cropMoving" @img-load="imgLoad"
                    @real-time="realTime">
                </vue-cropper>
            </div>
            <div class="zoom" v-if="minimumScale !== maximumScale">
                <i @click="zoomIn" class="iconfont icon-zoom-in"></i>
                <el-slider v-model="sliderVal" :show-tooltip="false" :min="minimumScale" :max="maximumScale"
                    :step="0.01" @input="sliderInput" />
                <i @click="zoomOut" class="iconfont icon-zoom-out"></i>
            </div>
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('utils.avatar.btns.cancel') }}
            </div>
            <div class="confirm" :style="{ backgroundColor: confirmBackgroundColor, color: confirmTextColor }"
                :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/ploading.svg" v-if="isLoading && confirmBackgroundColor === '#34d399'" />
                <img src="@/assets/svg/loading.svg" v-else-if="isLoading" />
                {{ $t('utils.avatar.btns.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, onMounted, nextTick } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import { dataURLtoFile, getImagesUrl } from '@/utils/functions';
import { Upload } from '@/request/axios/http';

export default defineComponent({
    name: 'ImagesUpload',
    components: { VueCropper },
    emits: ['cuttingClose', 'cuttingSuccess'],
    props: {
        imgFile: { type: File },
        imageUrl: { type: String },
        config: { type: Object },
        cuttingBoxHeight: {
            type: Number,
        },
        title: {
            type: String,
            default: t('utils.avatar.title'),
        },
        subtitle: {
            type: String,
            default: t('utils.avatar.adjust'),
        },
        mode: {
            type: String,
            default: '',
        },
        confirmBackgroundColor: {
            type: String,
            default: '#806ef2',
        },
        confirmTextColor: {
            type: String,
            default: '#fff',
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const imageUrl = ref();
        const previews = ref();
        const isLoading = ref(false);
        const cropperDom = shallowRef();
        const sliderVal = ref();
        const createCropperEnd = ref(false);
        // https://www.npmjs.com/package/vue-cropper
        const option = ref({
            img: props.imageUrl,
            outputSize: 1,
            info: false,
            infoTrue: true,
            full: false,
            outputType: 'png',
            canMove: false,
            fixedBox: false,
            original: false,
            canMoveBox: true,
            autoCrop: true,
            autoCropWidth: 100,
            autoCropHeight: 100,
            centerBox: true,
            high: true,
            max: 99999,
            maxImgSize: 1920,
            fixed: true,
            fixedNumber: [1, 1],
            ...props.config,
        });
        const isShow = ref(false);
        const minimumScale = ref(0);
        const maximumScale = ref(1);

        const realTime = (data) => {
            previews.value = data;
            sliderVal.value = cropperDom.value.scale;
        };

        const imgLoad = (msg) => {
            createCropperEnd.value = true;

            if (props.mode === 'cutting') {
                setTimeout(() => {
                    if (previews.value.w) {
                        let pWidth = document.querySelector('.cropper');
                        if (!pWidth || !pWidth.offsetWidth) {
                            return;
                        }

                        pWidth = pWidth.offsetWidth;
                        cropperDom.value.cropOffsertX = 0;
                        cropperDom.value.cropOffsertY = (300 - pWidth * 0.156) / 2;
                        cropperDom.value.cropW = pWidth;
                        cropperDom.value.cropH = pWidth * 0.156;
                        const width = Number(previews.value.img.width.split('px')[0]);


                        let scale = pWidth / width / (1920 / width);
                        cropperDom.value.scale = scale;
                        sliderVal.value = scale;

                        minimumScale.value = pWidth / width;

                        maximumScale.value = scale;
                    }
                }, 100);
            }
        };

        const cropMoving = (data) => { };

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('planetTips.insufficient.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('cuttingClose');
        };

        const sliderInput = (val) => {
            cropperDom.value.scale = val;
        };

        const zoomIn = () => {
            if (sliderVal.value <= 0.1) {
                sliderVal.value = 0;
                return;
            }
            sliderVal.value = sliderVal.value - 0.1;
            cropperDom.value.scale = sliderVal.value;
        };

        const zoomOut = () => {
            if (sliderVal.value >= 1) {
                sliderVal.value = 1;
                return;
            }
            sliderVal.value = sliderVal.value + 0.1;
            cropperDom.value.scale = sliderVal.value;
        };

        const handerImg = (file, width, height) => {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                let img = document.createElement('img');
                reader.onload = function (e) {
                    img.src = e.target.result;
                    img.onload = function () {
                        let canvas = document.createElement('canvas');
                        let context: any = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        context.clearRect(0, 0, width, height);
                        context.drawImage(img, 0, 0, width, height);
                        let newUrl = canvas.toDataURL('image', 1);
                        resolve(newUrl);
                    };
                };
                reader.readAsDataURL(file);
            });
        };

        const confirm = async () => {
            if (isLoading.value) {
                return;
            }
            isLoading.value = true;
            cropperDom.value.getCropBlob(async (rawFile) => {
                let base64 = await handerImg(
                    rawFile,
                    option.value.autoCropWidth,
                    option.value.autoCropHeight,
                );
                let name = `${new Date().getTime()}.png`;
                let file = dataURLtoFile(base64, name);

                const imagesInfo = {
                    filename: name,
                    reqTime: new Date().getTime(),
                };
                Upload(props.mode === 'cutting' ? rawFile : file, imagesInfo)
                    .then((res: any) => {
                        isLoading.value = false;
                        context.emit('cuttingSuccess', res);
                        handleClose();
                    })
                    .catch(() => {
                        isLoading.value = false;
                        ElMessage.error(t('planetTips.insufficient.imagesUploadFail'));
                    });
            });
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        onMounted(() => {
            nextTick(() => {
                isShow.value = true;
            });
        });

        return {
            dialogVisible,
            imageUrl,
            option,
            isLoading,
            cropperDom,
            sliderVal,
            createCropperEnd,
            isShow,
            minimumScale,
            maximumScale,
            zoomIn,
            zoomOut,
            sliderInput,
            handleClose,
            afterClose,
            cancel,
            confirm,
            realTime,
            imgLoad,
            cropMoving,
        };
    },
});
</script>

<style scoped lang="less">
.curbox {
    .padding(10, 35, 10, 35);

    :deep(.cropper-modal) {
        background: none;
    }

    :deep(.vue-cropper) {
        background: none;
    }

    .cropper {
        width: 100%;
        background-color: @bg-color-body;
    }

    .zoom {
        .margin(15, 0, 0, 0);
        display: flex;
        justify-content: space-between;
        align-items: center;

        i {
            .font-size(20);
            color: @border-color;
        }

        .icon-zoom-in {
            .margin(0, 10, 0, 0);
        }

        .icon-zoom-out {
            .margin(0, 0, 0, 10);
        }
    }

    :deep(.el-slider__bar) {
        background-color: #c1c1c1;
    }

    :deep(.el-slider__button) {
        width: 15px;
        height: 15px;
        border: 2px solid #fff;
        background-color: #c1c1c1;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    }
}

.mora-button {
    .margin(20, 0, 10, 0);

    .confirm {
        &.loading {
            opacity: 0.5;
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {}
</style>
