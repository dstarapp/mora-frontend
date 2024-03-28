<template>
    <div class="browserHome">
        <Banner />
        <div class="mPlanet">
            <Planet />
        </div>
        <div class="contain">
            <div class="w-55 relative <lg:(hidden)" v-if="!browserPlanetUserData">
                <el-skeleton animated>
                    <template #template>
                        <div class="skeletonCategory">
                            <div class="w-full px-6 py-3">
                                <el-skeleton-item variant="text" style="width: 100%; height: 22px" />
                            </div>
                            <div class="w-full px-6 py-3">
                                <el-skeleton-item variant="text" style="width: 100%; height: 22px" />
                            </div>
                            <div class="w-full px-6 py-3">
                                <el-skeleton-item variant="text" style="width: 100%; height: 22px" />
                            </div>
                            <div class="w-full px-6 py-3">
                                <el-skeleton-item variant="text" style="width: 100%; height: 22px" />
                            </div>
                        </div>
                    </template>
                </el-skeleton>
            </div>
            <div class="w-55 <xl:(w-45) <2xl:(w-50) relative <lg:(hidden)" v-else>
                <div :style="{ top: `${affTop}px` }"
                    class="afixed w-55 <xl:(w-45 mr-6) <2xl:(w-50) relative <lg:(hidden)">
                    <Category />
                </div>
            </div>
            <div class="article-box">
                <el-skeleton animated v-if="isSkeleton" :count="3">
                    <template #template>
                        <div class="list">
                            <div class="date">
                                <div class="day">
                                    <el-skeleton-item variant="text" class="w-10 h-8" />
                                </div>
                                <div class="month">
                                    <el-skeleton-item variant="text" class="w-15 <sm:(w-10)" />
                                </div>
                                <div class="line"></div>
                            </div>
                            <div class="conbox">
                                <div class="header">
                                    <el-skeleton-item variant="text" class="h-10" style="width: 110px" />
                                </div>
                                <div class="title">
                                    <el-skeleton-item variant="text" class="w-full" />
                                    <el-skeleton-item variant="text" class="w-4/5" />
                                </div>
                                <div class="imgbox">
                                    <el-skeleton-item variant="image" class="skeletonImg" />
                                </div>
                                <p>
                                    <el-skeleton-item variant="text" class="w-full" />
                                    <el-skeleton-item variant="text" class="w-4/5" />
                                </p>
                                <div class="flex justify-between items-center">
                                    <div class="article-data">
                                        <el-skeleton-item variant="text" class="w-10" />
                                        <el-skeleton-item variant="text" class="w-10 ml-5" />
                                    </div>
                                    <el-skeleton-item variant="text" class="w-12 h-10 mt-2 float-right" />
                                </div>
                            </div>
                        </div>
                    </template>
                </el-skeleton>
                <List :planetListData="planetListData" v-else />
            </div>
            <div class="w-70 relative lg:(w-60) xl:(w-70) 2xl:(w-80) <lg:(hidden)">
                <div :style="{ top: `${affTop}px` }"
                    class="afixed w-70 relative lg:(w-60) xl:(w-70) 2xl:(w-80) <lg:(hidden)">
                    <Planet />
                </div>
            </div>
        </div>
    </div>
    <!-- <el-backtop :right="20" :bottom="50" /> -->
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    shallowRef,
    onMounted,
    provide,
    inject,
    watch,
    onUnmounted,
    nextTick,
} from 'vue';
import bus from 'vue3-eventbus';
import Banner from './components/Banner.vue';
import Category from './components/Category.vue';
import Planet from '../plugin/Planet.vue';
import List from './components/List.vue';
import { goTop } from '@/utils/functions';

