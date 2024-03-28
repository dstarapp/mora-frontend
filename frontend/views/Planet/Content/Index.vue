<template>
    <div class="content" translate="no">
        <div class="tab">
            <p :class="{ active: isShow === 'Articles' }">
                {{ $t('planetContent.tab.articles') }}
            </p>
            <div class="screening">
                <div class="search">
                    <i class="iconfont icon-search"></i>
                    <input
                        type="text"
                        v-model="searchVal"
                        :placeholder="$t('planetContent.screening.searchPlaceholder')"
                        @keydown.enter="search()"
                    />
                    <button @click="search()">
                        {{ $t('planetContent.screening.go') }}
                    </button>
                </div>
                <div class="mora-button">
                    <div class="category" @click="category" v-if="isPermissions()">
                        {{ $t('planetContent.screening.category') }}
                    </div>
                    <div class="article" @click="article">
                        {{ $t('planetContent.screening.article') }}
                    </div>
                </div>
                <!-- <div class="mirror" @click="showMirror">
                    <img src="@/assets/svg/mirror.svg" alt="" />
                </div> -->
            </div>
        </div>

        <div class="articles">
            <div class="screening">
                <div class="btn" :class="{ active: !cif.length }" @click="classification([])">
                    <em>{{ $t('planetContent.btn.all') }}</em>
                    <i>{{ articlesStat ? articlesStat.total : 0 }}</i>
                </div>
                <div
                    class="btn"
                    :class="{
                        active: cif.length && Object.keys(cif[0])[0] === 'Subcribe',
                    }"
                    @click="classification([{ Subcribe: null }])"
                >
                    <em>{{ $t('planetContent.btn.subscription') }}</em>
                    <i>{{ articlesStat ? articlesStat.subcribeCount : 0 }}</i>
                </div>
                <div
                    class="btn"
                    :class="{
                        active: cif.length && Object.keys(cif[0])[0] === 'Public',
                    }"
                    @click="classification([{ Public: null }])"
                >
                    <em>{{ $t('planetContent.btn.public') }}</em>
                    <i>{{ articlesStat ? articlesStat.publicCount : 0 }}</i>
                </div>
                <div
                    class="btn"
                    :class="{
                        active: cif.length && Object.keys(cif[0])[0] === 'Private',
                    }"
                    @click="classification([{ Private: null }])"
                >
                    <em>{{ $t('planetContent.btn.private') }}</em>
                    <i>{{ articlesStat ? articlesStat.privateCount : 0 }}</i>
                </div>
                <div class="interval"></div>
                <div
                    class="btn right"
                    :class="{
                        active: cif.length && Object.keys(cif[0])[0] === 'Draft',
                    }"
                    @click="classification([{ Draft: null }])"
                >
                    <em>{{ $t('planetContent.btn.draft') }}</em>
                    <i>{{ articlesStat ? articlesStat.draftCount : 0 }}</i>
                </div>
            </div>
            <template v-if="isLoading || (articlesList && articlesList.length)">
                <el-skeleton class="skeleton" v-if="isLoading" animated :count="5">
                    <template #template>
                        <div class="item">
                            <div class="title">
                                <el-skeleton-item variant="h3" style="width: 100%" />
                            </div>
                            <div class="info">
                                <strong
                                    ><el-skeleton-item variant="text" style="width: 120px"
                                /></strong>
                                <strong>
                                    <el-skeleton-item variant="text" style="width: 45px" />
                                </strong>
                                <strong>
                                    <el-skeleton-item variant="text" style="width: 45px" />
                                </strong>
                                <strong>
                                    <el-skeleton-item variant="text" style="width: 45px" />
                                </strong>
                            </div>
                        </div>
                    </template>
                </el-skeleton>

                <template v-else>
                    <Articles
                        v-for="item in articlesList"
                        @refresh="getList"
                        @openLoading="isLoading = true"
                        :key="item.id"
                        :listData="item"
                    />
                    <div class="bottom">
                        <Pagination
                            :total="total"
                            :pageSize="pageSize"
                            :currentPage="currentPage"
                            @next="next"
                            @prev="prev"
                            @goPage="goPage"
                        />
                    </div>
                </template>
            </template>
            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverDashboard.noData') }}</p>
            </div>
        </div>
    </div>

    <ArticleCategory v-if="isCategoryEdit" @articleCategoryClose="articleCategoryClose" />
    <Mirror v-if="isMirror" @close="showMirror" @refresh="getList" />
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, onMounted } from 'vue';
import Articles from './components/Articles.vue';
import Pagination from '@/components/Pagination.vue';
import { useRoute, useRouter } from 'vue-router';
import ArticleCategory from '@/components/ArticleCategory.vue';
import store from '@/store';
import CONFIG from '@/assets/config';
import { isPermissions, isMobile } from '@/utils/functions';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import debug from '@/utils/debug';
import Mirror from './components/Mirror.vue';

