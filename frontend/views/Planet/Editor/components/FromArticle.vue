<template>
    <el-dialog class="w700" :title="$t('editor.settings.cover.fromArticle')" v-model="dialogVisible"
        :before-close="handleClose" @closed="afterClose">
        <div class="imglist" v-if="pictureHistoryList.length">
            <div class="item" :class="{ active: currentImgId === index }" v-for="(item, index) in pictureHistoryList"
                :key="index" @click="ImgClick(index, $event)">
                <img :src="item" alt="" />
            </div>
        </div>
        <div class="noData" v-else>
            <i class="iconfont icon-no"></i>
            <span>{{ $t('editor.imagesUpload.nodata') }}</span>
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.insertLink.cancel') }}
            </div>
            <div class="confirm" :class="{ disable: currentImgId === -1 || loading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="loading" />
                {{ $t('editor.insertLink.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { getFileFromUrl } from '@/utils/functions';

export default defineComponent({
    name: 'fromArticle',
    emits: ['fromArticleClose', 'fromArticleConfirm'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const pictureHistoryList: any = inject('pictureHistoryList', null);
        const currentImgId = ref(-1);
        const loading = ref(false);

        const ImgClick = (id: number, event) => {
            if (currentImgId.value !== id) {
                currentImgId.value = id;
            } else {
                currentImgId.value = -1;
            }
        };

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('fromArticleClose');
        };

        const confirm = async () => {
            if (loading.value) {
                return;
            }
            if (currentImgId.value === -1) {
                return;
            }
            loading.value = true;
            let imgUrl = pictureHistoryList.value[currentImgId.value];
            context.emit('fromArticleConfirm', await getFileFromUrl(imgUrl));
            handleClose();
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        return {
            dialogVisible,
            pictureHistoryList,
            currentImgId,
            loading,
            cancel,
            handleClose,
            confirm,
            afterClose,
            ImgClick,
        };
    },
});
</script>

<style scoped lang="less">
.imglist {
    @apply w-full max-h-100 overflow-y-auto grid grid-cols-4 gap-3;
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
</style>
