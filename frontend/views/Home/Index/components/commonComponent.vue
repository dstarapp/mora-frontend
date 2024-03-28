<template>
    <div v-if="type === 'banner'" class="banner">
        <div class="box">
            <div class="slogan">
                <strong>{{ $t('banner.t1') }}</strong>
                <strong>{{ $t('banner.t2') }}</strong>
                <div class="txt">{{ $t('banner.profile') }}</div>
                <div class="btn" @click="jumpClaim">
                    {{ $t('btn.create') }}
                    <i class="iconfont icon-planet"></i>
                </div>
            </div>
            <img src="@/assets/pic/homeBanner.png" />
        </div>
    </div>

    <div v-if="type === 'createbox'" class="createbox">
        <div class="conbox">
            <i class="iconfont icon-planet"></i>
            <p>{{ $t('xc.txt') }}</p>
            <button @click="jumpClaim">{{ $t('btn.create') }}</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';

export default defineComponent({
    components: {},
    props: {
        type: {
            type: String,
            default: '',
        },
    },
    setup() {
        const router = useRouter();
        const openLogin: any = inject('openLogin', null);

        const jumpClaim = () => {
            if (!store.state.user_data) {
                openLogin();
                return;
            }
            router.push({
                name: 'roverClaim',
            });
        };

        return {
            jumpClaim,
        };
    },
});
</script>

<style lang="less" scoped>
.banner {
    @apply w-full mx-auto overflow-hidden;

    .box {
        @apply w-auto relative md:(mx-4 h-70 rounded-2xl) lg:(mx-5 h-100 rounded-3xl) xl:(mx-7 h-137) sm:(mx-4 h-60 rounded-xl) <sm:(mx-4 h-40 rounded-xl);
        background: url('@/assets/svg/bannerbg.svg');
        background-size: cover;

        .slogan {
            @apply w-full left-0 top-0 bottom-0 flex flex-col justify-center absolute sm:(pl-5) <sm:(pl-5) md:(pl-10) lg:(pl-15) xl:(pl-22);

            strong {
                @apply w-4/5 text-black font-bold lg:(text-3xl) xl:(text-5xl leading-15) md:(text-2xl) <sm:(w-3/5 text-base leading-5) sm:(text-lg leading-5);
            }

            .txt {
                @apply w-3/5 text-gray-800 lg:(text-base pt-6 pr-10) xl:(pt-10 pr-30 text-lg) 2xl:(text-xl pt-15 pr-40) md:(text-sm leading-4 pt-4 pr-10) sm:(text-sm leading-4 pt-4 pr-10) <sm:(hidden);
            }

            .btn {
                @apply bg-black text-white transition duration-300 flex justify-center items-center hover:(transition duration-300 bg-purple-500 cursor-pointer) sm:(w-45 mt-5 py-1 text-sm rounded-lg) <sm:(w-35 mt-5 py-2 text-xs rounded-lg) md:(w-50 mt-5 py-2 text-base rounded-2xl) lg:(w-60 mt-6 py-3 text-lg) xl:( w-70 mt-10 py-5 text-xl);
                i {
                    @apply text-white text-2xl ml-3 <sm:(text-sm ml-2);
                }
            }
        }

        img {
            @apply h-full float-right <sm:(rounded-tr-xl) md:(rounded-2xl) lg:(rounded-tr-3xl);
        }
    }
}

.createbox {
    @apply w-full mt-3;
    .conbox {
        @apply rounded-3xl sm:(rounded-2xl mx-5 py-8) <sm:(rounded-2xl mx-5 py-8) sm:(rounded-2xl mx-5 py-8) md:(rounded-2xl mx-5 py-12) lg:(mx-10 py-15) xl:(mx-20 py-25);
        background: url('@/assets/svg/createbg.svg') repeat-x;
        background-size: cover;
        i {
            @apply block mx-auto text-7xl text-white text-center font-normal <sm:(text-5xl);
        }
        p {
            @apply text-white text-center py-8 <sm:(text-xl px-6) sm:(text-xl px-6) md:(text-2xl px-20) lg:(text-3xl px-30) xl:(w-full px-70 text-4xl leading-13);
        }
        button {
            @apply border-none mt-5 w-65 py-5 block mx-auto rounded-full text-white text-lg text-center bg-gradient-to-r from-fuchsia-500 to-blue-600 transition duration-300 hover:(transition duration-300 bg-gradient-to-tr shadow-2xl bg-gray-900) <sm:(mt-0 py-3) sm:(mt-0 py-3);
        }
    }
}
</style>