export default defineComponent({
    components: { Banner, Category, Planet, List },
    props: {},
    name: 'Browser',
    setup() {
        goTop();
        const planetListData = ref<any[]>([]);
        const hasmore = ref();
        const total = ref();
        const page = ref(1);
        const size = ref(50);
        const search = ref('');
        const subcate = ref(0);
        const cate = ref(0);
        const isSkeleton = ref(true);
        const affix1 = shallowRef();
        const affix2 = shallowRef();
        const affTop = ref(330);
        const loadMoreLoading = ref(false);
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const planetCanisterAnonymous: any = inject('planetCanisterAnonymous', null);

        const getQueryArticles = async () => {
            if (!planetCanisterAnonymous || !planetCanisterAnonymous.value) {
                return;
            }
            isSkeleton.value = true;
            let str = {
                status: [],
                subcate: subcate.value,
                cate: cate.value,
                atype: [
                    {
                        Article: null,
                    },
                ],
                page: page.value,
                size: size.value,
                sort: {
                    TimeDesc: null,
                },
                search: search.value,
            };
            let res = await planetCanisterAnonymous.value.queryArticles(str);
            if (res) {
                isSkeleton.value = false;
                planetListData.value = res.data;
                hasmore.value = res.hasmore;
                total.value = res.total;
                onSroll();
            }
        };

        const loadMore = async () => {
            if (!planetCanisterAnonymous || !planetCanisterAnonymous.value) {
                return;
            }
            if (loadMoreLoading.value) {
                return;
            }
            page.value = page.value + 1;
            loadMoreLoading.value = true;
            let str = {
                status: [],
                subcate: subcate.value,
                cate: cate.value,
                atype: [
                    {
                        Article: null,
                    },
                ],
                page: page.value,
                size: size.value,
                sort: {
                    TimeDesc: null,
                },
                search: search.value,
            };
            let res = await planetCanisterAnonymous.value.queryArticles(str);
            loadMoreLoading.value = false;
            if (res) {
                planetListData.value = [...planetListData.value, ...res.data];
            }
        };

        const browserSearch = (keyword) => {
            search.value = keyword;
            getQueryArticles();
        };

        const browserCategory = (item) => {
            search.value = '';
            bus.emit('browserSearchClear');
            if (item.l1 === 'all') {
                subcate.value = 0;
                cate.value = 0;
                page.value = 1;
                getQueryArticles();
            } else if (!item.l2) {
                cate.value = parseInt(item.l1);
                subcate.value = 0;
                page.value = 1;
                getQueryArticles();
            } else {
                cate.value = parseInt(item.l1);
                subcate.value = parseInt(item.l2);
                page.value = 1;
                getQueryArticles();
            }
        };

        const setDocumentTitle = () => {
            if (!browserPlanetUserData.value || !browserPlanetUserData.value.name) {
                return;
            }
            document.title = `${browserPlanetUserData.value && browserPlanetUserData.value.name
                ? browserPlanetUserData.value.name
                : ''
                } - ${isPrivate.value ? `${window?.__PRIVATE_CONFIG__?.name}` : 'Mora'}`;

            let meta = document.querySelector('meta[name="description"]');
            if (meta) {
                meta.setAttribute('content', browserPlanetUserData.value.desc);
            }
        };

        const onSroll = () => {
            let scrollTop =
                document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;

            let clientHeight = document.documentElement.clientHeight;
            let scrollHeight = document.documentElement.scrollHeight;
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                loadMore();
            }

            let arrTop = 330 - scrollTop;
            if (arrTop <= 70) {
                affTop.value = 70;
                return;
            }
            affTop.value = arrTop;
        };

        watch(
            () => browserPlanetUserData?.value,
            (val: any) => {
                if (val) {
                    setDocumentTitle();
                }
            },
            { immediate: true },
        );

        onUnmounted(() => {
            bus.off('browserCategory', browserCategory);
            bus.off('browserSearch', browserSearch);
            window.removeEventListener('scroll', onSroll, false);
        });

        onMounted(async () => {
            window.addEventListener('scroll', onSroll);
            bus.on('browserSearch', browserSearch);
            bus.on('browserCategory', browserCategory);
            nextTick(() => {
                getQueryArticles();
            });
            onSroll();
        });

        provide('getQueryArticles', getQueryArticles);

        return {
            isSkeleton,
            browserPlanetUserData,
            planetListData,
            affix1,
            affix2,
            affTop,
        };
    },
});
</script>

<style scoped lang="less">
.browserHome {
    @apply w-full min-h-180 overflow-auto min-h-screen bg-white dark:(bg-dark-900);

    .mPlanet {
        @apply hidden border-b border-light-700 dark:(border-dark-100) <lg:(block);
    }
}

.contain {
    position: relative;
    @apply flex justify-between mx-auto pt-5 w-full <sm:(px-4) <md:(px-8) <xl:(px-10) xl:(px-25) 2xl:(w-400);

    .article-box {
        @apply flex-1 mx-10 min-h-180 <lg:(mx-0 min-h-60);
    }

    .skeletonCategory {
        @apply w-55 mr-10 py-4 rounded-xl overflow-hidden border border-light-700 bg-white <xl:(w-45 mr-6) <2xl:(w-50) dark:(bg-dark-600 border-dark-100);
    }
}

.el-menu {
    @apply justify-center;
}

:deep(.el-menu--horizontal) {
    &>.el-menu-item {
        &.is-active {
            @apply border-b-2 !border-b-blue-500 !text-blue-500;
        }
    }

    &>.el-sub-menu {
        .el-sub-menu__title {
            &:hover {
                @apply !text-blue-500;
            }
        }
    }
}

:deep(.el-sub-menu) {
    @apply sm(mx-5);
}

.list {
    @apply w-full flex justify-between;

    .date {
        @apply w-16 mr-8 flex flex-col <sm:(w-10 mr-3) <xl:(mr-4);

        .day {
            @apply w-full text-center text-3xl;
        }

        .month {
            @apply w-full pt-1 text-xs text-center;
            color: #666;
        }

        .line {
            @apply flex-1 w-1px border-dashed border-r border-light-800 mx-auto my-4 dark:(border-light-800/20);
        }
    }

    .conbox {
        @apply flex-1;

        .header {
            @apply w-full flex items-center justify-between;

            .tag {
                @apply flex-1 flex items-center;

                span {
                    @apply text-sm pl-2 <sm:(text-xs);
                    color: #999;
                }
            }
        }

        .title {
            @apply w-full py-3;
        }

        .article-data {
            @apply w-full flex items-center;

            span {
                @apply text-gray-400 text-sm;
            }
        }

        .imgbox {
            @apply w-full my-5;

            img {
                @apply w-full hover:(cursor-pointer);
            }

            .skeletonImg {
                @apply w-full h-60 <sm:(h-40);
            }
        }

        p {
            @apply w-full leading-6 <sm:(text-sm leading-5);
        }
    }
}

.afixed {
    position: fixed;
}
</style>
