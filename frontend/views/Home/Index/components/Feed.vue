<template>
    <div class="article" @click="jump('article')">
        <div class="<sm:(flex flex-row-reverse)">
            <strong
                :class="{
                    isLoading: imgLoading,
                }"
                v-if="articleData.thumb"
            >
                <img
                    sizes="100vw"
                    :srcset="`
                        ${getImagesUrl(articleData.thumb, 165)} 640w,
                        ${getImagesUrl(articleData.thumb, 278)} 1080w,
                        ${getImagesUrl(articleData.thumb, 495)} 1920w
                    `"
                    @load="loadImg"
                    alt=""
                />
            </strong>
            <h3 v-if="articleData.thumb !== ''">{{ articleData.title }}</h3>
            <div v-else class="noImgTitle">
                <img src="@/assets/svg/feed.svg" alt="" />
                <p>{{ articleData.title }}</p>
            </div>
            <div class="summary" :class="{ noImg: articleData.thumb === '' }">
                {{ articleData.abstract }}
            </div>
        </div>
        <div class="info" @click.stop="">
            <div class="user">
                <div class="avatar" @click.stop="jump('author')">
                    <img
                        v-if="userData && userData.avatar"
                        :src="getImagesUrl(userData.avatar, 50)"
                    />
                    <img v-else src="@/assets/svg/defaultPlanet.png" alt="avatar" />
                </div>
                <div class="username" @click.stop="jump('author')">
                    {{ userData ? userData.name : 'loading...' }}
                </div>
            </div>
            <div class="flex items-center">
                <div class="collection" v-show="articleData.love > 0">
                    <i class="iconfont icon-zan"></i>{{ articleData.love }}
                </div>
                <div class="date">
                    {{
                        articleData
                            ? moment(Number(articleData.created * 1000)).fromNow()
                            : 'unknow'
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { format_date, getImagesUrl } from '@/utils/functions';
import { getUserData } from '@/utils/getAvatar';
import moment from 'moment';

export default defineComponent({
    props: {
        articleData: {
            type: Object,
            default: {},
        },
    },
    setup(props) {
        const router = useRouter();
        const userData = ref();
        const imgLoading = ref(true);

        const jump = (type) => {
            if (type === 'article') {
                router.push({
                    name: 'browserArticle',
                    params: {
                        id: props.articleData.canister,
                        articleId: props.articleData.articleid,
                    },
                });
            } else {
                router.push({
                    name: 'browserHome',
                    params: {
                        id: props.articleData.canister,
                    },
                });
            }
        };

        const loadImg = () => {
            imgLoading.value = false;
        };

        onMounted(async () => {
            if (!props?.articleData?.canister) {
                return;
            }
            userData.value = await getUserData(props.articleData.canister);
        });

        return {
            format_date,
            getImagesUrl,
            jump,
            loadImg,
            imgLoading,
            userData,
            moment,
        };
    },
});
</script>

<style lang="less" scoped>
.article {
    @apply w-full pb-1 bg-white rounded-2xl flex flex-col justify-between transition duration-300 hover: (shadow-2xl shadow-gray-300 transform scale-105 transition duration-300 cursor-pointer <sm:(shadow-none transform-none) dark:(shadow-black)) dark:(bg-dark-600);

    strong {
        @apply block overflow-hidden <sm:(h-auto pr-3) md:(h-47) lg:(h-72) xl:(h-57) 2xl:(h-62);
        &.isLoading {
            background: url('@/assets/svg/loading3.svg') no-repeat center center;
            background-size: 50px auto;
        }

        img {
            @apply w-full h-full rounded-tl-2xl rounded-tr-2xl object-cover <sm:(w-30 h-14 rounded-xl mt-4);
        }
    }
    h3,
    .summary {
        @apply px-6 sm:(mb-6 px-4 pt-5 pb-2) <sm:(mb-6 px-4 pt-5 pb-2) md:(mb-0);
    }

    h3 {
        @apply w-full my-4 py-0 text-lg font-bold overflow-hidden overflow-ellipsis dark:(text-light-900) <sm:(max-h-13 text-left text-base) md:(max-h-13) lg:(max-h-20);

        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .noImgTitle {
        min-height: 12.1rem;
        @apply w-full m-0 relative <sm:(min-h-0 h-35 overflow-hidden mb-2);
        img {
            @apply w-full rounded-tl-2xl rounded-tr-2xl;
        }
        p {
            @apply absolute w-full px-10 font-bold text-2xl overflow-hidden transform top-1/2 -translate-y-1/2 dark:(text-black);

            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
    }
    .summary {
        @apply w-full max-h-20 pt-0 text-gray-500 break-words text-center text-sm overflow-hidden overflow-ellipsis 2xl:(text-base) dark:(text-light-900/50) 2xl:(max-h-18) <sm:(mb-2 hidden) md:(mb-5) lg:(mb-8);
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        &.noImg {
            @apply py-5;
        }
    }
    .info {
        @apply w-full mt-5 flex items-center px-6 sm:(px-4) <sm:(px-4 mt-2);
        .user {
            @apply flex-1 flex items-center;
            .ellipsisMore(1);
            .avatar {
                @apply rounded-full overflow-hidden w-7 h-7 2xl:(w-9 h-9) <sm:(w-6 h-6);
                float: left;
                flex-shrink: 0;
                img {
                    @apply w-full h-full rounded-full w-7 h-7 2xl:(w-9 h-9) <sm:(w-6 h-6);
                }
            }
            .username {
                @apply ml-3 text-base max-w-45 text-left truncate dark:(text-light-900/80) <sm:(ml-2 flex-1 text-sm) <lg:(max-w-35) xl:(max-w-50);
                margin-left: 10px;
            }
        }
        .collection {
            @apply flex items-center mr-3 text-gray-400 text-sm;
            i {
                @apply mx-1;
            }
        }
        .date {
            @apply text-sm text-gray-400 whitespace-nowrap;
        }
        @apply w-full flex justify-between mt-5 mb-3;
    }
}
</style>
