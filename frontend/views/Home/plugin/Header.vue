<template>
    <div class="header" :class="{ hfixed: scrollTop > 88 }">
        <div class="hbox">
            <div @click="goHome" class="logo">
                <img v-if="store.state.theme === 'light' && route.name !== 'homeActivity'"
                    src="@/assets/svg/logo-light.svg" />
                <img v-else src="@/assets/svg/logo-dark.svg" />
            </div>

            <div class="search" :class="{ active: keywords.length > 0 }"
                v-if="currentUrl || (!currentUrl && scrollTop > 280)">
                <i class="iconfont icon-search"></i>
                <input type="text" v-model="keywords" @keydown.enter="search" />
                <i class="iconfont icon-close" v-show="keywords.length > 0" @click="clear"></i>
            </div>

            <div class="flex items-center">
                <i class="iconfont icon-search mr-4 text-gray-500 text-xl <sm:(flex) sm:(hidden)"
                    @click="isShowMsearch = true"></i>
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
                        <div class="name">
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
                    <Transition name="slidedown">
                        <InfoBox @click.stop="" :address="address" @close="showMenu" v-if="isShowMenu" />
                    </Transition>
                </div>

                <div class="mode" @click="selectMode">
                    <i class="iconfont" :class="store.state.theme == 'dark' ? 'icon-light' : 'icon-dark'"></i>
                </div>

                <div class="notice" @click.stop="showNotice" ref="rootNotice">
                    <i class="iconfont icon-notice"></i>
                    <transition name="el-fade-in">
                        <span v-show="store.state.notice_list.length" />
                    </transition>
                    <Transition name="slidedown">
                        <Notice v-if="isShowNotice" @close="showNotice" />
                    </Transition>
                </div>
            </div>
        </div>
    </div>
    <div class="msearch" v-if="isShowMsearch">
        <i class="iconfont icon-arrow-up" @click="isShowMsearch = false"></i>
        <div class="search" :class="{ active: keywords.length > 0 }">
            <i class="iconfont icon-search"></i>
            <input type="text" v-model="keywords" @keydown.enter="search" />
            <i class="iconfont icon-close" v-show="keywords.length > 0" @click="clear"></i>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch, inject, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/store';
import InfoBox from '@/components/InfoBox.vue';
import { getIcnaming } from '@/utils/icnaming';
import { getImagesUrl, dealPid, isMobile } from '@/utils/functions';
import bus from 'vue3-eventbus';
import Notice from '@/components/Notice.vue';

export default defineComponent({
    components: { InfoBox, Notice },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const keywords = ref('');
        const address = ref();
        const userData: any = ref({});
        const scrollTop = ref(0);
        const isShowMsearch = ref(false);
        const isShowMenu = ref(false);
        const isLoading = ref(true);
        const openLogin: any = inject('openLogin', null);
        const globalOutLogin: any = inject('globalOutLogin', null);
        const searchHistory: any = inject('searchHistory', null);
        const isShowNotice = ref(false);
        const showNotice = () => {
            if (!isShowNotice.value) {
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.documentElement.style.overflow = 'auto';
            }
            isShowNotice.value = !isShowNotice.value;
            if (isShowMenu.value) {
                isShowMenu.value = false;
            }
        };

        const rootNotice = ref();
        const noticeClick = (e: { target: any }) => {
            if (!rootNotice?.value?.contains(e.target)) {
                isShowNotice.value = false;
            }
        };

        const onScroll = () => {
            scrollTop.value =
                window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            isShowMenu.value = false;
        };

        const clear = () => {
            keywords.value = '';
        };

        const search = () => {
            if (route.name === 'homeIndex') {
                if (!keywords.value) {
                    return;
                }
                router.push({
                    name: 'homeSearch',
                    params: {
                        keyword: keywords.value,
                    },
                });
                searchHistory.record(keywords.value);
                nextTick(() => {
                    bus.emit('updateSearchHistory');
                });
            } else {
                if (!keywords.value) {
                    router.push({
                        name: 'homeIndex',
                    });
                    return;
                }
                router.push({
                    name: 'homeSearch',
                    params: {
                        keyword: keywords.value,
                    },
                });
                searchHistory.record(keywords.value);
                nextTick(() => {
                    bus.emit('updateSearchHistory');
                });
            }
        };

        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
            document.querySelectorAll('#root')[0].classList.add('homebg');
        };

        const goHome = () => {
            keywords.value = '';
            router.push({
                name: 'homeIndex',
            });
        };

        const homeSearchKeyword = (keyword) => (keywords.value = keyword);

        const init = async () => {
            if (userData.value.pid) {
                const addressRes = await getIcnaming(userData.value.pid);
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

        onUnmounted(() => {
            window.removeEventListener('scroll', onScroll);
            bus.off('homeSearchKeyword', homeSearchKeyword);
            document.removeEventListener('click', handleClick, false);
            document.querySelectorAll('#root')[0].classList.remove('homebg');
            document.removeEventListener('click', noticeClick, false);
        });

        onMounted(() => {
            window.addEventListener('scroll', onScroll);
            bus.on('homeSearchKeyword', homeSearchKeyword);
            document.addEventListener('click', handleClick, false);
            document.addEventListener('click', noticeClick, false);

            if (route.params.keyword) {
                keywords.value = route.params.keyword as string;
            }

            const data: any = store.state.user_data;
            if (data) {
                userData.value = data;
                init();
            }

            document.querySelectorAll('#root')[0].classList.add('homebg');
        });

        const showMenu = () => {
            if (isMobile() && !isShowMenu.value) {
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.documentElement.style.overflow = 'auto';
            }
            isShowMenu.value = !isShowMenu.value;
        };

        const rootPoint = ref();
        const handleClick = (e: { target: any }) => {
            if (!rootPoint?.value?.contains(e.target)) {
                isShowMenu.value = false;
            }
        };

        const currentUrl = ref(false);
        watch(
            () => router.currentRoute.value.path,
            (newValue, oldValue) => {
                if (newValue.indexOf('/search/') !== -1) {
                    currentUrl.value = true;
                } else {
                    currentUrl.value = false;
                }
            },
            { immediate: true },
        );

        const goPlugin = () => {
            router.push({ name: 'lightHome' });
        };

        return {
            store,
            keywords,
            scrollTop,
            isShowMsearch,
            isLoading,
            userData,
            address,
            openLogin,
            rootPoint,
            isShowMenu,
            rootNotice,
            route,
            currentUrl,
            isShowNotice,
            globalOutLogin,
            onScroll,
            clear,
            close,
            selectMode,
            search,
            getImagesUrl,
            dealPid,
            goHome,
            showMenu,
            handleClick,
            goPlugin,
            showNotice,
            noticeClick,
        };
    },
});
</script>

