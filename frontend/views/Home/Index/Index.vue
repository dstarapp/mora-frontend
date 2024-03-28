<template>
    <div class="layout" v-if="isMounted">
        <Banner />
        <div class="tbox">
            <div class="filter" translate="yes">
                <ul>
                    <li
                        v-if="store.state.agent"
                        @click="sortChange('subscribe')"
                        :class="{ active: sort === 'subscribe' }"
                    >
                        <i class="iconfont icon-dy"></i>{{ $t('menu.subscribe') }}
                    </li>
                    <li @click="sortChange('feed')" :class="{ active: sort === 'feed' }">
                        <i class="iconfont icon-feed"></i>{{ $t('list.category.c7') }}
                    </li>
                    <!-- <li @click="sortChange('feed')" :class="{ active: sort === 'hot' }">
                        <i class="iconfont icon-hot"></i>{{ $t('list.category.c8') }}
                    </li> -->
                    <li @click="sortChange(4)" :class="{ active: sort === 4 }">
                        <i class="iconfont icon-popular"></i>{{ $t('list.category.c5') }}
                    </li>
                    <li @click="sortChange(2)" :class="{ active: sort === 2 }">
                        <i class="iconfont icon-popular"></i>{{ $t('list.category.c9') }}
                    </li>
                </ul>
                <i class="iconfont icon-filter" @click="isSetLang = true" />
            </div>
            <div class="list">
                <template v-if="sort === 'feed' || sort === 'subscribe'">
                    <template v-if="planetListFirst">
                        <FeedSkeleton v-for="i in 9" :key="i" />
                    </template>
                    <template v-else>
                        <Feed v-for="item in planetList" :key="item.canister" :articleData="item" />
                    </template>
                </template>

                <template v-else>
                    <template v-if="planetListFirst">
                        <Skeleton v-for="i in 9" :key="i" />
                    </template>
                    <List
                        v-else
                        v-for="item in planetList"
                        :key="item.canister"
                        :planetData="item"
                    />
                </template>
            </div>

            <div class="noData" v-if="!loadMoreLoading && !planetList.length">
                <i class="iconfont icon-no"></i>
                <span v-if="sort === 'feed' || sort === 'subscribe'">{{
                    $t('home.noArticles')
                }}</span>
                <span v-else>{{ $t('home.noPlanets') }}</span>
            </div>

            <div class="loading" v-if="loadMoreLoading && !planetListFirst">
                <img src="@/assets/svg/loading3.svg" />
            </div>
        </div>
    </div>
    <el-backtop v-if="$route.name === 'homeIndex'" :right="20" :bottom="40" />
    <SetLang v-if="isSetLang" @componentClose="componentClose" @listInit="listInit" />
    <!-- <div class="mora" @click="goMora">
        <i class="iconfont icon-plugin-help"></i>
    </div> -->
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    onMounted,
    onUnmounted,
    inject,
    watch,
    Ref,
    onActivated,
    onDeactivated,
    getCurrentInstance,
    nextTick,
} from 'vue';
import commonComponent from './components/commonComponent.vue';
import SetLang from './components/SetLang.vue';
import List from './components/List.vue';
import { getHomeList, getFeedList, article } from '@/request/axios/bv';
import bus from 'vue3-eventbus';
import Skeleton from './components/Skeleton.vue';
import store from '@/store';
import Feed from './components/Feed.vue';
import FeedSkeleton from './components/FeedSkeleton.vue';
import { useRoute, useRouter } from 'vue-router';
import Banner from './components/banner.vue';
import { sort } from 'mathjs';
import { t } from '@/i18n';

