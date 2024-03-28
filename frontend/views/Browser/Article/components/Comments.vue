<template>
    <div class="comments" translate="yes">
        <h3>
            {{ $t('comment.title') }} <strong>{{ replylist.length }}</strong>
            <i @click="init" class="iconfont icon-refresh" :class="{ refresh: isSkeleton }"></i>
        </h3>
        <div class="replybox" translate="no">
            <div class="avatar">
                <img
                    v-if="store.state.user_data && store.state.user_data.avatar"
                    :src="getImagesUrl(store.state.user_data.avatar)"
                />
                <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
            </div>
            <div class="replyfld mt-0 flex-1 relative" ref="rootPoint">
                <el-input
                    :disabled="commenting"
                    class="textarea"
                    v-model="commentwords"
                    :placeholder="$t('comment.placeholder')"
                    :maxlength="CONFIG.commentWordMax"
                    :autosize="{ minRows: 1 }"
                    resize="none"
                    @focus="showComment"
                    @blur="textareaIndex($event)"
                    type="textarea"
                />
                <template v-if="isShowComment">
                    <div class="words">
                        <div class="flex items-center">
                            <div class="emoji" ref="emojiDom">
                                <i
                                    class="iconfont icon-emoji"
                                    @click="isShowEmoji = !isShowEmoji"
                                ></i>
                                <transition name="el-fade-in">
                                    <EmojiPicker
                                        v-if="isShowEmoji"
                                        :native="true"
                                        :hide-search="true"
                                        :hide-group-names="true"
                                        :theme="store.state.theme"
                                        @select="onSelectEmoji"
                                    />
                                </transition>
                            </div>
                            <div class="inputwords">
                                <div>
                                    <span
                                        :class="{
                                            error: commentwords.length > CONFIG.commentWordMax,
                                        }"
                                        >{{ commentwords.length }}</span
                                    >
                                    / {{ CONFIG.commentWordMax }}
                                </div>
                                <div
                                    class="error"
                                    v-show="commentwords.length > CONFIG.commentWordMax"
                                >
                                    {{ $t('comment.error') }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <button class="cancel mr-3" @click="isShowComment = false">
                                {{ $t('btns.cancel') }}
                            </button>
                            <el-tooltip
                                :disabled="commentwords.length < CONFIG.commentWordMin"
                                :teleported="false"
                                :content="$t('comment.ctips')"
                                placement="top"
                            >
                                <button
                                    class="browserBtn"
                                    :class="{
                                        disabled:
                                            commentwords.length < CONFIG.commentWordMin ||
                                            commentwords.length > CONFIG.commentWordMax,
                                        loading: commenting,
                                    }"
                                    @click="submit"
                                >
                                    <img src="@/assets/svg/loading.svg" v-if="commenting" />
                                    {{ $t('comment.btn') }}
                                </button>
                            </el-tooltip>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div translate="no" v-if="!isAuthor && store.state.agent" class="myComments">
            <div>
                <span
                    @click="allCommentsSwitch('all')"
                    :class="{ current: isShowAllComments === 'all' }"
                >
                    {{ $t('comment.all') }}
                </span>
                <span
                    @click="allCommentsSwitch('my')"
                    :class="{ current: isShowAllComments === 'my' }"
                >
                    {{ $t('comment.my') }}
                </span>
            </div>
        </div>

        <template v-if="isSkeleton">
            <el-skeleton class="replylist" v-for="item in 6" :key="item" animated>
                <template #template>
                    <el-skeleton-item variant="circle" class="avatar" />
                    <div class="reply-info">
                        <div class="rheader">
                            <div>
                                <el-skeleton-item variant="text" class="w-22" />
                            </div>
                            <el-skeleton-item variant="h3" class="w-13" />
                        </div>
                        <div class="replytxt">
                            <el-skeleton-item variant="p" class="w-full" />
                            <el-skeleton-item variant="p" class="w-4/5" />
                        </div>
                    </div>
                </template>
            </el-skeleton>
        </template>
        <div
            class="replylist"
            v-for="item in replylist"
            :key="item.id"
            :class="{
                hideComment:
                    (isAuthor && !item.isShowComment) ||
                    (item.status === 'Invisible' && isShowAllComments === 'my'),
            }"
            v-else
        >
            <div class="avatar">
                <img
                    v-if="
                        !item.avatar ||
                        (item.avatar.length < 32 && ~item.avatar.includes('https://'))
                    "
                    src="@/assets/svg/defaultAvatar.svg"
                    alt="avatar"
                />
                <img v-else :src="getImagesUrl(item.avatar, 50)" alt="avatar" />
            </div>
            <div class="reply-info">
                <div class="rheader" translate="no">
                    <div class="replyer" v-if="icnamingData[item.pid.toString()]">
                        {{ icnamingData[item.pid.toString()] }}
                        <el-switch
                            v-if="isAuthor"
                            v-model="item.isShowComment"
                            :active-value="true"
                            :inactive-value="false"
                            size="small"
                            :before-change="switchChange.bind(this, item)"
                            active-color="#806EF2"
                            :inactive-color="store.state.theme === 'light' ? '#dddddd' : '#4a4a4a'"
                        />
                    </div>
                    <div class="replyer" v-else>
                        <el-tooltip
                            class="box-item"
                            :teleported="false"
                            effect="dark"
                            :content="item.pid.toString()"
                            placement="top"
                        >
                            <el-button class="my-elbtn">{{
                                dealPid(item.pid.toString())
                            }}</el-button>
                        </el-tooltip>
                        <el-switch
                            v-if="isAuthor"
                            v-model="item.isShowComment"
                            :active-value="true"
                            :inactive-value="false"
                            size="small"
                            :before-change="switchChange.bind(this, item)"
                            active-color="#806EF2"
                            :inactive-color="store.state.theme === 'light' ? '#dddddd' : '#4a4a4a'"
                        />
                    </div>
                </div>

                <div class="replytxt" :class="{ noCheck: !item.isShowComment && isAuthor }">
                    <p>{{ item.content }}</p>
                </div>

                <div class="tool">
                    <span class="time">{{
                        moment(Number(item.created)).format('MMM Do YYYY')
                    }}</span>
                    <div class="flex items-center">
                        <span
                            class="mr-5 text-sm text-purple-500 cursor-pointer"
                            @click="showReply(item.id)"
                            v-if="!item.reply.length && isAuthor"
                        >
                            {{ $t('roverComments.reply') }}
                        </span>
                        <div
                            class="thumbsup"
                            @click="commentThumbsup(item)"
                            :class="{ active: item.isThumbsup }"
                        >
                            <i class="iconfont icon-thumbsup font-16"></i>
                            <span>{{ Number(item.like) }}</span>
                        </div>
                    </div>
                </div>

                <template v-if="item.reply.length > 0">
                    <template v-for="sitem in item.reply" :key="sitem.id">
                        <div class="myreply">
                            <span>{{ $t('comment.authorreply') }}</span>
                            {{ sitem.content }}
                        </div>
                    </template>
                </template>
                <template v-else>
                    <div
                        class="replyfld mt-2 w-full"
                        v-if="Number(item.id) === isShowReplyTextArea"
                    >
                        <el-input
                            class="textarea"
                            v-model="item.replywords"
                            placeholder="add reply"
                            :maxlength="CONFIG.commentWordMax"
                            :autosize="{ minRows: 1 }"
                            resize="none"
                            @blur="textareaIndex($event)"
                            type="textarea"
                        />
                        <div class="words">
                            <div class="flex items-center">
                                <div class="emoji">
                                    <i
                                        class="iconfont icon-emoji"
                                        @click="isShowEmoji2 = !isShowEmoji2"
                                    />
                                    <EmojiPicker
                                        id="replyEmoji"
                                        v-if="isShowEmoji2"
                                        :native="true"
                                        :hide-search="true"
                                        :hide-group-names="true"
                                        :theme="store.state.theme"
                                        @select="onSelectEmoji2($event, item)"
                                    />
                                </div>
                                <div class="inputwords">
                                    <div>
                                        <span
                                            :class="{
                                                error:
                                                    item.replywords.length > CONFIG.commentWordMax,
                                            }"
                                        >
                                            {{ item.replywords.length }}
                                        </span>
                                        / {{ CONFIG.commentWordMax }}
                                    </div>
                                    <div
                                        class="error"
                                        v-show="item.replywords.length > CONFIG.commentWordMax"
                                    >
                                        {{ $t('comment.error') }}
                                    </div>
                                </div>
                            </div>
                            <button
                                class="browserBtn"
                                :class="{
                                    disabled:
                                        item.replywords.length < CONFIG.commentWordMin ||
                                        item.replywords.length > CONFIG.commentWordMax,
                                    loading: submitReplyLoading === Number(item.id),
                                }"
                                @click="submitReply(item)"
                            >
                                <img
                                    src="@/assets/svg/loading.svg"
                                    v-if="submitReplyLoading === Number(item.id)"
                                />{{ $t('comment.btn') }}
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, watch, inject, onUnmounted } from 'vue';
import { dealPid, getImagesUrl, getSetPid } from '@/utils/functions';
import store from '@/store';
import CONFIG from '@/assets/config';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import debug from '@/utils/debug';
import moment from 'moment';
import { getIcnamingArr } from '@/utils/icnaming';
import { getAvatar } from '@/utils/getAvatar';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default defineComponent({
    components: { EmojiPicker },
    emit: ['updateReplyNum'],
    props: {
        articleData: {
            type: Object,
            default: {},
        },
        replyNum: {
            type: Number,
            default: 0,
        },
    },
    setup(props, context) {
        const replylist = ref<any[]>([]);
        const isAuthor = ref(false);
        const commentwords = ref('');
        const commenting = ref(false);
        const isSkeleton = ref(true);
        const icnamingData = ref({});
        const avatarData = ref({});
        const isShowEmoji = ref(false);
        const isShowEmoji2 = ref(false);
        const isShowComment = ref(false);
        const replayTxt = ref();
        const replywords = ref('');
        const selectionStart = ref();
        const emojiDom = ref();
        const submitReplyLoading = ref();
        const isShowReplyTextArea = ref<any>(null);
        const isShowAllComments = ref('all');

        const openLogin: any = inject('openLogin', null);
        const articleId: any = inject('articleId', null);
        const planetId: any = inject('planetId', null);
        const planetCanister: any = inject('planetCanister', null);
        const currentCanister: any = inject('currentCanister', null);
        const browserPlanetID: any = inject('browserPlanetID', null);
        const getIsThumbsup: any = inject('getIsThumbsup', null);
        const usersCanister: any = inject('usersCanister', null);
        const thumbsup: any = inject('thumbsup', null);

        const showReply = (id: number) => {
            if (!isShowReplyTextArea.value) {
                isShowReplyTextArea.value = Number(id);
            } else {
                isShowReplyTextArea.value = null;
            }
        };

        const showComment = () => {
            if (!store.state.agent) {
                openLogin();
            } else {
                isShowComment.value = true;
            }
        };

        const textareaIndex = ({ target }) => {
            selectionStart.value = target.selectionStart;
        };

        const onSelectEmoji = (emoji) => {
            if (!selectionStart.value) {
                commentwords.value = commentwords.value + emoji.i;
            } else {
                const strArr = commentwords.value.slice(0, selectionStart.value);
                const strArr2 = commentwords.value.slice(
                    selectionStart.value,
                    commentwords.value.length,
                );
                commentwords.value = `${strArr}${emoji.i}${strArr2}`;
            }
            isShowEmoji.value = false;
        };

        const onSelectEmoji2 = (emoji, item) => {
            if (!selectionStart.value) {
                item.replywords = item.replywords + emoji.i;
            } else {
                const strArr = item.replywords.slice(0, selectionStart.value);
                const strArr2 = item.replywords.slice(selectionStart.value, item.replywords.length);
                item.replywords = `${strArr}${emoji.i}${strArr2}`;
            }
            isShowEmoji2.value = false;
        };

        const onReplyEmoji = (emoji) => {
            replywords.value = replywords.value + emoji.i;
            isShowEmoji.value = false;
        };

        const submit = async () => {
            if (commenting.value) {
                return;
            }
            if (
                commentwords.value.length < CONFIG.commentWordMin ||
                commentwords.value.length > CONFIG.commentWordMax
            ) {
                return;
            }
            commenting.value = true;
            const res = await planetCanister.value.addComment({
                aid: articleId.value,
                content: commentwords.value,
            });
            commenting.value = false;
            if (res.Err) {
                ElMessage.error(res.Err);
                return;
            }
            if (res.Ok) {
                ElMessage.success(t('browserArticle.commentSuccess'));
                const str = {
                    time: new Date().getTime(),
                    aid: articleId.value,
                    pid: planetId.value,
                    cid: res.Ok.data,
                    content: commentwords.value,
                };
                store.commit('ADD_COMMENT_NOTICE', str);
                allCommentsSwitch('my', true);
                commentwords.value = '';
                if (isAuthor.value) {
                    init();
                }
            }
        };

        const submitReply = async (item) => {
            submitReplyLoading.value = Number(item.id);
            try {
                const res = await planetCanister.value.adminReplyComment(Number(item.id), {
                    aid: item.aid,
                    content: item.replywords,
                });
                submitReplyLoading.value = '';
                if (res.Err) {
                    ElMessage.error(res.Err);
                } else {
                    ElMessage.success(t('planetContent.commentSuccess'));
                    isShowEmoji2.value = false;
                    init();
                }
            } catch (err) {
                debug('error', err);
            }
        };

        const getCommentsUserData = (list) => {
            const pidArr = getSetPid(list, true);
            getIcnamingArr(pidArr).then((res) => {
                if (res) {
                    icnamingData.value = res;
                }
            });

            pidArr.map((item) => {
                getAvatar(item);
            });
        };

        const getCommentIsThumbsup = async (list) => {
            list.map(async (item) => {
                const res = await getIsThumbsup(`_${Number(item.id)}`);
                item.isThumbsup = res;
            });
        };

        const commentThumbsup = async (item) => {
            if (!store.state.agent) {
                openLogin();
                return;
            }

            if (item.isThumbsup) {
                item.isThumbsup = false;
                item.like = Number(item.like) - 1;
                thumbsup(Number(item.id), false);
            } else {
                item.isThumbsup = true;
                item.like = Number(item.like) + 1;
                thumbsup(Number(item.id), true);
            }
        };

        const switchChange = (item) => {
            try {
                currentCanister.value.value.adminShowComment(Number(item.id), !item.isShowComment);
            } catch {
                debug('error');
            }
            return true;
        };

        const getComments = async () => {
            try {
                const res = await currentCanister.value.value.queryComments({
                    aid: articleId.value,
                    pid: [],
                    page: 1,
                    size: 99999,
                    sort: { TimeDesc: null },
                });
                if (res) {
                    if (res.data.length) {
                        replylist.value = res.data;
                        replylist.value.map(async (item) => {
                            const avatar = await getAvatar(item.pid);
                            if (avatar) {
                                item.avatar = avatar;
                            }
                        });
                        getCommentsUserData(replylist.value);
                        getCommentIsThumbsup(replylist.value);
                    } else {
                        replylist.value = [];
                    }
                    isSkeleton.value = false;
                }
            } catch (err) {
                debug('error', err);
            }
        };

        const getMyCommentsAdmin = async () => {
            try {
                const res = await currentCanister.value.value.adminComments({
                    aid: articleId.value,
                    pid: [],
                    page: 1,
                    size: 99999,
                    sort: { TimeDesc: null },
                });
                if (res.data && res.data.length) {
                    replylist.value = res.data;
                    replylist.value.map(async (item) => {
                        const avatar = await getAvatar(item.pid);
                        if (avatar) {
                            item.avatar = avatar;
                        }
                        item.status = Object.keys(item.status)[0];
                    });
                    await getCommentsUserData(replylist.value);
                    await getCommentIsThumbsup(replylist.value);
                } else {
                    replylist.value = [];
                }
                isSkeleton.value = false;
            } catch (err) {
                debug('error', err);
            }
        };

        const rootPoint = ref();
        const handleClick = (e: { target: any }) => {
            if (!rootPoint?.value?.contains(e.target)) {
                isShowComment.value = false;
                if (isShowEmoji.value) {
                    isShowEmoji.value = false;
                }
            }
        };

        const handleClickEmoji = (e: { target: any }) => {
            if (
                !~e.target?.parentNode?.className.indexOf('v3') &&
                typeof e?.target?.className === 'string' &&
                !~e.target?.className?.indexOf('icon-emoji')
            ) {
                isShowEmoji.value = false;
                isShowEmoji2.value = false;
            }
        };

        const allCommentsSwitch = (type: 'all' | 'my', forcedRefresh = false) => {
            if (!forcedRefresh && isShowAllComments.value === type) return;

            isShowAllComments.value = type;
            isSkeleton.value = true;
            if (isShowAllComments.value === 'all') {
                getComments();
            } else {
                getMyCommentsAdmin();
            }
        };

        const getCommentsAdmin = async () => {
            try {
                const res = await currentCanister.value.value.adminComments({
                    aid: articleId.value,
                    pid: [],
                    page: 1,
                    size: 99999,
                    sort: { TimeDesc: null },
                });
                if (res) {
                    if (res.data.length) {
                        replylist.value = res.data;
                        replylist.value.map(async (item: any) => {
                            if (Object.keys(item.status)[0] === 'Visible') {
                                item.isShowComment = true;
                            } else {
                                item.isShowComment = false;
                            }
                            const avatar = await getAvatar(item.pid);
                            if (avatar) {
                                item.avatar = avatar;
                            }
                            item.replywords = '';
                        });
                        getCommentsUserData(replylist.value);
                        getCommentIsThumbsup(replylist.value);
                    } else {
                        replylist.value = [];
                    }
                    isSkeleton.value = false;
                }
            } catch (err) {
                debug('failed', err);
            }
        };

        const init = () => {
            isSkeleton.value = true;
            isShowAllComments.value = 'all';
            if (
                (props.articleData.author.toString() === store.state.user_principal ||
                    store.state.planets_data.includes(store.state.current_open_planet)) &&
                store.state.agent
            ) {
                isAuthor.value = true;
                getCommentsAdmin();
            } else {
                isAuthor.value = false;
                getComments();
            }
        };

        watch(
            () => store.state.agent,
            (val: any) => {
                init();
            },
        );

        watch(
            () => replylist.value,
            (val: any) => {
                if (val) {
                    context.emit('updateReplyNum', replylist.value.length);
                } else {
                    context.emit('updateReplyNum', 0);
                }
            },
        );

        onUnmounted(() => {
            document.removeEventListener('click', handleClick, false);
            document.removeEventListener('click', handleClickEmoji, false);
        });

        onMounted(() => {
            document.addEventListener('click', handleClick, false);
            document.addEventListener('click', handleClickEmoji, false);
            init();
        });

        return {
            store,
            rootPoint,
            icnamingData,
            CONFIG,
            commenting,
            replylist,
            openLogin,
            commentwords,
            isSkeleton,
            moment,
            avatarData,
            planetId,
            browserPlanetID,
            isShowComment,
            isShowReplyTextArea,
            replayTxt,
            replywords,
            isShowEmoji,
            isShowEmoji2,
            emojiDom,
            isAuthor,
            submitReplyLoading,
            isShowAllComments,
            init,
            handleClick,
            allCommentsSwitch,
            onSelectEmoji,
            onSelectEmoji2,
            onReplyEmoji,
            textareaIndex,
            handleClickEmoji,
            switchChange,
            submitReply,
            showReply,
            commentThumbsup,
            showComment,
            close,
            submit,
            dealPid,
            getImagesUrl,
        };
    },
});
</script>

