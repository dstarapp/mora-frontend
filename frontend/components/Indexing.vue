<template>
    <el-dialog
        v-model="dialogVisible"
        :show-close="false"
        :close-on-click-modal="false"
        class="indexing"
    >
        <div class="box">
            <div class="imgbox">
                <img src="@/assets/images/indexing.png" />
            </div>
            <div class="progress"></div>
            <p>{{ $t('Indexing.txt') }}</p>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const dialogVisible = ref(true);

        return {
            dialogVisible,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full;
    .imgbox {
        @apply w-full h-50 bg-gradient-to-b from-purple-400 to-purple-100 flex justify-center <sm:(h-40);
        img {
            @apply h-full;
            animation: fadein linear 1s;
        }
    }
    .progress {
        @apply w-full h-2 rounded-xl relative overflow-hidden;
        &::after {
            @apply absolute left-0 w-10 h-2 bg-purple-500 rounded-xl;
            content: '';
            animation: bar linear 3s infinite;
        }
    }
    p {
        @apply pt-5 pb-7 px-25 break-normal <sm:(px-6);
    }
}

@keyframes bar {
    0%,
    100% {
        @apply left-0 w-10;
    }
    25% {
        left: 25%;
        width: 50%;
    }
    50% {
        left: 88%;
        @apply w-10;
    }
    75% {
        left: 25%;
        width: 50%;
    }
}

@keyframes fadein {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
