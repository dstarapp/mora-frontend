<template>
    <el-dialog class="basicInfo" :title="$t('plugin.tool.basicInfo')" v-model="props.show" @closed="onDialogClose">
        <div class="basic-info-box">
            <div class="basic-info">
                <div class="background">
                    <img v-if="!form.cover" src="@/assets/svg/plugin-default.svg" alt="" />
                    <img v-else :src="getImagesUrl(form.cover)" alt="" />
                    <el-upload class="cover-upload" :class="{ disabled: disabled }" :multiple="false" action=""
                        :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                        :http-request="uploadFile" :disabled="disabled">
                        <i class="iconfont icon-plugin-upload"></i>
                        {{ $t('plugin.basicInfo.coverPicture') }}
                    </el-upload>
                </div>
                <div class="bottom">
                    <Avatar :disabled="disabled" :src="form.thumbnail" type="basicInfo" />
                    <div class="name">
                        <el-input :disabled="disabled" v-model="form.name"
                            :placeholder="$t('plugin.basicInfo.namePlaceholder')" />
                    </div>
                    <div class="category">
                        <el-select :disabled="disabled" v-model="form.categories[0]"
                            :placeholder="$t('plugin.basicInfo.chooseCategory')">
                            <el-option v-for="item in categoryList" :key="item.label" :label="item.label"
                                :value="item.label" />
                        </el-select>
                    </div>
                    <div class="instruction">
                        <el-input :disabled="disabled" type="textarea" resize="none" v-model="form.instruction"
                            :placeholder="$t('plugin.basicInfo.instruction')" :maxlength="300" show-word-limit />
                    </div>
                    <div class="complete" @click="complete">{{ $t('plugin.basicInfo.next') }}</div>
                </div>

                <ImgCutting v-if="isImgCutting" @cuttingClose="cuttingClose" @cuttingSuccess="cuttingSuccess" :config="{
        autoCropWidth: 600,
        autoCropHeight: 300,
        fixedNumber: [600, 300],
    }" :imgFile="imgFile" :imageUrl="imageUrl" :cuttingBoxHeight="232" :title="$t('plugin.basicInfo.imgCutting')"
                    :subtitle="$t('plugin.basicInfo.subtitle')" />
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Avatar from '@/components/Avatar.vue';
import ImgCutting from '@/components/ImgCutting.vue';
import { imagesIsUpload, getImagesUrl } from '@/utils/functions';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';
import { LightBasicInfo } from '@/components/light-experience/types/core';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const onDialogClose = () => emit('complete');

const categoryList = ref<{ label: string }[]>([{ label: 'Tools' }, { label: 'Other' }]);

const form = ref<LightBasicInfo>({
    name: '',
    cover: '',
    thumbnail: '',
    categories: ['Tools'],
    tags: [],
    runnable_planet: { All: null },
    instruction: '',
});

const imageUrl = ref<string>('');
const imgFile = ref<File>();
const isImgCutting = ref(false);
const isUploadLoading = ref(false);

const handleAvatarSuccess = () => { };
const beforeAvatarUpload = async () => { };
const uploadFile = ({ file }) => {
    if (!imagesIsUpload(file)) return false;

    imageUrl.value = URL.createObjectURL(file);
    imgFile.value = file;
    isImgCutting.value = true;
};

const cuttingSuccess = async (cover: string) => {
    form.value.cover = cover;
    isUploadLoading.value = false;
};

const cuttingClose = () => (isImgCutting.value = false);

const setThumbnail = (thumbnail: string) => {
    form.value.thumbnail = thumbnail;
};

const setData = (data: LightBasicInfo) => {
    form.value = data;
    if (
        form.value.name &&
        form.value.cover &&
        form.value.thumbnail &&
        form.value.categories.length &&
        form.value.instruction
    ) {
        complete();
    }
};
onUnmounted(() => {
    bus.off('basicInfo', setThumbnail);
});
onMounted(() => {
    bus.on('basicInfo', setThumbnail);
});

defineExpose({
    setData,
});

const emit = defineEmits(['complete']);

