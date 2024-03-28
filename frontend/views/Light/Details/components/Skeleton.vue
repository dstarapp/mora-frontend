<template>
    <el-skeleton animated class="box">
        <template #template>
            <div class="baseinfo">
                <div class="left">
                    <div class="plugin-logo">
                        <el-skeleton-item variant="image" class="img" />
                    </div>
                    <div class="plugin-info">
                        <el-skeleton-item variant="h3" class="w-35" />
                        <el-skeleton-item variant="text" class="w-12 my-2" />
                        <el-skeleton-item variant="h3" class="w-30" />
                    </div>
                </div>
                <el-skeleton-item variant="button" class="collect" />
            </div>
            <div class="moreinfo">
                <div class="left">
                    <div class="title">{{ $t('plugin.details.description') }}</div>
                    <div class="content">
                        <el-skeleton-item variant="image" class="w-full h-78" />
                        <el-skeleton :rows="5" class="mt-5" />
                    </div>

                    <div class="timebox">
                        <div class="list">
                            <div class="time">
                                <span>{{ $t('plugin.details.createTime') }}</span>
                                <span>
                                    <el-skeleton-item variant="text" class="w-4/5" />
                                </span>
                            </div>
                            <el-skeleton-item variant="image" class="avatar" />
                        </div>
                    </div>

                    <div class="title">{{ $t('plugin.details.actions') }}</div>
                    <div class="actions">
                        <div class="item">
                            <el-skeleton-item variant="h3" class="w-4/5 h-5 my-1" />
                            <el-skeleton-item variant="text" class="w-5 h-5 rounded-full" />
                        </div>
                    </div>

                    <div class="title">{{ $t('plugin.details.json') }}</div>
                    <div class="json">
                        <el-skeleton :rows="10" />
                    </div>
                </div>

                <div class="right">
                    <div class="timebox">
                        <div class="list">
                            <div class="time">
                                <span>{{ $t('plugin.details.createTime') }}</span>
                                <span>
                                    <el-skeleton-item variant="text" class="w-4/5 h-4 mt-1" />
                                </span>
                            </div>
                            <el-skeleton-item variant="image" class="avatar" />
                        </div>
                        <div class="list">
                            <div class="time">
                                <span>{{ $t('plugin.details.reviewTime') }}</span>
                                <span>
                                    <el-skeleton-item variant="text" class="w-4/5 h-4 mt-1" />
                                </span>
                            </div>
                            <el-skeleton-item variant="image" class="avatar" />
                        </div>
                    </div>

                    <div class="share">
                        <div class="title">Share</div>
                        <div class="item">
                            <i class="iconfont icon-link"></i>
                            <i class="iconfont icon-twitter"></i>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>
</template>

<style scoped lang="less">
.box {
    @apply w-full max-w-250 mx-auto;

    .baseinfo {
        @apply w-full mt-10 flex justify-between items-center <lg:(px-10) <sm:(px-5 mt-5);
        .left {
            @apply flex items-center;
            .plugin-logo {
                @apply w-20 h-20 rounded-2xl border-3 border-white overflow-hidden <lg:(w-18 h-18) <sm:(w-15 h-15);
                .img {
                    @apply w-full h-full;
                }
            }
            .plugin-info {
                @apply ml-5 flex flex-col justify-between <sm:(ml-3);
            }
        }
        .collect {
            @apply w-27 h-11;
        }
    }
    .moreinfo {
        @apply w-full mt-8 bg-white rounded-2xl px-8 pt-2 pb-8 flex justify-between <sm:(px-5 pt-0 mt-5) dark:(bg-dark-800);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
        .left {
            @apply flex-1;

            .title {
                @apply w-full block text-xl text-black font-bold py-6 <sm:(text-lg py-4) dark:(text-light-900);
            }
            .content {
                @apply w-full;
                img {
                    @apply w-full;
                }
                p {
                    @apply text-base py-4 text-dark-500 <sm:(text-sm) dark:(text-light-900/80);
                }
            }

            .timebox {
                @apply w-full border border-light-700 rounded-2xl px-4 py-3 mt-1 mb-3 hidden <lg:(block);
                .list {
                    @apply w-full flex items-center justify-between;
                    &:first-child {
                        @apply pb-3 border-b border-dashed border-light-800;
                    }
                    &:last-child {
                        @apply pt-3;
                    }
                    .time {
                        @apply flex-1;
                        span {
                            @apply w-full block;
                            &:first-child {
                                @apply font-bold text-sm;
                            }
                            &:last-child {
                                @apply text-xs text-gray-500 pt-2px;
                            }
                        }
                    }
                    .avatar {
                        @apply w-10 h-10 rounded-full;
                    }
                }
            }

            .actions {
                @apply w-full rounded-xl px-4 py-3 mb-5 border border-light-900 dark:(border-dark-100);
                .item {
                    @apply w-full flex items-center justify-between;
                    span {
                        @apply text-green-500 <sm:(text-sm);
                    }
                    i {
                        @apply text-gray-400 text-2xl hover:(cursor-pointer);
                    }
                }
                .modulehash {
                    @apply w-full mt-2;
                    h4 {
                        @apply w-full block text-gray-400 text-xs;
                    }
                    .list {
                        @apply w-full flex justify-between items-center text-sm pt-1;
                        .hash {
                            @apply flex-1 break-all text-dark-50 <sm:(leading-4 pb-1 text-xs) dark:(text-light-900/80);
                        }
                        .status {
                            @apply text-red-400 ml-2 text-xs;
                        }
                    }
                }
            }
            :deep(.json) {
                @apply w-full;
                word-break: break-all;
                overflow: hidden;

                .code-toolbar {
                    div {
                        @apply my-0;
                    }

                    & > .toolbar {
                        @apply top-2 right-2;

                        & > .toolbar-item {
                            & > button {
                                @apply bg-gray-600 text-white py-1 px-2;
                                box-shadow: none;
                            }
                        }
                    }
                }
            }
        }
        .right {
            @apply w-60 ml-18 <lg:(hidden);
            .timebox {
                @apply w-full border border-light-700 rounded-2xl px-4 py-3 mt-18 dark:(border-dark-100);
                .list {
                    @apply w-full flex items-center justify-between;
                    &:first-child {
                        @apply pb-3 border-b border-dashed border-light-800 dark:(border-dark-100);
                    }
                    &:last-child {
                        @apply pt-3;
                    }
                    .time {
                        @apply flex-1;
                        span {
                            @apply w-full block;
                            &:first-child {
                                @apply font-bold text-sm dark:(text-light-900/80);
                            }
                            &:last-child {
                                @apply text-xs text-gray-500 pt-2px;
                            }
                        }
                    }
                    .avatar {
                        @apply w-10 h-10 rounded-full;
                    }
                }
            }
            .share {
                @apply mt-10 w-full;
                .title {
                    @apply w-full block font-bold pb-4;
                }
                .item {
                    @apply flex w-full items-center;
                    i {
                        @apply flex items-center justify-center border border-light-800 w-12 h-12 mr-4 rounded-xl text-gray-400 dark:(border-dark-100);
                        &.icon-link,
                        &.icon-twitter {
                            @apply transition duration-300 hover:(cursor-pointer transition duration-300);
                        }
                        &.icon-link {
                            @apply hover:(bg-green-500 text-white border-green-500);
                        }
                        &.icon-twitter {
                            @apply hover:(bg-blue-500 text-white border-blue-500);
                        }
                    }
                }
            }
        }
    }
}
</style>