export default defineComponent({
    components: { Articles, Pagination, ArticleCategory, Mirror },
    name: 'Content',
    setup() {
        const isShow = ref('Articles');
        const searchVal = ref('');
        const route = useRoute();
        const router = useRouter();
        const sortingList = ref([
            {
                name: 'Sort By TimeDesc',
                data: {
                    TimeDesc: null,
                },
            },
            {
                name: 'Sort By TimeAsc',
                data: {
                    TimeAsc: null,
                },
            },
        ]);
        const sortingValue = ref({
            TimeDesc: null,
        });
        const isCategoryEdit = ref(false);
        const planetCanister: any = inject('planetCanister', null);
        const articlesList: any = ref();
        const articlesStat = ref();
        const cif = ref([]);
        const currentPage = ref(1);
        const total = ref();
        const isLoading = ref(true);
        const pageSize = ref(CONFIG.articlesPageSize);

        if (route.query?.type) {
            cif.value = [{ [route.query.type]: null }];
        }

        const search = () => {
            currentPage.value = 1;
            getList();
        };

        const articleCategoryClose = () => {
            isCategoryEdit.value = false;
        };

        const category = () => {
            isCategoryEdit.value = true;
        };

        const isMirror = ref(false);
        const showMirror = () => {
            isMirror.value = !isMirror.value;
        };

        const article = () => {
            if (isMobile()) {
                t('editor.isMobile');
                return;
            }
            router.push({
                name: 'planetEditor',
                params: {
                    id: route.params.id,
                },
            });
        };

        const prev = () => {
            currentPage.value = currentPage.value - 1;
            getList();
        };

        const next = () => {
            currentPage.value = currentPage.value + 1;
            getList();
        };

        const goPage = (num) => {
            currentPage.value = parseInt(num);
            getList();
        };

        const classification = (type) => {
            if (JSON.stringify(cif.value) === JSON.stringify(type)) {
                cif.value = [];
                router.push({
                    name: 'planetContent',
                    params: {
                        id: route.params.id,
                    },
                });
            } else {
                if (!type.length) {
                    cif.value = [];
                    router.push({
                        name: 'planetContent',
                        params: {
                            id: route.params.id,
                        },
                    });
                } else {
                    cif.value = type;
                    router.push({
                        name: 'planetContent',
                        params: {
                            id: route.params.id,
                        },
                        query: {
                            type: Object.keys(type[0])[0],
                        },
                    });
                }
            }
            currentPage.value = 1;
            searchVal.value = '';
            getList();
        };

        const getList = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            isLoading.value = true;
            try {
                const res = await planetCanister.value.adminArticles({
                    status: cif.value,
                    subcate: 0,
                    atype: [
                        {
                            Article: null,
                        },
                    ],
                    cate: 0,
                    page: currentPage.value,
                    size: pageSize.value,
                    sort: sortingValue.value,
                    search: searchVal.value,
                });
                isLoading.value = false;
                if (res.data) {
                    articlesList.value = res.data;
                    articlesStat.value = res.stat;
                    total.value = Number(res.total.toString());
                }
            } catch (err) {
                debug('error', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (val) {
                    getList();
                }
            },
        );

        onMounted(() => {
            if (store.state.current_planet_data) {
                getList();
            }
        });

        return {
            isShow,
            articlesList,
            articlesStat,
            sortingList,
            sortingValue,
            searchVal,
            cif,
            isCategoryEdit,
            isLoading,
            total,
            currentPage,
            isMirror,
            pageSize,
            search,
            category,
            article,
            articleCategoryClose,
            prev,
            next,
            goPage,
            classification,
            getList,
            isPermissions,
            showMirror,
        };
    },
});
</script>

