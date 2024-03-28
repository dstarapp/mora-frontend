<template>
    <div class="modal-bg" @touchmove.prevent>
        <div class="modal-container">
            <div class="modal-con">
                <div class="modal-header">{{ $t('home.unSubscribe') }}</div>
                <div class="close" @click="close">
                    <i class="iconfont icon-close font-20"></i>
                </div>
                <div class="remind">
                    {{ $t('home.unSubscribeTip') }}
                </div>
                <div class="flex justify-between w-full mb-3 px-10 <sm:(px-0)">
                    <button class="w-4/5 cancelbtn mx-3" @click="close">
                        {{ $t('btns.cancel') }}
                    </button>
                    <button class="w-4/5 browserBtn mx-3" @click="confirm" :class="state == 1 ? 'current' : ''">
                        <img src="@/assets/svg/loading.svg" v-if="state == 1" />
                        {{ $t('btns.confirm') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';

export default defineComponent({
    emits: ['componentClose'],
    setup(props, context) {
        const state = ref(0);

        const confirm = () => {
            state.value = 1;
            let seconds = 10;
            let timer = setInterval(() => {
                seconds--;
                if (seconds == 8) {
                    state.value = 2;
                }
                if (seconds == 7) {
                    clearInterval(timer);
                    close();
                }
            }, 1000);
        };

        const close = () => {
            context.emit('componentClose');
        };

        return {
            state,
            confirm,
            close,
        };
    },
});
</script>

<style lang="less" scoped>
.modal-bg {
    @apply w-screen h-screen fixed top-0 left-0 overflow-hidden;

    .modal-container {
        @apply px-14 py-8 w-150 bg-white rounded-2xl fixed top-1/2 left-1/2 <sm:(px-6 py-5 w-9/10);
        z-index: 60;
        transform: translate(-50%, -50%);

        .modal-con {
            @apply w-full h-full relative;

            .modal-header {
                @apply w-full leading-10 text-black text-center;
                font-size: 22px;
            }

            .close {
                @apply text-xl text-white absolute -right-25 -top-9 px-3 pb-3 cursor-pointer <sm:(-right-10 -top-14);
            }

            .remind {
                @apply w-full text-gray-600 py-8 text-base;

                span {
                    @apply text-gray-600 mr-1 cursor-pointer;

                    &.checked {
                        color: #806ef2;
                    }
                }
            }
        }
    }
}
</style>
