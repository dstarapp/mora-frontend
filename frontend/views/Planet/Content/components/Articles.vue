<template>
    <div class="list" v-loading="isLoading">
        <div class="item">
            <div @click.prevent="listItemClick(listData)">
                <div class="title">
                    <h3 :class="{
        top:
            listData && listData.toped
                ? Number(listData.toped.toString())
                : false,
    }">
                        <i v-show="listData && listData.toped
        ? Number(listData.toped.toString())
        : false
        " class="iconfont icon-back-top"></i>
                        {{
        listData && listData.title
            ? listData.title
            : $t('planetContent.screening.noTitle')
    }}
                    </h3>
                    <p>{{ listData ? Object.keys(listData.status)[0] : '' }}</p>
                    <p class="reproduced" v-if="!listData.original">{{
        $t('articleSource.source2')
    }}</p>
                </div>
                <div class="info">
                    <span>{{
            listData
                ? new Date(Number(listData.created.toString())).toLocaleString()
                : $t('planetContent.screening.unknown')
        }}</span>
                    <strong>
                        <i class="iconfont icon-zan"></i>
                        <em>{{ listData ? listData.like.toString() : 0 }}</em>
                    </strong>
                    <strong>
                        <i class="iconfont icon-comments"></i>
                        <em>
                            {{ listData ? listData.comment : 0 }} <i>/</i>
                            {{ listData ? listData.commentTotal : 0 }}
                        </em>
                    </strong>
                </div>
            </div>
            <div class="menu">
                <span class="btn" @click.stop="edit">
                    <i class="iconfont icon-edit"></i>
                    <p>{{ $t('planetContent.menu.edit') }}</p>
                </span>
                <span class="btn" @click.stop="goComment()">
                    <i class="iconfont icon-comment"></i>
                    <p>{{ $t('planetContent.menu.comments') }}</p>
                </span>
                <!-- <span class="btn" @click.stop="onchain">
                    <i class="iconfont icon-onchain"></i>
                    <p>{{ $t('planetContent.menu.chain') }}</p>
                </span> -->
                <div class="dropdown">
                    <i class="iconfont icon-more"></i>
                    <div class="drop">
                        <span v-if="Object.keys(listData.status)[0] === 'Public' &&
        Number(listData.toped) === 0
        " class="drop-btn" @click.stop="backTop(true)">
                            <i class="iconfont icon-back-top"></i>
                            <p>{{ $t('planetContent.menu.top') }}</p>
                        </span>
                        <span v-if="Object.keys(listData.status)[0] === 'Public' &&
        Number(listData.toped) !== 0
        " class="drop-btn un" @click.stop="backTop(false)">
                            <i class="iconfont icon-back-top"></i>
                            <p>{{ $t('planetContent.menu.unTop') }}</p>
                        </span>
                        <span class="drop-btn" @click.stop="remove">
                            <i class="iconfont icon-remove"></i>
                            <p>{{ $t('planetContent.menu.remove') }}</p>
                        </span>
                        <span class="drop-btn isM" @click.stop="edit">
                            <i class="iconfont icon-edit"></i>
                            <p>{{ $t('planetContent.menu.edit') }}</p>
                        </span>
                        <span class="drop-btn isM" @click.stop="goComment">
                            <i class="iconfont icon-comment"></i>
                            <p>{{ $t('planetContent.menu.comments') }}</p>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="smallLoading" v-if="smallLoading">
            <img src="@/assets/svg/loading2.svg" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { ElMessageBox } from 'element-plus';