export default defineComponent({
    components: { commonComponent, List, Skeleton, Feed, FeedSkeleton, Banner, SetLang },
    props: {},
    name: 'homeIndex',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const loadMoreLoading = ref(false);
        const limit = ref(12);
        const sort: Ref<string | number> = ref('feed');
        const planetList: any = ref([]);
        const planetListFirst = ref(true);
        const page = ref(1);
        const total = ref(0);
        const noMore = ref(false);
        const isMounted = ref(false);
        const myPlanetsBaseList = inject('myPlanetsBaseList', null);
        const instance = getCurrentInstance();
        const isActivated = ref(true);
        const areaValue = ref(t('list.areaSelect.s1'));
        const isShowArea = ref(false);
        const changeArea = (str: string) => {
            areaValue.value = str;
            isShowArea.value = false;
        };
        const rootArea = ref();
        const getHistory: any = inject('getHistory');
        const isSetLang = ref(false);

        const areaClick = (e: { target: any }) => {
            if (!rootArea?.value?.contains(e.target)) {
                isShowArea.value = false;
            }
        };
        const loadMore = () => {
            if (loadMoreLoading.value || noMore.value) {
                return;
            }
            page.value = Number(page.value) + 1;
            if (sort.value === 'feed') {
                getFeedData();
            } else if (sort.value === 'subscribe') {
                getMyFeedData();
            } else {
                getHomeData();
            }
        };

        const sortChange = (val) => {
            if (val === sort.value) {
                return false;
            }
            if (val === 'feed') {
                planetListFirst.value = true;
                planetList.value = [];
                page.value = 1;
                sort.value = 'feed';
                noMore.value = false;
                getFeedData();
            } else if (val === 'subscribe') {
                planetListFirst.value = true;
                planetList.value = [];
                page.value = 1;
                sort.value = 'subscribe';
                noMore.value = false;
                getMyFeedData();
            } else {
                planetListFirst.value = true;
                planetList.value = [];
                page.value = 1;
                sort.value = val;
                noMore.value = false;
                getHomeData();
            }
        };

        const getMyFeedData = async () => {
            loadMoreLoading.value = true;
            const res: any = await article({
                limit: limit.value,
                page: page.value,
                canister: store.state.subscribes_data,
            });
            if (sort.value !== 'subscribe') {
                return;
            }
            if (!res && !res.data) {
                return;
            }
            if (!res.data?.limit) {
                noMore.value = true;
                bus.emit('homeOpenFooter');
            } else if (res.success) {
                total.value = res.data.total;
                planetList.value = [...planetList.value, ...res.data.list];
                bus.emit('homeCloseFooter');
            }
            planetListFirst.value = false;
            loadMoreLoading.value = false;
        };

        const getFeedData = async () => {
            loadMoreLoading.value = true;
            const res: any = await getFeedList({
                limit: limit.value,
                lang: store.state?.local_lang ?? 'en',
                page: page.value,
            });
            if (sort.value !== 'feed') {
                return;
            }
            if (!res && !res.data) {
                return;
            }
            if (!res.data?.limit) {
                noMore.value = true;
                bus.emit('homeOpenFooter');
            } else if (res.success) {
                total.value = res.data.total;
                planetList.value = [...planetList.value, ...res.data.list];
                bus.emit('homeCloseFooter');
            }
            planetListFirst.value = false;
            loadMoreLoading.value = false;
        };

        const getHomeData = async () => {
            loadMoreLoading.value = true;
            const currentSort = sort.value;
            const res: any = await getHomeList({
                limit: limit.value,
                lang: store.state?.local_lang ?? 'en',
                sort: currentSort,
                page: page.value,
            });
            if (currentSort !== sort.value) {
                return;
            }
            if (!res) {
                return;
            }
            if (!res.data?.limit) {
                noMore.value = true;
                if (res.data?.total) {
                    total.value = res.data.total;
                }
                bus.emit('homeOpenFooter');
            } else if (res.success) {
                total.value = res.data.total;
                planetList.value = [...planetList.value, ...res.data.list];
                bus.emit('homeCloseFooter');
            }
            planetListFirst.value = false;
            loadMoreLoading.value = false;
        };

        const openPlanets = (item) => {
            if (!item) {
                return;
            }

            router.push({
                name: 'browserHome',
                params: {
                    id: item.canister,
                },
            });
        };

        const handleScroll = () => {
            if (!isActivated.value) {
                return;
            }
            const scrollTop =
                document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            const scrollHeight = document.documentElement.scrollHeight;
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                loadMore();
            }
        };

        const componentClose = () => {
            isSetLang.value = false;
        };

        const listInit = () => {
            planetListFirst.value = true;
            planetList.value = [];
            page.value = 1;
            sort.value = 'feed';
            noMore.value = false;
            getFeedData();
        };

        watch(
            () => store.state.agent,
            (val: any) => {
                if (!val && sort.value === 'subscribe') {
                    page.value = 1;
                    sortChange('feed');
                }
            },
        );

        watch(
            () => store.state.subscribes_data,
            (val: any) => {
                if (val && val.length) {
                    if (sort.value === 'subscribe') {
                        getMyFeedData();
                    }
                }
            },
        );

        watch(
            () => route.name,
            (n) => {
                if (
                    n !== 'browserArticle' &&
                    n !== 'browserHome' &&
                    n !== 'planetDashboard' &&
                    n !== 'planetEditor' &&
                    n !== 'homeIndex' &&
                    n !== 'roverSetting'
                ) {
                    bus.emit('clearKeepAliveCache');
                }
            },
        );

        onUnmounted(() => {
            document.removeEventListener('scroll', handleScroll, false);
            document.removeEventListener('click', areaClick, false);
        });

        onMounted(() => {
            getFeedData();
            window.addEventListener('scroll', handleScroll, true);
            isMounted.value = true;
            document.addEventListener('click', areaClick, false);
        });

        onActivated(() => {
            isActivated.value = true;
            getHistory();
            nextTick(() => {
                document.querySelectorAll('#root')[0].classList.add('homebg');
            });
        });

        onDeactivated(() => {
            isActivated.value = false;
            nextTick(() => {
                document.querySelectorAll('#root')[0].classList.remove('homebg');
            });
        });

        const goMora = () => {
            window.location.href = 'https://mora.app/planet/qvsfp-6aaaa-aaaan-qdbua-cai';
        };

        return {
            sort,
            total,
            planetList,
            loadMoreLoading,
            noMore,
            planetListFirst,
            isMounted,
            store,
            myPlanetsBaseList,
            areaValue,
            isShowArea,
            rootArea,
            isSetLang,
            listInit,
            componentClose,
            getMyFeedData,
            openPlanets,
            loadMore,
            sortChange,
            changeArea,
            goMora,
        };
    },
});
</script>