<style lang="less" scoped>
.mt-0 {
    margin-top: 0 !important;
}

.comments {
    @apply w-full pb-20;

    h3 {
        width: 100%;
        @apply text-2xl flex items-center <sm: (text-base) dark:(text-light-900);

        strong {
            @apply pl-2 text-lg not-italic font-normal <sm: (text-base);
        }

        .icon-refresh {
            display: flex;
            margin-left: auto;
            cursor: pointer;
            font-size: 14px;
            color: #999;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }

    .replybox {
        @apply w-full mt-8 pb-5 flex <sm: (mt-3 pb-3);

        .avatar {
            @apply w-8 h-8 mr-3 <sm: (w-8 h-8 mr-2);
            border-radius: 4px;
            overflow: hidden;

            img {
                @apply w-full dark: (opacity-80);
            }
        }
    }

    .replyfld {
        @apply border border-light-800 rounded-lg px-3 pt-0 dark: (border-dark-100);

        textarea {
            @apply w-full h-10 leading-22px pt-3 pb-1 resize-none bg-transparent overflow-y-hidden <sm: (text-sm pt-2 h-8) dark:(text-light-900/80);
        }

        :deep(.el-textarea) {
            &.is-disabled {
                .el-textarea__inner {
                    background: none !important;
                }
            }
        }

        :deep(.el-textarea__inner) {
            padding: 14px 0;
        }

        .words {
            @apply w-full pt-2 mb-2 border-t border-light-600 flex justify-between items-center <sm: (pt-2) dark:(border-dark-300);

            .inputwords {
                @apply text-gray-400 flex items-center text-sm;

                span {
                    &.error {
                        @apply text-red-400 pl-0;
                    }
                }

                .error {
                    @apply text-red-400 pl-3;
                }
            }

            .emoji {
                @apply w-8 h-8 mr-2 relative;

                i {
                    @apply text-2xl text-gray-400 cursor-pointer;
                }
            }

            .browserBtn {
                @apply h-9 px-4 <sm: (h-8);

                img {
                    .width(20);
                    .height(20);
                    .margin(0, 5, 0, 0);
                }
            }

            .icon-translate {
                @apply mr-3 text-purple-500 font-medium text-lg transition duration-200 hover:(transition duration-300 text-purple-400 cursor-pointer);
            }

            .cancel {
                @apply h-9 px-3 text-dark-300 rounded-10px <sm: (h-8) transition duration-300 hover:(transition duration-300 bg-light-800 cursor-pointer dark:(bg-dark-100)) dark:(text-light-900/80);
            }

            :deep(.v3-emoji-picker) {
                @apply absolute z-50 left-0 bottom-8;

                &.v3-color-theme-dark {
                    @apply dark: ( !bg-dark-600);
                }

                .v3-footer {
                    @apply hidden;
                }
            }
        }

        .login-tips {
            @apply w-full rounded-lg absolute left-0 bottom-0 top-0 bg-light-50/80 justify-center flex items-center dark: (bg-dark-500 text-light-900/60);

            span {
                @apply text-purple-500 font-bold cursor-pointer pl-2;
            }
        }
    }

    .myComments {
        display: flex;
        justify-content: flex-end;

        div {
            .center();
            background: #f3f3f3;
            border-radius: 25px;
            padding: 3px;
            @apply dark:(bg-dark-300);

            span {
                .center();
                font-size: 10px;
                color: rgba(130, 130, 130, 1);
                border-radius: 25px;
                width: 40px;
                padding: 3px 0;
                cursor: pointer;
                transition: @transition;

                &.current {
                    background: #fff;
                    color: #000;
                    transition: @transition;
                    @apply dark:(bg-dark-800 text-light-900/80);
                }
            }
        }
    }

    .replylist {
        @apply w-full mb-4 mt-4 flex;

        .avatar {
            @apply w-8 h-8 mr-3 <sm: (w-8 h-8 mr-2);
            border-radius: 4px;
            overflow: hidden;

            img {
                @apply w-full dark:(opacity-80);
            }
        }

        .reply-info {
            @apply flex-1 flex flex-col justify-center;

            .rheader {
                @apply w-full flex justify-between items-center;

                .replyer {
                    @apply flex justify-between items-center leading-none text-black dark: (text-light-900/80);
                    width: 100%;

                    .el-switch--small {
                        @apply h-5;
                    }

                    span {
                        @apply text-gray-400 text-xs block pt-2 <sm: (pt-2px);

                        @apply dark: (text-light-900/30);
                    }

                    :deep(.el-button) {
                        & > span {
                            @apply text-sm dark:(text-light-900/60);
                        }
                    }
                }

                .thumbsup {
                    @apply flex items-center text-gray-400 cursor-pointer;

                    span {
                        @apply pl-1 text-sm;
                    }

                    &.active {
                        @apply text-purple-500 transition duration-300;
                    }
                }
            }

            .replytxt {
                @apply w-full leading-6 py-1 <sm: (text-sm py-1 leading-5);

                p {
                    @apply dark:(text-light-900);
                }

                &.noCheck {
                    @apply text-gray-400 dark: (text-light-900/30);
                }
            }

            .myreply {
                @apply w-full rounded-lg mt-1 bg-light-400 p-2 leading-5 <sm: (text-sm p-2 leading-5) dark:(bg-dark-500 text-light-900);
                font-size: 15px;

                span {
                    @apply text-gray-500 pr-1 dark: (text-light-900/60);
                    font-size: 15px;
                }
            }

            .tool {
                @apply flex justify-between;
                align-items: center;

                .time {
                    @apply text-gray-400 text-xs pt-1 block <sm: (pt-2px);

                    @apply dark: (text-light-900/30);
                }

                .thumbsup {
                    @apply flex items-center text-gray-400 cursor-pointer;

                    span {
                        @apply pl-1 text-sm;
                    }

                    &.active {
                        @apply text-purple-500 transition duration-300;
                    }
                }
            }
        }

        &.hideComment {
            .avatar {
                img {
                    filter: grayscale(30%);
                }
            }

            .reply-info {
                .rheader {
                    .replyer {
                        color: rgba(0, 0, 0, 0.5);
                        @apply dark: (text-light-900/40);

                        :deep(.el-button) {
                            span {
                                color: rgba(0, 0, 0, 0.5);
                                @apply dark: (text-light-900/40);
                            }
                        }
                    }
                }

                .replytxt {
                    color: rgba(0, 0, 0, 0.5);

                    p {
                        @apply dark: (text-light-900/40);
                    }
                }

                .myreply {
                    color: rgba(0, 0, 0, 0.5);
                    @apply dark: (text-light-900/40);

                    span {
                        color: rgba(0, 0, 0, 0.5);
                        @apply dark: (text-light-900/40);
                    }
                }
            }
        }
    }
}

.my-elbtn {
    border: none;
    background-color: none;
    padding: 0;
    @apply h-4 text-base text-black leading-none hover: (bg-transparent);
}

:deep(.el-button) {
    height: auto !important;

    &:not(.is-text, .is-link, .el-button--text) {
        @apply !bg-transparent text-black;
    }
}
</style>