<style scoped lang="less">
.content {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: @bg-color;
    .border-radius(25);
    max-width: 1512px;
    margin: 20px auto;
    @apply dark:(bg-dark-600);

    .tab {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid @border-color;
        .height(70);
        min-height: 60px;
        @apply dark:(border-dark-100);

        p {
            font-style: normal;
            .font-size(18);
            color: @text-fcolor;
            .margin(0, 50, 0, 42);
            position: relative;
            .center();
            height: 100%;
            transition: @transition;
            cursor: pointer;

            &.active {
                color: @text-active;
                font-weight: 500;
                transition: @transition;
            }

            &.active {
                &::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    .width(35);
                    .height(5);
                    background: @border-color-active;
                    .border-radius(6);
                    transition: @transition;
                }
            }

            &:last-child {
                .margin(0, 0, 0, 70);
            }
        }

        .screening {
            .center();

            :deep(.el-select) {
                width: 220px;
                .margin(0, 0, 0, 30);

                .el-input__wrapper {
                    border: 0;

                    .el-input__inner {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(16);
                        .line-height(22);
                        color: @text-color;
                        padding: 0;
                        text-align: right;
                    }

                    .placeholder(@text-color);
                }
            }

            .search {
                display: flex;
                position: relative;
                margin-left: auto;

                i {
                    .center();
                    position: absolute;
                    .font-size(14);
                    height: 100%;
                    .margin(0, 0, 0, 15);
                    color: @text-color-grey;
                }

                input {
                    .width(235);
                    .height(45);
                    background: @bg-color-hover;
                    .border-radius(10);
                    border: 0;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color;
                    .placeholder(@text-color-placeholder);
                    .padding(0, 0, 0, 43);
                    @apply dark:(bg-dark-300 text-light-900/80);
                }

                button {
                    .margin(0, 0, 0, 17);
                    .height(45);
                    .padding(0, 15, 0, 15);
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(19);
                    color: @text-color;
                    background: @bg-color;
                    border: 1px solid @border-color;
                    .border-radius(10);
                    cursor: pointer;
                    transition: @transition;
                    @apply dark:(bg-dark-300 border-dark-100 text-light-900/80);

                    &:hover {
                        border-color: @border-color-active;
                        color: @text-active;
                        transition: @transition;
                    }
                }

                @media screen and (min-width: 750px) and (max-width: 1240px) {
                    .margin(0, 20, 0, 0);

                    button {
                        display: none;
                    }
                }
            }

            .mora-button {
                display: flex;
                .margin(0, 0, 0, 0);
                margin-left: auto;

                div {
                    .border-radius(12);
                    .center();
                    .height(45);
                    font-style: normal;
                    font-weight: 350;
                    .font-size(16);
                    .line-height(19);
                    cursor: pointer;
                    transition: @transition;
                    .padding(0, 20, 0, 20);
                }

                .category {
                    .margin(0, 30, 0, 0);
                    border: 1px solid @border-color-active;
                    color: @bg-color-body-active;

                    &:hover {
                        background-color: @bg-color-body-active;
                        color: @text-color-inverse;
                    }
                }

                .article {
                    background: @bg-color-body-active;
                    color: @text-color-inverse;
                    white-space: nowrap;
                    .padding(0, 30, 0, 30);

                    &:hover {
                        opacity: 0.8;
                    }
                }
            }

            .mirror {
                @apply w-11 h-11 mr-8 flex justify-center items-center bg-blue-200/50 rounded-full <xl:(w-9 h-9) transition duration-300 dark:(bg-blue-200) hover:(transition duration-300 bg-blue-200/80 cursor-pointer);

                img {
                    @apply w-1/3;
                }
            }
        }
    }
}

