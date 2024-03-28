<template>
    <el-skeleton animated class="header"
        v-if="!browserPlanetUserData || (!store.state.agent && store.state.metamask_agent_hex)">
        <template #template>
            <div class="h-10 2xl:(h-13) flex items-center cursor-pointer">
                <el-skeleton-item variant="image" class="w-10 h-10 rounded-full mr-3 <sm:(w-8 h-8)" />
                <span class="<sm:(hidden)">
                    <el-skeleton-item variant="text" style="width: 80px" />
                </span>
            </div>
            <div class="flex items-center">
                <div class="user disconnectFrom">
                    <el-skeleton-item variant="image" class="w-10 h-10 rounded-lg mr-3 <sm:(w-8 h-8)" />
                    <el-skeleton-item variant="text" style="width: 80px" />
                    <div class="back" @click="globalOutLogin(false)">
                        <i class="iconfont icon-logout"></i>
                        {{ $t('home.disconnectFrom') }}
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>

    <div class="header" :class="{ Hfixed: isFixed }" v-else>
        <div class="h-10 2xl:(h-13) flex items-center cursor-pointer" @click="goHome('')">
            <img v-if="route.name !== 'browserHome' &&
            browserPlanetUserData &&
            browserPlanetUserData.avatar
            " :src="getImagesUrl(browserPlanetUserData.avatar)" class="w-10 h-10 rounded-full mr-3 <sm:(w-8 h-8)"
                alt="avatar" />
            <img v-else-if="isPrivate" src="@/assets/svg/home.svg" class="w-10 h-10 rounded-full mr-3 <sm:(w-8 h-8)"
                alt="avatar" />
            <img v-else src="@/assets/svg/logos.svg" class="w-10 h-10 rounded-full mr-3 <sm:(w-8 h-8)" alt="avatar" />
            <span v-if="route.name !== 'browserHome'" class="planetName">
                {{ browserPlanetUserData ? browserPlanetUserData.name : 'loading...' }}
            </span>
        </div>

        <div class="flex items-center">
            <transition name="slideright">
                <div class="search" v-if="isShowSearch">
                    <i class="iconfont icon-search text-gray-300"></i>
                    <input type="search" v-model="keywords" focus @keydown.enter="search" />
                    <i class="iconfont icon-close font-14 text-gray-500 hover:(cursor-pointer)" @click="clear"></i>
                </div>
            </transition>
            <i v-if="route.name && !isShowSearch && route.name !== 'browserArticle'" class="iconfont icon-search"
                @click="openSearch"></i>
            <el-skeleton animated v-if="!store.state.user_data && store.state.agent">
                <template #template>
                    <div class="flex items-center">
                        <div class="user">
                            <el-skeleton-item variant="image"
                                class="w-full w-10 h-10 rounded-lg mr-3 <sm:(w-8 h-8) 2xl:(w-11 h-11 rounded-xl)" />
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </div>
                    </div>
                </template>
            </el-skeleton>
            <div class="user" v-if="store.state.user_data" ref="rootPoint">
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
                <Transition name="slidedown">
                    <InfoBox @click.stop="" :address="address" @close="showMenu" v-if="isShowMenu" />
                </Transition>
            </div>
            <div v-if="!store.state.agent" class="login" @click="openLogin">
                <i class="iconfont icon-user font-18"></i>
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
    <Rss v-if="isShowRss" @close="showRss" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted, inject } from 'vue';
import bus from 'vue3-eventbus';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';
import { getImagesUrl, dealPid, isMobile } from '@/utils/functions';
import LeftSide from './LeftSide.vue';
import InfoBox from '@/components/InfoBox.vue';
import { getIcnaming } from '@/utils/icnaming';
import Notice from '@/components/Notice.vue';
import Rss from '@/components/Rss.vue';

