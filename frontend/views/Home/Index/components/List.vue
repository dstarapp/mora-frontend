<template>
    <div class="item">
        <div class="planetInfo" @click="planetJump">
            <div class="planet-header">
                <div class="planet-avatar">
                    <img v-if="planetData.avatar" :src="getImagesUrl(planetData.avatar)" />
                    <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                </div>
                <div class="planet-tbox">
                    <div class="title">
                        <span>{{ planetData.name }}</span>
                        <!-- <i v-if="planetData.isCert" class="iconfont icon-cert"></i> -->
                        <i @click.stop="openTwitter(planetData.twitter)" v-if="planetData.twitter"
                            class="iconfont icon-twitter2"></i>
                        <i v-if="isOfficial" class="iconfont icon-cert text-purple-500"></i>
                    </div>
                    <div class="tag">
                        <span>
                            <i class="iconfont icon-point" />
                            {{ dealPid(planetData.canister) }}
                        </span>
                        <span v-if="addressRes" translate="no">
                            <i class="iconfont icon-author" />
                            {{ addressRes }}
                        </span>
                        <span v-else>
                            <i class="iconfont icon-author" />
                            {{ dealPid(planetData.owner) }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="planet-profile">
                {{ planetData.descs }}
            </div>
            <div class="planet-data">
                <div class="data-item">
                    <strong>{{ numFormat(planetData.article, 1) }}</strong>
                    <span translate="yes">{{ $t('list.articles') }}</span>
                </div>
                <div class="data-item">
                    <strong>{{ numFormat(planetData.subcriber, 1) }}</strong>
                    <span translate="yes">{{ $t('list.subscribers') }}</span>
                </div>
                <div class="data-item">
                    <strong>{{ (planetData.income / 100).toFixed(2) }}</strong>
                    <span translate="yes">
                        {{ $t('list.income') }}
                        <i class="pl-1 text-xs not-italic">(ICP)</i>
                    </span>
                </div>
            </div>
        </div>
        <h3>{{ $t('list.latest') }}</h3>
        <div class="articlelist" v-for="article in planetData.articles" :key="article.articleid"
            @click="articleJump(article)">
            <!-- <i></i> -->
            <div class="mbox">
                <div class="title">
                    <span class="public" v-if="article.status === 'Public'">{{
            $t('editor.tools.permissions.Public')
        }}</span>
                    <span class="sub" v-else>{{ $t('editor.tools.permissions.Subcribe') }}</span>
                    {{ article.title }}
                </div>
                <span class="time">{{ format_date(article.created * 1000) }}</span>
            </div>
            <div class="img" v-if="isIPFSHashOrHttps(article.thumb)">
                <img :src="getImagesUrl(article.thumb)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getIcnaming } from '@/utils/icnaming';
import {
    dealPid,
    numFormat,
    getImagesUrl,
    format_date,
    isIPFSHashOrHttps,
} from '@/utils/functions';
import { getOfficial } from '@/utils/official';

export default defineComponent({
    components: {},
    props: {
        planetData: {
            type: Object,
            default: {},
        },
    },
    setup(props) {
        const router = useRouter();
        const addressRes = ref();
        const isOfficial = ref(false);

        const planetJump = () => {
            if (props.planetData.canister) {
                router.push({
                    name: 'browserHome',
                    params: {
                        id: props.planetData.canister,
                    },
                });
            }
        };

        const articleJump = (item) => {
            if (item.articleid) {
                router.push({
                    name: 'browserArticle',
                    params: {
                        id: props.planetData.canister,
                        articleId: item.articleid,
                    },
                });
            }
        };

        const openTwitter = (item) => window.open(item);

        onMounted(async () => {
            if (props.planetData.owner) {
                addressRes.value = await getIcnaming(props.planetData.owner);
            }

            let isOfficialVal = await getOfficial(props.planetData.canister);
            if (isOfficialVal) {
                isOfficial.value = isOfficialVal;
            }
        });

        return {
            addressRes,
            isOfficial,
            format_date,
            getImagesUrl,
            dealPid,
            numFormat,
            planetJump,
            articleJump,
            openTwitter,
            isIPFSHashOrHttps,
        };
    },
});
</script>

<style lang="less" scoped>
.item {
    @apply w-full bg-white rounded-2xl px-6 pt-8 pb-3 flex-col justify-between transition duration-300 hover: (shadow-2xl shadow-gray-300 transform scale-105 transition duration-300 cursor-pointer <sm:(shadow-none transform-none) dark:(shadow-black)) sm:(mb-2 px-4 pt-5 pb-2) <sm:(mb-1 px-4 pt-5 pb-2) md:(mb-0) dark:(bg-dark-600);

    .planetInfo {
        @apply w-full;

        .planet-header {
            @apply w-full flex items-center;

            .planet-avatar {
                @apply w-17 h-17 min-w-17 rounded-full border border-light-400 p-3px mr-3 <sm: (w-13 h-13 min-w-12) dark:(border-dark-300);

                img {
                    @apply w-full rounded-full;
                }
            }

            .planet-tbox {
                @apply flex-1;

                .title {
                    @apply flex items-center <sm: (text-base) dark:(text-light-900/80);

                    span {
                        @apply lg:(max-w-45) truncate <sm: (max-w-40) md:(max-w-40);
                    }

                    .icon-cert {
                        @apply text-purple-500 text-lg ml-1 <sm:(text-base);
                    }

                    .icon-twitter2 {
                        @apply ml-2 text-blue-400 text-lg transition duration-300 hover: (text-blue-500 transition duration-300 cursor-pointer) <sm:(text-base);
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
            @apply w-full my-5 text-gray-500 leading-5 text-center text-sm overflow-hidden break-words 2xl:(text-base) dark:(text-light-900/50);
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }

        .planet-data {
            @apply w-full divide-x divide-light-700 inline-grid grid-cols-3 dark:(divide-dark-300);

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

                span {
                    @apply text-xs text-white rounded-full px-1 py-1px font-normal;
                    zoom: 0.88;

                    &.public {
                        @apply bg-blue-500;
                    }

                    &.sub {
                        @apply bg-purple-500;
                    }
                }
            }

            .time {
                @apply w-full pt-2 block text-xs text-left text-gray-400 dark:(text-light-900/40);
            }
        }

        .img {
            @apply w-22 h-13 overflow-hidden ml-4;

            img {
                @apply w-full h-full rounded-xl;
                object-fit: cover;
                width: 100%;
            }
        }
    }
}
</style>