const complete = () => {
    if (!form.value.name) {
        ElMessage.error(`Please input ${t('plugin.basicInfo.namePlaceholder')}`);
        return;
    }
    if (!form.value.cover) {
        ElMessage.error(`${t('plugin.basicInfo.coverError')}`);
        return;
    }
    if (!form.value.thumbnail) {
        ElMessage.error(`${t('plugin.basicInfo.avatarError')}`);
        return;
    }
    if (!form.value.categories.length) {
        ElMessage.error(`Please input ${t('plugin.basicInfo.chooseCategory')}`);
        return;
    }
    if (!form.value.instruction) {
        ElMessage.error(`Please input ${t('plugin.basicInfo.instruction')}`);
        return;
    }
    emit('complete', form.value);
};
</script>

<style lang="less" scoped>
.basic-info-box {
    .center();
}

.basic-info {
    width: 600px;
    height: 660px;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    overflow-y: auto;
    .pscrollbar();

    >.background {
        width: 100%;
        height: 300px;
        display: flex;
        position: relative;
        border-radius: 18px 18px 0 0;
        overflow: hidden;
        flex-shrink: 0;

        >img {
            object-fit: cover;
            width: 100%;
        }

        >.cover-upload {
            position: absolute;
            right: 17px;
            top: 19px;
            width: 150px;
            height: 40px;
            background: #4c4f6b;
            border-radius: 8px;
            font-size: 16px;
            .center();
            color: #ffffff;
            cursor: pointer;

            &.disabled {
                display: none;
            }

            i {
                font-size: 16px;
                margin-right: 5px;
            }

            :deep(.el-upload) {
                background: none;
                border: none;

                &:focus {
                    color: #fff;
                }
            }
        }
    }

    >.bottom {
        display: flex;
        flex: 1;
        border: 1px solid #e8e8e8;
        border-top: 0;
        border-radius: 0 0 18px 18px;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        padding: 0 0 20px 0;
        @apply dark:(border-dark-100);

        :deep(.basicInfo) {
            margin-top: -36px;
        }

        >.name {
            width: 450px;
            height: 40px;
            margin-top: 15px;
            color: #666666;

            :deep(.el-input) {
                border: 1px solid #dddddd;
                border-radius: 10px;
                height: 40px;
                font-size: 14px;
                @apply dark:(border-dark-100);

                &.is-disabled {
                    border: none;
                }

                .el-input__wrapper {
                    padding: 0 16px;

                    .el-input__inner {
                        color: #666666;
                        @apply dark:(text-light-900);
                    }
                }
            }
        }

        >.category {
            width: 450px;
            height: 40px;
            margin-top: 15px;
            color: #666666;

            :deep(.el-select) {
                width: 100%;
                height: 40px;

                .el-input {
                    border-radius: 10px;
                    height: 40px;

                    .el-input__wrapper {
                        padding: 0 16px;
                        border-width: 1px;
                        border-color: #ddd;
                        border-radius: 10px;
                        @apply dark:(border-dark-100);

                        .el-input__inner {
                            text-align: left;
                            font-size: 14px;
                            color: #666666;
                            @apply dark:(text-light-900);
                        }
                    }
                }
            }
        }

        >.instruction {
            width: 450px;
            height: 110px;
            margin-top: 15px;
            color: #666666;

            :deep(.el-textarea) {
                border: 1px solid #dddddd;
                border-radius: 10px;
                height: 110px;
                @apply dark:(border-dark-100);

                &.is-disabled {
                    overflow: hidden;

                    .el-textarea__inner {
                        color: var(--el-disabled-text-color);

                    }
                }

                .el-textarea__inner {
                    padding: 5px 14px;
                    font-size: 14px;
                    color: #666666;
                    @apply dark:(text-light-900);
                }

                .el-input__count {
                    font-size: 12px;
                }
            }
        }

        >.complete {
            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
            border-radius: 8px;
            width: 450px;
            height: 44px;
            font-size: 18px;
            color: #000000;
            margin-top: 15px;
            cursor: pointer;
            .center();
        }
    }
}
</style>
