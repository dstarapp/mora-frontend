<template>
    <div class="dashboard">
        <div class="left">
            <el-skeleton animated class="user" v-if="!current_planet_data">
                <template #template>
                    <div class="avatarBox">
                        <el-skeleton-item variant="image" class="skeletonAvatar" />
                    </div>
                    <p class="uhead">
                        <el-skeleton-item variant="h3" style="width: 100px" />
                    </p>
                    <strong>
                        <el-skeleton-item v-for="i in 4" :key="i" style="margin-top: 3px; height: 12px"
                            variant="text" />
                    </strong>
                </template>
            </el-skeleton>
            <div class="user" v-else>
                <div class="avatarBox">
                    <div class="avatar" @click="jump('planetPlanetSettings')">
                        <img :src="getImagesUrl(current_planet_data.avatar)" />
                    </div>
                </div>
                <div class="uhead">
                    <p class="name">
                        {{ current_planet_data ? current_planet_data.name : '' }}
                    </p>
                    <i class="iconfont icon-link" @click="jump('browserHome')"></i>
                </div>
                <strong>{{ current_planet_data ? current_planet_data.desc : '' }}</strong>
            </div>
            <div class="subscribers">
                <div class="item">
                    <i class="iconfont icon-subscribe"></i>
                    <p>{{ $t('planetDashboard.subscribers.item1') }}</p>
                    <el-skeleton animated v-if="!current_planet_data">
                        <template #template>
                            <el-skeleton-item variant="text"
                                style="width: 100px; margin: 30px 0 36px 0; height: 32px" />
                        </template>
                    </el-skeleton>
                    <strong v-else>
                        <i>+</i>
                        {{
                current_planet_data && current_planet_data.last24subcriber
                    ? current_planet_data.last24subcriber.toString()
                    : 0
            }}
                    </strong>
                </div>
                <div class="item">
                    <i class="iconfont icon-subscribes"></i>
                    <p>{{ $t('planetDashboard.subscribers.item2') }}</p>
                    <el-skeleton animated v-if="!current_planet_data">
                        <template #template>
                            <el-skeleton-item variant="text"
                                style="width: 100px; margin: 30px 0 36px 0; height: 32px" />
                        </template>
                    </el-skeleton>
                    <strong @click="jump('planetSubscription')" v-else>{{
                current_planet_data ? current_planet_data.subcriber.toString() : ''
            }}</strong>
                </div>
            </div>
            <el-skeleton animated class="articles" v-if="!current_planet_data">
                <template #template>
                    <div class="title">
                        <p>{{ $t('planetDashboard.articles.title') }}</p>
                        <i>
                            <el-skeleton-item variant="text" style="width: 50px; height: 20px" />
                        </i>
                    </div>
                    <div class="list">
                        <div class="item">
                            <span>
                                <p>{{ $t('planetDashboard.articles.subscription') }}</p>
                                <el-skeleton-item variant="text" style="width: 50px; height: 20px" />
                            </span>
                        </div>
                        <div class="item">
                            <span>
                                <p>{{ $t('planetDashboard.articles.public') }}</p>
                                <el-skeleton-item variant="text" style="width: 50px; height: 20px" />
                            </span>
                        </div>
                        <div class="item">
                            <span>
                                <p>{{ $t('planetDashboard.articles.private') }}</p>
                                <el-skeleton-item variant="text" style="width: 50px; height: 20px" />
                            </span>
                        </div>
                    </div>
                </template>
            </el-skeleton>
            <div class="articles" v-else>
                <div class="title" @click="jumpArticles('')">
                    <p>{{ $t('planetDashboard.articles.title') }}</p>
                    <i>{{ articlesStat ? articlesStat.total.toString() : 0 }}</i>
                </div>
                <div class="list">
                    <div class="item" @click="jumpArticles('Subcribe')">
                        <span>
                            <p>{{ $t('planetDashboard.articles.subscription') }}</p>
                            <em>{{ articlesStat ? articlesStat.subcribeCount.toString() : 0 }}</em>
                        </span>
                    </div>
                    <div class="item" @click="jumpArticles('Public')">
                        <span>
                            <p>{{ $t('planetDashboard.articles.public') }}</p>
                            <em>{{ articlesStat ? articlesStat.publicCount.toString() : 0 }}</em>
                        </span>
                    </div>
                    <div class="item" @click="jumpArticles('Private')">
                        <span>
                            <p>{{ $t('planetDashboard.articles.private') }}</p>
                            <em>{{ articlesStat ? articlesStat.privateCount.toString() : 0 }}</em>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="middle">
            <div class="canister">
                <div class="canisterLeft">
                    <i class="iconfont icon-point"></i>
                    <h3>{{ $t('planetDashboard.canister.title') }}</h3>
                    <em v-if="store.state.current_planet_cycles_balance === null"
                        style="display: flex; align-items: center">
                        {{ $t('planetDashboard.canister.cycles') }}:
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item variant="text" style="width: 80px; margin-left: 10px" />
                            </template>
                        </el-skeleton>
                    </em>
                    <em v-else>{{ $t('planetDashboard.canister.cycles') }}:
                        {{ store.state.current_planet_cycles_balance }} T</em>
                    <strong v-if="!current_planet_data" style="display: flex; align-items: center">
                        {{ $t('planetDashboard.canister.id') }}:
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item variant="text" style="width: 70%; margin-left: 10px" />
                            </template>
                        </el-skeleton>
                    </strong>
                    <strong v-else>{{ $t('planetDashboard.canister.id') }}:
                        {{
                current_planet_data ? current_planet_data.canister.toString() : ''
            }}</strong>
                    <div class="btns">
                        <i @click="copy" class="iconfont icon-copy"></i>
                        <div class="widthdraw" @click="withDraw" v-if="isPermissions()">
                            <i @click="withdraw" class="iconfont icon-wallet" />
                            {{ $t('planetDashboard.canister.withdraw') }}
                        </div>
                    </div>
                </div>

                <div class="canisterRight">
                    <div class="item">
                        <i class="iconfont icon-time"></i>
                        <div>
                            <p>{{ $t('planetDashboard.canister.runtime') }}</p>
                            <span v-if="!current_planet_data" style="display: flex; align-items: center">
                                <em>
                                    <el-skeleton animated>
                                        <template #template>
                                            <el-skeleton-item variant="text" style="width: 20px" />
                                        </template>
                                    </el-skeleton> </em>{{ $t('planetDashboard.canister.days') }}
                                <em>
                                    <el-skeleton animated>
                                        <template #template>
                                            <el-skeleton-item variant="text" style="width: 20px; margin-left: 4px" />
                                        </template>
                                    </el-skeleton> </em>{{ $t('planetDashboard.canister.hours') }}
                            </span>
                            <span v-else>
                                <em>{{ runtime.day }}</em>{{ $t('planetDashboard.canister.days') }}
                                <em>{{ runtime.hours }}</em>{{ $t('planetDashboard.canister.hours') }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <i class="iconfont icon-balance"></i>
                        <div>
                            <p>{{ $t('planetDashboard.canister.storage') }}</p>
                            <strong v-if="!current_planet_data">
                                <el-skeleton animated>
                                    <template #template>
                                        <el-skeleton-item variant="text" style="width: 100px" />
                                    </template>
                                </el-skeleton>
                            </strong>
                            <strong v-else>{{
                getMemory(
                    current_planet_data
                        ? current_planet_data.memory.toString()
                        : '',
                ).M
            }}M / 4G</strong>
                            <el-progress :percentage="getMemory(
                    current_planet_data
                        ? current_planet_data.memory.toString()
                        : '',
                ).P
                " :show-text="false" color="#806EF2" />
                        </div>
                    </div>
                    <div class="item">
                        <i class="iconfont icon-wallet" />
                        <div>
                            <p>{{ $t('planetDashboard.canister.icp') }}</p>
                            <span v-if="store.state.current_planet_wallet_balance === null">
                                <el-skeleton animated>
                                    <template #template>
                                        <el-skeleton-item variant="text" style="width: 100px" />
                                    </template>
                                </el-skeleton>
                            </span>
                            <span v-else>{{
                store.state.current_planet_wallet_balance.toFixed(4)
            }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="articles">
                <div class="title">
                    <h3>{{ $t('planetDashboard.articlesList.title') }}</h3>
                    <i @click="jump('planetContent')" class="iconfont icon-arrow-right"></i>
                </div>
                <el-skeleton animated :count="5" class="list" v-if="!current_planet_data || articlesLoading">
                    <template #template>
                        <div class="item">
                            <el-skeleton-item variant="image" class="sArticleImg" />
                            <div class="titleBox">
                                <el-skeleton-item variant="h3" style="width: 100%" />
                                <span>
                                    <strong>
                                        <el-skeleton-item variant="text" style="width: 50px" />
                                    </strong>
                                    <strong>
                                        <el-skeleton-item variant="text" style="width: 50px" />
                                    </strong>
                                    <strong>
                                        <el-skeleton-item variant="text" style="width: 50px" />
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </template>
                </el-skeleton>
                <div v-else>
                    <div class="list" v-if="articlesList.length > 0">
                        <div class="item" v-for="item in articlesList" :key="item.id" @click="clickList(item)">
                            <div v-if="item.thumb" class="header">
                                <img :src="getImagesUrl(item.thumb, 150)" alt="" />
                            </div>
                            <div class="titleBox">
                                <p>{{ item.title }}</p>
                                <span>
                                    <strong>
                                        <i class="iconfont icon-zan"></i>
                                        <em>{{ item.like.toString() }}</em>
                                    </strong>
                                    <strong>
                                        <i class="iconfont icon-comments"></i>
                                        <em>
                                            {{ item.comment.toString() }} <i>/</i>
                                            {{ item.commentTotal.toString() }}
                                        </em>
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="noData articlelist" v-else>
                        <i class="iconfont icon-no"></i>
                        <span>{{ $t('roverPlanet.norecord') }}</span>
                        <span class="tips" @click="jump('planetEditor')">
                            {{ $t('planetDashboard.articlesList.noDataTip') }}
                            <i class="iconfont icon-go"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="right">
            <div class="create">
                <div class="createArticle" @click="createArticle">
                    {{ $t('planetDashboard.create.create') }}
                </div>
                <div class="addCycles" @click="addCycles">
                    {{ $t('planetDashboard.create.add') }}
                </div>
            </div>
            <div class="subscription">
                <div class="head">
                    <h3>{{ $t('planetDashboard.latest.title') }}</h3>
                    <i @click="jump('planetSubscription')" class="iconfont icon-arrow-right"></i>
                </div>
                <el-skeleton animated :count="4" class="list" v-if="latestSubscriptionLoading">
                    <template #template>
                        <div class="item">
                            <el-skeleton-item variant="image" class="sArticleImg" />
                            <div class="name">
                                <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 10px" />
                                <el-skeleton-item variant="text" style="width: 60%" />
                            </div>
                            <div class="price">
                                <el-skeleton-item variant="text" style="width: 40px; margin-bottom: 10px" />
                                <el-skeleton-item variant="text" style="width: 50px" />
                            </div>
                        </div>
                    </template>
                </el-skeleton>
                <div v-else>
                    <div class="list" v-if="latestSubscriptionList.length">
                        <div class="item" v-for="item in latestSubscriptionList" :key="item.id">
                            <img v-if="!item.avatar ||
                (item.avatar.length < 32 && ~item.avatar.includes('https://'))
                " src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                            <img v-else :src="getImagesUrl(item.avatar, 50)" alt="avatar" />
                            <div class="name" translate="no">
                                <p>
                                    {{
                item.icnaming ? item.icnaming : dealPid(item.pid.toString())
            }}
                                </p>
                                <em>{{
                    getExpired(Object.keys(item.subType)[0], item.expireTime)
                }}</em>
                            </div>
                            <div class="price">
                                <p>{{ Object.keys(item.subType)[0] }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="noData subs" v-else>
                        <i class="iconfont icon-no"></i>
                        <span>{{ $t('roverPlanet.norecord') }}</span>
                    </div>
                </div>
            </div>
            <div class="accompanied">
                <p>
                    {{ $t('planetDashboard.accompanied.text') }}
                    <em>{{ runtime.day }} {{ $t('planetDashboard.canister.days') }} </em>
                </p>
            </div>
        </div>
    </div>

    <component :is="isComponent" @refreshCycles="getCycles" @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AddCycles from '@/components/AddCycles.vue';
import WithDraw from '../components/WithDraw.vue';
import store from '@/store';
import CONFIG from '@/assets/config';
import {
    getImagesUrl,
    isPermissions,
    isMobile,
    copyText,
    getRuntime,
    dealPid,
    getExpired,
} from '@/utils/functions';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { getIcnaming } from '@/utils/icnaming';
import { getAvatar } from '@/utils/getAvatar';
import debug from '@/utils/debug';

export default defineComponent({
    components: { AddCycles, WithDraw },
    name: 'Dashboard',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const articlesNumList: any = ref();
        const articlesList: any = ref([]);
        const articlesStat = ref();
        const articlesLoading = ref(true);
        const latestSubscriptionList: any = ref([]);
        const latestSubscriptionLoading = ref(true);
        const isComponent = ref();
        const componentData = ref();
        const current_planet_data = ref();
        const planetCanister: any = inject('planetCanister', null);
        const getCycles = inject('getCycles', null);
        const runtime = ref({
            day: 0,
            hours: 0,
        });

        const jump = (item) => {
            router.push({
                name: item,
                params: {
                    id: route.params.id,
                },
            });
        };

        const componentClose = () => {
            isComponent.value = undefined;
        };

        const copy = () => {
            copyText(store.state.current_open_planet);
        };

        const getArticlesList = () => {
            if (!planetCanister) {
                return;
            }
            articlesLoading.value = true;
            try {
                planetCanister.value
                    .adminArticles({
                        status: [],
                        subcate: 0,
                        atype: [
                            {
                                Article: null,
                            },
                        ],
                        cate: 0,
                        page: 1,
                        size: 5,
                        sort: {
                            TimeDesc: null,
                        },
                        search: '',
                    })
                    .then((res) => {
                        if (res.data) {
                            articlesLoading.value = false;
                            articlesList.value = res.data;
                            articlesStat.value = res.stat;
                        }
                    });
            } catch (err) {
                debug('error', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const getLatestSubscriptionList = () => {
            if (!planetCanister) {
                return;
            }
            latestSubscriptionLoading.value = true;
            planetCanister.value
                .adminSubcribers({
                    page: 1,
                    size: 4,
                    sort: { TimeAsc: null },
                })
                .then((res) => {
                    latestSubscriptionLoading.value = false;
                    latestSubscriptionList.value = res.data;
                    latestSubscriptionList.value.map((item) => {
                        getIcnaming(item.pid).then((res) => {
                            item.icnaming = res;
                        });
                        getAvatar(item.pid).then((res) => {
                            item.avatar = res;
                        });
                    });
                })
                .catch((err) => {
                    latestSubscriptionLoading.value = false;
                });
        };

        const jumpArticles = (type) => {
            if (!type) {
                router.push({
                    name: 'planetContent',
                    params: {
                        id: route.params.id,
                    },
                });
                return;
            }
            router.push({
                name: 'planetContent',
                params: {
                    id: route.params.id,
                },
                query: {
                    type: type,
                },
            });
        };

        const init = () => {
            runtime.value = getRuntime(current_planet_data.value.created);

            getArticlesList();
            getLatestSubscriptionList();
        };

        const createArticle = () => {
            if (isMobile()) {
                ElMessage.warning(t('editor.isMobile'));
                return;
            }
            router.push({
                name: 'planetEditor',
                params: {
                    id: route.params.id,
                },
            });
        };

        const addCycles = () => {
            isComponent.value = 'AddCycles';
        };

        const withDraw = () => {
            isComponent.value = 'WithDraw';
        };

        const getMemory = (memory) => {
            let str = memory / 1024 / 1024;
            return {
                M: str.toFixed(2),
                P: Math.ceil(str / 1024 / 4 * 100)
            };
        };

        const clickList = (item) => {
            router.push({
                name: 'browserArticle',
                params: {
                    id: route.params.id,
                    articleId: item.id,
                },
            });
        };

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (val) {
                    current_planet_data.value = val;
                    init();
                }
            },
        );

        onMounted(() => {
            if (store.state.current_planet_data) {
                current_planet_data.value = store.state.current_planet_data;
                if (planetCanister?.value) {
                    init();
                }
            }
        });
        return {
            articlesNumList,
            articlesList,
            articlesStat,
            articlesLoading,
            latestSubscriptionList,
            isComponent,
            componentData,
            current_planet_data,
            store,
            CONFIG,
            latestSubscriptionLoading,
            getCycles,
            runtime,
            jump,
            copy,
            createArticle,
            addCycles,
            componentClose,
            withDraw,
            getMemory,
            getImagesUrl,
            clickList,
            dealPid,
            getExpired,
            isPermissions,
            jumpArticles,
        };
    },
});
</script>

<style scoped lang="less">
.dashboard {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    max-width: 1512px;
    margin: 10px auto 0 auto;

    @media screen and (min-width: 751px) and (max-width: 1240px) {
        margin: 0;
    }

    .padding(0, 0, 30, 0);

    .left {
        display: flex;
        width: 330px;
        flex-direction: column;

        .user {
            display: flex;
            .margin(0, 0, 30, 0);
            flex-direction: column;
            align-items: center;

            .avatarBox {
                .padding(3, 3, 3, 3);
                border: 1px solid @border-color;
                border-radius: 50%;
                position: relative;
                cursor: pointer;
                .height(98);
                .width(98);
                @apply dark:(border-dark-100);

                .skeletonAvatar {
                    .height(90);
                    .width(90);
                    border-radius: 100%;
                }

                .avatar {
                    .center();
                    border-radius: 50%;
                    width: 100%;
                    background: @bg-color;
                    overflow: hidden;

                    img {
                        .height(90);
                        .width(90);
                        border-radius: 100%;
                        object-fit: cover;
                    }
                }

                .icon-edit {
                    .center();
                    position: absolute;
                    z-index: 2;
                    .right(3);
                    .bottom(3);
                    border: 1px solid @border-color;
                    .font-size(12);
                    .height(24);
                    background: @bg-color;
                    border-radius: 50%;
                    .width(24);
                    @apply dark:(border-dark-100 bg-dark-300 text-light-900/60);
                }
            }

            .uhead {
                width: 100%;
                .margin(10, 0, 0, 0);
                .center();

                .name {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(20);
                    color: @text-color;

                    max-width: 70%;
                    .ellipsis();
                    @apply dark:(text-light-900);
                }

                i {
                    .font-size(14);
                    .margin(0, 0, 0, 10);
                    cursor: pointer;
                }

                .icon-cert {
                    color: @text-active;
                    .font-size(16);
                }

                .icon-link {
                    color: @text-color-grey;
                }
            }

            strong {
                width: 100%;
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                .line-height(17);
                color: @text-fcolor;
                .margin(20, 0, 0, 0);
                text-align: center;
                // .height(70);
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                white-space: pre-line;
                word-break: break-word;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                @apply dark:(text-light-900/60);
            }
        }

        .subscribers {
            display: flex;
            width: 100%;
            .margin(0, 0, 30, 0);

            .item {
                display: flex;
                background: @bg-color;
                .border-radius(25);
                .padding(16, 18, 0, 18);
                flex-direction: column;
                flex: 1;
                @apply dark:(bg-dark-600);

                i {
                    color: #b63ce6;
                    .font-size(35);
                }

                p {
                    width: 70%;
                    .margin(17, 0, 0, 0);
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(22);
                    color: @text-fcolor;
                    @apply dark:(text-light-900/60);
                }

                strong {
                    font-style: normal;
                    font-weight: 700;
                    .font-size(32);
                    .line-height(39);
                    color: @text-color;
                    .margin (30, 0, 36, 0);

                    @apply dark:(text-light-900);

                    i {
                        .font-size(26);
                        .line-height(39);
                        color: @text-color;
                        font-style: normal;
                        @apply dark:(text-light-900/80);
                    }
                }

                &:last-child {
                    .margin(0, 0, 0, 30);

                    i {
                        color: #806ef2;
                    }

                    strong {
                        cursor: pointer;
                    }
                }
            }
        }

        .articles {
            display: flex;
            background: @bg-color;
            flex-direction: column;
            border-radius: 25px;
            @apply dark:(bg-dark-600);

            .title {
                display: flex;
                width: 100%;
                .padding(30, 25, 30, 25);
                cursor: pointer;

                p,
                i {
                    font-style: normal;
                    font-weight: 500;
                    .font-size(18);
                    .line-height(22);
                    color: @text-color;

                    @apply dark:(text-light-900);
                }

                i {
                    margin-left: auto;
                }
            }

            .list {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                .margin(0, 25, 30, 25);
                .height(225);
                position: relative;
                background: #f8f8ff;
                @apply dark:(bg-purple-300/20);
                border-radius: 25px;

                .item {
                    display: flex;
                    width: 100%;
                    border-radius: 25px;

                    span {
                        .height(75);
                        display: flex;
                        width: 100%;
                        justify-content: space-between;
                        .padding(0, 25, 0, 25);
                        align-items: center;
                        cursor: pointer;

                        &:hover {
                            p {
                                color: @text-active;
                                transition: @transition;
                            }

                            em {
                                border: 1px solid @text-active;
                                background-color: @text-active;
                                color: #fff;
                                transition: @transition;
                            }
                        }
                    }

                    p {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(16);
                        .line-height(19);
                        color: @text-color;
                        @apply dark:(text-light-900/60);
                    }

                    em {
                        .center();
                        font-style: normal;
                        font-weight: 400;
                        .font-size(16);
                        .line-height(16);
                        color: @text-color;
                        border: 1px solid @text-color;
                        .border-radius(18);
                        .padding(0, 10, 0, 10);
                        .height(24);
                        @apply dark:(text-light-900/60 border-light-900/60);
                    }

                    &:nth-child(2) {
                        background: #fff;
                        // position: absolute;
                        // .top(75);
                        z-index: 2;
                        // .height(150);
                        @apply dark:(bg-dark-600/20);
                    }

                    &:nth-child(3) {
                        background: #f9f9f9;
                        // position: absolute;
                        // .top(150);
                        z-index: 3;
                        // .height(75);
                        border-radius: 25px 25px 25px 25px !important;
                        @apply dark:(bg-purple-500/10);
                    }
                }
            }
        }
    }

    .middle {
        display: flex;
        flex: 1;
        .margin(0, 40, 0, 40);
        flex-direction: column;

        .canister {
            display: flex;
            .margin(0, 0, 34, 0);
            background: @bg-color;
            .border-radius(25);
            overflow: hidden;
            @apply dark:(bg-dark-600);

            .canisterLeft {
                .padding(30, 0, 30, 30);
                display: flex;
                justify-content: center;
                flex: 1.5;
                position: relative;
                flex-direction: column;
                flex-shrink: 1;
                font-weight: 325;

                &::after {
                    @apply dark:(opacity-10);
                }

                .icon-point {
                    .font-size(42);
                    color: @text-active;
                }

                h3 {
                    margin: 0;
                    font-style: normal;
                    font-weight: 500;
                    width: 100%;
                    .font-size(20);
                    .line-height(29);
                    color: @text-color;
                    .margin(15, 0, 0, 0);

                    @apply dark:(text-light-900);
                }

                em,
                strong {
                    font-style: normal;

                    .font-size(16);
                    .line-height(19);
                    color: @text-fcolor;
                    .margin(15, 0, 0, 0);
                    @apply dark:(text-light-900/60);
                }

                .btns {
                    display: flex;
                    align-items: center;
                }

                .icon-copy {
                    .center();
                    width: 32px;
                    height: 32px;
                    color: @text-color-grey;
                    border: 2px solid @border-color;
                    .font-size(16);
                    .border-radius(10);
                    cursor: pointer;
                    transition: @transition;
                    .margin(15, 0, 0, 0);
                    @apply dark:(border-dark-100);

                    &:hover {
                        transition: @transition;
                        border-color: @bg-color-body-active;
                        color: @text-active;
                    }
                }

                .widthdraw {
                    .center();
                    color: @text-color-grey;
                    border: 2px solid @border-color;
                    .font-size(14);
                    .border-radius(10);
                    cursor: pointer;
                    transition: @transition;
                    .margin(15, 0, 0, 15);
                    .height(34);
                    .padding(0, 10, 0, 10);
                    @apply dark:(border-dark-100);

                    i {
                        .font-size(20);
                        margin-right: 8px;
                    }

                    &:hover {
                        transition: @transition;
                        border-color: @bg-color-body-active;
                        color: @text-active;
                    }
                }

                &::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 0;
                    display: flex;
                    width: 1px;
                    height: 100%;
                    // background: linear-gradient(to bottom, #eee 0%, #fff 100%);
                }
            }

            .canisterRight {
                .center();
                .padding(0, 30, 0, 30);
                background: linear-gradient(135deg, #fbfbfb 5%, #fff, #fff, #fff);
                flex: 1;
                flex-direction: column;
                @apply dark:(bg-gradient-to-br from-dark-500 to-dark-600);

                .item {
                    display: flex;
                    width: 100%;

                    i {
                        display: flex;
                        .font-size(18);
                        color: @text-color-grey;
                        .margin(0, 15, 0, 0);
                    }

                    >div {
                        display: flex;
                        flex: 1;
                        flex-direction: column;

                        span {
                            .font-size(16);
                            color: @text-fcolor;
                            .margin(5, 0, 0, 0);
                            @apply dark:(text-light-900/60);

                            em {
                                font-style: normal;
                                color: @text-color;

                                margin-right: 2px;
                                @apply dark:(text-light-900);
                            }
                        }

                        p {
                            font-weight: 500;
                            .font-size(16);
                            .line-height(22);
                            color: @text-color;

                            @apply dark:(text-light-900/80);
                        }

                        strong {
                            width: 100%;
                            text-align: right;
                            font-style: normal;
                            font-weight: 400;
                            .font-size(14);
                            .line-height(17);
                            color: @text-fcolor;
                            .margin(7, 0, 3, 0);
                            @apply dark:(text-light-900/60);
                        }

                        :deep(.el-progress) {
                            .el-progress-bar {
                                margin-left: 0;
                            }
                        }
                    }

                    &:nth-child(2),
                    &:last-child {
                        .margin(25, 0, 0, 0);
                    }
                }
            }
        }

        .articles {
            display: flex;
            background: @bg-color;
            .padding(25, 30, 25, 30);
            .border-radius(25);
            flex-direction: column;
            .height(538);
            @apply dark:(bg-dark-600);

            .title {
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: center;

                h3 {
                    font-style: normal;
                    font-weight: 500;
                    .font-size(20);
                    .line-height(29);
                    color: @text-color;
                    margin: 0;

                    @apply dark:(text-light-900);
                }

                i {
                    .font-size(20);
                    transition: @transition;
                    @apply dark:(text-light-900/60);

                    &:hover {
                        color: @text-active;
                        cursor: pointer;
                        transition: @transition;
                    }
                }
            }

            .list {
                display: flex;
                flex-direction: column;
                width: 100%;
                .padding(0, 0, 10, 0);

                .item {
                    display: flex;
                    width: 100%;

                    .margin(26, 0, 0, 0);

                    .header {
                        .center();
                        .width(95);
                        .height(50);
                        overflow: hidden;
                        .center();
                        .border-radius(10);
                        position: relative;
                        .margin(0, 20, 0, 0);

                        img {
                            position: absolute;
                            width: 100%;
                            background: @bg-color-body;
                        }
                    }

                    .sArticleImg {
                        .width(95);
                        .height(50);
                        .border-radius(10);
                        .margin(0, 20, 0, 0);
                    }

                    .titleBox {
                        display: flex;
                        flex-direction: column;
                        .height(50);
                        flex: 1;
                        justify-content: space-between;

                        p {
                            .ellipsisMore(1);

                            .font-size(16);
                            .line-height(22);
                            color: @text-color;
                            transition: @transition;
                            @apply dark:(text-light-900/80);

                            &:hover {
                                transition: @transition;
                                color: @text-active;
                                cursor: pointer;
                            }
                        }

                        span {
                            display: flex;
                            width: 100%;
                            align-items: center;

                            strong {
                                display: flex;
                                .margin(0, 20, 0, 0);
                                align-items: center;

                                i {
                                    color: @text-color-grey;
                                    .font-size(18);

                                    &.icon-views {
                                        .font-size(18);
                                    }
                                }

                                em {
                                    font-style: normal;
                                    font-weight: 400;
                                    .font-size(14);
                                    .line-height(17);
                                    color: @text-fcolor;
                                    .margin(0, 0, 0, 6);

                                    i {
                                        color: rgba(102, 102, 102, 0.5);
                                        font-style: normal;
                                        .font-size(12);
                                    }
                                }
                            }
                        }

                        @media screen and (min-width: 0) and (max-width: 750px) {
                            .margin(0, 0, 0, 10);

                            p {
                                .font-size(14);
                                .line-height(14);
                            }

                            span {
                                strong {
                                    i {
                                        .font-size(12);
                                    }

                                    em {
                                        .font-size(12);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .right {
        display: flex;
        width: 330px;
        flex-direction: column;

        .create {
            display: flex;
            .padding(47, 30, 47, 30);
            .margin(0, 0, 34, 0);
            background: @bg-color;
            .border-radius(25);
            flex-direction: column;
            @apply dark:(bg-dark-600);

            .createArticle {
                .center();
                background: @bg-color-body-active;
                border-radius: 15px;
                .height(70);
                font-style: normal;
                font-weight: 400;
                .font-size(20);
                .line-height(24);
                color: @text-color-inverse;
                transition: @transition;

                &:hover {
                    cursor: pointer;
                    opacity: 0.85;
                    box-shadow: 0 0 15px rgba(128, 110, 242, 0.5);
                    transition: @transition;
                }
            }

            .addCycles {
                .center();
                border: 1px solid @border-color-active;
                border-radius: 15px;
                .height(68);
                font-style: normal;
                font-weight: 400;
                .font-size(20);
                .line-height(24);
                color: @text-active;
                .margin(35, 0, 0, 0);
                transition: @transition;

                &:hover {
                    border: 1px solid #cd66f6;
                    background-color: #cd66f6;
                    color: @text-color-inverse;
                    transition: @transition;
                    box-shadow: 0 0 15px rgba(182, 60, 230, 0.5);
                    cursor: pointer;
                }
            }
        }

        .subscription {
            display: flex;
            .padding(25, 30, 25, 30);
            .margin(0, 0, 34, 0);
            background: @bg-color;
            .border-radius(25);
            flex-direction: column;
            .height(430);
            @apply dark:(bg-dark-600);

            .head {
                display: flex;
                justify-content: space-between;
                align-items: center;

                h3 {
                    font-style: normal;
                    font-weight: 500;
                    .font-size(20);
                    .line-height(29);
                    color: @text-color;
                    margin: 0;

                    @apply dark:(text-light-900);
                }

                i {
                    .font-size(18);
                    transition: @transition;
                    @apply dark:(text-light-900/60);

                    &:hover {
                        color: @text-active;
                        cursor: pointer;
                        transition: @transition;
                    }
                }
            }

            .list {
                display: flex;
                width: 100%;
                flex-direction: column;

                .item {
                    display: flex;
                    width: 100%;
                    .height(50);
                    .margin(35, 0, 0, 0);

                    img {
                        .height(50);
                        .width(50);
                        .border-radius(15);
                    }

                    .sArticleImg {
                        .height(50);
                        .width(50);
                        .border-radius(15);
                    }

                    .name {
                        display: flex;
                        flex: 1;
                        flex-direction: column;
                        .height(50);
                        justify-content: center;
                        .margin(0, 0, 0, 15);
                        overflow: hidden;

                        p {
                            font-style: normal;
                            font-weight: 400;
                            .font-size(16);
                            .line-height(19);
                            color: @text-color;
                            .ellipsis();
                            @apply dark:(text-light-900/80);
                        }

                        em {
                            font-style: normal;
                            font-weight: 400;
                            .font-size(14);
                            .line-height(17);
                            color: @text-fcolor;
                            .margin(6, 0, 0, 0);
                        }
                    }

                    .price {
                        display: flex;
                        width: 65px;
                        flex-direction: column;
                        .height(50);
                        justify-content: center;
                        .margin(0, 0, 0, 10);
                        align-items: flex-end;

                        p {
                            font-style: normal;
                            font-weight: 400;
                            .font-size(16);
                            .line-height(24);
                            color: @text-color;

                            @apply dark:(text-light-900);

                            i {
                                font-style: normal;
                                .font-size(14);
                            }
                        }

                        em {
                            font-style: normal;
                            font-weight: 400;
                            .font-size(14);
                            .line-height(17);
                            color: @text-color;
                            .margin(6, 0, 0, 0);
                        }
                    }
                }
            }
        }

        .accompanied {
            display: flex;
            .padding(15, 33, 15, 32);
            background: url(@/assets/svg/slogan.svg) no-repeat center center @bg-color;
            .border-radius(20);
            flex-direction: column;
            @apply dark:(bg-none bg-dark-600);

            p {
                font-style: normal;
                .font-size(18);
                .line-height(24);
                font-weight: 500;
                color: @text-fcolor;
                @apply dark:(text-light-900/60);

                em {
                    color: @text-color;
                    font-style: normal;
                    @apply dark:(text-light-900);
                }
            }
        }
    }
}

.noData {
    width: 100%;

    i {
        .font-size(70);
        display: block;
        color: @text-color-grey;
        opacity: 0.5;
        margin: 0 auto;
        text-align: center;
    }

    span {
        .padding(10, 0, 0, 0);
        .font-size(16);
        display: block;
        color: @text-color-grey;
        text-align: center;

        &.tips {
            .padding(30, 0, 0, 0);
            .center();
            color: @text-active;

            i {
                .font-size(12);
                color: @text-active;
                .margin(0, 0, 0, 6);
                opacity: 1;
            }

            &:hover {
                cursor: pointer;
            }
        }
    }

    &.articlelist {
        .padding(120, 0, 0, 0);
    }

    &.subs {
        .padding(120, 0, 0, 0);
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .dashboard {
        flex-direction: column;
        .margin(10, 0, 0, 0) !important;

        .left {
            flex: none;
            width: 100%;
            .margin-media(0, 0, 20, 0);

            .user,
            .subscribers,
            .articles {
                height: auto;
                .margin-media(0, 0, 20, 0);

                &.articles {
                    margin-bottom: 0;
                }
            }

            .user {
                strong {
                    .line-height(16);
                }

                .avatarBox {
                    .icon-edit {
                        .font-size(10);
                    }
                }
            }
        }

        .middle {
            display: flex;
            width: 100%;
            .margin-media(0, 0, 20, 0);

            .canister {
                flex-direction: column;
                .padding-media(10, 0, 20, 0);
                .margin-media(0, 0, 20, 0);

                .canisterLeft {
                    strong {
                        display: flex;
                        align-items: center;
                    }

                    .icon-copy {
                        .margin(15, 0, 0, 0);
                    }

                    .widthdraw {
                        .height(68);
                        .margin(15, 0, 0, 15);
                    }

                    &::after {
                        width: 100%;
                        height: 1px;
                        left: 0;
                        bottom: 0;
                        right: auto;
                        top: auto;
                        background: linear-gradient(to right, #eee 0%, #fff 100%);
                    }
                }

                .canisterRight {
                    .padding-media(30, 25, 20, 25) !important;
                    justify-content: space-between;
                    flex-direction: row;
                    flex-wrap: wrap;

                    .item {
                        width: 100%;

                        >div {
                            strong {
                                .margin(7, 0, 2, 0);
                            }
                        }

                        &:nth-child(2),
                        &:last-child {
                            width: 100%;
                            .margin(20, 0, 0, 0);
                        }
                    }
                }
            }

            .articles {
                height: auto;

                .list {
                    .item {
                        .margin(20, 0, 0, 0);

                        .titleBox {
                            .height(80);

                            p {
                                .ellipsisMore(1);

                                font-weight: 900;
                                .font-size(16);
                                .line-height(16);
                            }

                            span {
                                strong {
                                    i {
                                        .font-size(14);

                                        &.icon-views {
                                            .font-size(16);
                                        }
                                    }

                                    em {
                                        .font-size(14);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        .center {
            .margin-media(0, 0, 20, 0);
            flex: none;
            width: 100%;

            .canister,
            .articles {
                height: auto;
            }
        }

        .right {
            flex: none;
            width: 100%;
            .margin-media(0, 0, 20, 0);

            .create {
                display: none;
            }

            .create,
            .subscription,
            .accompanied {
                .padding-media(20, 33, 20, 32);
                .margin-media(0, 0, 20, 0);
            }

            .subscription {
                height: auto;

                .list {
                    .item {
                        .price {
                            width: 80px;
                        }
                    }
                }
            }
        }
    }

    .noData {
        &.articlelist {
            .padding(100, 0, 100, 0);
        }

        &.subs {
            .padding(80, 0, 0, 0);
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1240px) {
    .dashboard {
        .left {
            width: 300px;
        }

        .middle {
            margin-right: 0;

            .articles {
                .list {
                    .header {
                        width: 60px !important;
                        height: 60px !important;
                    }

                    .titleBox {
                        p {
                            .height(50);
                        }
                    }
                }
            }
        }

        .right {
            display: none;
        }
    }

    .noData {
        &.articlelist {
            .padding(140, 0, 140, 0);
        }

        &.subs {
            .padding(95, 0, 95, 0);
        }
    }
}
</style>
