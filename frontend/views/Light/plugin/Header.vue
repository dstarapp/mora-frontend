<template>
    <div class="header" :class="{ hfixed: scrollTop > 88 }">
        <div class="logo" @click="goUrl('lightHome')">
            <img src="@/assets/svg/editor-logo.svg" />
            <span>Light</span>
        </div>

        <div class="nav">
            <span class="active">Home<i></i></span>
            <span @click="goUrl('home')">Back to MORA<i></i></span>
        </div>

        <div class="right">
            <div class="connect" v-if="!store.state.agent && !store.state.metamask_agent_hex" @click="openLogin">
                {{ $t('btn.connect') }}
            </div>

            <el-skeleton class="user" animated v-if="!store.state.agent && store.state.metamask_agent_hex">
                <template #template>
                    <div class="flex items-center disconnectFrom">
                        <el-skeleton-item variant="image"
                            class="w-full w-10 h-10 rounded-lg mr-3 <sm:(w-8 h-8) 2xl:(w-11 h-11 rounded-xl)" />
                        <el-skeleton-item variant="text" style="width: 80px" />
                        <div class="back" @click="globalOutLogin">
                            <i class="iconfont icon-logout"></i>
                            {{ $t('home.disconnectFrom') }}
                        </div>
                    </div>
                </template>
            </el-skeleton>

            <div class="user" v-if="store.state.agent" ref="rootPoint">
                <div class="flex items-center" @click="showMenu">
                    <div class="avatar">
                        <img v-if="store.state.user_data && store.state.user_data.avatar"
                            :src="getImagesUrl(store.state.user_data.avatar)" />
                        <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                    </div>
                    <div class="name" translate="no">
                        {{
        address
            ? address
            : store.state.user_data
                ? dealPid(store.state.user_data.pid.toString())
                : ''
    }}
                    </div>
                    <i class="iconfont icon-arrow-down"></i>
                </div>
                <div class="userMenu" :class="{ show: isShowMenu }">
                    <InfoBox :address="address" :openLoginC="false" />
                </div>
            </div>
            <div class="mode" @click="selectMode">
                <i class="iconfont" :class="store.state.theme == 'dark' ? 'icon-light' : 'icon-dark'"></i>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch, onMounted, onUnmounted } from 'vue';
import store from '@/store';
import InfoBox from '../plugin/InfoBox.vue';
import { getImagesUrl, dealPid } from '@/utils/functions';
import { getIcnaming } from '@/utils/icnaming';
import { useRouter } from 'vue-router';

export default defineComponent({
    components: { InfoBox },
    setup() {
        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
            document.querySelectorAll('#root')[0].classList.add('homebg');
        };
        const openLogin: any = inject('openLogin', null);
        const globalOutLogin: any = inject('globalOutLogin', null);

        const isShowMenu = ref(false);
        const showMenu = () => {
            isShowMenu.value = !isShowMenu.value;
        };
        const rootPoint = ref();
        const handleClick = (e: { target: any }) => {
            if (!rootPoint?.value?.contains(e.target)) {
                isShowMenu.value = false;
            }
        };

        const userData: any = ref({});
        const address = ref();
        const init = async () => {
            if (userData.value.pid) {
                let addressRes = await getIcnaming(userData.value.pid);
                if (addressRes) {
                    address.value = addressRes;
                }
            }
        };

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (!val) {
                    address.value = '';
                }
                if (val && !address.value) {
                    address.value = '';
                    userData.value = val;
                    init();
                }
            },
        );

        const scrollTop = ref(0);
        const onScroll = () => {
            scrollTop.value =
                window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            isShowMenu.value = false;
        };

        onMounted(() => {
            window.addEventListener('scroll', onScroll);
            document.addEventListener('click', handleClick, false);
            let data: any = store.state.user_data;
            if (data) {
                userData.value = data;
                init();
            }
        });

        onUnmounted(() => {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('click', handleClick, false);
        });

        const router = useRouter();
        const goUrl = (str: string) => {
            router.push({ name: str });
        };

        return {
            selectMode,
            dealPid,
            handleClick,
            goUrl,
            showMenu,
            getImagesUrl,
            store,
            address,
            isShowMenu,
            scrollTop,
            openLogin,
            globalOutLogin,
            rootPoint,
        };
    },
});
</script>

