<template>
    <header :class="{ top: scrollTop !== 0 }">
        <div class="box">
            <img v-if="isPrivate" class="logo" src="@/assets/svg/home.svg" alt="logo" @click="jump('home')" />
            <img v-else class="logo" src="@/assets/svg/logos.svg" alt="logo" @click="jump('home')" />
            <div class="right">
                <el-tooltip v-if="route.name !== 'roverClaim'" effect="dark" :teleported="false"
                    :content="$t('roverComponents.header.btn')" placement="bottom">
                    <div class="mora-button" @click="jump('roverClaim')">
                        <i class="iconfont icon-add"></i>
                    </div>
                </el-tooltip>
                <div class="back" @click="globalOutLogin" v-if="!store.state.agent && store.state.metamask_agent_hex">
                    <i class="iconfont icon-logout"></i>
                    {{ $t('home.disconnectFrom') }}
                </div>
                <div v-else class="avatar" @click="jump('roverSetting')">
                    <img v-if="store.state.user_data && store.state.user_data.avatar"
                        :src="getImagesUrl(store.state.user_data.avatar)" alt="avatar" />
                    <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
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
                <div class="menu" @click="openMenu">
                    <i class="iconfont icon-category"></i>
                </div>
            </div>
        </div>
    </header>
    <Menu v-if="isMenu" @menuClose="menuClose" />
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Menu from './MenuM.vue';
import store from '@/store';
import { getImagesUrl } from '@/utils/functions';
import CONFIG from '@/assets/config';
import Notice from '@/components/Notice.vue';

export default defineComponent({
    components: { Menu, Notice },
    name: 'Header',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isMenu = ref(false);
        const scrollTop = ref(0);
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);
        const globalOutLogin = inject('globalOutLogin', null);

        const openMenu = () => {
            isMenu.value = true;
        };

        const menuClose = () => {
            isMenu.value = false;
        };

        const jump = (item) => {
            router.push({
                name: item,
            });
        };

        const handleScroll = () => {
            scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop;
        };

        const openHome = () => {
            if (CONFIG.indexPageLink) {
                window.open(CONFIG.indexPageLink);
                return;
            }
            router.push('/');
        };

        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
        };

        const isShowNotice = ref(false);
        const showNotice = () => {
            if (!isShowNotice.value) {
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.documentElement.style.overflow = 'auto';
            }
            isShowNotice.value = !isShowNotice.value;
        };

        const rootNotice = ref();
        const noticeClick = (e: { target: any }) => {
            if (!rootNotice?.value?.contains(e.target)) {
                isShowNotice.value = false;
            }
        };

        onUnmounted(() => {
            document.removeEventListener('click', noticeClick, false);
            document.removeEventListener('scroll', handleScroll, false);
        });

        onMounted(() => {
            document.addEventListener('click', noticeClick, false);
            document.addEventListener('scroll', handleScroll, false);
        });

        return {
            isMenu,
            scrollTop,
            route,
            store,
            globalOutLogin,
            rootNotice,
            isShowNotice,
            isPrivate,
            getImagesUrl,
            openMenu,
            menuClose,
            jump,
            openHome,
            selectMode,
            showNotice,
            noticeClick,
        };
    },
});
</script>