<style lang="less" scoped>
.header {
    @apply w-full;

    &.hfixed {
        @apply sticky bg-white shadow-lg shadow-dark-900/5 top-0 left-0 z-50 dark:(bg-dark-600);
        -webkit-animation: slide-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        animation: slide-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    }

    .hbox {
        @apply mx-auto max-w-384 flex justify-between items-center sm: (h-13 px-4) <sm:(h-13 px-4) md:(h-14 px-7) lg:(h-16 px-10) xl:(w-full h-16 px-20) 2xl:(w-full px-8);

        .logo {
            @apply 2xl: (h-11) lg:(h-10) md:(h-9) sm:(h-8) <sm:(h-8);
            cursor: pointer;

            img {
                @apply h-full w-auto;
            }
        }

        .search {
            @apply mx-auto bg-white border-2 border-gray-200 flex items-center relative transition duration-300 xl: (w-150 h-12) lg:(w-120 h-10 rounded-xl) md:(w-80 h-9 rounded-lg) sm:(w-70 h-9 rounded-lg) <sm:(hidden) dark:(bg-dark-600 border-dark-100);

            &:hover,
            &.active {
                @apply border-2 border-gray-400 transition duration-300;
            }

            i {
                @apply mr-4 ml-4 text-gray-300;

                &.icon-close {
                    @apply text-gray-400 hover: (cursor-pointer);
                }
            }

            form {
                @apply flex-1;
            }

            input {
                @apply flex-1 border-none w-full h-full text-gray-400 text-black bg-transparent xl: (leading-12) lg:(leading-10 text-base) md:(leading-9) sm:(leading-9 text-sm) dark:(text-light-900/80);

                &::placeholder {
                    @apply text-gray-400;
                }
            }

            .related {
                @apply w-full absolute bg-white shadow-black/15 shadow-lg z-50 overflow-hidden xl: (top-12) lg:(rounded-xl top-10) md:(rounded-lg top-9) sm:(rounded-lg top-9) dark:(bg-dark-600);

                .items {
                    @apply max-h-145 overflow-y-auto;

                    .item {
                        @apply w-full px-5 py-3 flex items-center border-b border-light-700 dark:(border-dark-300);

                        &:last-child {
                            @apply border-none;
                        }

                        &:hover {
                            @apply bg-light-500 cursor-pointer transition duration-300 dark:(bg-dark-300);
                        }

                        .avatar {
                            @apply w-10 h-10 rounded-full mr-4;

                            img {
                                @apply rounded-full;
                            }
                        }

                        .planetbox {
                            @apply flex-1;

                            .name {
                                @apply w-full block truncate dark:(text-white);
                            }

                            .data {
                                @apply w-full flex;

                                span {
                                    @apply text-gray-400 text-sm pr-4;
                                }
                            }
                        }
                    }
                }

                .loading {
                    @apply w-full py-4;

                    img {
                        @apply w-8 block mx-auto;
                    }
                }
            }
        }

        .connect,
        .plugin {
            @apply w-auto border transition duration-300 hover: (transition duration-300 cursor-pointer) 2xl:(h-11 px-6 rounded-xl text-base) xl:(h-10 px-4 rounded-xl) md:(h-9 rounded-lg text-base) sm:(h-9 rounded-lg px-3 text-sm) <sm:(h-8 rounded-lg px-2 text-sm);

            span {
                @apply <sm: (hidden);
            }
        }

        .connect {
            @apply text-purple-500 border-purple-500 hover:(bg-purple-500 text-white);
            .center();
        }

        .plugin {
            @apply ml-4 text-green-500 border-green-500 hover:(bg-green-500 text-white) <sm:(ml-3);
        }

        .user {
            @apply w-auto flex items-center relative xl: (h-20) lg:(h-17) md:(h-14) sm:(h-13) <sm:(h-13);
            .noScrollbar();

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

            &:hover {
                @apply cursor-pointer;
            }
        }

        .rss,
        .mode,
        .notice {
            @apply flex-shrink-0 text-center ml-4 overflow-hidden transition duration-300 text-dark-600 border border-dark-600 dark:(text-white border-light-900/50) hover:(text-white bg-dark-700 transition duration-300 cursor-pointer <sm:(bg-transparent text-black) dark:(bg-light-900/20 text-white)) 2xl:(w-11 h-11 leading-11 rounded-xl text-base) lg:(w-10 h-10 leading-10 rounded-xl text-lg) md:(w-9 h-9 leading-9 rounded-lg text-sm px-2) sm:(w-9 h-9 leading-9 rounded-lg text-sm) <sm:(w-8 h-8 leading-8 rounded-lg text-sm px-6px ml-3);
            .center();

            .icon-dark,
            .icon-light {
                @apply text-lg;
            }

            .icon-dark {
                @apply ml-1;
            }
        }

        .notice {
            @apply relative overflow-visible;

            span {
                @apply absolute w-2 h-2 rounded-full bg-red-500 top-5px right-5px;
            }
        }

        .rss {
            @apply border-yellow-500 bg-yellow-500 text-white hover:(border-yellow-600 bg-yellow-600 <lg:(border-yellow-500 bg-yellow-500) dark:(bg-yellow-600 border-yellow-600));
        }
    }
}