export default defineComponent({
    components: { LeftSide, InfoBox, Notice, Rss },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const keywords = ref('');
        const isShowPlanet = ref(false);
        const isShowSearch = ref(false);
        const isFixed = ref(false);
        const scrollTop = ref(0);
        const userData: any = ref({});
        const address = ref();
        const openLogin: any = inject('openLogin', null);
        const globalOutLogin: any = inject('globalOutLogin', null);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const isShowMenu = ref(false);
        const isShowNotice = ref(false);
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);

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
        const isShowRss = ref(false);
        const showRss = () => {
            isShowRss.value = !isShowRss.value;
        };

        const goUrl = (str: string) => {
            router.push({
                name: str,
            });
        };

        const goHome = (id = '') => {
            if (route.name === 'browserHome') {
                router.push({
                    name: 'home',
                });
                return;
            }
            router.push({
                name: 'browserHome',
                params: {
                    id: id ? id : route.params.id,
                },
            });
        };

        const clear = () => {
            if (keywords.value != '') {
                keywords.value = '';
            } else {
                isShowSearch.value = false;
            }
        };

        const searchClear = () => {
            keywords.value = '';
            isShowSearch.value = false;
        };

        const showPlanet = () => {
            isShowPlanet.value = !isShowPlanet.value;
        };

        const onScroll = () => {
            scrollTop.value =
                window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            isShowMenu.value = false;
        };

        const search = () => {
            bus.emit('browserSearch', keywords.value);
        };

        const openSearch = () => {
            isShowSearch.value = true;
        };

        const headerClose = () => {
            setTimeout(() => {
                isFixed.value = false;
            }, 50);
        };

        const startSubscribing = () => {
            isShowPlanet.value = false;
        };

        const init = async () => {
            if (userData.value.pid) {
                let addressRes = await getIcnaming(userData.value.pid);
                if (addressRes) {
                    address.value = addressRes;
                } else {
                    address.value = '';
                }
            }
        };

        watch(
            () => scrollTop.value,
            (newVal, oldVal) => {
                if (oldVal > newVal && oldVal > 60) {
                    isFixed.value = true;
                } else {
                    isFixed.value = false;
                }
            },
        );

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val && !address.value) {
                    address.value = '';
                    userData.value = val;
                    init();
                }
            },
        );

        watch(
            () => store.state.agent,
            (val: any) => {
                if (!val) {
                    address.value = '';
                    userData.value = '';
                }
            },
        );

        watch(
            () => route.name,
            (val: any) => {
                if (val) {
                    isShowSearch.value = false;
                }
            },
            {
                deep: true,
            },
        );

        onUnmounted(() => {
            window.removeEventListener('scroll', onScroll);
            window.addEventListener('browserSearchClear', searchClear);
            bus.off('browserSearchClear', searchClear);
            bus.off('browserHeaderClose', headerClose);
            bus.off('startSubscribing', startSubscribing);
            document.removeEventListener('click', handleClick, false);
            document.removeEventListener('click', noticeClick, false);
        });

        onMounted(() => {
            window.addEventListener('scroll', onScroll);
            bus.on('browserSearchClear', searchClear);
            bus.on('browserHeaderClose', headerClose);
            bus.on('startSubscribing', startSubscribing);
            document.addEventListener('click', handleClick, false);
            document.addEventListener('click', noticeClick, false);

            let data: any = store.state.user_data;
            if (data) {
                userData.value = data;
                init();
            }
        });

        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
        };

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

        return {
            address,
            browserPlanetUserData,
            store,
            userData,
            keywords,
            isShowPlanet,
            isShowSearch,
            isFixed,
            scrollTop,
            route,
            isShowMenu,
            rootPoint,
            globalOutLogin,
            rootNotice,
            isShowNotice,
            isShowRss,
            openLogin,
            isPrivate,
            goUrl,
            goHome,
            close,
            clear,
            showPlanet,
            openSearch,
            getImagesUrl,
            search,
            dealPid,
            searchClear,
            selectMode,
            showMenu,
            handleClick,
            showNotice,
            noticeClick,
            showRss,
        };
    },
});
</script>

