<template>
    <el-dialog v-model="dialogVisible" :title="$t('onAr.title')" @closed="afterClose">
        <div class="box">
            <div class="arbox">
                <span class="toright">
                    <i></i>
                </span>
                <img :src="store.state.theme === 'light' ? ar_light : ar_dark" />
                <span class="toleft">
                    <i></i>
                </span>
            </div>
            <h3>{{ $t('onAr.txt1') }}</h3>
            <p>
                <span>{{ $t('onAr.txt2') }}</span>
                {{ message }}
            </p>
            <div class="mora-button">
                <div class="cancel" @click="cancel">
                    {{ $t('editor.pushData.reject') }}
                </div>
                <div class="confirm" :class="{ disabled: state }" @click="confirm">
                    <img src="@/assets/svg/loading.svg" v-if="state" />
                    {{ $t('onAr.btn') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import store from '@/store';
import ar_light from '@/assets/svg/ar-light.svg';
import ar_dark from '@/assets/svg/ar-dark.svg';

export default defineComponent({
    emits: ['onChainClose', 'onChainSubmit'],
    props: {
        message: {
            type: String,
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const state = ref(false);

        const afterClose = () => {
            context.emit('onChainClose');
        };

        const cancel = () => {
            context.emit('onChainClose');
        };

        const confirm = () => {
            state.value = true;
            context.emit('onChainSubmit');
        };

        return {
            dialogVisible,
            store,
            state,
            ar_light,
            ar_dark,
            afterClose,
            confirm,
            cancel,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full px-5;
    .arbox {
        @apply flex justify-between items-center;
        img {
            @apply w-11 h-11;
        }
        span {
            @apply flex-1 relative h-1px from-white to-black dark:(from-dark-600 to-dark-50);
            &.toright {
                @apply bg-gradient-to-r;
                i {
                    @apply absolute left-0 w-2 h-2 rounded-full bg-black -top-1 dark:(bg-gray-500);
                    animation: to-right 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
                }
            }
            &.toleft {
                @apply bg-gradient-to-l;
                i {
                    @apply absolute right-0 w-2 h-2 rounded-full bg-black -top-1 dark:(bg-gray-500);
                    animation: to-left 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
                }
            }
        }
    }
    h3 {
        @apply w-full my-4 text-black font-medium dark:(text-light-900);
    }
    p {
        @apply w-full text-left rounded-2xl py-4 px-5 bg-gray-100 break-words text-sm dark:(bg-dark-900 text-light-900/60);
        span {
            @apply w-full block pb-2 text-base text-dark-500 dark:(text-light-900/80);
        }
    }
    .mora-button {
        @apply px-0;
    }
}

@keyframes to-right {
    0% {
        left: 0;
        scale: 0.5;
    }
    80% {
        left: 70%;
        scale: 1;
    }
    100% {
        left: 98%;
        scale: 0.7;
    }
}
@keyframes to-left {
    0% {
        right: 0;
        scale: 0.5;
    }
    80% {
        right: 70%;
        scale: 1;
    }
    100% {
        right: 98%;
        scale: 0.7;
    }
}
</style>
