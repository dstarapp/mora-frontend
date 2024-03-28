<template>
    <div class="tabBox">
        <div class="back" @click="context.emit('back')">
            <i class="iconfont icon-arrow-left"></i>
        </div>

        <el-upload ref="uploadRef" class="upload" action="" :show-file-list="false" :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload" :http-request="uploadFile" v-show="!fileUploadLoading">
            <template #trigger>
                <div class="addFile">
                    <i class="iconfont icon-add"></i>
                    <strong>{{ $t('metabox.addFile') }}</strong>
                </div>
            </template>
        </el-upload>
        <div class="fileUploadLoading" v-show="fileUploadLoading">
            <strong>
                {{ fileName.length >= 10 ? fileName.slice(0, 7) + '...' : fileName }}
            </strong>
            <img src="@/assets/svg/loading2.svg" alt="" />
        </div>
    </div>
    <div class="noData" v-if="fileList.length === 0">
        <i class="iconfont icon-no"></i>
        <p>{{ $t('roverDashboard.noData') }}</p>
    </div>
    <div class="listBox" v-else>
        <div class="list" v-for="(item, index) in fileList" :key="item.PlainFileExt.file_key">
            <div class="imgbox">
                <img v-if="~item.PlainFileExt.file_extension.indexOf('image')" src="@/assets/svg/defaultPic.svg" />
                <img v-else-if="~item.PlainFileExt.file_extension.indexOf('video')" src="@/assets/svg/video.svg" />
                <img v-else-if="~item.PlainFileExt.file_extension.indexOf('pdf')" src="@/assets/svg/pdf.svg" />
                <img v-else-if="~item.PlainFileExt.file_extension.indexOf('application')"
                    src="@/assets/svg/archive.svg" />
                <img v-else src="@/assets/svg/file.svg" />
            </div>
            <div class="conbox">
                <div class="filename">{{ item.PlainFileExt.file_name }}</div>
                <div class="filesize">
                    {{ byteToOther(item.PlainFileExt.total_size) }}
                </div>
            </div>
            <div class="operate">
                <!-- <button class="uploadFile" @click="context.emit('uploadFile', item)">
          <i class="iconfont icon-back-top"></i>
        </button> -->
                <button class="insert" @click="context.emit('insert', item)">
                    <i class="iconfont icon-insert"></i>
                </button>
                <button class="del" v-if="deleteLoading !== index" @click="delFile(item, index)">
                    <i class="iconfont icon-delete"></i>
                </button>
                <div v-else class="del">
                    <img src="@/assets/svg/loading2.svg" alt="" />
                </div>
            </div>
        </div>
    </div>
    <div class="bottomRefresh" @click="context.emit('refresh')">
        <i class="iconfont icon-refresh"></i>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { t } from '@/i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { byteToOther } from '@/utils/functions';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'MetaFile',
    props: {
        dataBoxApi: { type: Object },
        fileList: {
            type: Array,
            default: [],
        },
    },
    emits: ['back', 'refresh', 'insert', 'uploadFile'],
    setup(props, context) {
        const fileUploadLoading = ref(false);
        const fileName = ref('');
        const deleteLoading = ref(999999);

        const handleAvatarSuccess = () => { };

        const beforeAvatarUpload = () => { };

        const uploadFile = async ({ file }) => {
            fileUploadLoading.value = true;
            fileName.value = file.name;
            try {
                await props.dataBoxApi.put_plain_files([file], false);
                context.emit('refresh');
            } catch (err) {
                debug('upload failed', err);
                ElMessage.error(t('metabox.uploadError'));
            }
            fileName.value = '';
            fileUploadLoading.value = false;
        };

        const delFile = async (item, index) => {
            ElMessageBox.confirm(t('metabox.delFile.content'), t('metabox.delFile.title'), {
                confirmButtonText: t('metabox.delFile.btn.confirmButtonText'),
                cancelButtonText: t('metabox.delFile.btn.cancelButtonText'),
                type: 'warning',
            })
                .then(async () => {
                    try {
                        deleteLoading.value = index;
                        await props.dataBoxApi.delete_box_plain_file(item.PlainFileExt.file_key);
                        context.emit('refresh');
                        deleteLoading.value = 999999;
                    } catch (err) {
                        debug('delete failed', err);
                        ElMessage.error(t('metabox.delFile.error'));
                        deleteLoading.value = 999999;
                    }
                })
                .catch(() => { });
        };

        return {
            fileUploadLoading,
            fileName,
            context,
            deleteLoading,
            handleAvatarSuccess,
            beforeAvatarUpload,
            uploadFile,
            byteToOther,
            delFile,
        };
    },
});
</script>

