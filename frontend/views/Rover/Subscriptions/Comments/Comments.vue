<template>
    <div class="commentsBox">
        <Skeleton v-if="commentsLoading"></Skeleton>

        <template v-else>
            <div class="comments" v-if="commentsData.length">
                <div class="item" v-for="(item, index) in commentsData" :key="index" @click="jumpArticle(item)">
                    <div class="reply">
                        {{ $t('roverComments.reply') }}
                    </div>
                    <div class="center">
                        <h3>{{ item.content }}</h3>
                        <div class="info">
                            <em>{{ moment(Number(item.created)).format('h:mm : MMM Do YYYY') }}</em>
                            <i class="iconfont icon-thumbsup"></i>
                            <em>{{ Number(item.like) }}</em>
                            <span v-if="item.status">
                                <i class="iconfont" :class="Object.keys(item.status)[0] === 'Invisible'
                ? 'icon-noview'
                : 'icon-views'
            "></i>
                            </span>
                        </div>
                        <div class="authoBox" v-for="reply in item.reply" :key="reply.id">
                            <span>
                                <em>{{ $t('roverPlanetSubscriptions.comments.authorReply') }}</em>
                                <strong>{{ reply.content }}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverPlanet.norecord') }}</p>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Skeleton from './Skeleton.vue';
import moment from 'moment';

export default defineComponent({
    components: {
        Skeleton,
    },
    name: 'Comments',
    props: {
        commentsData: {
            type: Array,
            default: [],
        },
        commentsLoading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const commentsList = ref();

        const jumpArticle = (item) => {
            router.push({
                name: 'browserArticle',
                params: {
                    id: route.params.id,
                    articleId: item.aid,
                },
            });
        };

        return {
            commentsList,
            moment,
            jumpArticle,
        };
    },
});
</script>

<style scoped lang="less">
.commentsBox {
    display: flex;
    width: 100%;
    flex-direction: column;
}

.comments {
    display: flex;
    width: 100%;
    flex-wrap: wrap;

    .item {
        display: flex;
        width: 100%;
        .margin(40, 0, 0, 0);
        cursor: pointer;

        .reply {
            display: flex;
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .line-height(19);
            color: @text-fcolor;
        }

        .center {
            display: flex;
            flex: 1;
            .margin(0, 0, 0, 17);
            flex-direction: column;

            h3 {
                display: flex;
                width: 100%;
                margin: 0;
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                color: @text-color;
                transition: @transition;
                @apply dark:(text-light-900/80);
            }

            >p {
                display: flex;
                width: 100%;
                .margin(12, 0, 0, 0);
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                color: @text-color;
            }

            .info {
                display: flex;
                align-items: center;
                width: 100%;
                .margin(14, 0, 0, 0);
                position: relative;

                em {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color-grey;

                    &:last-child {
                        color: @text-color-placeholder;
                    }
                }

                i {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color-grey;
                    .margin(0, 8, 0, 24);
                }

                span {
                    position: absolute;
                    top: 0;
                    right: 0;
                    font-size: 14px;

                    i {
                        color: @text-color-grey;
                        .font-size(18);
                    }
                }
            }

            .authoBox {
                display: flex;
                background: @bg-color-body;
                .border-radius(15);
                .padding(13, 15, 13, 15);
                .margin(14, 0, 0, 0);
                @apply dark:(bg-dark-300);

                img {
                    display: flex;
                    .width(40);
                    .height(40);
                    border-radius: 50%;
                }

                span {
                    .margin(0, 0, 0, 12);

                    em {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(16);
                        .line-height(19);
                        color: @text-color;
                        @apply dark:(text-light-900/50);
                    }

                    strong {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(14);
                        .line-height(20);
                        color: @text-fcolor;
                        .margin(0, 0, 0, 10);
                        @apply dark:(text-light-900);
                    }
                }
            }
        }

        &:hover {
            .center {
                h3 {
                    color: @text-active;
                    transition: @transition;
                }
            }
        }
    }
}

.noData {
    .center();
    .font-size(70);
    width: 100%;
    flex-direction: column;
    .margin(50);

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
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .comments {
        .item {
            border-bottom: 1px solid @border-color;
            .padding(0, 0, 20, 0);
            .margin(20, 0, 0, 0);

            .reply {
                display: none;
            }

            .center {
                .margin(0, 0, 0, 0);

                p {
                    .padding(5, 0, 5, 0);
                    color: @text-fcolor;
                }
            }

            &:last-child {
                border-bottom: none;
            }
        }
    }
}
</style>
