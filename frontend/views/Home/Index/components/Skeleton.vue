<template>
    <el-skeleton animated class="item">
        <template #template>
            <div class="planetInfo">
                <div class="planet-header">
                    <el-skeleton-item variant="image" class="planet-avatar" />
                    <div class="planet-tbox">
                        <div class="title">
                            <span><el-skeleton-item variant="h3" /></span>
                            <el-skeleton-item variant="h3" class="w-10 mr-3" />
                            <el-skeleton-item variant="h3" class="w-10" />
                        </div>
                        <div class="tag">
                            <el-skeleton-item variant="p" class="w-25 mr-3" />
                            <el-skeleton-item variant="p" class="w-25" />
                        </div>
                    </div>
                </div>
                <div class="planet-profile">
                    <el-skeleton-item variant="text" class="w-full" />
                    <el-skeleton-item variant="text" class="w-full" />
                    <el-skeleton-item variant="text" class="w-3/5" />
                </div>
                <div class="planet-data">
                    <div class="data-item">
                        <strong><el-skeleton-item variant="text" /></strong>
                        <span><el-skeleton-item variant="text" /></span>
                    </div>
                    <div class="data-item">
                        <strong><el-skeleton-item variant="text" /></strong>
                        <span><el-skeleton-item variant="text" /></span>
                    </div>
                    <div class="data-item">
                        <strong><el-skeleton-item variant="text" /></strong>
                        <span><el-skeleton-item variant="text" /></span>
                    </div>
                </div>
            </div>
            <h3><el-skeleton-item variant="h3" /></h3>
            <div class="articlelist">
                <div class="mbox">
                    <div class="title">
                        <el-skeleton-item variant="text" class="w-full" />
                    </div>
                    <span class="time"><el-skeleton-item variant="text" class="w-25" /></span>
                </div>

                <el-skeleton-item variant="image" class="img" />
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    },
});
</script>

<style lang="less" scoped>
.item {
    @apply w-full bg-white rounded-2xl px-6 pt-8 pb-4 flex-col justify-between transition duration-300 hover: (shadow-2xl shadow-gray-300 transform scale-105 transition duration-300 cursor-pointer dark:(shadow-black)) sm:(mb-3 px-4 pt-5 pb-2) <sm:(mb-1 px-4 pt-5 pb-2) md:(mb-0) dark:(bg-dark-600);

    .planetInfo {
        @apply w-full;

        .planet-header {
            @apply w-full flex items-center;

            .planet-avatar {
                @apply w-17 h-17 min-w-17 rounded-full border border-light-400 p-3px mr-3 <sm: (w-13 h-13 min-w-12) dark:(border-dark-300);
            }

            .planet-tbox {
                @apply flex-1;

                .title {
                    @apply w-full flex-1 text-lg flex items-center <sm: (text-base) dark:(text-light-900/80);

                    span {
                        @apply lg:(max-w-45) truncate <sm: (max-w-40) md:(max-w-40);
                    }

                    .icon-cert {
                        @apply text-purple-500 text-lg ml-1;
                    }

                    .icon-twitter {
                        @apply ml-3 text-blue-400 text-lg transition duration-300 hover: (text-blue-500 transition duration-300 cursor-pointer);
                    }
                }

                .tag {
                    @apply w-full mt-2 block flex items-center <sm: (mt-0);

                    span {
                        @apply flex items-center;
                        i {
                            @apply mr-1 text-sm;

                            &.icon-point {
                                @apply text-purple-500;
                            }

                            &.icon-author {
                                @apply text-green-500;
                            }
                        }

                        @apply bg-light-500 rounded-2xl text-sm py-2px px-3 text-gray-500 mr-2 <sm:(text-xs) dark:(bg-dark-300);
                    }
                }
            }
        }

        .planet-profile {
            @apply w-full my-5 text-gray-500 leading-5 text-center text-sm overflow-hidden 2xl:(text-base) dark:(text-light-900/50);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }

        .planet-data {
            @apply w-full inline-grid grid-cols-3 gap-4;

            .data-item {
                @apply text-center;

                strong {
                    @apply text-2xl dark:(text-light-900);
                }

                span {
                    @apply block text-sm text-gray-400 dark:(text-light-900/40);
                }
            }
        }
    }

    h3 {
        @apply w-full py-5 text-blue-500 text-left;
    }

    .articlelist {
        @apply w-full flex justify-between mb-5;

        i {
            @apply w-6px h-6px rounded-full bg-blue-500 mr-3 mt-1;
        }

        .mbox {
            @apply flex-1 flex flex-col;

            .title {
                @apply leading-4 text-sm font-bold text-left 2xl: (text-base) dark:(text-light-900/80);
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .time {
                @apply w-full pt-2 block text-xs text-left text-gray-400 dark:(text-light-900/40);
            }
        }

        .img {
            @apply w-22 h-13 overflow-hidden ml-4 rounded-xl;
        }
    }
}
</style>
