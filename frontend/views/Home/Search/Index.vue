<template>
    <div class="filter" translate="yes">
        <div class="box">
            <div class="item" :class="{ active: filterSwitch == 'Article' }" @click="filterSwitchChange('Article')">
                <i class="iconfont icon-record"></i>
                {{ $t('search.article') }} ({{ articlesSearchRes.length }})
                <div class="line" v-show="filterSwitch == 'Article'"></div>
            </div>
            <div class="item" :class="{ active: filterSwitch == 'Planet' }" @click="filterSwitchChange('Planet')">
                <i class="iconfont icon-planet"></i>
                {{ $t('search.planet') }} ({{ planetSearchRes.length }})
                <div class="line" v-show="filterSwitch == 'Planet'"></div>
            </div>
        </div>
    </div>
    <div class="layout">
        <div class="list">
            <List v-for="item in planetList" :key="item.id" :planetData="item" :filterSwitch="filterSwitch" />
            <template v-if="((filterSwitch === 'Planet' && planetSearchRes.length < 1) ||
                (filterSwitch === 'Article' && articlesSearchRes.length < 1)) &&
                !searchLoading
                ">
                <div class="noData">
                    <i class="iconfont icon-no"></i>
                    <span>{{ $t('search.noData') }}</span>
                </div>
            </template>
            <div class="loading" v-if="searchLoading">
                <img src="@/assets/svg/loading3.svg" />
            </div>
        </div>
        <History />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, inject, watch } from 'vue';
import { numFormat, dealPid, getImagesUrl } from '@/utils/functions';
import History from './components/History.vue';
import List from './components/List.vue';
import { useRouter, useRoute } from 'vue-router';
import { getHomeSearch } from '@/request/axios/bv';
import store from '@/store';
import bus from 'vue3-eventbus';
import axios from 'axios';

export default defineComponent({
    components: { List, History },
    name: 'Home',
    setup() {
        const router = useRouter();
        const route = useRoute();
        const filterSwitch = ref('Article');
        const searchHistory: any = inject('searchHistory', null);
        const planetSearchRes = ref<any[]>([]);
        const articlesSearchRes = ref<any[]>([]);
        const noData = ref(false);
        const planetList = ref<any[]>([]);
        const limit = ref(100);
        const keyword = ref();
        const type = ref();
        const searchHistoryList = ref([]);
        const searchLoading = ref(false);

        const filterSwitchChange = (type) => {
            if (filterSwitch.value == type) {
                return;
            } else {
                filterSwitch.value = type;
                if (type === 'Planet') {
                    planetList.value = [];
                    nextTick(() => {
                        planetList.value = planetSearchRes.value;
                    });
                } else {
                    planetList.value = [];
                    nextTick(() => {
                        planetList.value = articlesSearchRes.value;
                    });
                }
            }
        };

        const getSearchList = async () => {
            searchLoading.value = true;
            planetSearchRes.value = [];
            articlesSearchRes.value = [];
            planetList.value = [];

            // const res2 = await axios.get(
            //     `https://mora-gpt.onrender.com/query?query=${route.params.keyword}&count=20`,
            // );
            // articlesSearchRes.value = res2.data.results;

            const res: any = await getHomeSearch({
                keyword: route.params.keyword,
                type: type.value,
                limit: limit.value,
            });
            if (res) {
                if (res.articles) {
                    articlesSearchRes.value = res.articles;
                }
                if (res.canister) {
                    planetSearchRes.value.push(...res.canister);
                }
                if (res.name) {
                    planetSearchRes.value.push(...res.name);
                }
                if (!articlesSearchRes.value && !planetSearchRes.value) {
                    noData.value = true;
                    return;
                }
                noData.value = false;
                if (
                    filterSwitch.value === 'Article' &&
                    !articlesSearchRes.value.length &&
                    planetSearchRes.value.length
                ) {
                    filterSwitch.value = 'Planet';
                }
                if (
                    filterSwitch.value === 'Planet' &&
                    !planetSearchRes.value.length &&
                    articlesSearchRes.value.length
                ) {
                    filterSwitch.value = 'Article';
                }

                if (filterSwitch.value === 'Planet') {
                    planetList.value = planetSearchRes.value;
                } else {
                    planetList.value = articlesSearchRes.value;
                }

                searchLoading.value = false;
            }
        };

        const setDocumentTitle = () => {
            document.title = `${keyword.value} - Mora`;
        };

        const init = () => {
            keyword.value = route.params.keyword;

            if (!keyword.value) {
                router.push({
                    name: 'homeIndex',
                });
            }
            if (store.state?.user_data?.pid) {
                searchHistory.record(keyword.value);
                bus.emit('searchHistoryRefresh');
            }
            getSearchList();
            setDocumentTitle();
        };

        onMounted(() => {
            nextTick(() => {
                document.querySelectorAll('#root')[0].classList.add('homebg');
            });
            init();
        });

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val) {
                    searchHistory.record(keyword.value);
                    bus.emit('searchHistoryRefresh');
                }
            },
            {
                deep: true,
            },
        );

        watch(
            () => route.params.keyword,
            (val: any) => {
                if (val) {
                    init();
                }
            },
        );

        return {
            filterSwitch,
            planetList,
            limit,
            keyword,
            type,
            articlesSearchRes,
            planetSearchRes,
            searchHistoryList,
            searchLoading,
            getImagesUrl,
            filterSwitchChange,
            numFormat,
            dealPid,
        };
    },
});
</script>

