<template>
    <el-dialog class="noHeader login" v-model="dialogVisible" @closed="afterClose">
        <h1>{{ $t('getcode.title') }}</h1>
        <div class="getcodeImg">
            <div v-if="loading">
                <div class="left"><img src="@/assets/svg/getcode.svg" /></div>
                <div class="right"><img src="@/assets/svg/getcode.svg" /></div>
            </div>
            <img src="@/assets/svg/getcode.svg" />
        </div>
        <p class="pt-8 flex items-center justify-center"><i class="iconfont icon-attention mr-2 text-gray-400"></i>{{
        $t('getcode.attention') }}</p>
        <div class="box">
            <div class="con">
                <button @click="getCode" :class="{ disabled: loading }">
                    <img src="@/assets/svg/loading.svg" v-if="loading" />
                    {{ $t('getcode.btn') }}
                </button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { getInvitationCode } from '@/request/axios/bv';
import { ElMessage } from 'element-plus';
import store from '@/store';

export default defineComponent({
    components: {},
    emits: ['close', 'setInvitationCode'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const afterClose = () => {
            context.emit('close');
        };

        const loading = ref(false);
        const getCode = () => {
            if (loading.value) return;

            loading.value = true;

            getInvitationCode({ pid: store.state.user_principal })
                .then((res: any) => {
                    if (!res.data) {
                        ElMessage.error('Failed to obtain the invitation code');
                        return;
                    }

                    if (res.data.success) {
                        context.emit('setInvitationCode', res.data.code);
                    } else {
                        ElMessage.error('You can only get an invitation code once');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    ElMessage.error('Failed to obtain the invitation code');
                })
                .finally(() => {
                    loading.value = false;
                });
        };

        return {
            dialogVisible,
            afterClose,
            getCode,
            loading,
        };
    },
});
</script>

<style lang="less" scoped>
h1 {
    @apply px-5 pb-3 text-3xl font-bold text-black text-center dark:(text-white) <sm:(text-2xl px-2);
}

.title {
    @apply w-full px-5 flex items-center text-xl font-bold text-blue-500 <sm:(px-2);

    i {
        @apply text-3xl mr-3;
    }
}

.getcodeImg {
    @apply w-full text-center relative;

    img {
        @apply w-20 mx-auto;
    }

    .left,
    .left2,
    .right,
    .right2 {
        @apply absolute top-0;

        img {
            @apply opacity-60;
        }
    }

    .left {
        animation: to-left 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
    }

    .right {
        animation: to-right 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
    }
}

.box {
    @apply w-full px-5 mt-5 flex <sm:(px-2);

    .line {
        @apply w-1 ml-3 mr-7 border-l border-dashed border-light-900 dark:(border-light-900/40);
    }

    .con {
        @apply flex-1;

        p {
            @apply w-full text-left;
        }

        input {
            @apply w-full px-3 h-11 mt-5 border-2 border-light-700 rounded-xl bg-white text-sm dark:(bg-dark-300 border-light-700/20);
        }

        button {
            @apply w-full mt-5 mb-2 h-12 text-white block rounded-xl flex items-center justify-center border-none bg-purple-500 transition duration-300 hover:(transition duration-300 bg-purple-500/85);

            i {
                @apply mr-3;
            }

            &.disabled {
                @apply bg-purple-400/80 pointer-events-none;
            }

            img {
                @apply w-4 mr-2;
            }
        }
    }
}

.success {
    @apply w-full py-13 relative <sm:(pb-5 pt-10);

    i {
        @apply block mx-auto text-7xl text-green-400 <sm:(text-6xl);
    }

    p {
        @apply block text-center pt-8 text-lg font-medium text-black dark:(text-white) <sm:(text-base);
    }

    .canvas {
        @apply w-full absolute h-full top-0 transform scale-300 <sm:(scale-120 h-150 -top-35);
    }
}

@keyframes to-right {
    0% {
        right: 46%;
        scale: 0.9;
    }

    100% {
        right: 0;
        scale: 0.5;
        opacity: 0;
    }
}

@keyframes to-left {
    0% {
        left: 46%;
        scale: 0.9;
    }

    100% {
        left: 0;
        scale: 0.5;
        opacity: 0;
    }
}
</style>