import Pagination from '@/components/Pagination.vue';
import { t } from '@/i18n';
import { useRoute, useRouter } from 'vue-router';
import { isMobile } from '@/utils/functions';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'Articles',
    components: { Pagination },
    props: {
        listData: { type: Object },
    },
    emits: ['refresh', 'openLoading'],
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const planetCanister: any = inject('planetCanister', null);
        const isLoading = ref(false);
        const smallLoading = ref(false);

        const edit = (aid = '') => {
            if (isMobile()) {
                t('editor.isMobile');
                return;
            }
            router.push({
                name: 'planetEditor',
                params: {
                    id: typeof aid === 'object' ? route.params.id : aid,
                },
                query: {
                    articlesId: props.listData && props.listData.id ? props.listData.id : '',
                },
            });
        };

        const goComment = () => {
            if (!props?.listData?.id) {
                return;
            }
            router.push({
                name: 'planetComment',
                query: {
                    ...route.query,
                },
                params: {
                    id: route.params.id,
                    articleId: props.listData.id,
                },
            });
        };

        const onchain = () => { };

        const backTop = async (bol) => {
            smallLoading.value = true;
            try {
                let res = await planetCanister.value.topedArticle(props.listData.id, bol);
                if (res.Ok) {
                    smallLoading.value = false;
                } else {
                    debug('error', res);
                    smallLoading.value = false;
                }
            } catch (err) {
                debug('error', err);
                smallLoading.value = false;
            }
        };

        const remove = () => {
            ElMessageBox.confirm(
                t('planetContent.removeTip.content'),
                t('planetContent.removeTip.title'),
                {
                    confirmButtonText: t('planetContent.removeTip.confirmButtonText'),
                    cancelButtonText: t('planetContent.removeTip.cancelButtonText'),
                    type: 'warning',
                },
            )
                .then(async () => {
                    smallLoading.value = true;
                    try {
                        let res = await planetCanister.value.deleteArticle(props.listData.id);
                        if (res) {
                            smallLoading.value = false;
                            context.emit('refresh');
                        } else {
                            debug('failed', res);
                            smallLoading.value = false;
                        }
                    } catch (err) {
                        smallLoading.value = false;
                        debug('failed', err);
                    }
                })
                .catch(() => { });
        };

        const listItemClick = (item) => {
            if (Object.keys(item.status)[0] === 'Draft') {
                edit(route.params.id as string);
                return;
            }
            router.push({
                name: 'browserArticle',
                params: {
                    id: route.params.id,
                    articleId: item.id,
                },
            });
        };

        return {
            listItemClick,
            edit,
            onchain,
            backTop,
            remove,
            goComment,
            isLoading,
            smallLoading,
        };
    },
});
</script>

