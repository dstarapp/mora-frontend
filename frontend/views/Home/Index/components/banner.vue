<template>
    <div class="banner" translate="yes">
        <p>{{ $t('banner.t1') }}<br />{{ $t('banner.t2') }}</p>
        <div class="light" @click="goLight">
            <img src="@/assets/svg/editor-logo.svg" alt="mora light" />
            <span>light - Create interactive content easily and efficiently</span>
            <i class="iconfont icon-filedown"></i>
        </div>
        <div class="search" :class="{ active: keywords.length > 0 }">
            <div class="tips"><img src="@/assets/svg/searchai.svg" />{{ $t('home.iplaceholder') }}</div>
            <div class="sbox">
                <div class="flex items-center flex-1">
                    <input type="text" v-model="keywords" @keydown.enter="search" />
                    <i class="iconfont icon-close" v-show="keywords.length > 0" @click="clear"></i>
                </div>
                <button @click="search">
                    <i class="iconfont icon-search"></i>
                </button>
            </div>
        </div>
        <div class="statistics">
            <span>
                {{ $t('banner.total') }}
                <strong>{{ total.planet }}</strong>
                {{ $t('banner.planets') }}
                <strong> {{ total.articles ? 673268 + total.articles : 0 }}</strong>
                {{ $t('banner.articles') }}
            </span>
            <div class="loggedInfo" v-if="store.state.agent">
                <div class="planets">
                    <div v-for="(item, idx) in myPlanetsBaseList" :key="item.canister">
                        <img v-if="item.avatar" :src="getImagesUrl(item.avatar)" />
                        <img v-else src="@/assets/svg/defaultPlanet.png" alt="avatar" />
                        <span>
                            <i class="iconfont icon-planet" @click="jump(item, 'browserHome')"></i>
                            <i class="iconfont icon-create" @click="jump(item, 'planetEditor')"></i>
                            <i class="iconfont icon-dashboard" @click="jump(item, 'planetDashboard')"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getImagesUrl } from '@/utils/functions';
import store from '@/store';
import { statistical } from '@/request/axios/bv';
import bus from 'vue3-eventbus';

export default defineComponent({
    components: {},
    setup() {
        const keywords = ref('');
        const myPlanetsBaseList = inject('myPlanetsBaseList', null);
        const router = useRouter();
        const route = useRoute();
        const total = ref({ articles: 0, planet: 0 });

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
            }
        };

        const clear = () => {
            keywords.value = '';
        };

        const jump = (item, name) => {
            if (!item) {
                return;
            }
            bus.emit('clearKeepAliveCache');
            if (name === 'planetEditor') {
                nextTick(() => {
                    router.push({
                        name: 'homeTransfer',
                        query: {
                            id: item.canister,
                        },
                    });
                });
            } else {
                router.push({
                    name: name,
                    params: {
                        id: item.canister,
                    },
                });
            }
        };

        onMounted(async () => {
            const res: any = await statistical();
            total.value = res.data;
        });

        const goLight = () => {
            router.push('/light');
        };

        return {
            keywords,
            store,
            myPlanetsBaseList,
            total,
            getImagesUrl,
            search,
            clear,
            jump,
            goLight,
        };
    },
});
</script>

