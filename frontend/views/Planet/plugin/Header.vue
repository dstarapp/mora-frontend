<template>
    <header translate="yes" :class="{ top: scrollTop !== 0, isEditor: route.name === 'planetEditor' }">
        <div class="box">
            <img v-if="isPrivate" class="logo" src="@/assets/svg/home.svg" alt="logo" @click="jump('home')" />
            <img v-else class="logo" src="@/assets/svg/logos.svg" alt="logo" @click="jump('home')" />
            <span v-if="route.name === 'planetEditor'" @click="jump('planetDashboard')">
                {{ $t('planetDashboard.dashboard') }}
            </span>

            <div class="right">
                <Menu v-show="route.name !== 'planetEditor'" />

                <SwitchMora />

                <User v-show="route.name !== 'planetEditor'" />

                <Wallet v-if="isPermissions()" v-show="route.name !== 'planetEditor'" />

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
    <MenuM v-if="isMenu" @menuClose="menuClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuM from './MenuM.vue';
import Menu from './Menu.vue';
import SwitchMora from './SwitchMora.vue';
import User from './User.vue';
import store from '@/store';
import Wallet from '../Wallet/Index.vue';
import { isPermissions } from '@/utils/functions';
import Notice from '@/components/Notice.vue';

export default defineComponent({
    components: { MenuM, Menu, SwitchMora, User, Wallet, Notice },
    name: 'Header',
    setup() {
        const isMenu = ref(false);
        const route = useRoute();
        const router = useRouter();
        const scrollTop = ref(0);
        const isHeader = ref(true);
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);

        watch(
            () => store.state.isHeader,
            (val) => {
                isHeader.value = val;
            },
        );

        const openMenu = () => {
            isMenu.value = true;
        };

        const menuClose = () => {
            isMenu.value = false;
        };

        const jump = (item) => {
            if (item === 'home') {
                router.push({
                    name: item,
                });
            } else {
                router.push({
                    name: item,
                    params: {
                        id: route.params.id,
                    },
                });
            }
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

        const handleScroll = () => {
            scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop;
        };

        onMounted(() => {
            window.addEventListener('scroll', handleScroll, true);
            document.addEventListener('click', noticeClick, false);
        });

        onUnmounted(() => {
            document.removeEventListener('click', noticeClick, false);
        });

        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
        };

        return {
            store,
            isMenu,
            scrollTop,
            route,
            isShowNotice,
            rootNotice,
            isHeader,
            isPrivate,
            openMenu,
            menuClose,
            jump,
            isPermissions,
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
    .padding(10, 30, 10, 30);
    width: 100%;
    opacity: 1;
    transition: @transition;
    z-index: 99;
    box-sizing: border-box;

    &.isEditor {
        background: #fff;
        position: relative;
        min-width: 1000px;
        @apply dark:(bg-dark-600);
    }

    .box {
        display: flex;
        width: 100%;
        max-width: 1512px;
        align-items: center;

        >span {
            .center();
            cursor: pointer;
            font-weight: bold;

            &::before {
                content: '';
                margin: 0 17px;
                display: inline-flex;
                height: 29px;
                width: 1px;
                background-color: #d5d2d2;
            }
        }
    }

    .logo {
        display: flex;
        // .margin(0, 0, 0, 30);
        .height(50);
        .width(50);
        cursor: pointer;
        flex-shrink: 1;
        transition: @transition;
    }

    .right {
        .center();
        // .margin(0, 30, 0, 0);
        .height(50);
        flex: 1;
        justify-content: flex-end;
        transition: @transition;

        .notice,
        .mode {
            .center();
            border-radius: 8px;
            .height(26);
            .width(26);
            .margin(0, 0, 0, 20);
            cursor: pointer;
            transition: @transition;

            i {
                .font-size(22);
                @apply dark:(text-light-900/80);
            }
        }

        .notice {
            @apply relative overflow-visible ml-3;

            span {
                @apply absolute w-2 h-2 rounded-full bg-red-500 top-0 right-4px <sm:(right-2px -top-2px);
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
            .margin(0, 0, 0, 18);

            .icon-category {
                .font-size(26);
                @apply dark:(text-light-900/80);
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                .center();
            }
        }
    }

    &.top {
        background: #fff;
        .padding(10, 30, 10, 30);
        box-shadow: 0 1px 3px @border-shadow;
        // opacity: 0;
        transition: @transition;
        z-index: 9;
        @apply dark:(bg-dark-600);

        .logo {
            .height(50);
            .width(50);
            transition: @transition;
        }

        .right {
            transition: @transition;
            .height(35);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    header {
        .padding(10, 15, 10, 15);

        &.top {
            box-shadow: 0 3px 6px @border-shadow;
            .padding(10, 15, 10, 15);

            .logo {
                .height(70);
                .width(70);
            }
        }

        .right {
            .mode {
                .height(48);
                .width(48);
            }
        }
    }
}
</style>
