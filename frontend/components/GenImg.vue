<template>
    <el-dialog class="noHeader w768" v-model="dialogVisible" :before-close="handleClose" @closed="handleClose">
        <div class="ImgBox" v-if="loading">
            <img src="@/assets/svg/loading2.svg" class="loading" />
            <span>{{ $t('genImg.loadingTxt') }}</span>
        </div>
        <div class="myImg" v-else>
            <div class="myImgBox">
                <i class="iconfont icon-download" @click="downloadImg"></i>
                <img :src="ImgUrl" />
            </div>
            <div class="tip">{{ $t('genImg.tips') }}</div>
            <div @click="downloadImg" class="save">{{ $t('invite.download') }}</div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';

export default defineComponent({
    name: 'GenImg',
    emits: ['closeGenImg'],
    props: {
        shareImgUrl: { type: String, default: '' },
        title: { type: String, default: '' },
    },
    setup(props, context) {
        const loading = ref(true);
        const ImgUrl = ref();
        const dialogVisible = ref(true);
        watch(
            () => props.shareImgUrl,
            (newVal, oldVal) => {
                if (newVal) {
                    loading.value = false;
                    ImgUrl.value = newVal;
                }
            },
        );

        const handleClose = () => {
            dialogVisible.value = false;
            context.emit('closeGenImg');
        };

        const afterClose = () => {
            context.emit('closeGenImg');
        };

        const downloadImg = () => {
            let imgLink = document.createElement('a');
            imgLink.download = props.title || 'pic';
            imgLink.href = props.shareImgUrl;
            imgLink.click();
            imgLink.remove();
        };

        return {
            loading,
            ImgUrl,
            dialogVisible,
            downloadImg,
            afterClose,
            handleClose,
        };
    },
});
</script>

<style lang="less" scoped>
.myImg {
    @apply w-full relative;

    .myImgBox {
        @apply overflow-y-auto rounded-2xl bg-white <sm:(max-h-130 rounded-xl) md:(max-h-200) lg:(max-h-[calc(100vh-5rem)]) dark:(bg-dark-600);

        &::-webkit-scrollbar {
            display: none;
        }

        img {
            @apply w-full;
        }

        .icon-download {
            @apply text-5xl text-purple-500 absolute top-0 left-165 transition duration-300 <lg:(hidden) hover:(transition duration-300 text-purple-600 cursor-pointer);
        }
    }

    .save {
        @apply w-full mt-6 py-3 text-center rounded-xl bg-purple-500 text-white text-sm hidden <lg:(block w-9/10 mx-auto);
    }

    .tip {
        @apply hidden <lg:(block);
        font-size: 14px;
        color: #999;
        margin-top: 10px;
    }
}

.ImgBox {
    @apply bg-white flex flex-col justify-center items-center rounded-xl dark:(bg-dark-600) <sm:(pt-8 pb-4 px-2) md:(p-10);

    img {
        &.loading {
            @apply w-8;
        }
    }

    span {
        @apply pt-6 text-center dark:(text-light-900/80);
    }
}
</style>