<style scoped lang="less">
.tabBox {
    width: 100%;
    .center();
    position: relative;
    display: flex;
    justify-content: space-between;

    .back {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: @text-active;
        .padding(0, 20, 0, 0);
        @apply dark: (text-dark-50);
    }
}

.listBox {
    width: 100%;
    border: 1px solid @border-color;
    max-height: 450px;
    overflow-y: auto;
    .border-radius(15);
    .margin(20, 0, 0, 0);
    @apply dark: (border-dark-100);

    .list {
        width: 100%;
        .padding(12, 15, 12, 15);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: @transition;

        .imgbox {
            width: 77px;
            height: 54px;
            .border-radius(12);
            overflow: hidden;
            .margin(0, 15, 0, 0);

            img {
                height: 100%;
                object-fit: cover;
            }
        }

        .conbox {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;

            .filename,
            .filesize {
                width: 100%;
                text-align: left;
            }

            .filename {
                .font-size(16);
                max-width: 250px;
                .ellipsis();
                font-weight: 500;
                color: @text-color;
                @apply dark: (text-light-900/80);
            }

            .filesize {
                .font-size(12);
                @apply dark: (text-light-900/30);
            }
        }

        .operate {
            display: flex;
            align-items: center;

            button {
                .margin(0, 0, 0, 30);
                width: 30px;
                height: 30px;
                border-radius: 100%;
                background: @bg-color-grey;
                transition: @transition;
                @apply dark: (bg-dark-300);
                .font-size(18);
                .center();

                .icon-insert {
                    .font-size(14);
                    font-weight: 400;
                }

                &.del {
                    &:hover {
                        color: white;
                        background: #ff8282;
                    }
                }

                &.insert {
                    &:hover {
                        color: white;
                        background: @text-active;
                    }
                }

                &.uploadFile {
                    color: @text-active;

                    i {
                        transform: rotate(180deg);
                    }
                }
            }

            .del {
                .margin(0, 0, 0, 30);
                width: 30px;
                height: 30px;
                .center();
            }
        }

        &:hover {
            transition: @transition;
            cursor: pointer;
            background: @bg-color-hover;
            @apply dark: (bg-dark-800);
        }
    }
}

.upload {
    :deep(.el-upload) {
        border: 0;
        background: none;
    }

    .addFile {
        cursor: pointer;
        color: @text-active;
        .font-size(14);
        .center();

        i {
            color: @text-active;
            .font-size(12);
        }

        strong {
            .margin(0, 0, 0, 5);
        }
    }
}

.fileUploadLoading {
    display: flex;

    strong {
        .margin(0, 5, 0, 0);
    }
}

.noData {
    width: 100%;
    .padding(40, 0, 20, 0);
    text-align: center;

    i {
        .font-size(70);
        .line-height(70);
        color: #dddddd;
    }

    p {
        width: 100%;
        display: block;
        .font-size(16);
        .padding(10, 0, 0, 0);
        color: @text-color-grey;
    }
}

.bottomRefresh {
    position: absolute;
    bottom: 30px;
    cursor: pointer;
    color: @text-active;
}
</style>
