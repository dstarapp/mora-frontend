<template>
    <div class="info-box">
        <div class="hbar">
            <i class="iconfont icon-close" @click.stop="closeUser"></i>
        </div>
        <div class="con">
            <div class="flex justify-between items-center">
                <div class="userInfo">
                    <div class="userAvatar">
                        <img v-if="store.state.user_data && store.state.user_data.avatar"
                            :src="getImagesUrl(store.state.user_data.avatar)" />
                        <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                    </div>
                    <div class="userAddress">
                        <div class="userName" v-if="address">
                            {{ address }}
                        </div>
                        <span>{{
                store.state.user_data ? dealPid(store.state.user_data.pid) : ''
            }}</span>
                    </div>
                </div>
                <i class="iconfont icon-rarrow" @click="goUrl('roverPlanet')"></i>
                <!-- <i class="iconfont icon-close" @click.stop="closeUser"></i> -->
            </div>
            <div class="balance" @click="goUrl('roverWallet')">
                <div class="w-full text-black">{{ $t('user.balance') }}</div>
                <span class="price">{{
                store.state.wallet_balance ? store.state.wallet_balance.toFixed(4) : 0
            }}</span>
            </div>
            <div class="hidden <lg:(block)" v-if="myPlanetsBaseList && myPlanetsBaseList.length">
                <h3 v-if="myPlanetsBaseList.length">{{ $t('menu.planet') }}</h3>
                <div v-if="myPlanetsBaseList.length" class="read">
                    <div class="planet" v-for="item in myPlanetsBaseList" :key="item.id" @click="openPlanets(item)">
                        <img v-if="item.avatar" :src="getImagesUrl(item.avatar)" />
                        <img v-else src="@/assets/svg/defaultPlanet.png" alt="avatar" />
                        <span>{{ item.name }}</span>
                    </div>
                </div>
            </div>

            <h3 v-if="historyList.length">{{ $t('user.t1') }}</h3>
            <div v-if="historyList.length" class="read">
                <div class="planet" v-for="item in historyList" :key="item.id" @click="goHome(item.id)">
                    <i @click.stop="removeHistory(item)" class="iconfont icon-close"></i>
                    <img :src="item.avatar" alt="" />
                    <span>{{ item.name }}</span>
                </div>
            </div>
            <h3>
                {{ $t('user.t2') }}
                <!-- <i class="iconfont icon-setting" @click="goUrl('roverSetting')" /> -->
            </h3>
            <div class="menu">
                <el-tooltip :teleported="false" effect="dark" :content="$t('menu.planet')" placement="top">
                    <div v-if="!isPrivate" class="item" @click="goUrl('roverPlanet')">
                        <i class="iconfont icon-planet"></i>
                    </div>
                </el-tooltip>
                <el-tooltip :teleported="false" effect="dark" :content="$t('menu.subscribe')" placement="top">
                    <div class="item" @click="goUrl('roverPlanetSubscriptions')">
                        <i class="iconfont icon-dy"></i>
                    </div>
                </el-tooltip>
                <el-tooltip :teleported="false" effect="dark" :content="$t('menu.collection')" placement="top">
                    <div class="item" @click="goUrl('roverCollection')">
                        <i class="iconfont icon-collection"></i>
                    </div>
                </el-tooltip>
                <el-tooltip :teleported="false" effect="dark" :content="$t('roverComponents.menu.roverSetting.name')"
                    placement="top">
                    <div class="item" @click="goUrl('roverSetting')">
                        <i class="iconfont icon-setting"></i>
                    </div>
                </el-tooltip>
            </div>
            <div class="logout" @click="globalOutLogin(openLoginC)">
                <i class="iconfont icon-logout"></i>
                {{ $t('menu.logout') }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';
import bus from 'vue3-eventbus';
import { getImagesUrl, dealPid } from '@/utils/functions';

export default defineComponent({
    components: {},
    props: {
        address: {
            type: String,
            default: '',
        },
        openLoginC: {
            type: Boolean,
            default: false,
        },
    },
    name: 'InfoBox',
    emits: ['close'],
    setup(props, context) {
        const router = useRouter();
        const route = useRoute();
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);
        const openLogin = inject('openLogin', null);
        const globalOutLogin: any = inject('globalOutLogin', null);
        const historyList: any = inject('historyList', null);
        const myPlanetsBaseList: any = inject('myPlanetsBaseList', null);

        const goUrl = (str: string) => {
            nextTick(() => {
                router.push({
                    name: str,
                });
            });
        };

        const goHome = (id = '') => {
            router.push({
                name: 'browserHome',
                params: {
                    id: id ? id : route.params.id,
                },
            });
            context.emit('close');
        };

        const openPlanets = (item) => {
            if (!item) {
                return;
            }
            bus.emit('clearKeepAliveCache');
            nextTick(() => {
                router.push({
                    name: 'browserHome',
                    params: {
                        id: item.canister,
                    },
                });
                context.emit('close');
            });
        };

        const removeHistory = (item) => {
            bus.emit('removeHistory', item);
        };

        onUnmounted(() => {
            document.documentElement.style.overflow = 'auto';
        });

        const closeUser = () => {
            context.emit('close');
        };

        return {
            store,
            historyList,
            openLogin,
            globalOutLogin,
            myPlanetsBaseList,
            isPrivate,
            openPlanets,
            goUrl,
            goHome,
            getImagesUrl,
            dealPid,
            removeHistory,
            closeUser,
        };
    },
});
</script>

