<template>
    <div class="noData" v-if="planetListData.length < 1">
        <i class="iconfont icon-no"></i>
        <span>{{ $t('home.noArticles') }}</span>
    </div>
    <div class="list" v-for="item in planetListData" :key="item.id" v-else>
        <div class="date">
            <div class="day">
                {{ getTime(item.created, 'day') }}
            </div>
            <div class="month">
                {{ getTime(item.created, 'month') }}.
                {{ getTime(item.created, 'year') }}
            </div>
            <div class="line"></div>
        </div>
        <div class="conbox" @click="goUrl(item)">
            <div class="header">
                <div class="tag">
                    <i :class="getKeys(item)">{{ getKeys(item).slice(0, 1) }}</i>
                    <span>— {{ getKeys(item) }}</span>
                </div>
                <div class="top" v-if="Number(item.toped.toString())">
                    <i class="iconfont icon-back-top"></i>
                </div>
            </div>
            <div class="title">{{ item.title }}</div>

            <div class="imgbox" v-if="item.thumb && isIPFSHashOrHttps(item.thumb)">
                <img :src="getImagesUrl(item.thumb)" />
            </div>
            <p>
                {{ item.abstract }}
            </p>
            <div class="flex justify-between items-center">
                <div class="article-data">
                    <span>
                        <i class="iconfont icon-zan font-14" />
                        {{ item.like.toString() }}
                    </span>
                    <span class="ml-5">
                        <i class="iconfont icon-talks font-14" />
                        {{ item.comment.toString() }}
                    </span>
                </div>
                <div class="go">
                    <i class="iconfont icon-article-arrow text-white"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getImagesUrl, getTime, isIPFSHashOrHttps } from '@/utils/functions';

export default defineComponent({
    props: {
        planetListData: {
            type: Array,
            default: [],
        },
    },
    setup() {
        const router = useRouter();
        const route = useRoute();

        const goUrl = (item) => {
            router.push({
                name: 'browserArticle',
                params: {
                    id: route.params.id,
                    articleId: item.id,
                },
            });
        };

        const getKeys = (item) => {
            let key = Object.keys(item?.status)[0];
            return key ? key : 'unknown';
        };

        return {
            goUrl,
            getKeys,
            getImagesUrl,
            getTime,
            isIPFSHashOrHttps,
        };
    },
});
</script>

<style lang="less" scoped>
.noData {
    @apply w-full py-25 flex items-center flex-col;
    i {
        @apply text-7xl text-gray-300;
    }
    span {
        @apply py-3 text-gray-400;
    }
}
.list {
    @apply w-full flex justify-between;
    .date {
        @apply w-16 mr-8 flex flex-col <sm:(w-10 mr-3) <xl:(mr-4);
        .day {
            @apply w-full text-center text-3xl dark:(text-light-900/80);
        }
        .month {
            @apply w-full pt-1 text-xs text-center;
            color: #666;
        }
        .line {
            @apply flex-1 w-1px border-dashed border-r border-light-800 mx-auto my-4 dark:(border-light-800/20);
        }
    }
    .conbox {
        @apply flex-1;
        .header {
            @apply w-full flex items-center justify-between;
            .tag {
                @apply flex-1 flex items-center;
                i {
                    @apply w-10 h-10 text-center leading-10 text-2xl not-italic <sm:(w-7 h-7 leading-7 text-base);
                    &.Public {
                        background-color: #fff4d7;
                        color: #ead18e;
                        @apply dark:(bg-yellow-100/10);
                    }
                    &.Private {
                        background-color: #dae2ec;
                        color: #acbaca;
                        @apply dark:(bg-purple-100/10);
                    }
                    &.Subcribe {
                        background-color: #ebfcec;
                        color: #c5e1c7;
                        @apply dark:(bg-green-100/10);
                    }
                }
                span {
                    @apply text-sm pl-2 <sm:(text-xs);
                    color: #999;
                }
            }
            .top {
                @apply w-7 h-7 rounded-full bg-red-500 text-center leading-6 text-sm <sm:(w-6 h-6 leading-5) cursor-pointer;
                i {
                    @apply text-white text-xs;
                }
            }
        }
        .title {
            @apply w-full py-5 text-2xl leading-7 font-bold <sm:(text-base leading-5) <xl:(text-xl py-4 leading-6) transition dark:(text-light-900) hover:(text-purple-500 cursor-pointer transition duration-300 dark:(text-purple-500));
        }
        .imgbox {
            @apply w-full max-h-90 mb-5 overflow-hidden <sm:(mb-3);
            img {
                @apply w-full hover:(cursor-pointer);
            }
        }
        p {
            @apply w-full leading-6 break-words <sm:(text-sm leading-5) dark:(text-light-900/60);
            .ellipsisMore(4);
            word-break: break-word;
            color: @text-fcolor;
        }
        .article-data {
            @apply flex-1 flex items-center;
            span {
                @apply text-gray-400 text-sm;
                i {
                    @apply mr-2;
                }
            }
        }
        .go {
            @apply w-12 h-10 leading-10 bg-purple-400 text-center my-5 float-right transition duration-300 hover:(bg-purple-500 transition duration-300 cursor-pointer) <sm:(w-10 h-8 leading-8);
            i {
                @apply text-xl;
            }
        }
    }
}
</style>
