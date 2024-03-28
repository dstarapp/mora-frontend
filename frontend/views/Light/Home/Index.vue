<template>
    <div class="light-home">
        <div class="banner" :style="{ minHeight: bannerLoad ? `${bannerHeight}px` : 'auto' }">
            <p>
                {{ $t('plugin.home.h1') }}
                <span>
                    {{ $t('plugin.home.slogan') }}
                </span>
            </p>
            <img src="@/assets/svg/plugin-banner.svg" @load="bannerLoad = false" />
        </div>
        <div class="contentbox">
            <div class="bar">
                <div class="total">{{ pageData.all }} {{ $t('plugin.home.plugin') }}</div>
                <div class="right">
                    <el-select v-model="category" :placeholder="$t('plugin.home.categoryPlaceholder')" size="large"
                        @change="categoryChange">
                        <el-option key="All" label="All" value="All" />
                        <el-option v-for="item in categoryList" :key="item.label" :label="item.label"
                            :value="item.label" />
                    </el-select>
                    <div class="search">
                        <i class="iconfont icon-search"></i>
                        <input v-model="keywords" type="text" :placeholder="$t('plugin.home.searchPlaceholder')"
                            @keydown.enter="getHomeList" />
                        <span>/</span>
                    </div>
                </div>
            </div>
            <div class="list" animated v-if="isLoading">
                <Skeleton v-for="i in 9" />
            </div>
            <div class="noData" v-else-if="pageData.data.length < 1">
                <i class="iconfont icon-no"></i>
                <span> {{ $t('plugin.home.noData') }} </span>
            </div>
            <template v-else>
                <div class="list">
                    <div v-for="item in pageData.data" class="item" @click="goDetails(item)">
                        <List :data="item as DoneLightExperienceManager" />
                    </div>
                </div>
                <Pagination :total="pageData.all" :currentPage="pageData.page" :pageSize="pageData.size" @next="next"
                    @prev="prev" @goPage="goPage" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { experiencesQueryExperiencesByConditions } from '@/components/light-experience/canisters/experience_manager/apis';
import { PageData } from '@/components/light-experience/canisters/common';
import { DoneLightExperienceManager } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import Pagination from '@/components/Pagination.vue';
import List from './components/List.vue';
import Skeleton from './components/Skeleton.vue';

const router = useRouter();
const bannerLoad = ref(true);
const bannerHeight = ref(document.body.offsetWidth * 0.38);

const keywords = ref<string | undefined>();

const categoryList = ref<{ label: string }[]>([{ label: 'Tools' }, { label: 'Other' }]);
const category = ref<string>('All');
const categoryChange = () => {
    getHomeList();
};

const isLoading = ref(true);
const pageData = reactive<PageData<DoneLightExperienceManager>>({
    page: 1,
    size: 12,
    data: [],
    all: 0,
});

const prev = () => {
    pageData.page = pageData.page - 1;
    getHomeList();
};

const next = () => {
    pageData.page = pageData.page + 1;
    getHomeList();
};

const goPage = (num) => {
    pageData.page = parseInt(num);
    getHomeList();
};

const getHomeList = () => {
    isLoading.value = true;
    experiencesQueryExperiencesByConditions(
        keywords.value ? [keywords.value] : [],
        category.value === 'All' ? [] : [[category.value]],
        [],
        [],
        {
            page: pageData.page,
            size: pageData.size,
        },
    )
        .then((res: PageData<DoneLightExperienceManager>) => {
            pageData.page = res.page;
            pageData.size = res.size;
            pageData.data = res.data;
            pageData.all = res.all;
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            isLoading.value = false;
        });
};

const goDetails = (item) => {
    router.push({
        name: 'lightDetails',
        params: {
            canisterId: item.status.Done.canister_id,
            hash: item.status.Done.hash,
        },
    });
};

onMounted(() => {
    getHomeList();
});
</script>

<style scoped lang="less">
.light-home {
    display: flex;
    flex-direction: column;
}

.banner {
    @apply mx-auto pt-15 pb-10 relative <lg:(pt-6) <sm:(pb-5 pt-20);

    &.load {
        min-height: 29vw;
    }

    img {
        @apply h-full mx-auto;
    }

    p {
        @apply font-bold w-220 text-64px leading-18 text-center absolute top-10 left-1/2 transform -translate-x-1/2 <lg:(text-4xl top-3 w-4/5) <sm:(w-full px-5 text-2xl top-2);

        span {
            @apply font-normal w-3/5 pt-5 text-base block mx-auto text-dark-50 <lg:(w-4/5 text-sm) <sm:(w-full px-6 pt-2 text-xs) dark:(text-light-900);
        }
    }
}

.contentbox {
    @apply w-full max-w-384 mx-auto;
    display: flex;
    flex-direction: column;

    .bar {
        @apply w-full flex justify-between items-center px-10 <lg:(px-5) <sm:(px-2) lg:(px-10) xl:(px-20) 2xl:(px-8);

        .total {
            @apply flex-1 <sm:(hidden);
        }

        .right {
            @apply flex items-center;

            :deep(.el-select) {
                .el-input {
                    .el-input__wrapper {
                        @apply rounded-xl bg-white h-12 border-light-900 <lg:(w-38) <sm:(w-32 h-11) dark:(border-dark-100 !bg-dark-600);
                    }
                }
            }

            :deep(.el-popper) {
                &.is-pure {
                    @apply !rounded-xl;
                }
            }

            .search {
                @apply w-90 ml-3 rounded-xl border-2 border-light-900 bg-white flex items-center justify-between transition duration-300 hover:(border-green-500 transition duration-300) <lg:(w-60) <sm:(mx-2 w-auto flex-1) dark:(border-dark-100 bg-dark-600);

                i {
                    @apply text-light-900 mx-4 <sm:(mx-3);
                }

                input {
                    @apply border-transparent bg-transparent h-full flex-1 <lg:(w-25) <sm:(w-full);

                    &::placeholder {
                        @apply text-sm;
                    }
                }

                span {
                    @apply w-7 h-7 m-2 rounded-lg border border-light-900 text-light-900 text-center leading-7 text-xs <sm:(w-6 h-6 leading-6) dark:(border-dark-50 text-light-900/60);
                }
            }
        }
    }

    .list {
        @apply w-full mx-auto mt-6 mb-10 grid relative sm:(px-4 grid-cols-1 gap-6) <sm:(px-4 grid-cols-1 gap-5) md:(px-5 grid-cols-2 gap-5) lg:(px-10 grid-cols-2 gap-8) xl:(px-20 grid-cols-3 gap-9) 2xl:(px-8);
        height: 100%;

        .item {
            @apply w-full bg-white rounded-2xl overflow-hidden transition duration-300 hover:(shadow shadow-2xl transition duration-300 cursor-pointer dark:(shadow-black)) dark:(bg-dark-300);
        }
    }

    :deep(.pagination) {
        @apply pr-20 mb-5;
    }

    .noData {
        @apply w-full py-30 flex items-center justify-center flex-col;

        i {
            @apply text-7xl text-gray-300 dark:(text-light-900/30);
        }

        span {
            @apply py-3 text-gray-400 dark:(text-light-900/50);
        }
    }
}
</style>
