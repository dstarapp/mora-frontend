<template>
    <div class="avatar" :class="{ basicInfo: type === 'basicInfo' }" v-loading="uploadLoading">
        <el-upload
            class="avatar-uploader"
            :multiple="false"
            action=""
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadFile"
            :disabled="disabled"
        >
            <slot name="trigger">
                <el-button ref="uploadDom" class="triggerRef" type="primary"></el-button>
            </slot>
            <strong class="camera position" v-if="imageRes"></strong>
            <img v-if="imageRes" :src="imageRes" class="avatar" />
            <i class="camera" v-else></i>
        </el-upload>
    </div>
    <ImgCutting
        v-if="isImgCutting"
        @cuttingClose="cuttingClose"
        @cuttingSuccess="cuttingSuccess"
        :config="{
            fixedNumber: [1, 1],
            autoCropWidth: 300,
            autoCropHeight: 300,
        }"
        :confirmBackgroundColor="confirmBackgroundColor"
        :confirmTextColor="confirmTextColor"
        :imgFile="imgFile"
        :imageUrl="imageUrl"
    />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, inject, watch, shallowRef } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { Plus } from '@element-plus/icons-vue';
import ImgCutting from './ImgCutting.vue';
import CONFIG from '@/assets/config';
import store from '@/store';
import { getImagesUrl, imagesIsUpload } from '@/utils/functions';
import bus from 'vue3-eventbus';

export default defineComponent({
    name: 'Rover',
    components: { Plus, ImgCutting },
    props: {
        src: { type: String, default: '' },
        type: { type: String, default: '' },
        confirmBackgroundColor: {
            type: String,
            default: '#806ef2',
        },
        confirmTextColor: {
            type: String,
            default: '#fff',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const imageUrl = ref();
        const imgFile = ref();
        const imageRes = ref();
        const imgHex = ref();
        const uploadLoading = ref(false);
        const isImgCutting = ref(false);
        const usersCanister: any = inject('usersCanister', null);
        const planetCanister: any = inject('planetCanister', null);
        const uploadDom = shallowRef();

        const handleAvatarSuccess = () => {};

        const beforeAvatarUpload = () => {};

        const uploadFile = ({ file }) => {
            if (!imagesIsUpload(file)) {
                return false;
            }
            imageUrl.value = URL.createObjectURL(file);
            imgFile.value = file;
            isImgCutting.value = true;
        };

        const cuttingClose = () => {
            isImgCutting.value = false;
        };

        const cuttingSuccess = async (hex) => {
            imageRes.value = `${CONFIG.imgBaseUrl}${hex}`;
            imgHex.value = hex;

            if (props.type === 'basicInfo') {
                bus.emit('basicInfo', hex);
            }

            if (props.type === 'setting') {
                uploadLoading.value = true;
                const res = await usersCanister.value.set_avatar(hex);
                if (res) {
                    ElMessage.success(t('utils.avatar.updateSuccess'));
                    store.commit('SET_AVATAR', hex);
                    uploadLoading.value = false;
                }
            }

            if (props.type === 'planetSettings') {
                uploadLoading.value = true;
                const res = await planetCanister.value.setAvatar(hex);
                if (res) {
                    ElMessage.success(t('utils.avatar.updateSuccess'));
                    store.commit('SET_PLANET_AVATAR', hex);
                    uploadLoading.value = false;
                }
            }
        };

        const getAvatar = () => {
            return imgHex.value;
        };

        const setUrl = () => {
            imageUrl.value = getImagesUrl(props.src);
            imageRes.value = getImagesUrl(props.src);
        };

        watch(
            () => props.src,
            () => {
                if (!imageUrl.value && !imageRes.value) {
                    setUrl();
                }
            },
        );

        onMounted(() => {
            nextTick(() => {
                if (props.src) {
                    setUrl();
                }
            });
        });

        return {
            uploadDom,
            store,
            imageUrl,
            isImgCutting,
            imgFile,
            imageRes,
            imgHex,
            uploadLoading,
            getAvatar,
            handleAvatarSuccess,
            beforeAvatarUpload,
            uploadFile,
            cuttingClose,
            cuttingSuccess,
        };
    },
});
</script>

<style scoped lang="less">
.avatar {
    .center();
    border-radius: 50%;
    .height(88);
    .width(88);
    background: @bg-color;
    overflow: hidden;
    position: relative;
    @apply dark:(bg-dark-300);

    img {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }

    .isAuto {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .triggerRef {
        display: none;
    }

    .avatar-uploader {
        width: 100%;
        height: 100%;
        position: relative;
        transition: @transition;

        :deep(.el-upload) {
            background: none;
            border: none;
        }

        .camera {
            display: flex;
            width: 100%;
            height: 100%;
            background: url('@/assets/svg/camera.svg') no-repeat center center;
            background-size: 28px auto;
        }

        .position {
            position: absolute;
            left: -1px;
            top: -1px;
            background-color: rgba(255, 255, 255, 0.92);
            background-size: 28px auto;
            width: calc(100% + 2px);
            height: calc(100% + 2px);
            backdrop-filter: blur(4px);
            transition: @transition;
            z-index: 2;
            opacity: 0;
            @apply dark:(bg-dark-300);
        }

        &:hover {
            .position {
                transition: @transition;
                opacity: 1;
            }
        }
    }

    &.basicInfo {
        border: 3px solid #fff;
        background: rgba(76, 79, 107, 0.3);
        backdrop-filter: blur(2px);
        border-radius: 20px;
        height: 72px;
        width: 72px;
        overflow: hidden;
        color: #fff;
        @apply dark:(border-dark-500 bg-dark-300/80);

        img {
            width: 100%;
            height: 100%;
            border-radius: 0px;
            max-height: none;
            max-width: none;
        }

        .avatar-uploader {
            .camera {
                background: url('@/assets/svg/camera2.svg') no-repeat center center;
                background-size: 28px auto;
            }
        }
    }
}
</style>
