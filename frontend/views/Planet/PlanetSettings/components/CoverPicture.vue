<template>
    <div class="myCover" v-if="imgHex">
        <img @load="handleLoad" :src="getImagesUrl(imgHex)" class="myCover" />
        <i class="loading" v-if="imgLoading" />
        <div class="del" @click="delCover">
            <i class="iconfont icon-delete"></i>
        </div>
    </div>
    <div class="coverBox" v-else>
        <el-upload class="avatar-uploader" v-loading="isUploadLoading" :multiple="false" action=""
            :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
            :http-request="uploadFile">
            <el-icon>
                <Plus />
            </el-icon>
        </el-upload>
        <div class="el-upload__tip">
            {{ $t('planetSettings.from.covertips') }}
        </div>
    </div>
    <ImgCutting v-if="isImgCutting" :title="$t('planetSettings.from.cover')"
        :subtitle="$t('planetSettings.from.subtitle')" mode="cutting" @cuttingClose="cuttingClose"
        @cuttingSuccess="cuttingSuccess" :cuttingBoxHeight="300" :config="{
        autoCropWidth: 1920,
        autoCropHeight: 300,
        fixedNumber: [1920, 300],
        canMove: true,
        canMoveBox: false,
        fixedBox: true,
        canScale: false,
        enlarge: 1,
        outputSize: 1,
        full: true,
        original: true,
    }" :imgFile="imgFile" :imageUrl="imageUrl" />
</template>

<script lang="ts">
import { ref, defineComponent, inject, onMounted, nextTick } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { t } from '@/i18n';
import store from '@/store';
import { getImagesUrl, imagesIsUpload } from '@/utils/functions';
import ImgCutting from '@/components/ImgCutting.vue';
import debug from '@/utils/debug';

export default defineComponent({
    components: { Plus, ImgCutting },
    props: {
        src: { type: String, default: '' },
    },
    setup(props, context) {
        const router = useRouter();
        const isUploadLoading = ref(false);
        const isImgCutting = ref(false);
        const imageUrl = ref();
        const imgFile = ref();
        const imgHex = ref();
        const imgLoading = ref(true);
        const planetCanister: any = inject('planetCanister', null);

        const getImageSize = (file) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const { width, height } = img;
                    resolve({ width, height });
                };
                img.onerror = () => {
                    reject(new Error('images error'));
                };
                img.src = URL.createObjectURL(file);
            });
        };

        const uploadFile = async ({ file }) => {
            if (!imagesIsUpload(file)) {
                return false;
            }
            try {
                let imagesInfo: any = await getImageSize(file);
                if (imagesInfo.width < 1920 || imagesInfo.height < 300) {
                    ElMessage.error(t('planetSettings.from.coverSizeError'));
                    return;
                }
                imageUrl.value = URL.createObjectURL(file);
                imgFile.value = file;
                isImgCutting.value = true;
            } catch { }
        };

        const cuttingClose = () => {
            isImgCutting.value = false;
        };

        const cuttingSuccess = async (hex) => {
            isUploadLoading.value = false;
            imgHex.value = hex;
            imgLoading.value = true;
            store.commit('SET_PLANET_COVER', hex);

            try {
                await planetCanister.value.setCover(hex);
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const handleAvatarSuccess = () => { };

        const beforeAvatarUpload = () => { };

        const delCover = async () => {
            ElMessageBox.confirm(
                t('planetSettings.cover.delMessage'),
                t('planetSettings.cover.delTitle'),
                {
                    confirmButtonText: t('planetSettings.cover.confirm'),
                    cancelButtonText: t('planetSettings.cover.cancel'),
                    type: 'warning',
                },
            )
                .then(async () => {
                    store.commit('DEL_PLANET_COVER');
                    imgHex.value = '';
                    try {
                        await planetCanister.value.setCover('');
                    } catch (err) {
                        debug('failed', err);
                    }
                })
                .catch(() => { });
        };

        const handleLoad = () => {
            imgLoading.value = false;
        };

        onMounted(() => {
            nextTick(() => {
                imgHex.value = props.src;
            });
        });

        return {
            Plus,
            props,
            isUploadLoading,
            imgFile,
            imgHex,
            imageUrl,
            isImgCutting,
            imgLoading,
            cuttingSuccess,
            handleAvatarSuccess,
            beforeAvatarUpload,
            uploadFile,
            getImagesUrl,
            delCover,
            cuttingClose,
            handleLoad,
        };
    },
});
</script>

<style lang="less" scoped>
.myCover {
    width: 100%;
    position: relative;
    .center();

    img {
        width: 100%;
        .border-radius(10);
    }

    .loading {
        background: url(@/assets/svg/loading2.svg) no-repeat center center;
        background-size: 20px 20px;
        width: 20px;
        height: 20px;
        position: absolute;
    }

    .del {
        // display: none;
        position: absolute;
        .width(35);
        .height(35);
        background-color: rgba(0, 0, 0, 0.8);
        transition: @transition;
        border-radius: 100%;
        .center();
        .right(15);
        .top(15);
        cursor: pointer;

        i {
            color: white;
            .font-size(18);
            transition: @transition;
        }

        &:hover {
            background-color: white;
            transition: @transition;

            i {
                color: black;
            }
        }
    }
}

.coverBox {
    // .center();
    flex-direction: column;

    :deep(.el-upload) {
        .width(130);
        .height(80);

        img {
            width: 100%;
            height: 100%;
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            .width(260);
            .height(160);
            .margin(10, 0, 0, 0);
        }
    }
}
</style>