<style scoped lang="less">
.filter {
    @apply w-full border-b border-gray-500/20 dark:(border-dark-50);

    .box {
        @apply mx-auto max-w-384 flex sm:(px-4) <sm:(px-4) md:(px-7) lg:(px-10) xl:(px-20) 2xl:(px-8);

        .item {
            @apply flex items-center text-gray-400 py-3 cursor-pointer relative <sm:(mr-5) md:(mr-10) lg:(ml-0 mr-10) xl:(ml-15 mr-0) 2xl:(ml-15) <lg:(text-sm);

            span {}

            i {
                @apply text-gray-400 text-base mr-2;
            }

            &.active {
                @apply text-black dark:(text-white);

                i,
                span {
                    @apply text-black text-base dark:(text-white);
                }
            }

            span {
                @apply text-base <xl: (text-sm) <sm:(whitespace-nowrap);
            }

            .line {
                @apply absolute w-full h-1 bg-purple-500 -bottom-1px rounded-full;
            }
        }
    }
}

.layout {
    @apply max-w-384 flex sm:(px-4) <sm:(px-4) md:(px-7) lg:(px-10) xl:(px-15 w-338 mx-auto) 2xl:(px-8 w-384);

    .list {
        @apply pt-8 <md:(pt-6 w-full) md:(mr-0) lg:(mr-15) xl:(mr-25) 2xl:(pl-15);

        .loading {
            @apply py-5;

            img {
                @apply w-12 block mx-auto;
            }
        }
    }
}

.noData {
    @apply border rounded-2xl py-15 flex flex-col justify-center items-center transition duration-300 hover: (shadow-lg bg-white shadow-gray-200 transform scale-102 transition duration-300 cursor-pointer dark:(bg-dark-600 shadow-black)) sm:(mb-6 px-4) <sm:(mb-6 px-4) md:(w-full) <xl:(w-165) <lg:(w-full) xl:(w-180) dark:(border-dark-300);

    i {
        @apply text-7xl text-gray-300;
    }

    span {
        @apply py-3 text-gray-400;
    }
}

.loading {
    @apply sm:(mb-6 px-4) <sm:(mb-6 px-4) md:(w-full) <xl:(w-165) <lg:(w-full) xl:(w-180);
}
</style>
