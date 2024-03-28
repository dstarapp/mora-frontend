<template>
    <div v-if="store.state.meta['twitter:url']">
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" :content="store.state.meta['twitter:site']" />
        <meta property="twitter:title" :content="store.state.meta['twitter:title']" />
        <meta property="twitter:description" :content="store.state.meta['twitter:description']" />
        <meta property="twitter:image" v-if="articleData && isIPFSHashOrHttps(articleData.thumb)"
            :content="getImagesUrl(articleData.thumb)" />
        <meta property="twitter:url" :content="store.state.meta['twitter:url']" />
    </div>
    <div class="layout">
        <el-skeleton class="container <md:(px-4) md:(px-8)" animated v-if="!articleData">
            <template #template>
                <div class="pt-15">
                    <el-skeleton-item variant="text" class="skeleton-title w-full" />
                    <el-skeleton-item variant="text" class="skeleton-title mt-2" style="width: 60%" />
                </div>
                <div class="articleInfo">
                    <el-skeleton-item variant="text" class="mr-5 h-6" style="width: 200px" />
                    <el-skeleton-item variant="text" class="w-25 h-6" />
                </div>
                <div class="w-full py-5">
                    <el-skeleton :rows="5" animated />
                    <el-skeleton-item variant="image" class="w-full my-6 h-80 <sm:(h-50)" />
                    <el-skeleton :rows="3" animated />
                </div>
            </template>
        </el-skeleton>
        <div class="container" v-else>
            <transition name="el-fade-in-linear">
                <div class="directory" :class="{
        fixed: directoryTop === 2,
    }" v-show="isDirectory">
                    <Directory :directoryIndex="directoryIndex" />
                </div>
            </transition>
            <div ref="fileToImg" class="<md:(px-4) md:(px-8)">
                <div ref="titleDom" translate="yes">
                    <!-- <div class="thumb">
                        <img
                            v-if="articleData.thumb"
                            :src="getImagesUrl(articleData.thumb)"
                            alt=""
                        />
                    </div> -->
                    <h1 class="title" v-html="articleData ? articleData.title : ''"></h1>
                    <div class="articleInfo" translate="no" :class="{ isHtml2Canvas: isHtml2Canvas }">
                        <div class="flex items-center">
                            <span class="reproduced" v-if="!articleData.original">
                                <strong>{{ $t('articleSource.source2') }}</strong>
                            </span>
                            <span v-else class="original">
                                <strong>{{ $t('articleSource.source1') }}</strong>
                            </span>
                            <div class="timer">
                                <strong>{{
        articleData
            ? moment(Number(articleData.updated)).format('MMM Do, YYYY')
            : 'unknow'
    }}</strong>
                            </div>
                            <div class="author">
                                <strong>
                                    <template v-if="address">{{ address }}</template>
                                    <el-tooltip v-else :teleported="false" effect="dark"
                                        :content="articleData ? articleData.author.toString() : ''" placement="top">
                                        {{
        articleData
            ? dealPid(articleData.author.toString())
            : ''
    }}
                                    </el-tooltip>
                                </strong>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="editArticle" v-if="store.state.agent &&
        ~store.state.planets_data.indexOf(planetId) &&
        !isHtml2Canvas
        " @click="editArticle">
                                <i class="iconfont icon-create"></i>
                                <span>{{ $t('browserArticle.edit') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="reproducedbox" v-if="!articleData.original" @click="openLink(articleData.fromurl)">
                    <div class="rebox" :class="{ isHtml2Canvas: isHtml2Canvas }">
                        <span>
                            {{ $t('subread.reproducedbox') }}
                        </span>
                        <p>{{ articleData.fromurl }}</p>
                    </div>
                    <i class="iconfont icon-arrow-right"></i>
                </div>
                <div class="summary" v-if="isLocked && articleData && articleData.abstract">
                    {{ articleData.abstract }}
                </div>

                <div class="locked" v-if="isLocked">
                    <img src="@/assets/pic/lockedbg.png" />
                    <div class="lockbox">
                        <i class="iconfont" :class="isBlack ? 'icon-blacklist' : 'icon-locked'"></i>
                        <h2>{{ isBlack ? $t('subread.isBlack') : $t('subread.loginread') }}</h2>
                        <div class="txt" v-if="!isBlack">
                            {{ $t('subread.txt') }}
                        </div>
                        <template v-if="!isBlack">
                            <button @click="subscribe" v-if="store.state.agent" :class="{
        upgrade: subType || isExpire,
        disabled: subscribeLoading,
    }">
                                <i class="iconfont icon-upgrade-1" v-if="subType || isExpire"></i>
                                {{ subType || isExpire ? $t('btns.upgrade') : $t('subread.btn') }}
                                <span class="free" v-if="!browserPlanetUserData?.subprices?.length">
                                    {{ $t('planet.free') }}
                                </span>
                                <template v-else> + </template>
                            </button>
                            <button v-else @click="openLogin">
                                {{ $t('subread.btn') }}
                                <span class="free" v-if="!browserPlanetUserData?.subprices?.length">
                                    {{ $t('planet.free') }}
                                </span>
                                <template v-else> + </template>
                            </button>
                        </template>
                    </div>
                </div>

                <Preview v-if="!isLocked" ref="contentDom" :content="articleData ? articleData.content : ''" />

                <!-- reward -->
                <div v-show="!isHtml2Canvas">
                    <Reward />
                </div>

                <div class="tags" v-if="articleData && articleData.tags.length">
                    {{ $t('browserArticle.tag') }}:
                    <span v-for="item in articleData.tags" :key="item">#{{ item }}</span>
                </div>

                <div v-if="recordList.length" class="chain-address">
                    <div class="alist" @click="openArTx(recordList[0].id)" :class="{ open: isShowAr }">
                        <span>
                            {{ $t('browserArticle.arweave') }}
                            <i class="nums">{{ recordList.length }}</i>
                            <img src="@/assets/svg/arrow-right-top.svg" />
                        </span>
                        <p>{{ recordList[0].id }}</p>
                    </div>
                    <div class="fold" :class="{ show: isShowAr }">
                        <template v-for="(item, index) in recordList" :key="item.id">
                            <div class="alist" v-if="index !== 0" @click="openArTx(item.id)">
                                <span class="date">
                                    {{
        item.timestamp
            ? item.timestamp
            : $t('browserArticle.blockGeneration')
    }}
                                </span>
                                <p>{{ item.id }}</p>
                            </div>
                        </template>
                    </div>
                    <button @click="showAr" v-if="recordList.length > 1">
                        <i class="iconfont" :class="!isShowAr ? 'icon-arrow-down' : 'icon-arrow-up'" />
                    </button>
                </div>
            </div>
            <div class="soperates" ref="soperatesDom" v-if="!isLocked">
                <template v-if="store.state.agent">
                    <div class="items subscribed" v-if="subType === 'Permanent' ||
        (subType === 'Free' && !browserPlanetUserData?.subprices.length)
        ">
                        <div class="item"><i class="iconfont icon-correct"></i></div>
                        <span>{{ $t('planet.subscribed') }}</span>
                    </div>
                    <div class="items upgrade" v-else-if="subType || isExpire" @click="subscribe">
                        <div class="item"><i class="iconfont icon-upgrade-1"></i></div>
                        <span>{{ $t('planet.subscribed') }}</span>
                    </div>
                    <div class="items sub" v-else-if="store.state.agent && !~store.state.planets_data.indexOf(planetId)
        " @click="subscribe">
                        <div class="item"><i class="iconfont icon-add"></i></div>
                        <span>{{ $t('subread.btn') }}</span>
                    </div>
                </template>
                <div class="items sub" v-else @click="openLogin">
                    <div class="item"><i class="iconfont icon-add"></i></div>
                    <span>{{ $t('subread.btn') }}</span>
                </div>

                <div class="items thumbs" :class="{ active: isThumbsup }" @click="thumbsup">
                    <div class="item">
                        <i class="iconfont icon-thumbsup"></i>
                    </div>
                    <span>{{ Number(articleData.like) }}</span>
                </div>
                <div class="items" @click="scrollToComments">
                    <div class="item">
                        <i class="iconfont icon-comment"></i>
                    </div>
                    <span>{{ replyNum }}</span>
                </div>
                <div class="items collect" :class="{ active: isCollect }" @click="setCollect">
                    <div class="item">
                        <i class="iconfont icon-collection-1"></i>
                    </div>
                    <span>{{ $t('operate.collect') }}</span>
                </div>
                <div class="items share" v-if="!isPrivate" @click="showShare = !showShare" ref="rootShare">
                    <div class="item"><i class="iconfont icon-share"></i></div>
                    <span>{{ $t('operate.share') }}</span>
                    <transition name="fadeimg">
                        <div class="shareBox" v-if="showShare">
                            <div class="twitter" @click="twitterShare">
                                <i class="iconfont icon-twitter"></i>
                            </div>
                            <div class="link" @click="linkShare">
                                <i class="iconfont icon-link"></i>
                            </div>
                            <div class="genImg" ref="genImgDom" @click="genMyImg">
                                <i class="iconfont icon-genImg2"></i>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>

            <div v-if="store.state.directory_data.length" class="mdirectory" @click="openMdirectory">
                <i class="iconfont icon-directory"></i>
            </div>

            <mDirectory v-if="isMdirectory" @componentClose="componentClose" />

            <transition name="fadeimg">
                <div class="modal-bg" v-if="imgPreview.isShowImg">
                    <div class="myImg" @click="hideImg">
                        <img :src="imgPreview.imgUrl" />
                    </div>
                </div>
            </transition>

            <div class="preNext" v-if="nextData || prevData" :class="{ only: !(nextData && prevData) }">
                <div class="itembox" v-if="prevData">
                    <div class="abox">
                        <div class="ptitle">{{ prevData.title }}</div>
                        <div class="attrs">
                            <div v-if="prevData.original" class="original">original</div>
                            <div v-else class="reproduced">reproduced</div>
                            <div class="article-data">
                                <span>
                                    <i class="iconfont icon-zan" />
                                    {{ prevData.like }}
                                </span>
                                <span>
                                    <i class="iconfont icon-talks" />
                                    {{ prevData.comment }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="pbtn" @click="jumpLink(prevData.id)">
                        <i class="iconfont icon-arrow-left"></i>
                        Previous
                    </div>
                </div>
                <div class="itembox" v-if="nextData">
                    <div class="abox">
                        <div class="ptitle">{{ nextData.title }}</div>
                        <div class="attrs">
                            <div v-if="nextData.original" class="original">original</div>
                            <div v-else class="reproduced">reproduced</div>
                            <div class="article-data">
                                <span>
                                    <i class="iconfont icon-zan" />
                                    {{ nextData.like }}
                                </span>
                                <span>
                                    <i class="iconfont icon-talks" />
                                    {{ nextData.comment }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="pbtn" @click="jumpLink(nextData.id)">
                        Next
                        <i class="iconfont icon-arrow-right"></i>
                    </div>
                </div>
            </div>

            <div ref="commentsBox" class="px-8 <md:(px-4)">
                <Comments ref="commentsDom" v-if="!isLocked && articleData.allowComment" :articleData="articleData"
                    @updateReplyNum="updateReplyNum" />
            </div>
        </div>
    </div>
    <GenImg v-if="isShowImg" :shareImgUrl="genImgUrl" :title="articleData ? articleData.title : ''"
        @closeGenImg="closeGenImg" />
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    inject,
    provide,
    nextTick,
    onMounted,
    watch,
    onUnmounted,
    shallowRef,
} from 'vue';
import store from '@/store';
import { Principal } from '@dfinity/principal';
import { useRoute, useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import debug from '@/utils/debug';
import Comments from './components/Comments.vue';
import Directory from '@/components/Directory.vue';
import mDirectory from '@/components/mDirectory.vue';
import moment from 'moment';
import { getIcnaming } from '@/utils/icnaming';
import { createActor } from '@/request/agent';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';
import { isMobile, getImagesUrl, dealPid, copyText, isIPFSHashOrHttps } from '@/utils/functions';
import CONFIG from '@/assets/config';
import { idlFactory as thumbsupFactory } from '@/request/canister/thumbsup.did';
import { idlFactory as likesFactory } from '@/request/canister/likes.did';
import GenImg from '@/components/GenImg.vue';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import logo from '@/assets/svg/logo.png';
import subscribeSvg from '@/assets/svg/subscribe.svg';
import moraEnterDark from '@/assets/svg/mora-enter-dark.svg';
import moraEnterLight from '@/assets/svg/mora-enter-light.svg';
import Preview from '@/components/Preview.vue';
import { getArweaveByArticleId, openArTx } from '@/request/arweave';
import Reward from './components/Reward.vue';

export default defineComponent({
    components: { Comments, Directory, mDirectory, GenImg, Preview, Reward },
    props: {},
    name: 'browserArticle',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const contentDom = ref();
        const planetId = ref();
        const articleId = ref();
        const articleData = ref();
        const showShare = ref(false);
        const isShowImg = ref(false);
        const genImgDom = ref();
        const fileToImg = ref();
        const titleDom = ref();
        const genImgUrl = ref();
        const commentsBox = ref();
        const isHtml2Canvas = ref(false);
        const tweetMetadata = ref(false);
        const imgPreview = ref({
            imgUrl: '',
            isShowImg: false,
        });
        const currentCanister: any = ref();
        const isLocked = ref(false);
        const address = ref();
        const isSubscribed = ref(false);
        const permissions = ref();
        const isCollect = ref(false);
        const isThumbsup = ref(false);
        const collectLoading = ref(false);
        const isDirectory = ref(true);
        const isMdirectory = ref(false);
        const directoryTopList = ref([]);
        const directoryIndex = ref(0);
        const directoryTop = ref(1);
        const subType = ref();
        const expireTime = ref();
        const isBlack = ref(false);
        const subscribeLoading = ref(false);
        const isExpire = ref(false);
        const isPrivate = ref(window?.__PRIVATE_CONFIG__?.planet);
        const commentsDom = shallowRef();
        const openLogin: any = inject('openLogin', null);
        const getPlanetCanister: any = inject('getPlanetCanister', null);
        const browserPlanetID: any = inject('browserPlanetID', null);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const usersCanister: any = inject('usersCanister', null);
        const planetCanister: any = inject('planetCanister', null);
        const recordList: any = ref([]);
        let clearLock = false;
        let clearCommentLock = false;
        const replyNum = ref(0);
        const soperatesDom = ref();
        const isSticky = ref(true);
        const isShowAr = ref(false);
        const showAr = () => {
            isShowAr.value = !isShowAr.value;
        };

        const articleList = ref([]);

        const updateReplyNum = (val) => {
            replyNum.value = val;
        };

        const articleListPage = ref(1);
        const articleListSize = ref(50);

        const getArticleList = async () => {
            if (!currentCanister?.value?.value) return;

            const str = {
                status: [],
                subcate: 0,
                cate: 0,
                atype: [
                    {
                        Article: null,
                    },
                ],
                page: articleListPage.value,
                size: articleListSize.value,
                sort: {
                    TimeDesc: null,
                },
                search: '',
            };
            const res: any = await currentCanister.value.value.queryArticles(str);

            if (res.data.length) {
                articleList.value = articleList.value.concat(res.data);
            }
            if (res.hasmore) {
                articleListPage.value = articleListPage.value + 1;
                getArticleList();
            } else {
                computeNextOrPrev();
            }
        };

        const prevData = ref<any>(false);
        const nextData = ref<any>(false);
        const computeNextOrPrev = () => {
            if (articleList.value.length) {
                const idx = _.findIndex(articleList.value, ['id', articleId.value]);
                if (articleList.value[idx - 1]) {
                    prevData.value = articleList.value[idx - 1];
                }
                if (articleList.value[idx + 1]) {
                    nextData.value = articleList.value[idx + 1];
                }
            }
        };

        const jumpLink = (id) => {
            router.push({
                name: 'browserArticle',
                params: {
                    id: planetId.value,
                    articleId: id,
                },
            });
        };

        const getArticle = async () => {
            if (
                !browserPlanetID ||
                (browserPlanetID.value !== route.params.id &&
                    browserPlanetID.value !== window?.__PRIVATE_CONFIG__?.planet)
            ) {
                return;
            }
            nextTick(async () => {
                isLocked.value = false;
                articleData.value = '';
                getIsSubscribe();
                getIsThumbsup();
                try {
                    const res = await currentCanister.value.value.queryArticle(articleId.value);

                    if (res) {
                        const data = res.Ok.article;
                        data.content = res.Ok.content;
                        articleData.value = data;
                        if (!Number(articleData.value.updated)) {
                            articleData.value.updated = articleData.value.created;
                        }
                        setDocumentTitle();
                        store.commit('SET_META', {
                            'twitter:card': 'summary_large_image',
                            'twitter:url': location.href,
                            'twitter:type': 'article',
                            'twitter:title': articleData.value.title,
                            'twitter:description': articleData.value.abstract,
                        });
                        const meta = document.querySelector('meta[name="description"]');
                        if (meta) {
                            meta.setAttribute('content', articleData.value.abstract);
                        }
                        permissions.value = Object.keys(data.status)[0];
                        if (data?.author) {
                            const addressRes = await getIcnaming(data.author);
                            if (addressRes) {
                                address.value = addressRes;
                            }
                        }
                        if (!data.content && permissions.value === 'Subcribe') {
                            isLocked.value = true;
                            return;
                        } else {
                            isLocked.value = false;
                        }

                        nextTick(() => {
                            setTimeout(() => {
                                generateDirectory();
                                clearArticleNotice();
                                if (route?.query?.comments === 'true') {
                                    const top = Number(
                                        commentsBox.value?.getBoundingClientRect()?.top,
                                    );
                                    if (top) {
                                        window.scroll(0, top);
                                    }
                                }
                            }, 0);
                        });

                        if (permissions.value === 'Public') {
                            try {
                                recordList.value = await getArweaveByArticleId(
                                    articleId.value,
                                    planetId.value,
                                );
                            } catch (err) {
                                recordList.value = [];
                            }
                        }
                    } else {
                        isLocked.value = true;
                    }
                } catch (err) {
                    debug('error ', err);
                    const currentRoute = router.currentRoute.value.path;
                    const historyArr: any[] = [];
                    for (let i = 0; i < window.history.length; i++) {
                        const state = window.history.state[i];
                        if (state) {
                            historyArr.push(state);
                        }
                    }

                    if (window.history.length) {
                        window.history.replaceState(null, '', currentRoute);
                    }
                    router.push({ path: '/404' });
                }
            });
        };

        const openLink = (url) => window.open(url);

        const thumbsup = async (tid, type) => {
            if (!store.state.agent) {
                openLogin();
                return;
            }

            const thumbsupInit = async () => {
                const _cancel = async () => {
                    try {
                        const res = await currentCanister.value.value.cancelThumbsup(
                            articleId.value,
                            typeof tid === 'number' ? [tid] : [],
                        );
                        if (res.Ok) {
                            // ...
                        }
                    } catch (err) {
                        debug('error', err);
                    }
                };

                const _thumbsup = async () => {
                    try {
                        const res = await currentCanister.value.value.thumbsup(
                            articleId.value,
                            typeof tid === 'number' ? [tid] : [],
                        );
                        if (res.Ok) {
                            // ...
                        }
                    } catch (err) {
                        debug('error', err);
                    }
                };

                if (typeof tid === 'number') {
                    if (type) {
                        _thumbsup();
                    } else {
                        _cancel();
                    }
                } else {
                    if (isThumbsup.value) {
                        isThumbsup.value = false;
                        articleData.value.like = Number(articleData.value.like) - 1;
                        _cancel();
                    } else {
                        isThumbsup.value = true;
                        articleData.value.like = Number(articleData.value.like) + 1;
                        _thumbsup();
                    }
                }
            };

            await thumbsupInit();
        };

        const getIsThumbsup = async (cid = '') => {
            if (!store.state.agent) {
                return;
            }

            try {
                const thumbsupCanister = await createActor(
                    CONFIG.thumbsupCanister,
                    thumbsupFactory,
                );
                const res = await thumbsupCanister.hscan(
                    `lk_${planetId.value}_${articleId.value}`,
                    store.state.user_principal,
                );
                if (res) {
                    const likeCanister = await createActor(res.toString(), likesFactory);
                    const res2 = await likeCanister.hexist(
                        `lk_${planetId.value}_${articleId.value}${cid}`,
                        store.state.user_principal,
                    );
                    if (!cid) {
                        isThumbsup.value = res2;
                    } else {
                        return res2;
                    }
                }
            } catch (err) {
                debug('error', err);
            }
        };

        const getCollections = async () => {
            const res = await usersCanister.value.get_collections({
                page: 1,
                size: 9999,
            });
            if (res && res.data) {
                res.data.map((item) => {
                    if (
                        item.article_id === articleId.value &&
                        item.canister_id.toString() === planetId.value
                    ) {
                        isCollect.value = true;
                    }
                });
            }
        };

        const generateDirectory = () => {
            if (!isDirectory.value) {
                return;
            }
            const dom = contentDom.value?.contentDom;
            if (!dom) {
                return;
            }

            const directoryArr: any[] = [];
            const headers = dom.querySelectorAll('h1, h2');
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                if (header.innerText) {
                    const id = uuidv4();
                    header.id = id;
                    directoryArr.push({
                        id,
                        type: header.localName === 'h1' ? 'header1' : 'header2',
                        text: header.innerText,
                    });
                    const rect = header.getBoundingClientRect();
                    directoryTopList.value.push(rect.top + document.documentElement.scrollTop);
                }
            }
            store.commit('SET_DIRECTORY_DATA', directoryArr);
        };

        const getIsSubscribe = async () => {
            try {
                const res = await planetCanister.value.getSelfSubcriber();
                isBlack.value = res.isblack;
                if (res.data.length && !res.isblack) {
                    isSubscribed.value = true;
                    subType.value = Object.keys(res.data[0].subType)[0];
                    expireTime.value = Number(res.data[0].expireTime);

                    if (expireTime.value - new Date().getTime() < 0) {
                        isExpire.value = true;
                    }
                } else {
                    isSubscribed.value = false;
                }
            } catch (err) {
                isSubscribed.value = false;
            }
        };

        const setCollect = async () => {
            if (!store.state.agent) {
                openLogin();
                return;
            }

            collectLoading.value = true;
            if (!isCollect.value) {
                isCollect.value = true;
                const res = await usersCanister.value.add_collection(
                    Principal.fromText(planetId.value),
                    articleId.value,
                );
                if (!res) {
                    isCollect.value = false;
                }
                collectLoading.value = false;
            } else {
                isCollect.value = false;
                const res = await usersCanister.value.remove_collection(
                    Principal.fromText(planetId.value),
                    articleId.value,
                );
                if (!res) {
                    isCollect.value = true;
                }
                collectLoading.value = false;
            }
        };

        const showImg = (e: any) => {
            if (e.target.tagName == 'IMG') {
                imgPreview.value.imgUrl = e.target.src;
                imgPreview.value.isShowImg = true;
            }
        };

        const hideImg = () => {
            imgPreview.value.imgUrl = '';
            imgPreview.value.isShowImg = false;
        };

        const setDocumentTitle = () => {
            if (!articleData.value || !articleData.value || !articleData.value.title) {
                return;
            }
            document.title = `${articleData.value.title} - ${browserPlanetUserData.value && browserPlanetUserData.value.name
                ? browserPlanetUserData.value.name
                : ''
                }`;
        };

        const subscribe = async () => {
            if (!store.state.agent) {
                openLogin();
                return;
            }
            if (!browserPlanetUserData.value) {
                return;
            }
            if (subscribeLoading.value) {
                return;
            }

            const prices = browserPlanetUserData.value.subprices;
            if (!prices.length) {
                subscribeLoading.value = true;
                bus.emit('browserOpenComponent', {
                    type: 'FreeSubscribe',
                    expireTime: '',
                });
            } else {
                bus.emit('browserOpenComponent', {
                    type: 'Subscribe',
                    subType: subType.value,
                    expireTime: expireTime.value,
                    hideFree: isLocked.value ? true : false,
                });
            }
        };

        const subscribeSuccess = () => {
            subscribeLoading.value = false;
            nextTick(() => {
                getIsSubscribe();
                getArticle();
            });
        };

        const browserSubscribeStart = () => {
            subscribeLoading.value = true;
        };

        const locateArticle = (item) => {
            const dom = document.getElementById(item.id);
            if (dom) {
                dom.scrollIntoView(true);
                let scrollBar =
                    window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                scrollBar += 5;
                window.scrollTo(0, scrollBar);

                nextTick(() => {
                    bus.emit('browserHeaderClose');
                });
            }
        };

        let prevTop = 0;
        const isElementSticky = () => {
            if (!soperatesDom?.value?.offsetTop) {
                isSticky.value = true;
                return;
            }
            if (prevTop === soperatesDom.value.offsetTop) {
                isSticky.value = false;
            } else {
                isSticky.value = true;
            }
            prevTop = Number(soperatesDom.value.offsetTop);
        };

        const headerRolling = () => {
            const nowTop = document.body.scrollTop + document.documentElement.scrollTop;
            directoryIndex.value = _.sortedIndex(directoryTopList.value, nowTop) - 1;

            if (nowTop >= 300) {
                directoryTop.value = 2;
            } else {
                directoryTop.value = 1;
            }
            const commentsDomHeight = commentsDom?.value?.$el?.nextSibling?.clientHeight;
            if (commentsDom.value && commentsDomHeight && document?.body?.clientHeight) {
                if (nowTop >= document.body.clientHeight - commentsDomHeight - 500) {
                    isDirectory.value = false;
                } else {
                    isDirectory.value = true;
                }
            }
        };

        const clearArticleNotice = async () => {
            if (clearLock) {
                return;
            }

            let hasData = false;

            store.state.notice_list.map((item) => {
                if (item.id === articleId.value && item.type === 'articles') {
                    hasData = true;
                }

                if (item.aid === articleId.value && item.type === 'comment') {
                    if (clearCommentLock) {
                        return;
                    }
                    clearCommentLock = true;
                    const arr = store.state.notice_list.filter((item) => {
                        if (item.aid === articleId.value) {
                            return item;
                        }
                    });
                    store.commit('REMOVE_COMMENT_NOTICE', arr);
                }
            });

            if (!hasData) {
                return;
            }

            if (store.state.agent && !~store.state.planets_data.indexOf(planetId.value)) {
                clearLock = true;
                return;
            }
            clearLock = true;
            const res = await planetCanister.value.resetArticleCommentNew(articleId.value);
            if (res) {
                debug('success', '', false);
            }
        };

        // share
        const twitterShare = () => {
            const title = articleData.value.title;
            let url = `${CONFIG.twitterShareUrl}planet/${planetId.value}/${articleId.value}`;

            const source = route.query.from;
            if (source) {
                url += `?from=${source}`;
            }
            const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title,
            )}&url=${url}`;
            window.open(twitter, '_blank');
        };

        const linkShare = () => {
            copyText(`${CONFIG.twitterShareUrl}${location.pathname.substring(1)}`);
        };

        const openMdirectory = () => {
            isMdirectory.value = true;
        };

        const componentClose = () => {
            isMdirectory.value = false;
        };

        const canvasTextAutoLine = function (
            ctx,
            str,
            leftWidth,
            initHeight,
            titleHeight,
            canvasWidth,
            width,
        ) {
            let lineWidth = 0;
            let lastSubStrIndex = 0;
            for (let i = 0; i < str.length; i++) {
                lineWidth += ctx.measureText(str[i]).width;
                if (lineWidth > canvasWidth) {
                    ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight);
                    if (width < 640) {
                        initHeight += 50;
                    } else {
                        initHeight += 50;
                    }
                    lineWidth = 0;
                    lastSubStrIndex = i;
                    titleHeight += 30;
                }
                if (i == str.length - 1) {
                    ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
                }
            }

            titleHeight = titleHeight + 10;
            return titleHeight;
        };

        const genMyImg = () => {
            let disabled = false;
            CONFIG.productionLink.map((item) => {
                if (~location.host.indexOf(item)) {
                    disabled = true;
                }
            });
            if (disabled) {
                ElMessage.warning(t('utils.development'));
                return;
            }
            if (isShowImg.value) {
                return;
            }
            const dom = permissions.value === 'Subcribe' ? titleDom.value : fileToImg.value;
            isShowImg.value = true;
            const width = dom.offsetWidth;
            const height = dom.offsetHeight;
            let ratio = window.devicePixelRatio;
            // return;
            const imgLength = contentDom.value.contentDom.getElementsByTagName('img').length;
            if (permissions.value !== 'Subcribe') {
                if (imgLength > 3) {
                    ratio = ratio - imgLength / 9;
                }
                if (ratio <= 0.8) {
                    ratio = 0.8;
                }
                if (ratio >= 2) {
                    ratio = 2;
                }

                if (isMobile()) {
                    if (height >= 8000) {
                        ratio = ratio * (8000 / height);
                    }
                }
            }

            debug('ratio', ratio, false);
            setTimeout(() => {
                isHtml2Canvas.value = true;
                nextTick(() => {
                    const isSubcribe = permissions.value === 'Subcribe';
                    const _ignoreElements = (element) => {
                        if (element.classList.contains('chain-address')) {
                            return true;
                        }
                        if (
                            element.localName === 'div' &&
                            element.getAttribute('data-w-e-type') === 'link-card'
                        ) {
                            return true;
                        }
                        return false;
                    };

                    html2canvas(dom, {
                        backgroundColor: store.state.theme == 'light' ? '#ffffff' : '#1c1c1e',
                        ignoreElements: _ignoreElements,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        scale: ratio,
                        width: width,
                        height: height,
                    })
                        .then(async (canvas) => {
                            const url = canvas.toDataURL('image/png', 0);
                            const canvasDom = document.createElement('canvas');
                            canvasDom.width = width * ratio;
                            const dh = height > 340 ? 340 : height;
                            const proportion = width / (width - 60 * ratio);
                            if (isSubcribe) {
                                if (width < 640) {
                                    canvasDom.height = (dh + 280) * ratio + 150;
                                } else {
                                    canvasDom.height = (dh + 410) * ratio + 150;
                                }
                            } else {
                                canvasDom.height = height * ratio + 135 * ratio;
                            }

                            const ctx: any = canvasDom.getContext('2d');
                            if (ctx) {
                                ctx.fillStyle =
                                    store.state.theme == 'light'
                                        ? '#ffffff'
                                        : 'rgba(28, 28, 30, 1)';
                                ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
                                const imgObj = new Image();
                                imgObj.src = url;
                                imgObj.onload = async () => {
                                    await ctx.drawImage(
                                        imgObj,
                                        0,
                                        0,
                                        width * ratio,
                                        height * ratio,
                                    );
                                };

                                if (isSubcribe) {
                                    let abstractData = articleData.value.abstract;
                                    if (width < 640) {
                                        if (abstractData.length >= 100) {
                                            abstractData = abstractData.substring(0, 100);
                                            abstractData += '...';
                                        }
                                    } else {
                                        if (abstractData.length >= 120) {
                                            abstractData = abstractData.substring(0, 120);
                                            abstractData += '...';
                                        }
                                    }

                                    ctx.fillStyle =
                                        store.state.theme == 'light'
                                            ? '#000'
                                            : 'rgba(221, 225, 227, 0.8)';
                                    ctx.font = `${16 * ratio}px mora`;
                                    canvasTextAutoLine(
                                        ctx,
                                        abstractData,
                                        30 * ratio,
                                        dh * ratio + 40,
                                        20,
                                        canvasDom.width - 70 * ratio,
                                        width,
                                    );
                                }

                                if (isSubcribe) {
                                    if (width < 640) {
                                        const subscribeObj = new Image();
                                        subscribeObj.src = subscribeSvg;
                                        subscribeObj.onload = async (obj) => {
                                            await ctx.drawImage(
                                                subscribeObj,
                                                18 * ratio,
                                                dh * ratio + 30 + 150,
                                                width * ratio - 18 * ratio * 2,
                                                (width * ratio - 18 * ratio * 2) * 0.29,
                                            );
                                        };
                                    } else {
                                        const subscribeObj = new Image();
                                        subscribeObj.src = subscribeSvg;
                                        subscribeObj.onload = async (obj) => {
                                            await ctx.drawImage(
                                                subscribeObj,
                                                30 * ratio,
                                                dh * ratio + 100 + 130,
                                                width * ratio - 30 * ratio * 2,
                                                (width * ratio - 30 * ratio * 2) * 0.29,
                                            );
                                        };
                                    }
                                }

                                ctx.fillStyle =
                                    store.state.theme == 'light' ? '#F0F0F0' : '#171717';
                                ctx.fillRect(
                                    0,
                                    canvasDom.height - 130 * ratio,
                                    width * ratio,
                                    130 * ratio,
                                );

                                const qrcodeUrl = await QRCode.toDataURL(location.href);
                                const qrcodeImgObj = new Image();
                                qrcodeImgObj.src = qrcodeUrl;
                                if (width < 640) {
                                    qrcodeImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            qrcodeImgObj,
                                            (width - 109) * ratio,
                                            canvasDom.height - (130 - 19) * ratio,
                                            93 * ratio,
                                            93 * ratio,
                                        );
                                    };
                                } else {
                                    qrcodeImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            qrcodeImgObj,
                                            (width - 129) * ratio,
                                            canvasDom.height - (130 - 19) * ratio,
                                            93 * ratio,
                                            93 * ratio,
                                        );
                                    };
                                }

                                const tipText1 = t('browserArticle.tipText1');
                                const tipText2 = t('browserArticle.tipText2');
                                const logoText = t('browserArticle.logoText');
                                const moraEnterImgObj = new Image();
                                if (store.state.theme == 'light') {
                                    moraEnterImgObj.src = moraEnterLight;
                                } else {
                                    moraEnterImgObj.src = moraEnterDark;
                                }
                                if (width < 640) {
                                    moraEnterImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            moraEnterImgObj,
                                            20 * ratio,
                                            canvasDom.height - (130 - 25) * ratio,
                                            160 * ratio,
                                            36 * ratio,
                                        );
                                    };

                                    const logoImgObj = new Image();
                                    logoImgObj.src = logo;
                                    logoImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            logoImgObj,
                                            18 * ratio,
                                            canvasDom.height - (130 - 75) * ratio,
                                            30 * ratio,
                                            30 * ratio,
                                        );
                                    };
                                    ctx.fillStyle =
                                        store.state.theme == 'light' ? '#666666' : '#fff';
                                    ctx.strokeStyle =
                                        store.state.theme == 'light' ? '#666666' : '#fff';
                                    ctx.font = `${14 * ratio}px mora`;
                                    ctx.fillText(
                                        logoText,
                                        55 * ratio,
                                        canvasDom.height - (130 - 95) * ratio,
                                    );
                                } else {
                                    moraEnterImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            moraEnterImgObj,
                                            30 * ratio,
                                            canvasDom.height - (130 - 25) * ratio,
                                            160 * ratio,
                                            36 * ratio,
                                        );
                                    };
                                    const logoImgObj = new Image();
                                    logoImgObj.src = logo;
                                    logoImgObj.onload = async () => {
                                        await ctx.drawImage(
                                            logoImgObj,
                                            30 * ratio,
                                            canvasDom.height - (130 - 75) * ratio,
                                            30 * ratio,
                                            30 * ratio,
                                        );
                                    };
                                    ctx.fillStyle =
                                        store.state.theme == 'light' ? '#666666' : '#fff';
                                    ctx.strokeStyle =
                                        store.state.theme == 'light' ? '#666666' : '#fff';
                                    ctx.font = `${14 * ratio}px mora`;
                                    ctx.fillText(
                                        logoText,
                                        80 * ratio,
                                        canvasDom.height - (130 - 95) * ratio,
                                    );
                                }
                                setTimeout(() => {
                                    const nUrl = canvasDom.toDataURL('image/png', 0);
                                    genImgUrl.value = nUrl;
                                }, 1000);
                            }
                        })
                        .catch((err) => {
                            debug('error', err);
                        });
                });
            }, 300);
        };

        const closeGenImg = () => {
            isShowImg.value = false;
            genImgUrl.value = '';
            isHtml2Canvas.value = false;
        };

        const rootShare = ref();
        const shareClick = (e: { target: any }) => {
            if (!rootShare?.value?.contains(e.target)) {
                showShare.value = false;
            }
        };

        const editArticle = () => {
            if (isMobile()) {
                ElMessage.warning(t('editor.isMobile'));
                return;
            }
            bus.emit('clearKeepAliveCache');
            nextTick(() => {
                router.push({
                    name: 'planetEditor',
                    params: {
                        id: planetId.value,
                    },
                    query: {
                        articlesId: articleId.value,
                    },
                });
            });
        };

        watch(
            () => browserPlanetUserData?.value,
            (val: any) => {
                if (val) {
                    setDocumentTitle();
                    browserPlanetUserData?.value.subprices.length;
                }
            },
            { immediate: true },
        );

        watch(
            () => store.state.agent,
            (val: any) => {
                if (!val) {
                    if (permissions.value !== 'Public') {
                        isLocked.value = true;
                        if (articleData.value && articleData.value.content) {
                            articleData.value.content = '';
                        }
                    }
                    subType.value = '';
                    isExpire.value = false;
                } else {
                    if (!currentCanister.value || !currentCanister.value) {
                        return;
                    }
                    currentCanister.value.value = getPlanetCanister();
                    getArticle();
                }
            },
        );

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val) {
                    nextTick(() => {
                        getCollections();
                    });
                }
            },
        );

        onUnmounted(() => {
            document.removeEventListener('scroll', headerRolling);
            store.commit('SET_DIRECTORY_DATA', []);
            bus.off('browserSubscribeSuccess', subscribeSuccess);
            bus.off('locateArticle', locateArticle);
            bus.off('browserSubscribeStart', browserSubscribeStart);
            document.removeEventListener('click', shareClick, false);
        });

        onMounted(() => {

            bus.on('browserSubscribeSuccess', subscribeSuccess);
            bus.on('locateArticle', locateArticle);
            bus.on('browserSubscribeStart', browserSubscribeStart);
            document.addEventListener('click', shareClick, false);
            document.addEventListener('scroll', headerRolling, false);
            planetId.value = route.params.id;
            articleId.value = route.params.articleId;
            if (store.state.agent) {
                currentCanister.value = inject('planetCanister', null);
            } else {
                currentCanister.value = inject('planetCanisterAnonymous', null);
            }
            getArticle();
            if (store.state.user_data) {
                nextTick(() => {
                    getCollections();
                });
            }
            getArticleList();
        });

        provide('articleId', articleId);
        provide('planetId', planetId);
        provide('currentCanister', currentCanister);
        provide('thumbsup', thumbsup);
        provide('getIsThumbsup', getIsThumbsup);

        const scrollToComments = () => {
            commentsBox.value.scrollIntoView({ behavior: 'smooth' });
        };

        return {
            store,
            contentDom,
            imgPreview,
            articleData,
            moment,
            isLocked,
            permissions,
            openLogin,
            address,
            isSubscribed,
            browserPlanetUserData,
            isCollect,
            collectLoading,
            showShare,
            isThumbsup,
            isDirectory,
            directoryIndex,
            directoryTop,
            isExpire,
            isMdirectory,
            commentsDom,
            soperatesDom,
            isShowImg,
            subType,
            rootShare,
            expireTime,
            fileToImg,
            titleDom,
            genImgUrl,
            genImgDom,
            isHtml2Canvas,
            subscribeLoading,
            planetId,
            commentsBox,
            isBlack,
            tweetMetadata,
            recordList,
            isShowAr,
            replyNum,
            isSticky,
            isPrivate,
            nextData,
            prevData,
            isIPFSHashOrHttps,
            openArTx,
            getImagesUrl,
            dealPid,
            showImg,
            hideImg,
            subscribe,
            getIsSubscribe,
            setCollect,
            twitterShare,
            linkShare,
            thumbsup,
            openMdirectory,
            componentClose,
            genMyImg,
            closeGenImg,
            shareClick,
            editArticle,
            openLink,
            showAr,
            scrollToComments,
            updateReplyNum,
            jumpLink,
        };
    },
});
</script>

<style scoped lang="less">
.layout {
    @apply bg-white w-full dark: (bg-dark-900);
    display: flex;
    position: relative;
    flex: 1;
    overflow: visible;
    justify-content: center;
}

:deep(.container) {
    @apply mx-auto <md: (w-full) md:(w-full) lg:(w-192) 2xl:(w-200);
    overflow: visible;
    position: relative;

    .container {
        @apply !w-full;
    }

    .content {
        position: relative;
    }

    .coverpic {
        @apply w-full block;

        img {
            @apply w-full rounded-lg;
        }
    }

    .thumb {
        @apply rounded-lg mt-5 mb-5 overflow-hidden;
        max-height: 500px;
        min-height: 200px;
        position: relative;
        .center();

        img {
            position: absolute;
            object-fit: cover;
            width: 100%;
        }

        &:hover {
            cursor: zoom-in;
        }
    }

    .title {
        @apply w-full pt-15 mt-0 mb-0 text-black text-5xl leading-14 font-bold block break-words <sm: (text-3xl pt-10) <md:(text-3xl) dark:(text-light-700);
    }

    .skeleton-title {
        @apply h-10 <sm: (h-5) <md:(h-7);
    }

    .locked {
        @apply w-full my-6 relative dark: (rounded-xl border border-dark-500);
        min-height: 400px;

        img {
            @apply w-full h-full dark: (opacity-1);
        }

        .lockbox {
            @apply w-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center;

            i {
                @apply text-5xl text-gray-400;
            }

            h2 {
                @apply pt-6 pb-2 text-xl text-black dark: (text-white);
            }

            .txt {
                @apply text-base text-gray-400;
            }

            .free {
                @apply ml-1 border border-white text-white text-xs px-1 rounded-full font-bold transform scale-80;
            }

            button {
                @apply border-none mt-6 py-3 px-7 text-white rounded-xl bg-purple-500 transition duration-300 hover: (transition duration-300 bg-purple-400);

                &.upgrade {
                    @apply flex items-center bg-yellow-400 text-black hover:(bg-yellow-300);
                }

                &.disabled {
                    opacity: 0.8;
                }

                i {
                    @apply text-xl mr-2 text-black;
                }
            }
        }
    }

    .articleInfo {
        @apply w-full py-6 flex items-center justify-between;

        .original,
        .reproduced,
        .timer,
        .author {
            background: rgba(0, 0, 0, 0.033);
            @apply flex text-sm px-3 leading-6 rounded-full text-gray-400 mr-3 <sm:(mr-2 px-2) dark: (bg-dark-400);

            strong {
                @apply whitespace-nowrap dark: (text-light-500/40);
                font-weight: normal;

                span {
                    font-weight: normal;
                }
            }
        }

        .author {
            strong {
                @apply <sm:(truncate max-w-32);
            }
        }

        .reproduced {
            @apply bg-yellow-500 text-white dark:(bg-yellow-500/80);

            strong {
                @apply dark:(text-black);
            }
        }

        .editArticle {
            @apply cursor-pointer ml-5;

            i {
                @apply text-sm mr-2;
            }

            span {
                @apply hover: (underline-blue-500 underline cursor-pointer underline-offset-4);
            }

            @apply flex items-center text-blue-500 <lg:(hidden);
        }

        .icon-translate,
        .translate {
            @apply text-purple-500 font-medium text-lg transition duration-200 hover:(transition duration-300 text-purple-400 cursor-pointer);
        }

        .subscribe {
            @apply px-3 h-6 leading-6 rounded-full text-sm border border-purple-200 text-purple-500 transition hover: (cursor-pointer bg-purple-500 border-purple-500 text-white transition duration-300) <sm:(hidden);
        }

        &.isHtml2Canvas {
            strong {
                position: relative;
                font-weight: normal;
                top: -5px;
            }
        }
    }

    .reproducedbox {
        @apply w-full border rounded-xl p-4 my-4 flex justify-between items-center bg-white transition duration-300 hover:(transition duration-300 shadow shadow-xl cursor-pointer shadow-dark-50/10 dark:(shadow-dark-800)) dark:(border-dark-100 bg-dark-600);

        .rebox {
            @apply flex-1 overflow-hidden;

            span {
                @apply w-full block text-dark-50/50 dark:(text-light-900/60);
                height: 24px;
                line-height: 24px;
            }

            p {
                @apply max-w-full block whitespace-nowrap truncate text-blue-500 font-bold mt-2;
                font-size: 16px;
                line-height: 28px;
            }

            &.isHtml2Canvas {
                span {
                    strong {
                        position: relative;
                        font-weight: normal;
                        top: -20px;
                    }
                }

                p {
                    position: relative;
                    top: -5px;
                }
            }
        }

        i {
            @apply ml-8 text-2xl text-dark-50/40 dark:(text-dark-50);
        }
    }

    .summary {
        @apply w-full my-3 px-4 py-3 leading-6 rounded-lg bg-light-400 text-gray-500 dark: (bg-dark-600 text-light-900/60);
        overflow-x: scroll;
        .scrollbar();
    }

    .tags {
        @apply w-full py-5 flex flex-wrap <sm: (py-3 text-sm) dark:(text-light-900/80);

        span {
            @apply ml-2 mr-2 text-purple-500;
        }
    }

    .soperates {
        @apply py-3 w-full sticky bottom-0 px-8 my-10 z-20 bg-white flex items-center <sm:( !px-4 py-2 h-12 justify-between) dark:(bg-dark-900);

        .items {
            @apply mr-10 cursor-pointer flex items-center <sm: (mr-0);

            &:hover {

                .item,
                span {
                    @apply text-gray-500 transition duration-300 dark:(text-gray-300);
                }

                &.sub {

                    .item,
                    span {
                        @apply text-purple-500;
                    }
                }

                &.upgrade {

                    .item,
                    span {
                        @apply text-yellow-500;
                    }
                }
            }

            &.sub,
            &.subscribed,
            &.upgrade {
                @apply py-6px px-4 rounded-lg <sm:(px-2) transition duration-300;

                .iconfont {
                    // font-size: 14px !important;
                }

                .item,
                span {
                    @apply text-purple-500;

                    i {
                        @apply text-sm <sm:(text-xs transform scale-80);
                    }
                }
            }

            &.sub {
                @apply bg-purple-200/30 dark:(bg-purple-700/20) hover:(bg-purple-200/60 transition duration-300 dark:(bg-purple-700/15));
            }

            &.subscribed {
                @apply text-gray-500 bg-gray-100 hover:(cursor-auto) dark:(bg-dark-300);

                .item,
                span {
                    @apply text-gray-400 dark:(text-light-900/40);
                }
            }

            &.upgrade {
                @apply bg-yellow-200/30 dark:(bg-yellow-600/20) hover:(bg-yellow-200/60 transition duration-300 dark:(bg-yellow-600/15));

                .item,
                span {
                    @apply text-yellow-500;
                }
            }

            .item {
                @apply flex justify-center items-center text-gray-400 transition duration-300;

                i {
                    @apply text-sm mr-2 <sm:(text-sm mr-1);

                    &.icon-failed {
                        @apply transform rotate-45;
                    }
                }
            }

            span {
                @apply flex-1 block text-center text-gray-500 transition duration-300 <sm: (text-xs);
                font-size: 15px;
            }

            &.thumbs {
                font-size: 15px;

                &.active {

                    .item,
                    span {
                        @apply text-purple-500 transition duration-300;
                    }
                }
            }

            &.collect {
                font-size: 15px;

                &.active {

                    .item,
                    span {
                        @apply text-red-400 transition duration-300;
                    }
                }
            }

            &.share {
                @apply relative;
                font-size: 15px;

                .shareBox {
                    @apply absolute top-0;

                    .twitter,
                    .genImg,
                    .link {
                        @apply absolute -left-2 z-10 w-10 h-10 flex justify-center items-center text-white rounded-full border-transparent shadow shadow-xl transition duration-300;
                    }

                    .twitter {
                        @apply -top-11 bg-blue-400 hover: (bg-blue-500 transition);
                    }

                    .link {
                        @apply -top-25 bg-teal-400 hover: (bg-teal-500 transition);
                    }

                    .genImg {
                        @apply -top-39 bg-purple-500 transition duration-300 hover: (transition duration-300 bg-purple-600);
                    }
                }
            }
        }
    }

    .subscribes {
        @apply w-35 mx-auto mb-10 leading-9 rounded-full border border-purple-200 text-purple-500 text-center hidden <sm: (block);
    }

    .chain-address {
        @apply w-full border border-light-700 rounded-xl mt-10 mb-8 relative <sm:(mt-6 mb-4) dark:(border-dark-100);
        transition: @transition;

        .fold {
            overflow: hidden;
            transition: @transition;
            max-height: 0;
            height: 0;

            &.show {
                max-height: inherit !important;
                height: auto !important;
                transition: @transition;
            }

            .alist {
                &:first-child {
                    @apply rounded-none border-t border-light-500 dark:(border-dark-300);
                }
            }
        }

        .alist {
            @apply border-t border-light-500 p-3 flex items-center text-gray-500 cursor-pointer transition duration-300 hover: (bg-gray-50 transition duration-300 dark:(bg-dark-600)) dark:(border-dark-300 text-light-900/60);

            &:first-child {
                @apply rounded-xl border-t-transparent;
            }

            &:last-of-type {
                @apply !rounded-b-xl border-b-transparent;
            }

            span {
                @apply pr-5 text-sm <sm: (text-xs) flex items-center;

                .nums {
                    @apply ml-2 w-4 h-4 rounded-full border border-purple-500 flex items-center justify-center text-xs text-purple-500 not-italic;
                }

                img {
                    @apply w-4 ml-1;
                }

                &.date {
                    @apply text-xs text-gray-400;
                }
            }

            p {
                @apply flex-1 truncate break-words text-xs text-right dark:(text-light-900/80);
                color: rgba(0, 0, 0, 0.4);
            }

            &.open {
                @apply rounded-b-none;
            }
        }

        .history {
            @apply max-h-90 overflow-y-auto;
            .scrollbar();

            .alist {
                &:first-child {
                    @apply rounded-t-none;
                }
            }
        }

        button {
            @apply absolute w-6 h-6 flex items-center justify-center bg-white border border-gray-300 left-1/2 -bottom-3 transform -translate-1/2 rounded-full transition duration-300 dark:(bg-dark-300 border-dark-50) <sm:(w-4 h-4 -bottom-2);
            zoom: 0.8;

            i {
                @apply text-xs text-gray-500 <sm:(transform scale-75);
            }

            &:hover {
                @apply transition duration-300 shadow shadow-lg shadow-gray-300 border border-purple-500 dark:(shadow-black);
            }
        }
    }

    :deep(.el-drawer) {
        border-radius: 20px 20px 0 0;

        .el-drawer__header {
            margin-top: 20px;
        }
    }

    .preNext {
        @apply my-7 w-full grid grid-cols-2 gap-7 px-8 <sm:( !px-4 my-5 grid-cols-1 gap-5);

        &.only {
            @apply gap-0 grid-cols-1;

            .itembox {
                @apply flex items-center <sm:(flex-col);

                .abox {
                    @apply flex-1;

                    .ptitle {
                        @apply h-auto;
                    }

                    .attrs {
                        @apply mb-0 <sm:(mb-4);
                    }
                }

                .pbtn {
                    @apply w-45 h-12 ml-10 <sm:(w-full ml-0);
                }
            }
        }

        .itembox {
            @apply w-full border border-light-700 rounded-xl p-5 dark:(border-dark-100 bg-dark-600);

            .abox {
                @apply w-full;

                .ptitle {
                    @apply block text-black text-lg font-medium h-11 leading-22px overflow-hidden overflow-ellipsis dark:(text-light-900);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .attrs {
                    @apply flex items-center mt-3 mb-4;

                    .original,
                    .reproduced {
                        @apply text-sm px-2 rounded-full mr-3 <sm:(mr-2 px-2);
                    }

                    .original {
                        @apply text-gray-400 bg-gray-100 dark: (bg-dark-400);
                    }

                    .reproduced {
                        @apply bg-yellow-500 text-white dark:(bg-yellow-500/80 text-black);
                    }

                    .article-data {
                        @apply flex-1 flex items-center;

                        span {
                            @apply text-gray-400 text-sm mr-4;

                            i {
                                @apply mr-1;

                                &.icon-talks {
                                    @apply text-sm;
                                }
                            }
                        }
                    }
                }
            }

            .pbtn {
                @apply w-full rounded-xl flex items-center justify-center py-2 bg-purple-500 text-white transition duration-300 hover:(transition duration-300 bg-purple-500/85 cursor-pointer);

                i {
                    &.icon-arrow-left {
                        @apply mr-2;
                    }

                    &.icon-arrow-right {
                        @apply ml-2;
                    }
                }
            }
        }
    }
}

.directory {
    @apply w-52 z-1 absolute top-75 lg: (ml-198) 2xl:(ml-226) <lg:(hidden);

    &.fixed {
        @apply fixed top-16;
    }
}

.mdirectory {
    @apply fixed z-50 w-14 p-2 right-0 bottom-1/3 bg-white shadow shadow-xl shadow-dark-900/10 border-l border-t border-b border-light-600 rounded-tl-xl rounded-bl-xl text-center hidden <lg: (block) dark:(border-dark-100 bg-dark-600 shadow-black);

    i {
        @apply text-xl;
    }
}

:deep(.katex-display) {
    @apply !my-0 py-1 overflow-x-auto overflow-y-hidden;

    .katex-html {
        text-align: center !important;
    }

    &>.katex {
        @apply text-center;

        .base {
            @apply !text-xl <sm: (text-base);
        }

        .tag {
            .mord {
                @apply !text-xl <sm: (text-base);
            }
        }

        .eqn-num {
            &::before {
                @apply !text-xl <sm: (hidden);
            }
        }
    }
}

.modal-bg {
    @apply fixed left-0 top-0 bottom-0 w-screen h-screen;

    .myImg {
        @apply w-screen h-screen overflow-auto flex justify-center items-center;

        img {
            @apply max-w-full;

            &:hover {
                cursor: zoom-out;
            }
        }
    }
}

// .genImg{
//   @apply fixed right-10 bottom-20 z-20 transition duration-300 hover:(transition duration-300 transform rotate-180 cursor-pointer) <sm:(right-3 bottom-25);
//   i{
//     @apply text-5xl text-purple-500 <sm:(text-40px);
//   }
// }

.fadeimg-enter-active {
    -webkit-animation: fade-out-fwd 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation: fade-out-fwd 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.fadeimg-leave-active {
    -webkit-animation: fade-out-bck 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation: fade-out-bck 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes fade-out-fwd {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateZ(80px);
        transform: translateZ(80px);
        opacity: 1;
    }
}

@keyframes fade-out-fwd {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateZ(80px);
        transform: translateZ(80px);
        opacity: 1;
    }
}

@-webkit-keyframes fade-out-bck {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }

    100% {
        -webkit-transform: translateZ(-80px);
        transform: translateZ(-80px);
        opacity: 0;
    }
}

@keyframes fade-out-bck {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }

    100% {
        -webkit-transform: translateZ(-80px);
        transform: translateZ(-80px);
        opacity: 0;
    }
}
</style>