<style lang="less" scoped>
.banner {
    @apply w-full mx-auto;

    p {
        @apply block text-center mx-auto pt-6 text-black font-bold lg: (text-4xl w-2/3) xl:(text-6xl leading-15) 2xl:(text-64px leading-17) md:(text-3xl w-4/5) <sm:(hidden) dark:(text-white);
    }

    .light {
        @apply w-full mx-0 mt-8 mb-10 flex items-center justify-center <sm:(hidden);

        img {
            @apply w-6 h-6;
        }

        span {
            @apply text-base px-6px text-dark-200 transition duration-300 dark:(text-light-900/80);
        }

        i {
            @apply text-base transform -rotate-90 text-dark-200 transition duration-300 dark:(text-light-900/80);
        }

        &:hover {

            span,
            i {
                @apply transition duration-300 cursor-pointer text-green-500;
            }
        }
    }

    .search {
        @apply relative mx-auto xl: (w-170 h-14) lg:(w-150 h-13) md:(w-4/5 h-12) <sm:(hidden);

        .tips {
            @apply absolute left-0 bg-orange-500 px-4 pt-1 pb-7 rounded-tr-2xl rounded-tl-xl text-white -top-7 text-sm flex items-center z-1;

            i {
                @apply mr-1 ml-0 text-white;
            }

            img {
                @apply w-4 mr-1;
            }
        }

        .sbox {
            @apply absolute z-10 w-full h-full flex items-center justify-between bg-white border-2 border-gray-200 transition duration-300 md:(rounded-lg) lg:(rounded-xl) dark:(bg-dark-600 border-dark-600);

            &:hover,
            &.active {
                @apply border-2 border-white shadow-lg shadow-dark-900/6 transition duration-300 dark: (border-dark-400 shadow-dark-900/20);
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
                @apply flex-1 pl-3 border-none w-full h-full text-gray-400 text-black bg-transparent xl: (leading-12) lg:(leading-10 text-base) md:(leading-9) sm:(leading-9 text-sm) dark:(text-light-900/80);

                &::placeholder {
                    @apply text-gray-400;
                }
            }

            button {
                @apply h-full bg-purple-500 flex items-center px-5 border-none md:(h-12) lg: (h-13 rounded-tr-10px rounded-br-10px) sm:(rounded-tr-6px rounded-br-6px) <sm:(rounded-tr-6px rounded-br-6px);

                i {
                    @apply text-white;
                }
            }
        }

        .related {
            @apply w-full absolute bg-white shadow-black/15 shadow-lg z-50 overflow-hidden xl: (top-12) lg:(rounded-xl top-10) md:(rounded-lg top-9) sm:(rounded-lg top-9) dark:(bg-dark-600);

            .items {
                @apply max-h-145 overflow-y-auto;

                .item {
                    @apply w-full px-5 py-3 flex items-center border-b border-light-700 dark: (border-dark-300);

                    &:last-child {
                        @apply border-none;
                    }

                    &:hover {
                        @apply bg-light-500 cursor-pointer transition duration-300 dark: (bg-dark-300);
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
                            @apply w-full block truncate dark: (text-white);
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

    .statistics {
        @apply w-full mt-3 mx-auto flex items-center justify-center relative xl: (w-170) lg:(w-150) md:(w-4/5) <sm: (hidden);

        span {
            @apply text-dark-100 dark: (text-light-900/80);

            strong {
                @apply text-base px-1 text-black dark: (text-white);
            }
        }

        .loggedInfo {
            @apply ml-5 flex items-center <md: (hidden);

            .planets {
                @apply flex relative;

                div {
                    @apply w-auto overflow-hidden flex items-center rounded-full border-2 border-white bg-white -ml-2 cursor-pointer transition duration-300 dark:(border-dark-300 bg-dark-300);

                    img {
                        @apply w-8 h-8 rounded-full;
                    }

                    &:first-child {
                        @apply -ml-0;
                    }

                    span {
                        @apply flex items-center w-0 overflow-hidden;
                        transition: @transition;

                        i {
                            @apply ml-4 font-medium transition duration-300 hover:(transition duration-300 text-purple-500 dark:(text-purple-500)) dark:(text-light-900);

                            &.icon-author {
                                @apply !font-normal;
                            }

                            &.icon-create {
                                @apply text-sm;
                            }

                            &.icon-dashboard {
                                @apply mr-3;
                            }
                        }
                    }

                    &:hover {
                        @apply border-purple-500 transition duration-300 dark:(border-purple-500);

                        span {
                            transition: @transition;
                            @apply w-27;
                        }
                    }
                }
            }
        }
    }
}
</style>
