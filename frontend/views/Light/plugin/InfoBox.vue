<template>
    <div class="info-box">
        <div class="hbar">
            <i class="iconfont icon-close" @click.stop="closeUser"></i>
        </div>
        <div class="con">
            <div class="flex justify-between items-center">
                <div class="userInfo">
                    <div class="userAvatar">
                        <img
                            v-if="store.state.user_data && store.state.user_data.avatar"
                            :src="getImagesUrl(store.state.user_data.avatar)"
                        />
                        <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                    </div>
                    <div class="userAddress">
                        <div class="userName" v-if="store.state.user_data">
                            {{ address }}
                        </div>
                        <span>
                            {{ store.state.user_data ? dealPid(store.state.user_data.pid) : '' }}
                        </span>
                    </div>
                </div>
                <i class="iconfont icon-rarrow" @click="goUrl('roverPlanet')"></i>
            </div>
            <div class="balance" @click="goUrl('roverWallet')">
                <div class="w-full text-black">{{ $t('user.balance') }}</div>
                <span class="price">{{
                    store.state.wallet_balance ? store.state.wallet_balance.toFixed(4) : 0
                }}</span>
            </div>

            <h3>
                {{ $t('user.t2') }}
                <i class="iconfont icon-setting" @click="goUrl('roverSetting')" />
            </h3>
            <div class="menu">
                <div class="item" @click="goUrl('lightProfileUser')">
                    <i class="iconfont icon-plugin-myplugin"></i>
                    <span>{{ $t('plugin.route.user') }}</span>
                </div>
                <div class="item" @click="goUrl('lightProfileCollect')">
                    <i class="iconfont icon-plugin-sc"></i>
                    <span>{{ $t('plugin.route.collect') }}</span>
                </div>
                <div class="item" @click="goUrl('lightProfileCreate')">
                    <i class="iconfont icon-plugin-add"></i>
                    <span>{{ $t('plugin.route.create') }}</span>
                </div>
            </div>
            <div class="logout" @click="globalOutLogin(openLoginC)">
                <i class="iconfont icon-logout"></i>
                {{ $t('menu.logout') }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
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
    emits: ['close'],
    setup(props, context) {
        const router = useRouter();
        const globalOutLogin: any = inject('globalOutLogin', null);

        const profile = () => {
            router.push({
                name: 'lightProfile',
            });
        };

        const closeUser = () => {
            context.emit('close');
        };

        const goUrl = (str: string) => {
            nextTick(() => {
                router.push({
                    name: str,
                });
            });
        };

        return {
            profile,
            closeUser,
            getImagesUrl,
            dealPid,
            goUrl,
            globalOutLogin,
            store,
        };
    },
});
</script>

<style scoped lang="less">
.info-box {
    @apply w-100 pt-5 px-5 bg-white border border-light-500 rounded-xl shadow-lg absolute z-100 shadow-gray-900/10 right-0 <sm:(w-full h-screen fixed flex flex-col rounded-none left-0 top-0 right-0) dark:(bg-dark-800 border-dark-300);
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
            display: flex;
            flex-direction: column;
        }
        .userName {
            @apply text-base font-medium block max-w-40 truncate dark:(text-light-900/80);
        }
        span {
            @apply text-xs rounded-2xl px-2 py-2px mt-1 bg-light-700 text-gray-400 dark:(bg-dark-300);
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
        @apply w-full;
        .item {
            @apply w-full border border-light-800 rounded-xl px-4 py-2 mb-4 flex flex-row-reverse items-center justify-between transition duration-300 hover:(transition duration-300 bg-light-600 cursor-pointer dark:(bg-dark-400 text-light-900/80)) dark:(border-dark-100);
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
        @apply w-full border-t border-light-800 text-center py-4 text-gray-600 cursor-pointer <sm:(border py-3 mb-8 rounded-xl) dark:(border-dark-300 text-light-900/80);
        i {
            @apply mr-1 dark:(text-light-900/80);
        }
    }
}
</style>
