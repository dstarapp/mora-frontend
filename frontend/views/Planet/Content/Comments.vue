<template>
    <div class="comments">
        <div class="back" @click="goBack">
            <i class="iconfont icon-back-left"></i>
        </div>
        <h3>{{ $t('planetContent.tab.comments') }}</h3>
        <el-skeleton :count="4" animated v-if="isLoading">
            <template #template>
                <div class="item">
                    <div class="flex">
                        <div class="header">
                            <el-skeleton-item variant="image" style="width: 40px; height: 40px; border-radius: 100%" />
                        </div>
                        <div class="content">
                            <div class="info">
                                <el-skeleton-item variant="h3" style="width: 90px" />
                                <p>
                                    <el-skeleton-item variant="text" style="width: 150px" />
                                </p>
                            </div>
                            <p class="text">
                                <el-skeleton-item variant="text" style="width: 100%" />
                                <el-skeleton-item variant="text" style="width: 80%" />
                            </p>
                            <div class="operation">
                                <el-skeleton-item variant="text" style="width: 50px" />
                                <el-skeleton-item variant="text" style="width: 50px; margin-left: 15px" />
                                <el-skeleton-item variant="text" style="width: 50px; margin-left: 15px" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </el-skeleton>
        <template v-else>
            <template v-if="listContentData.length > 0">
                <div class="item" v-for="item in listContentData" :key="item.id">
                    <div class="flex">
                        <div class="header">
                            <img v-if="!item.avatar ||
            (item.avatar.length < 32 && ~item.avatar.includes('https://'))
            " src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                            <img v-else :src="getImagesUrl(item.avatar)" alt="avatar" />
                        </div>
                        <div class="content">
                            <div class="info">
                                <div class="replyer" translate="no" v-if="icnamingData[item.pid.toString()]">
                                    {{ icnamingData[item.pid.toString()] }}
                                </div>
                                <div class="replyer" v-else>
                                    <el-tooltip class="box-item" :teleported="false" effect="dark"
                                        :content="item.pid.toString()" placement="top">
                                        <el-button class="my-elbtn">{{
            dealPid(item.pid.toString())
        }}</el-button>
                                    </el-tooltip>
                                </div>
                                <el-switch :loading="switchLoading === Number(item.id)" v-model="item.isShow"
                                    :before-change="isHideChange.bind(this, item)" :active-value="true"
                                    :inactive-value="false" size="small" active-color="#806EF2"
                                    inactive-color="#999999" />
                            </div>
                            <p class="text">
                                {{ item.content }}
                            </p>
                            <div class="operation">
                                <div class="time">{{ format_date(Number(item.created)) }}</div>
                                <span>
                                    <p class="comment" v-if="!item.reply.length" @click="openComment(item)">
                                        <i class="iconfont icon-comment"></i>
                                        {{ $t('planetContent.reply') }}
                                    </p>
                                    <p class="like" :class="{ isLike: item.isLike }">
                                        <i class="iconfont icon-thumbsup"></i>
                                        {{ Number(item.like) }}
                                    </p>
                                </span>
                            </div>
                            <div v-if="item.isComment" class="commentBox">
                                <el-input v-model="item.comment" type="textarea" resize="none"
                                    :autosize="{ minRows: 3, maxRows: 10 }" show-word-limit
                                    :maxlength="CONFIG.commentWordMax" @keydown.enter="textareaKeydown"
                                    @blur="textareaIndex($event)" :placeholder="$t('planetContent.replyPlaceholder')" />
                                <div class="words">
                                    <div class="flexs">
                                        <div class="emoji" ref="emojiDom">
                                            <i class="iconfont icon-emoji" @click="item.isEmoji = !item.isEmoji"></i>
                                            <transition name="el-fade-in">
                                                <EmojiPicker v-if="item.isEmoji" :native="true" :hide-search="true"
                                                    :hide-group-names="true" :theme="store.state.theme"
                                                    @select="onSelectEmoji($event, item)" />
                                            </transition>
                                        </div>
                                        <div class="inputwords"></div>
                                    </div>
                                    <div class="flexs">
                                        <button class="cancel mr-3" @click="item.isComment = false">
                                            {{ $t('btns.cancel') }}
                                        </button>
                                        <div class="mora-button" @click="commentSave(item)" :class="{
            loading: currentSave === Number(item.id),
            active:
                item.comment &&
                item.comment.length >= CONFIG.commentWordMin,
        }">
                                            <img src="@/assets/svg/loading.svg"
                                                v-if="currentSave === Number(item.id)" />
                                            {{ $t('planetContent.reply') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="myreply" v-if="item.reply && item.reply.length">
                                <span>{{ $t('planetContent.replied') }}:</span>
                                <p v-for="children in item.reply" :key="children">
                                    {{ children.content }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <Pagination :total="total" :currentPage="currentPage" :pageSize="sizePage" @next="next" @prev="prev"
                        @goPage="goPage" />
                </div>
            </template>
            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverDashboard.noData') }}</p>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Pagination from '@/components/Pagination.vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import store from '@/store';
import debug from '@/utils/debug';
import moment from 'moment';
import { dealPid, getSetPid, getImagesUrl, format_date } from '@/utils/functions';
import CONFIG from '@/assets/config';
import { getIcnamingArr } from '@/utils/icnaming';
import { getAvatar } from '@/utils/getAvatar';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default defineComponent({
    name: 'Comments',
    components: { Pagination, EmojiPicker },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const articleID = ref();
        const planetId = ref();
        const currentPage = ref(1);
        const sizePage = ref(5);
        const total = ref();
        const listData = ref();
        const listContentData = ref<any[]>([]);
        const icnamingData = ref({});
        const planetCanister: any = inject('planetCanister');
        const switchLoading = ref();
        const currentSave = ref();
        const isLoading = ref(true);
        const selectionStart = ref();
        const rootPoint = ref();

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

        const like = (item) => {
            item.isLike = !item.isLike;
        };

        const textareaIndex = ({ target }) => {
            selectionStart.value = target.selectionStart;
        };

        const onSelectEmoji = (emoji, item) => {
            if (!selectionStart.value) {
                item.comment = item.comment + emoji.i;
            } else {
                const strArr = item.comment.slice(0, selectionStart.value);
                const strArr2 = item.comment.slice(selectionStart.value, item.comment.length);
                item.comment = `${strArr}${emoji.i}${strArr2}`;
            }
            item.isEmoji = false;
        };

        const handleClickEmoji = (e: { target: any }) => {
            if (
                !~e.target.parentNode.className.indexOf('v3') &&
                typeof e?.target?.className === 'string' &&
                !~e.target?.className?.indexOf('icon-emoji')
            ) {
                listContentData.value.map((item) => {
                    item.isEmoji = false;
                });
            }
        };

        const openComment = (item) => {
            if (item.reply.length) {
                ElMessage.warning(t('planetContent.isCommentTrue'));
                return;
            }
            item.isComment = !item.isComment;
        };

        const commentSave = async (item) => {
            if (currentSave.value) {
                return;
            }
            if (!item.comment) {
                return;
            }
            currentSave.value = Number(item.id);
            try {
                const res = await planetCanister.value.adminReplyComment(Number(item.id), {
                    aid: item.aid,
                    content: item.comment,
                });
                currentSave.value = '';
                if (res.Err) {
                    ElMessage.error(res.Err);
                } else {
                    ElMessage.success(t('planetContent.commentSuccess'));
                    getList();
                    item.isComment = false;
                    item.isReply = true;
                }
            } catch (err) {
                debug('error', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const textareaKeydown = () => {
            const e = window.event || arguments[0];
            if (e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) {
                e.returnValue = false;
                return false;
            }
        };

        const isHideChange = (item) => {
            switchLoading.value = Number(item.id);
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await planetCanister.value.adminShowComment(
                        Number(item.id),
                        !item.isShow,
                    );
                    switchLoading.value = '';
                    if (res) {
                        if (item.isShow) {
                            ElMessage.success(t('planetContent.switch.close'));
                        } else {
                            ElMessage.success(t('planetContent.switch.open'));
                        }
                        return resolve(true);
                    } else {
                        ElMessage.error(t('planetContent.switch.failed'));
                        return reject();
                    }
                } catch (err) {
                    debug('error', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            });
        };

        const getCommentsUserData = (list) => {
            const pidArr = getSetPid(list, true);
            getIcnamingArr(pidArr).then((res) => {
                if (res) {
                    icnamingData.value = res;
                }
            });
        };

        const getList = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            isLoading.value = true;
            const str = {
                aid: articleID.value,
                pid: [],
                page: currentPage.value,
                size: sizePage.value,
                sort: { TimeDesc: null },
            };
            try {
                const res = await planetCanister.value.adminComments(str);
                isLoading.value = false;
                if (res) {
                    const arr = res.data.map((item) => {
                        const _status = Object.keys(item.status)[0];
                        if (_status === 'Visible') {
                            item.isShow = true;
                        } else {
                            item.isShow = false;
                        }
                        item.isEmoji = false;
                        item.comment = '';
                        return item;
                    });
                    listContentData.value = arr;
                    listContentData.value.map(async (item) => {
                        const avatar = await getAvatar(item.pid);
                        if (avatar) {
                            item.avatar = avatar;
                        }
                    });

                    if (listContentData.value.length) {
                        getCommentsUserData(listContentData.value);
                    }
                    total.value = Number(res.total.toString());
                }
            } catch (err) {
                debug('failed', err);
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

        onUnmounted(() => {
            document.removeEventListener('click', handleClickEmoji, false);
        });

        onMounted(() => {
            articleID.value = route.params.articleId;
            planetId.value = route.params.id;
            if (store.state.current_planet_data) {
                getList();
            }
            document.addEventListener('click', handleClickEmoji, false);
        });

        const goBack = () => {
            router.push({
                name: 'planetContent',
                params: {
                    id: route.params.id,
                },
            });
        };

        return {
            isLoading,
            store,
            currentPage,
            total,
            listData,
            listContentData,
            articleID,
            planetId,
            sizePage,
            moment,
            getList,
            like,
            textareaKeydown,
            selectionStart,
            openComment,
            onSelectEmoji,
            prev,
            next,
            goPage,
            isHideChange,
            commentSave,
            goBack,
            format_date,
            dealPid,
            switchLoading,
            CONFIG,
            icnamingData,
            currentSave,
            getImagesUrl,
            textareaIndex,
        };
    },
});
</script>

<style scoped lang="less">
.comments {
    display: flex;
    min-height: 650px;
    background: @bg-color;
    .border-radius(25);
    .margin(20, 0, 20, 0);
    display: flex;
    flex: 3;
    flex-direction: column;
    .padding(30, 50, 30, 100);
    position: relative;
    max-width: 1512px;
    margin-left: auto;
    margin-right: auto;
    @apply dark:(bg-dark-600);

    .back {
        position: absolute;
        left: 35px;
        top: 28px;
        transition: @transition;
        color: @text-color-grey;

        i {
            .font-size(20);
        }

        &:hover {
            transition: @transition;
            color: @text-active;
            cursor: pointer;
        }
    }

    h3 {
        width: 100%;
        .font-size(24);
        .padding(0, 0, 30, 0);
        font-weight: 700;
        @apply dark:(text-light-900/80);
    }

    .item {
        display: flex;
        width: 100%;
        .font-size(16);
        .line-height(19);
        .margin(0, 0, 46, 0);

        :deep(.el-checkbox) {
            width: 40px;
            height: 40px;
            .margin(0, 15, 0, 0);

            .el-checkbox__label {
                display: none;

                p {
                    .font-size(16);
                }
            }
        }

        .flex {
            display: flex;
            width: 100%;
        }

        .header {
            display: flex;
            .width(40);
            .height(40);
            border-radius: 50%;
            overflow: hidden;

            img {
                .width(40);
            }
        }

        .content {
            display: flex;
            flex-direction: column;
            .margin(0, 0, 0, 17);
            flex: 1;

            .info {
                display: flex;
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                justify-content: space-between;
                width: 100%;

                strong {
                    display: inline-flex;
                    color: @text-fcolor;
                    .margin(0, 11, 0, 0);
                }

                em {
                    display: inline-flex;
                    font-style: normal;
                    color: @text-color;
                    .margin(0, 8, 0, 0);
                }

                p {
                    .font-size(14);
                    color: @text-color-grey;
                }

                p.pc {
                    display: flex;
                    flex: 1;
                    .ellipsisMore(1);
                }

                p.m {
                    margin-left: auto;
                    color: @text-color-grey;
                    .ellipsisMore(2);
                    display: none;
                }

                :deep(.el-switch) {
                    .margin(0, 0, 0, 25);

                    .el-switch__label {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(14);
                        .line-height(17);
                        color: @text-fcolor;

                        &.is-active {
                            color: @text-fcolor;
                        }
                    }
                }
            }

            >p.m {
                display: none;
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                .line-height(17);
                color: @text-color;
                .margin(0, 0, 21, 0);
            }

            .text {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                .padding(10, 0, 10, 0);
                color: @text-color-icon;
                @apply dark:(text-light-900/80);
            }

            .operation {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .time {
                    display: flex;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color-grey;
                    .margin(0, 15, 0, 0);
                    @apply dark:(text-light-900/60);
                }

                span {
                    display: flex;
                    flex: 1;
                    justify-content: flex-end;
                }

                .like,
                .comment {
                    display: flex;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-fcolor;
                    cursor: pointer;
                    .margin(0, 0, 0, 25);
                    transition: @transition;
                    @apply dark:(text-light-900/60);

                    .icon-thumbsup,
                    .icon-comment {
                        .font-size(16);
                        color: @text-color-grey;
                        .margin(0, 8, 0, 0);
                        transition: @transition;
                    }
                }

                .isLike,
                .isReply {
                    color: @text-active;
                    transition: @transition;

                    .icon-thumbsup,
                    .icon-comment {
                        color: @text-active;
                        transition: @transition;
                    }
                }
            }

            .commentBox {
                @apply border mt-2 border-light-800 rounded-lg px-3 dark:(border-dark-100);

                textarea {
                    @apply w-full h-10 leading-22px pt-3 pb-1 resize-none bg-transparent overflow-y-hidden <sm:(text-sm pt-2 h-8) dark:(text-light-900/80);
                }

                :deep(.el-textarea__inner) {
                    padding: 14px 0;
                }

                .words {
                    @apply w-full pt-2 mb-2 border-t border-light-600 flex justify-between items-center <sm:(pt-2) dark:(border-dark-300);

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

                    .flexs {
                        display: flex;
                    }

                    .emoji {
                        @apply w-8 h-8 mr-2 relative;

                        i {
                            @apply text-2xl text-gray-400 cursor-pointer;
                        }
                    }

                    .browserBtn {
                        @apply h-9 px-4 <sm:(h-8);

                        img {
                            .width(20);
                            .height(20);
                            .margin(0, 5, 0, 0);
                        }
                    }

                    .cancel {
                        @apply h-9 px-3 text-dark-300 rounded-10px <sm:(h-8) transition duration-300 hover:(transition duration-300 bg-light-800 cursor-pointer dark:(bg-dark-100)) dark:(text-light-900/80);
                    }

                    :deep(.v3-emoji-picker) {
                        @apply absolute left-0 bottom-8;

                        &.v3-color-theme-dark {
                            @apply dark:( !bg-dark-600);
                        }

                        .v3-footer {
                            @apply hidden;
                        }
                    }
                }

                .login-tips {
                    @apply w-full rounded-lg absolute left-0 bottom-0 top-0 bg-light-50/80 justify-center flex items-center dark:(bg-dark-500 text-light-900/60);

                    span {
                        @apply text-purple-500 font-bold cursor-pointer pl-2;
                    }
                }

                .mora-button {
                    .padding(0, 15, 0, 15);
                    .right(27);
                    .bottom(23);
                    .border-radius(10);
                    .center();
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .margin();
                    color: @text-color-inverse;
                    background: @bg-color-body-disable;
                    cursor: not-allowed;
                    transition: @transition;
                    pointer-events: none;

                    &.active {
                        background-color: @bg-color-body-active;
                        cursor: pointer;
                        transition: @transition;
                        pointer-events: auto;
                    }

                    &.loading {
                        transition: @transition;
                        background-color: @bg-color-body-loading;
                        cursor: wait;
                    }

                    img {
                        .margin(0, 5, 0, 0);
                        .width(20);
                        .height(20);
                    }
                }
            }

            .myreply {
                width: 100%;
                background-color: @bg-color-hover;
                .border-radius(10);
                .margin(15, 0, 0, 0);
                padding: 10px 15px;
                display: flex;
                @apply dark:(bg-dark-300 text-light-900/80);

                span {
                    color: @text-fcolor;
                    .padding(0, 10, 0, 0);
                }

                p {
                    flex: 1;
                }
            }
        }
    }

    .noData {
        .center();
        .font-size(70);
        position: relative;
        margin-top: 20vh;
        flex-direction: column;

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

    .bottom {
        display: flex;
        margin-top: auto;
        justify-content: flex-end;

        .selecAll {
            .center();
            .height(40);

            :deep(.el-checkbox) {
                width: auto;
            }

            p {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                color: @text-color;
                .margin(0, 0, 0, 10);
                cursor: pointer;
            }

            i {
                .width(50);
                .height(40);
                .border-radius(10);
                .center();
                .font-size(22);
                color: @text-color-grey;
                .margin(0, 0, 0, 53);
                transition: @transition;
                cursor: pointer;
                border: 1px solid @bg-color;
                background: @bg-color;

                @media screen and (min-width: 750px) and (max-width: 1240px) {
                    min-width: 40px;
                    min-height: 30px;
                    .font-size(18);
                }

                &:hover {
                    border: 1px solid @border-color;
                    background: #fbfbfb;
                    transition: @transition;
                }
            }
        }

        :deep(.pagination) {
            width: auto;
        }
    }
}

:deep(.el-switch__label) {
    &>span {
        font-size: 14px !important;
    }
}

.my-elbtn {
    border: none;
    background-color: none;
    padding: 0;
    .margin(0, 10, 0, 0);
    @apply h-4 text-base text-black leading-none hover:(bg-transparent);
}

:deep(.el-button) {
    height: auto !important;

    &:not(.is-text, .is-link, .el-button--text) {
        @apply !bg-transparent text-black;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .comments {
        .padding(20, 20, 20, 20);
        width: 100%;
        min-height: calc(100vh - 100px);

        .back {
            top: 15px;
            left: 20px;
        }

        h3 {
            .margin(40, 0, 0, 0);
        }

        .item {
            .content {
                .info {
                    p.pc {
                        display: none;
                    }

                    p.m {
                        display: flex;
                        .font-size(14);
                    }
                }

                >p.m {
                    display: flex;
                    .font-size(16);
                    .margin(10, 0, 0, 0);
                    .line-height(17);
                }

                .text {
                    .font-size(15);
                    .line-height(18);
                    .padding(10, 0, 10, 0);
                }

                .operation {
                    .time {
                        display: none;
                    }
                }

                .myreply {
                    flex-wrap: wrap;

                    span {
                        width: 100%;
                        padding-bottom: 8px;
                    }

                    p {
                        width: 100%;
                        line-height: 18px;
                    }
                }
            }
        }

        .bottom {
            .padding(14, 15, 21, 15);

            .selecAll {
                display: none;

                p {
                    .font-size(14);
                }
            }

            .pagination {
                width: 100%;
            }
        }
    }
}
</style>