<style scoped lang="less">
.info-box {
    @apply w-100 pt-5 px-5 bg-white border border-light-500 rounded-xl shadow-lg absolute z-100 shadow-gray-900/10 <sm:(w-full h-screen fixed flex flex-col rounded-none left-0 top-0 right-0) md:(top-14 -right-12) lg:(top-15 -right-13) xl:(top-18) 2xl:(-right-15) dark:(bg-dark-800 border-dark-300);
    .noScrollbar();

    h3 {
        @apply w-full py-4 font-medium flex justify-between items-center dark:(text-light-900);

        i {
            @apply transition duration-300 hover:(transition duration-300 text-gray-600 dark:(text-light-900/80));
        }
    }

    .userInfo {
        @apply flex-1 flex items-center;

        .userAvatar {
            @apply w-12 h-12 rounded-xl overflow-hidden mr-4;
            flex-shrink: 1;

            img {
                @apply w-full h-full rounded-xl;
            }
        }

        .userAddress {
            @apply w-auto;
        }

        .userName {
            @apply text-base font-medium block max-w-40 truncate dark:(text-light-900/80);
        }

        span {
            @apply w-auto text-xs rounded-2xl px-2 py-2px mt-1 bg-light-700 text-gray-400 dark:(bg-dark-300);
        }
    }

    .icon-rarrow {
        @apply text-2xl text-gray-400 transition duration-300 hover:(text-black transition duration-300 cursor-pointer dark:(text-light-900/50)) dark:(text-light-900/80);
    }

    .hbar {
        @apply w-full pb-3 hidden pb-3 text-right bg-white text-gray-500 dark:(text-dark-50 bg-dark-800) <sm:(block);
    }

    .con {
        @apply w-full overflow-y-scroll <sm:(pb-20);
        .noScrollbar();
        display: flex;
        flex-direction: column;
    }

    .balance {
        background: linear-gradient(155deg, #2aeebf 20%, #87ff69 80%);
        @apply w-full rounded-2xl mt-5 py-4 px-6 transition duration-300 hover:(transition duration-300 shadow-bg-green-600/10 shadow-lg cursor-pointer);

        .price {
            @apply pt-2 text-2xl block break-words text-black font-bold;
        }
    }

    .read {
        white-space: nowrap;
        overflow-x: auto;

        &::-webkit-scrollbar {
            @apply h-6px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            @apply h-8px bg-gray-200 dark:(bg-dark-100);
        }

        .planet {
            display: inline-block;
            @apply w-1/3 px-3 pt-3 pb-2 rounded-xl text-gray-600 transition duration-300 relative hover:(transition duration-300 cursor-pointer bg-light-600 <sm:(bg-none) dark:(bg-dark-300)) dark:(text-light-900/80);

            i {
                @apply rounded-full hidden absolute right-2 top-2 text-sm text-gray-500 text-center transform scale-80 <sm:(flex);
            }

            img {
                @apply w-13 h-13 rounded-full mx-auto;
            }

            span {
                @apply block w-full text-center pt-2 text-gray-600 text-sm truncate dark:(text-light-900/60);
            }

            &:hover {
                i {
                    display: flex;
                }
            }
        }
    }

    .menu {
        @apply w-full flex mb-5 justify-between items-center;

        .item {
            @apply w-1/5 border border-light-800 rounded-xl px-4 py-2 flex flex-row-reverse items-center justify-between transition duration-300 hover:(transition duration-300 bg-light-600 cursor-pointer dark:(bg-dark-400 text-light-900/80)) dark:(border-dark-100);

            &:hover {
                i {
                    @apply text-black;
                }
            }

            i {
                @apply text-lg block mx-auto transition duration-300 dark:(text-light-900/60);

                &.icon-collection {
                    @apply text-xl;
                }
            }

            span {
                @apply flex-1 text-left text-sm text-gray-600 dark:(text-light-900/80);
            }
        }
    }

    .logout {
        @apply w-full border-t border-light-800 text-center py-3 text-gray-600 cursor-pointer <sm:(border py-3 mb-8 rounded-xl) dark:(border-dark-300 text-light-900/80);

        i {
            @apply mr-1 dark:(text-light-900/80);
        }
    }
}
</style>