<style scoped lang="less">
.list {
    display: flex;
    flex-direction: column;
    width: 100%;
    .padding(0, 30, 0, 30);
    position: relative;

    :deep(.el-checkbox-group) {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    :deep(.el-checkbox__label) {
        display: none;
    }

    .item {
        width: 100%;
        .padding(15, 20, 15, 20);
        .margin(4, 0, 4, 0);
        cursor: pointer;
        .border-radius(15);
        // transition: @transition;
        position: relative;

        .el-checkbox {
            height: 100%;
            .margin(0, 20, 0, 0);
        }

        .title {
            display: flex;
            width: 100%;
            align-items: center;

            h3 {
                display: flex;
                margin: 0;
                .font-size(18);
                line-height: 100%;
                color: @text-color;
                transition: @transition;
                height: 100%;
                font-weight: 500;

                .icon-back-top {
                    .font-size(16);
                    .margin(0, 10, 0, 0);
                    color: text-base @text-active;
                }

                // .ellipsisMore(1);
                &.top {
                    color: @text-active;
                }

                @apply dark:(text-light-900);
            }

            p {
                display: inline-flex;
                background: #f5f3fe;
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                .padding(2, 8, 2, 8);
                .border-radius(6);
                .margin(0, 0, 0, 20);
                color: @text-active;
                @apply dark:(bg-dark-300);

                &.reproduced {
                    .margin(0, 0, 0, 15);
                    @apply bg-yellow-400/10 text-yellow-500;
                }
            }
        }

        .info {
            display: flex;
            .margin(10);
            width: 100%;
            align-items: center;

            span,
            strong {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                .line-height(17);
                color: @text-fcolor;
                .margin(0, 36, 0, 0);
                align-items: center;
            }

            span {
                .padding(3, 10, 2, 10);
                background: #f7f7f7;
                .border-radius(22);
                @apply dark:(bg-dark-300 text-light-900/60);
            }

            strong {
                i {
                    color: @text-color-grey;
                    .font-size(18);
                    @apply dark:(text-light-900/60);
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

                @media screen and (min-width: 0) and (max-width: 1240px) {
                    i {
                        .font-size(14);
                    }

                    em {
                        .font-size(14);
                    }
                }
            }
        }

        .menu {
            display: none;
            position: absolute;
            align-items: center;
            right: 0;
            bottom: 0;
            background: linear-gradient(to right,
                    rgba(246, 246, 246, 0.95) 1%,
                    @bg-color-hover 35%,
                    @bg-color-hover 35%,
                    @bg-color-hover 29%);
            height: 100%;
            padding-left: 20px;
            .border-radius(15);
            @apply dark:(bg-gradient-to-r from-dark-900 to-dark-900);

            .icon-more {
                .font-size(18);
                color: @text-color-grey;
                .margin(0, 20, 0, 0);
            }

            .btn {
                .center();
                .height(40);
                background: #ffffff;
                border: 2px solid @border-color;
                .border-radius(12);
                box-sizing: border-box;
                opacity: 0;
                transition: @transition;
                .margin(0, 0, 0, 15);
                .padding(8, 12, 8, 12);
                @apply dark:(bg-dark-600 border-dark-100);

                i {
                    .font-size(14);
                    color: @text-color-grey;
                    transition: @transition;
                    .margin(0, 8, 0, 0);
                    @apply dark:(text-light-900/60);
                }

                p {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color;
                    transition: @transition;
                    @apply dark:(text-light-900);
                }

                &:hover {
                    border: 2px solid @border-color-active;

                    i {
                        color: @text-active;
                        transition: @transition;
                    }

                    p {
                        color: @text-active;
                        transition: @transition;
                    }
                }
            }

            .dropdown {
                display: flex;
                height: 100%;
                align-items: center;
                position: relative;
                .padding(0, 5, 0, 15);

                .icon-back-top {
                    .font-size(16);
                    color: @text-color;
                }

                .drop {
                    display: none;
                    position: absolute;
                    .padding(12, 12, 12, 12);
                    flex-direction: column;
                    background: @bg-color;
                    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.12);
                    .border-radius(15);
                    right: 0;
                    top: 95%;
                    z-index: 2;
                    @apply dark:(bg-dark-900 shadow-black);

                    .drop-btn {
                        display: flex;
                        align-items: center;
                        .padding(12, 22, 12, 22);
                        .border-radius(10);

                        &.isM {
                            display: none;
                        }

                        i {
                            display: flex;
                            .font-size(16);
                            color: @text-color-grey;
                        }

                        p {
                            display: flex;
                            font-style: normal;
                            font-weight: 400;
                            .font-size(14);
                            .line-height(19);
                            color: @text-color;
                            .margin(0, 0, 0, 12);
                            @apply dark:(text-light-900);
                        }

                        &:hover {
                            background: @bg-color-hover;
                            @apply dark:(bg-dark-600);

                            i,
                            p {
                                color: @text-active;
                            }
                        }

                        &.un {
                            i {
                                transform: rotate(180deg);
                            }
                        }
                    }
                }

                &:hover {
                    .drop {
                        display: flex;
                    }
                }
            }
        }

        &:hover {
            background: @bg-color-hover;
            @apply dark:(bg-dark-900);

            .title {
                .icon-back-top {
                    color: @text-active;
                }

                h3 {
                    color: @text-active;
                    transition: @transition;
                }
            }

            .menu {
                display: flex;

                span {
                    opacity: 1;
                }
            }
        }
    }

    .smallLoading {
        position: absolute;
        .top(30);
        .right(50);
        width: 20px;
        height: 20px;

        img {
            width: 20px;
            height: 20px;
        }
    }
}

.articles {
    display: flex;
    flex-direction: column;
    min-height: 650px;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .list {
        .padding(11, 0, 0, 0);
        .noScrollbar();

        .item {
            padding-top: 0;

            .title {
                h3 {
                    // .ellipsisMore(2);
                    .font-size(16);
                    .line-height(22);
                }

                p {
                    display: none;
                }
            }

            .info {
                .margin(10, 0, 0, 0);

                span {
                    display: none;
                }

                strong {
                    .margin(0, 15, 0, 0);
                }
            }

            .menu {
                display: block;
                .height(70);
                background: none;
                @apply dark:(bg-gradient-to-r from-dark-600 to-dark-600);

                .btn {
                    display: none;
                }

                .dropdown {
                    .icon-more {
                        .font-size(20);
                    }

                    .drop {
                        top: 80%;

                        .drop-btn {
                            .padding(12, 12, 12, 12);

                            i {
                                margin-right: 4px;
                            }

                            &.isM {
                                display: flex;
                            }
                        }
                    }
                }
            }

            &:hover {
                background: none;
                transition: 0;

                .title {
                    .icon-back-top {
                        color: #000;
                    }

                    h3 {
                        color: inherit;
                        transition: @transition;
                    }
                }
            }
        }

        .screening {
            // .height(64);
            .margin(0, 0, 15, 0);

            .btn {
                margin-left: 0;
                display: flex;
                white-space: nowrap;

                i {
                    .border-radius(9);
                    .line-height(14);
                    .font-size(10);
                }

                &.right {
                    .margin(0, 20, 0, 0) !important;

                    &::before {
                        display: none;
                    }
                }

                &:first-child {
                    .margin(0, 10, 0, 15) !important;
                }
            }

            .interval {
                display: none;
            }
        }
    }
}
</style>