.msearch {
    @apply <sm: (h-13 px-4 flex items-center fixed top-0 w-full bg-white z-99) sm:(hidden) dark:(bg-dark-600);

    i {
        @apply text-2xl text-gray-500 transform -rotate-90 mr-4;
    }

    .search {
        @apply flex-1 mr-1 h-9 rounded-lg bg-white border-2 border-gray-200 flex items-center relative transition duration-300 dark:(bg-dark-600 border-dark-300);

        &:hover,
        &.active {
            @apply border-2 border-gray-400 transition duration-300;
        }

        i {
            @apply mr-4 ml-4 text-gray-300 text-base rotate-0;

            &.icon-close {
                @apply text-gray-400 text-sm hover: (cursor-pointer);
            }
        }

        form {
            @apply flex-1;
        }

        input {
            @apply flex-1 border-none w-full h-full leading-8 text-gray-400 rounded-xl text-black text-sm bg-transparent dark:(text-light-900/80);

            &::placeholder {
                @apply text-gray-400;
            }
        }

        .related {
            @apply w-full absolute bg-white shadow-black/15 shadow-lg z-50 rounded-xl top-9 dark:(bg-dark-600);

            .items {
                @apply max-h-145 overflow-y-auto;

                .item {
                    @apply w-full px-5 py-2 flex items-center border-b border-light-700 dark:(border-dark-300);

                    &:last-child {
                        @apply border-none;
                    }

                    &:hover {
                        @apply bg-light-500 cursor-pointer dark:(bg-dark-300);
                    }

                    .avatar {
                        @apply w-8 h-8 rounded-full mr-4;

                        img {
                            @apply rounded-full;
                        }
                    }

                    .planetbox {
                        @apply flex-1;

                        .name {
                            @apply w-full block text-sm truncate dark:(text-white);
                        }

                        .data {
                            @apply w-full flex;

                            span {
                                @apply text-gray-400 text-xs pr-4;
                            }
                        }
                    }
                }
            }

            .loading {
                @apply w-full py-3;

                img {
                    @apply w-7 block mx-auto;
                }
            }
        }
    }
}

.disconnectFrom {
    @apply relative;

    .back {
        @apply flex items-center justify-center absolute w-full h-full opacity-0 bg-gray-200 text-dark-200 rounded-lg text-sm transition duration-300 dark:(bg-dark-300 text-light-900/80);

        i {
            @apply text-dark-100 mr-2 text-sm dark:(text-light-900/60);
        }
    }

    &:hover {
        .back {
            @apply opacity-100 transition duration-300;
        }
    }
}
</style>