<style lang="less" scoped>
.layout {
    @apply w-full max-w-384 mx-auto;
}

.tbox {
    @apply w-full text-center lg: (pb-8) md:(py-5) sm:(py-4) <sm:(pb-4);
    // overflow: auto;

    .title {
        @apply text-4xl lg: (text-3xl) md:(text-2xl) sm:(text-xl) <sm:(text-lg) dark:(text-light-900/80);
    }

    .filter {
        @apply w-full flex items-center justify-center sm: (px-4 my-5) <sm:(px-4 my-5) md:(px-5 my-8) lg:(px-10) xl:(px-20) 2xl:(px-8);

        ul {
            @apply flex justify-center items-center <lg:(overflow-x-auto justify-start);
            .noScrollbar();

            li {
                @apply text-left px-4 py-4 list-none text-sm text-black font-medium border bg-white border-light-500 rounded-xl mx-3 whitespace-nowrap transition duration-300 dark:(bg-dark-600 border-dark-300 text-light-900/80) <sm:(py-2 ml-0 shadow-none);

                i {
                    @apply mr-3 text-lg text-gray-400;
                }

                &:hover,
                &.active {
                    @apply transition duration-400 text-purple-500 shadow-lg shadow-gray-200 cursor-pointer dark:(bg-dark-800 shadow-dark-900/50) <lg:(shadow-none);

                    i {
                        @apply text-purple-500;
                    }
                }
            }
        }

        .icon-filter {
            @apply ml-4 text-lg font-medium transition duration-300 hover:(transition duration-300 text-purple-500 cursor-pointer) <sm:(ml-3);
        }

        .selectArea {
            @apply flex justify-center items-center px-4 py-4 <sm:(py-2) relative cursor-pointer dark:(text-light-900/80);

            i {
                @apply text-xs ml-2 font-normal transition duration-300;
            }

            &.hover {
                i {
                    @apply rotate-180 transform transition duration-300;
                }
            }

            .item {
                @apply absolute z-30 top-15 p-3 rounded-xl border border-white bg-white shadow shadow-xl shadow-dark-900/10 dark:(bg-dark-600 border-dark-300 shadow-dark-900/50 text-light-900/80);

                span {
                    @apply block text-center rounded-lg py-3 px-5 transition duration-300 hover:(bg-gray-100 cursor-pointer transition duration-300 dark:(bg-dark-900));
                }
            }
        }

        .loggedInfo {
            @apply ml-5 flex items-center <lg:(hidden);

            .planets {
                @apply flex;

                div {
                    @apply w-13 h-13 rounded-full border-3 border-white border-solid -ml-3 cursor-pointer transition duration-300 hover:(relative border-purple-500 transition duration-300 dark:(border-purple-500)) dark:(border-dark-300);
                    overflow: hidden;
                    display: none;

                    img {
                        width: 100%;
                        height: 100%;
                    }

                    &:first-child {
                        @apply -ml-0;
                    }

                    &:nth-child(1),
                    &:nth-child(2),
                    &:nth-child(3),
                    &:nth-child(4),
                    &:nth-child(5) {
                        display: flex;
                    }
                }
            }

            .mysubs {
                @apply ml-3 px-3 w-13 h-13 leading-12 text-center border bg-white border-light-500 rounded-full dark:(bg-dark-600 border-dark-300 text-light-900/80) <sm:(shadow-none);

                i {
                    @apply font-bold text-gray-400;
                }

                &:hover,
                &.active {
                    @apply transition duration-400 text-purple-500 shadow-lg shadow-gray-200 cursor-pointer dark:(bg-dark-300 shadow-black) <sm:(shadow-none);

                    i {
                        @apply text-purple-500;
                    }
                }
            }
        }
    }

    .setLang {
        display: flex;
        font-size: 14px;
        cursor: pointer;
        margin-left: 15px;
    }
}

.list {
    @apply w-full mx-auto mt-5 grid relative sm: (px-4 grid-cols-1 gap-6) <sm:(px-4 grid-cols-1 gap-5) md:(px-5 grid-cols-2 gap-5) lg:(px-10 grid-cols-2 gap-8) xl:(px-20 grid-cols-3 gap-9) 2xl:(px-8);
    height: 100%;
}

.loading {
    @apply w-full py-4;
    .margin(25);

    img {
        @apply w-15 block mx-auto;
    }
}

.noData {
    @apply w-full py-20 flex items-center justify-center flex-col;

    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }

    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
    }
}

.mora {
    @apply w-10 h-10 flex justify-center items-center bg-white border border-light-700 rounded-xl shadow-lg shadow-dark-50/10 fixed right-5 bottom-25 cursor-pointer transition duration-300 dark:(bg-dark-300 border-dark-100);

    &:hover {
        @apply transition duration-300 bg-gray-100 border-light-800 dark:(bg-dark-800/20 border-light-800/30);

        i {
            @apply transition duration-300 text-dark-50 dark:(text-light-900/60);
        }
    }

    i {
        @apply transition duration-300 text-xl text-dark-50/60 dark:(text-light-900/50);
    }
}
</style>