<style scoped lang="less">
header {
    position: fixed;
    top: 0;
    left: 0;
    .center();
    .padding(10, 0, 10, 0);
    width: 100vw;
    opacity: 1;
    transition: @transition;
    z-index: 9;

    .box {
        display: flex;
        width: 100%;
        max-width: 1512px;
        align-items: center;
    }

    .logo {
        display: flex;
        .margin(0, 0, 0, 30);
        .height(50);
        .width(50);
        cursor: pointer;
        transition: @transition;

        @media screen and (min-width: 0) and (max-width: 750px) {
            .margin(0, 0, 0, 15);
        }
    }

    .right {
        .center();
        .margin(0, 30, 0, 0);
        .height(50);
        flex: 1;
        justify-content: flex-end;
        transition: @transition;
        position: relative;

        @media screen and (min-width: 0) and (max-width: 750px) {
            .margin(0, 15, 0, 0);
        }

        .mora-button {
            .center();
            color: @text-color-inverse;
            background: @bg-color-body-active;
            .height(38);
            .border-radius(12);
            transition: @transition;
            .padding(0, 15, 0, 15);
            .margin(0, 0, 0, 0);
            cursor: pointer;

            &:hover {
                opacity: 0.85;
                transition: @transition;
            }

            &.backhome {
                .margin(0, 15, 0, 0);
                .padding(0, 13, 0, 13);
                background-color: @text-color;
                transition: @transition;

                &:hover {
                    cursor: pointer;
                    background-color: @text-active;
                    transition: @transition;
                }
            }

            .icon-add {
                .font-size(16);
            }

            @media screen and (min-width: 750px) and (max-width: 1240px) {
                .padding(0, 15, 0, 15);
            }
        }

        .avatar {
            .center();
            border-radius: 10px;
            .height(38);
            .width(38);
            .margin(0, 0, 0, 15);
            cursor: pointer;
            position: relative;

            img {
                width: 100%;
                .border-radius(10);
            }

            .dropDownBox {
                position: absolute;
                .top(10);
                right: -10px;
                display: none;
                .padding(30, 0, 0, 0);

                .dropDown {
                    .center();
                    .width(170);
                    background: @bg-color;
                    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.12);
                    .border-radius(10);
                    .font-size(14);
                    .padding(8, 0, 8, 0);

                    p {
                        .center();
                        font-style: normal;
                        font-weight: 400;
                        .height(45);
                        .width(150);
                        color: #000000;

                        i {
                            .font-size(16);
                            .padding(0, 6, 0, 0);
                        }

                        &:hover {
                            background: @bg-color-grey;
                            .border-radius(6);
                        }
                    }

                    &:hover {
                        display: flex;
                    }
                }
            }

            &:hover {
                .dropDownBox {
                    display: flex;
                }
            }
        }

        .notice,
        .mode {
            .center();
            border-radius: 10px;
            .height(38);
            .width(38);
            .margin(0, 0, 0, 15);
            background: #e8e8e8;
            cursor: pointer;
            transition: @transition;
            @apply dark:(bg-dark-300);

            i {
                font-size: 16px;
            }

            &:hover {
                background: @text-color;
                color: @text-color-inverse;
                transition: @transition;
                @apply dark:(bg-dark-100);
            }
        }

        .notice {
            @apply relative overflow-visible;

            span {
                @apply absolute w-2 h-2 rounded-full bg-red-500 top-5px right-5px;
            }

            :deep(.noticeBox) {
                .header {
                    @apply md:(mt-3 mb-5);

                    .icon-close {
                        @apply -top-8;
                    }
                }
            }
        }

        .menu {
            display: none;
            height: 100%;
            .margin(0, 0, 0, 20);

            .icon-category {
                .font-size(30);
                @apply dark:(text-light-900/80);
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                .center();
            }
        }
    }

    &.top {
        background: #fff;
        .padding(10, 0, 10, 0);
        box-shadow: 0 2px 8px @border-shadow;
        // opacity: 0;
        transition: @transition;
        z-index: 9;
        @apply dark:(bg-dark-900);

        .logo {
            .height(50);
            .width(50);
            transition: @transition;
        }

        .right {
            transition: @transition;
            .height(40);

            .mora-button {
                .border-radius(10);
                transition: @transition;
                .font-size(14);
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    header {
        .avatar {
            .dropDownBox {
                display: none !important;
            }
        }

        &.top {
            box-shadow: 0 3px 6px @border-shadow;
            .padding(10, 0, 10, 0);

            .logo {
                .height(70);
                .width(70);
            }
        }

        .right {
            .mora-button {
                display: none;

                &.backhome {
                    display: flex;
                    margin-right: 0;
                    .padding(0, 8, 0, 8);

                    i {
                        .font-size(14);
                    }
                }
            }

            .avatar {
                margin-left: 10px;
            }

            .notice,
            .clear {
                &:hover {
                    background: #e9ecef;
                    color: @text-color;
                }
            }
        }
    }
}

// .disconnectFrom {
//   @apply relative;
.back {
    @apply flex items-center w-30 justify-center bg-gray-200 text-dark-200 rounded-lg text-sm transition duration-300 dark:(bg-dark-300 text-light-900/80);
    .height(38);
    .margin(0, 0, 0, 15);
    cursor: pointer;

    // width: 120%;
    // height: 120%;
    // top: -10%;
    // left: -10%;
    i {
        @apply text-dark-100 mr-2 text-sm dark:(text-light-900/60);
    }
}

// }</style>