<style lang="less" scoped>
.header {
    backdrop-filter: saturate(180%) blur(12px);
    background: rgba(255, 255, 255, 0.8);
    @apply w-full px-8 py-2 flex justify-between items-center bg-white/80 <sm: (px-4 shadow-gray-100) dark:(bg-dark-900/80);
    z-index: 99;

    .planetName {
        @apply max-w-80 block truncate <sm:(hidden) dark:(text-gray-200);
    }

    .icon-search {
        @apply text-gray-500 mr-5 cursor-pointer text-base <sm:(mr-3 text-xl) transition dark:(text-gray-400) hover:(transition duration-300 text-gray-600 dark:(text-white)) 2xl:(text-xl);
    }

    .login {
        @apply flex items-center justify-center text-dark-600 border border-dark-600 dark:(text-white border-light-900/50) font-semibold transition duration-300 text-center 2xl: (w-11 h-11 rounded-xl) lg:(w-10 h-10 rounded-xl) md:(w-9 h-9 rounded-lg) hover:(cursor-pointer text-light-100 bg-purple-500 border border-purple-500 transition duration-300 dark:(bg-purple-500 text-white)) <sm:(w-8 h-8 rounded-lg);
    }

    .search {
        @apply w-100 h-10 mr-3 flex items-center overflow-hidden bg-white dark:(bg-dark-600) <lg: (w-screen h-14 top-0 left-0 px-3 fixed z-10);
        transition: 0.3s all linear;

        i {
            @apply mr-3 ml-3;
        }

        form {
            @apply flex-1;
        }

        input {
            @apply flex-1 border-none w-full bg-transparent leading-8 text-gray-400 rounded-xl text-black text-sm dark:(text-white);

            &::-webkit-search-cancel-button {
                -webkit-appearance: none;
            }
        }
    }

    .user {
        @apply w-auto flex items-center relative h-10 xl: (h-12);
        .noScrollbar();

        .avatar {
            @apply overflow-hidden 2xl:(w-11 h-11) xl:(w-10 h-10 rounded-xl) md:(w-9 h-9 rounded-lg) sm:(w-9 h-9 rounded-lg) <sm:(w-8 h-8 rounded-lg);

            img {
                @apply w-full object-fill rounded-xl <sm:(rounded-lg);
            }
        }

        .name {
            @apply max-w-25 ml-2 truncate <lg:(hidden) dark:(text-light-900/80);
        }

        i {
            @apply text-gray-500 ml-1 dark:(text-gray-300);
        }

        :deep(.infobox) {
            @apply md:(top-12) lg:(top-13) xl:(top-14);
        }

        &:hover {
            @apply cursor-pointer;
        }
    }

    .icon-category {
        @apply text-2xl dark:(text-gray-400);
    }

    .rss,
    .notice,
    .mode {
        @apply text-center ml-4 overflow-hidden transition duration-300 text-dark-600 border border-dark-600 2xl:(w-11 h-11) xl:(w-10 h-10 rounded-xl) md:(w-9 h-9 rounded-lg) sm:(w-9 h-9 rounded-lg) <sm:(w-8 h-8 rounded-lg) dark:(text-white border-light-900/50) hover:(text-white bg-dark-700 transition duration-300 cursor-pointer <sm:(bg-transparent text-black) dark:(bg-light-900/20 text-white)) 2xl:(w-11 h-11 leading-11 rounded-xl text-base) lg:(w-10 h-10 leading-10 rounded-xl text-lg) md:(w-9 h-9 leading-9 rounded-lg text-sm px-2) sm:(w-9 h-9 leading-9 rounded-lg text-sm ml-3) <sm:(w-8 h-8 leading-8 rounded-lg text-sm px-6px ml-3);
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
        @apply relative overflow-visible flex-shrink-0;

        span {
            @apply absolute w-2 h-2 rounded-full bg-red-500 top-5px right-5px;
        }
    }

    .rss {
        @apply border-yellow-500 bg-yellow-500 text-white hover:(border-yellow-600 bg-yellow-600 <lg:(border-yellow-500 bg-yellow-500) dark:(bg-yellow-600 border-yellow-600));
    }
}

.el-dropdown-link {
    @apply flex items-center;
}

.el-icon--right {
    margin-left: 5px;
}

:deep(.el-dropdown-menu__item) {
    @apply py-2;

    i {
        @apply mr-3;
    }

    &:hover {
        background-color: #f6f6f6;
        color: black;
    }

    .logout {
        @apply w-full flex items-center justify-center;
    }
}

.modalbg {
    @apply fixed w-screen h-screen bg-dark-900/30 top-0 left-0 z-150 backdrop-filter backdrop-blur-md;
}

.sleft-enter-active {
    -webkit-animation: s-left 0.3s ease-out;
    animation: s-left 0.3s ease-out;
}

.sleft-leave-active {
    -webkit-animation: s-right 0.3s ease-out;
    animation: s-right 0.3s ease-out;
}

@keyframes s-left {
    0% {
        -webkit-transform: translateX(300px);
        transform: translateX(300px);
    }

    100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }
}

@-webkit-keyframes s-left {
    0% {
        -webkit-transform: translateX(300px);
        transform: translateX(300px);
    }

    100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }
}

@keyframes s-right {
    0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }

    100% {
        -webkit-transform: translateX(300px);
        transform: translateX(300px);
    }
}

@-webkit-keyframes s-right {
    0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }

    100% {
        -webkit-transform: translateX(300px);
        transform: translateX(300px);
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
