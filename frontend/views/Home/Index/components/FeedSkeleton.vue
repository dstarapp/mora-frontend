<template>
    <el-skeleton animated class="article">
        <template #template>
            <div class="<sm:(flex flex-row-reverse)">
                <el-skeleton-item variant="image" class="img" />
                <h3><el-skeleton-item variant="h3" class="h-6" /></h3>
                <div class="summary">
                    <el-skeleton-item variant="text" class="w-full h-4" />
                    <el-skeleton-item variant="text" class="w-full h-4" />
                    <el-skeleton-item variant="text" class="w-3/5 h-4 mx-auto" />
                </div>
            </div>
            <div class="info">
                <div class="user">
                    <el-skeleton-item variant="image" class="avatar" />
                    <div class="username"><el-skeleton-item variant="text" class="w-15" /></div>
                </div>
                <el-skeleton-item variant="text" class="w-25 h-4" />
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        articleData: {
            type: Object,
            default: {},
        },
    },
    setup() {
        return {};
    },
});
</script>

<style lang="less" scoped>
.article {
    @apply w-full pb-1 bg-white rounded-2xl flex flex-col justify-between transition duration-300 hover: (shadow-2xl shadow-gray-300 transform scale-105 transition duration-300 cursor-pointer dark:(shadow-black)) dark:(bg-dark-600);
    .img {
        @apply w-full rounded-tl-2xl rounded-tr-2xl <sm:(object-cover w-30 h-14 rounded-xl mt-4 mr-4) md:(h-48) xl:(h-56) 2xl:(h-62);
    }
    h3,
    .summary {
        @apply px-6 sm:(mb-6 px-4 pt-5 pb-2) <sm:(mb-6 px-4 pt-5 pb-2) md:(mb-0);
    }

    h3 {
        @apply w-full py-4 my-0 text-lg font-bold overflow-hidden overflow-ellipsis dark:(text-light-900);

        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .noImgTitle {
        @apply w-full m-0 relative;
        img {
            @apply w-full rounded-tl-2xl rounded-tr-2xl;
        }
        p {
            @apply absolute w-full px-10 font-bold text-2xl overflow-hidden transform top-1/2 -translate-y-1/2 dark:(text-black);

            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
    }
    .summary {
        @apply w-full max-h-20 pt-0 mb-10 text-gray-500 break-words text-center text-sm overflow-hidden overflow-ellipsis 2xl:(text-base) <sm:(mb-2 hidden) dark:(text-light-900/50) 2xl:(max-h-18);
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        &.noImg {
            @apply py-5;
        }
    }
    .info {
        @apply w-full mt-5 flex items-center items-center px-6 sm:(px-4) <sm:(px-4);
        .user {
            @apply flex-1 flex items-center;
            .avatar {
                @apply rounded-full overflow-hidden w-8 h-8 2xl:(w-10 h-10);
                img {
                    @apply w-full rounded-full;
                }
            }
            .username {
                @apply ml-3 text-base max-w-25 truncate dark:(text-light-900/80);
            }
        }

        .date {
            @apply text-sm text-gray-400;
        }
        @apply w-full flex justify-between mt-5 mb-3;
    }
}
</style>
