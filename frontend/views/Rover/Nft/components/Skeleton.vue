<template>
    <el-skeleton class="nftSkeleton" animated>
        <template #template>
            <div class="item" v-for="(item, index) in 6" :key="index">
                <el-skeleton-item class="img" variant="image" />
                <div class="text">
                    <span>
                        <el-skeleton-item class="w-20 h-4" variant="text" />
                        <el-skeleton-item class="w-12 h-4 mt-2" variant="text" />
                    </span>
                    <el-skeleton-item class="w-10 h-5" variant="text" />
                </div>
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Skeleton',
    setup() {
        return {};
    },
});
</script>

<style scoped lang="less">
.nftSkeleton {
    @apply w-full mt-10 grid grid-cols-3 gap-8 <lg:(grid-cols-2 gap-5);

    .item {
        @apply w-full;
        transition: @transition;

        .img {
            @apply w-full rounded-tl-xl rounded-tr-xl h-58 <lg:(h-38) <sm:(h-32);
            object-fit: cover;
            transition: @transition;
        }

        .text {
            @apply w-full border border-light-500 rounded-bl-xl rounded-br-xl bg-white flex justify-between px-4 py-2 items-center dark:(bg-dark-300 border-dark-100);
            border-top: none;

            span {
                @apply flex flex-col flex-1;
            }

        }
    }
}
</style>
