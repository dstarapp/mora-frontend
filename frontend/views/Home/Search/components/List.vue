<template>
    <div class="item" v-if="filterSwitch == 'Planet'">
        <div class="planetInfo" @click="planetJump">
            <div class="planet-header">
                <div class="flex justify-between items-center flex-1">
                    <div class="planet-avatar">
                        <img v-if="isIPFSHashOrHttps(planetData.avatar)" :src="getImagesUrl(planetData.avatar)" />
                        <img v-else src="@/assets/svg/defaultPlanet.png" alt="avatar" />
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
                            <span v-if="addressRes">
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
            <div class="planet-profile">
                {{ planetData.descs }}
            </div>
        </div>
    </div>
    <div class="item" v-else>
        <div class="articlelist" @click="articleJump(planetData)">
            <div class="mbox">
                <div class="article">
                    <div class="title">{{ planetData.title }}</div>
                    <span class="time">{{ format_date(planetData.created * 1000) }}</span>
                </div>
                <div class="authorbox">
                    <div class="author">
                        <img v-if="planetData.avatar" :src="getImagesUrl(planetData.avatar)" />
                        <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                    </div>
                    <div class="author-pid" translate="no">
                        {{ addressRes ? addressRes : dealPid(planetData.author) }}
                    </div>
                </div>
            </div>
            <div class="img" v-if="planetData.thumb">
                <img :src="getImagesUrl(planetData.thumb)" />
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
import { getAvatar } from '@/utils/getAvatar';
import { Principal } from '@dfinity/principal';

export default defineComponent({
    components: {},
    props: {
        planetData: {
            type: Object,
            default: {},
        },
        filterSwitch: {
            type: String,
            default: {},
        },
    },
    setup(props: any) {
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
            if (props.planetData.author || props.planetData.owner) {
                addressRes.value = await getIcnaming(
                    props.planetData.author ? props.planetData.author : props.planetData.owner,
                );
            }

            if (typeof props.planetData.avatar === 'undefined') {
                let avatar = await getAvatar(Principal.fromText(props.planetData.author));
                props.planetData.avatar = avatar;
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
    @apply border border-light-900/50 rounded-2xl pt-8 pb-4 mb-8 flex-col justify-between bg-white transition duration-300 hover: (shadow-lg shadow-gray-200 transform scale-102 transition duration-300 cursor-pointer dark:(bg-dark-600 shadow-black)) sm:(mb-6 px-4 pt-5 pb-2) <sm:(mb-6 px-4 pt-5 pb-2) md:(w-full) <xl:(w-165) <lg:(w-full) xl:(w-180) dark:(border-dark-300 bg-dark-600);

    .planetInfo {
        @apply w-full;

        .planet-header {
            @apply w-full flex items-center justify-between <xl: (flex-wrap) <lg:(flex-nowrap) <sm:(flex-wrap);

            .planet-avatar {
                @apply w-17 h-17 min-w-17 rounded-full border border-light-400 p-3px mr-3 <sm: (w-13 h-13 min-w-12) dark:(border-dark-100);

                img {
                    @apply w-full rounded-full;
                }
            }

            .planet-tbox {
                @apply flex-1;

                .title {
                    @apply w-full flex-1 text-lg flex items-center <sm: (text-base) dark:(text-light-900/80);

                    span {
                        @apply lg: (max-w-50) truncate <sm: (max-w-50) md:(max-w-45);
                    }

                    .icon-cert {
                        @apply text-purple-500 text-lg ml-1;
                    }

                    .icon-twitter2 {
                        @apply ml-2 text-blue-400 text-lg transition duration-300 hover: (text-blue-500 transition duration-300 cursor-pointer);
                    }
                }

                .tag {
                    @apply w-full mt-2 block flex items-center <sm: (mt-0);

                    span {
                        @apply flex items-center;

                        i {
                            @apply mr-2 text-sm;

                            &.icon-point {
                                @apply text-purple-500;
                            }

                            &.icon-author {
                                @apply text-green-500;
                            }
                        }

                        @apply bg-light-500 rounded-2xl text-sm py-2px px-3 text-gray-500 mr-2 <sm:(text-xs py-1px px-2) dark:(bg-dark-300);
                    }
                }
            }

            .planet-data {
                @apply divide-x divide-light-700 flex <xl: (w-full mt-6) <lg:(mt-0) <sm:(mt-5) dark:(divide-dark-300);

                .data-item {
                    @apply text-center px-5 <xl: (text-left);

                    strong {
                        @apply text-xl dark:(text-light-900);
                    }

                    span {
                        @apply w-auto block text-sm text-gray-400 dark:(text-light-900/40);
                    }
                }
            }
        }

        .planet-profile {
            @apply w-full mt-5 pb-4 text-gray-500 leading-4 text-sm max-h-13 overflow-hidden <sm: (max-h-12) md:(max-h-12) 2xl:(text-base max-h-18);
        }
    }

    h3 {
        @apply w-full py-3 text-blue-500;
    }

    .articlelist {
        @apply w-full flex justify-between mb-3;

        i {
            @apply w-6px h-6px rounded-full bg-blue-500 mr-3 mt-1;
        }

        .mbox {
            @apply px-2 flex-1 flex flex-col justify-between <sm:(px-0);

            .article {
                @apply w-full;

                .title {
                    @apply leading-5 text-lg font-bold dark:(text-light-900/80) <sm:(text-base);
                }

                .time {
                    @apply w-full pt-2 block text-xs text-gray-400 <sm:(pt-1) dark:(text-light-900/40);
                }
            }

            .authorbox {
                @apply flex items-center mt-4;

                .author {
                    @apply w-8 h-8 <sm:(w-6 h-6);

                    img {
                        @apply w-8 h-8 rounded-full <sm:(w-6 h-6);
                    }
                }

                .author-pid {
                    @apply text-gray-400 text-sm pl-3;
                }
            }
        }

        .img {
            @apply w-25 h-16 overflow-hidden ml-4 mr-2 md:(w-40 h-22) xl:(w-60 h-33) <sm:(mr-0);

            img {
                @apply w-full h-full rounded-xl;
                object-fit: cover;
                width: 100%;
            }
        }
    }
}
</style>