<style lang="less" scoped>
.header {
    @apply w-full px-10 py-3 flex justify-between items-center <lg:(px-5);

    &.hfixed {
        @apply sticky bg-white shadow-lg shadow-dark-900/5 top-0 left-0 z-50 dark:(bg-dark-600);
        -webkit-animation: slide-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        animation: slide-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    }

    .logo {
        @apply h-12 flex items-center <sm:(h-9) hover:(cursor-pointer);

        img {
            @apply h-12 <sm:(h-9);
        }

        span {
            @apply text-2xl pl-3 font-bold <sm:(text-lg);
        }
    }

    .nav {
        @apply flex items-center <sm:(hidden);

        span {
            @apply mx-10 font-medium pb-10px relative <lg:(mx-4 text-sm);

            i {
                @apply w-1/2 h-1 hidden absolute bottom-0 left-1/2 -ml-1/4;
                background: linear-gradient(to right, #34d399, #7cee83);
            }

            &.active {
                i {
                    @apply block;
                }

                &:hover {
                    i {
                        animation: none;
                    }
                }
            }

            &:hover {
                @apply cursor-pointer;

                i {
                    @apply block;
                    -webkit-animation: scale-up-hor-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
                    animation: scale-up-hor-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
                }
            }
        }
    }

    .right {
        @apply flex items-center;

        .connect,
        .mora {
            @apply w-auto border transition duration-300 hover: (transition duration-300 cursor-pointer) 2xl:(h-11 leading-11 px-6 rounded-xl text-base) xl:(h-10 px-4 leading-10 rounded-xl) md:(h-9 leading-9 rounded-lg text-base) sm:(h-9 leading-8 rounded-lg px-3 text-sm) <sm:(h-8 leading-7 rounded-lg px-3 text-sm);
            .center();

            span {
                @apply <sm: (hidden);
            }
        }

        .connect {
            @apply text-green-500 border-green-500 hover:(bg-green-500 text-white);
        }

        .mora {
            @apply text-purple-500 border-purple-500 hover:(bg-purple-500 text-white) ml-4 <sm:(ml-3);
        }

        .mora {}

        .user {
            @apply w-auto flex items-center relative;

            .avatar {
                @apply overflow-hidden 2xl:(w-11 h-11 rounded-xl) xl:(w-10 h-10 rounded-xl) md:(w-9 h-9 rounded-lg) sm:(w-9 h-9 rounded-lg) <sm:(w-8 h-8 rounded-lg);

                img {
                    @apply w-full object-fill rounded-xl <sm:(rounded-lg);
                }
            }

            .name {
                @apply max-w-25 ml-2 truncate <sm:(hidden) dark:(text-light-900/80);
            }

            i {
                @apply text-gray-500 ml-1;
            }

            .userMenu {
                @apply absolute hidden z-50 <sm:(top-12 w-screen fixed right-0 max-h-[calc(100vh-3rem)] overflow-y-auto) sm: (top-12) md:(w-100 top-14 -right-12) lg:(top-15 -right-13) xl:(top-14) 2xl:(-right-15);

                &.show {
                    @apply block;
                }
            }

            &:hover {
                @apply cursor-pointer;
            }
        }

        .mode {
            @apply text-center ml-4 overflow-hidden transition duration-300 text-dark-600 border border-dark-600 dark:(text-white border-light-900/50) hover:(text-white bg-dark-700 transition duration-300 cursor-pointer dark:(bg-light-900/20 text-white)) 2xl:(w-11 h-11 leading-11 rounded-xl text-base) lg:(w-10 h-10 leading-10 rounded-xl text-lg) md:(w-9 h-9 leading-9 rounded-lg text-sm px-2) sm:(w-9 h-9 leading-9 rounded-lg text-sm) <sm:(w-8 h-8 leading-8 rounded-lg text-sm px-6px ml-3);
            .center();

            .icon-dark,
            .icon-light {
                @apply text-lg;
            }

            .icon-dark {
                @apply ml-1;
            }
        }
    }
}

@-webkit-keyframes scale-up-hor-center {
    0% {
        -webkit-transform: scaleX(0.4);
        transform: scaleX(0.4);
    }

    100% {
        -webkit-transform: scaleX(1);
        transform: scaleX(1);
    }
}

@keyframes scale-up-hor-center {
    0% {
        -webkit-transform: scaleX(0.4);
        transform: scaleX(0.4);
    }

    100% {
        -webkit-transform: scaleX(1);
        transform: scaleX(1);
    }
}
</style>