.articles {
    display: flex;
    flex-direction: column;
    min-height: 650px;

    .screening {
        display: flex;
        width: 100%;
        .padding(15, 30, 0, 30);
        .margin(0, 0, 15, 0);
        overflow-x: scroll;
        .noScrollbar();
        align-items: center;

        .btn {
            border: 1px solid @border-color;
            .border-radius(10);
            .padding(8, 12, 8, 12);
            .margin(0, 16, 0, 0);
            font-style: normal;
            font-weight: 500;
            .font-size(16);
            .line-height(19);
            color: @text-color;
            cursor: pointer;
            transition: @transition;
            .center();
            @apply dark:(border-dark-100);

            em {
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 17px;
                color: #000000;
                white-space: nowrap;
                @apply dark:(text-light-900/60);
            }

            i {
                .center();
                border: 1px solid @text-color-grey;
                .border-radius(18);
                .margin(0, 0, 0, 12);
                font-style: normal;
                font-weight: 400;
                .font-size(12);
                .line-height(17);
                .padding(0, 6, 0, 6);
                color: @text-fcolor;

                @apply dark:(text-light-900/60);
            }

            &:hover,
            &.active {
                background: rgba(128, 110, 242, 0.08);
                border: 1px solid #ece8ff;
                transition: @transition;
                color: @text-active;
                @apply dark:(bg-dark-800 border-purple-500/50);

                em {
                    @apply dark:(text-light-900);
                }

                i {
                    transition: @transition;
                }
            }
        }

        .interval {
            display: flex;
            background: #ddd;
            .height(24);
            width: 1px;
            .margin(0, 15, 0, 0);
            @apply dark:(bg-dark-100);
        }
    }

    .noData {
        .center();
        .font-size(70);
        width: 100%;
        flex-direction: column;
        height: 100%;
        flex: 1;
        // margin-top: 20%;

        i {
            .font-size(70);
            color: #dddddd;
        }

        p {
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .line-height(19);
            .margin(10, 0, 0, 0);
            color: @text-color-grey;
        }

        .btn {
            .center();
            .height(45);
            border: 1px solid @bg-color-body-active;
            background: @bg-color;
            .border-radius(12);
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .padding(0, 23, 0, 23);
            color: @text-active;
            .margin(40, 0, 0, 0);
            transition: @transition;
            cursor: pointer;

            &:hover {
                transition: @transition;
                border: 1px solid @border-color-active;
                color: @bg-color;
                background: @bg-color-body-active;
            }
        }
    }
}

.bottom {
    display: flex;
    margin-top: auto;
    .padding(11, 35, 15, 43);
    border-top: 1px solid @border-color;
    justify-content: flex-end;
    @apply dark:(border-dark-100);

    :deep(.pagination) {
        width: auto;
    }
}

.skeleton {
    .padding(20, 30, 0, 30);

    .item {
        .margin(0, 0, 48, 0);
    }

    .info {
        strong {
            .margin(5, 15, 0, 0);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .content {
        .margin-media(0, 0, 30, 0);
        min-height: calc(100vh - 90px);

        .tab {
            padding: 0 5%;

            p {
                flex: none;
                .font-size(16);
                .margin(0, 20, 0, 20);
            }

            .screening {
                display: none;

                .search {
                    display: none;
                }

                .mora-button {
                    display: none;
                }
            }
        }
    }

    .screening {
        padding-left: 12px !important;
    }

    .bottom {
        .padding(15, 15, 15, 15);

        .pagination {
            width: 100%;
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1240px) {
    .content {
        .margin(0, 0, 20, 0);

        .tab {
            .screening {
                // justify-content: flex-start !important;
                :deep(.el-select) {
                    width: 120px;
                    .margin(0, 0, 0, 20);

                    .el-input__wrapper {
                        border: 0;

                        .el-select-dropdown__list {
                            margin: 5px 10px 18px 10px !important;
                        }

                        .el-input__inner {
                            font-style: normal;
                            font-weight: 400;
                            .font-size(16);
                            .line-height(22);
                            color: @text-color;
                            padding: 0;
                            text-align: right;
                        }

                        .placeholder(@text-color);
                    }
                }

                .mora-button {
                    padding: 0 !important;
                    margin: 20px !important;
                }
            }
        }
    }

    .articles {
        min-height: 400px;

        .list {
            .item {
                .title {
                    h3 {
                        .font-size(16);
                    }
                }
            }
        }
    }

    .el-popper {
        .el-select-dropdown__list {
            .el-select-dropdown__item {
                height: 40px !important;
            }
        }
    }
}
</style>
