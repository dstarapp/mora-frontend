<template>
    <div class="noticeBox" @click.stop="">
        <div class="header">
            <div class="title">{{ $t('notice.title') }}</div>
            <div class="reset" @click="clearAll">
                <i class="iconfont icon-reset"></i>
                {{ $t('notice.clear') }}
            </div>
            <i class="iconfont icon-close" @click.stop="closeNotice"></i>
        </div>
        <el-skeleton class="con" animated v-if="store.state.notice_loading" :count="3">
            <template #template>
                <div class="item border border-light-500 !bg-transparent dark:(border-dark-100)">
                    <el-skeleton-item variant="image" class="imgbox mr-3" />
                    <el-skeleton-item variant="text" class="flex-1 h-6" />
                    <el-skeleton-item variant="text" class="w-10 h-6 ml-3" />
                </div>
            </template>
        </el-skeleton>
        <template v-else>
            <div class="no-data" v-if="!store.state.notice_list.length">
                <i class="iconfont icon-notice-empty"></i>
                <p>{{ $t('notice.noData') }}</p>
            </div>
            <div class="con" v-show="store.state.notice_list.length && !store.state.notice_loading">
                <template v-for="item in store.state.notice_list" :key="item.id">
                    <div class="item" @click="itemClick(item)" v-if="item.type === 'articles'">
                        <div class="imgbox"><img src="@/assets/svg/notice-comment.svg" /></div>
                        <p>{{ item.name }}</p>
                        <span>+{{ item.value }}</span>
                    </div>
                    <div class="item" @click="itemClick(item)" v-if="item.type === 'subcriber'">
                        <div class="imgbox">
                            <img :src="getImagesUrl(item.avatar)" />
                        </div>
                        <p>{{ item.name }}<span>Add subscription</span></p>
                        <span>+{{ item.value }}</span>
                    </div>
                    <div class="item" @click="itemClick(item)" v-if="item.type === 'cyclesDeficiency'">
                        <div class="imgbox"><img src="@/assets/svg/notice-insufficient.svg" /></div>
                        <p>{{ item.name }}
                            <span class="insufficient">{{ $t('notice.cyclesDeficiency') }}</span>
                        </p>
                    </div>
                    <div class="item" @click="itemClick(item)" v-if="item.type === 'comment'">
                        <div class="imgbox"><img src="@/assets/svg/notice-comment.svg" /></div>
                        <p>{{ item.content }}</p>
                        <span>Pass audit</span>
                    </div>
                </template>
            </div>
        </template>

        <Teleport to="body">
            <AddCycles v-if="showAddCycles" @click.stop="" :principalID="pid" @refreshCycles="refreshCycles"
                @componentClose="componentClose" />
        </Teleport>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, onMounted, inject } from 'vue';
import bus from 'vue3-eventbus';
import store from '@/store';
import { useRoute, useRouter } from 'vue-router';
import { getImagesUrl } from '@/utils/functions';
import AddCycles from '@/components/AddCycles.vue';

export default defineComponent({
    emits: ['close'],
    components: { AddCycles },
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const initDone = ref(true);
        const noticeList = ref([]);
        const showAddCycles = ref(false);
        const pid = ref();
        const refreshCyclesQuantity: any = inject('refreshCyclesQuantity');

        const closeNotice = () => {
            context.emit('close');
        };

        const clearAll = () => {
            bus.emit('noticeClearAll');
        };

        const componentClose = () => {
            showAddCycles.value = false;
        };

        const refreshCycles = () => {
            refreshCyclesQuantity();
        };

        const itemClick = (item) => {
            if (item.type === 'articles') {
                router.push({
                    name: 'browserArticle',
                    params: {
                        id: item.pid,
                        articleId: item.id,
                    },
                    query: {
                        comments: 'true',
                    },
                });
                closeNotice();
            }
            if (item.type === 'subcriber') {
                router.push({
                    name: 'planetSubscription',
                    params: {
                        id: item.id,
                    },
                });
                closeNotice();
            }
            if (item.type === 'cyclesDeficiency') {
                pid.value = item.id;
                showAddCycles.value = true;
            }

            if (item.type === 'comment') {
                router.push({
                    name: 'browserArticle',
                    params: {
                        id: item.pid,
                        articleId: item.aid,
                    },
                    query: {
                        comments: 'true',
                    },
                });
                closeNotice();
            }
        };

        onUnmounted(() => {
            document.documentElement.style.overflow = 'auto';
            store.commit('SET_NOTICE_STATE', 'OFF');
        });

        onMounted(() => {
            store.commit('SET_NOTICE_STATE', 'ON');
        });

        return {
            store,
            initDone,
            noticeList,
            showAddCycles,
            pid,
            refreshCycles,
            componentClose,
            getImagesUrl,
            itemClick,
            closeNotice,
            clearAll,
        };
    },
});
</script>

<style lang="less" scoped>
.noticeBox {
    @apply absolute flex flex-col z-30 w-100 max-h-110 py-3 px-6 right-0 bg-white rounded-2xl text-black dark:(bg-dark-800 border-dark-300) hover:(text-black) 2xl:(top-13) lg:(top-50px) md:(top-11) <sm:(w-screen h-screen fixed top-0 rounded-none bottom-0 max-h-screen);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    z-index: 12;

    .header {
        @apply w-full flex items-center justify-between mb-3 relative <sm:(mt-10 mb-5);

        .title {
            @apply <sm:(text-lg) dark:(text-light-900/80);
        }

        .reset {
            @apply text-gray-500 text-sm;
            transition: @transition;

            &:hover {
                @apply text-purple-500 text-sm;
                transition: @transition;
            }
        }

        .icon-close {
            @apply absolute right-0 -top-10 text-gray-500 hidden dark:(text-dark-50) <sm:(block);
        }
    }

    .con {
        @apply w-full overflow-y-auto;
        .scrollbar();

        .item {
            @apply w-full bg-light-400 rounded-xl px-3 py-2 flex items-center justify-between mb-3 transition duration-300 dark:(bg-dark-300) hover:(transition duration-300 bg-light-600 dark:(bg-dark-500));

            .imgbox {
                @apply w-8 h-8 rounded-full overflow-hidden;

                img {
                    @apply w-full h-full;
                }
            }

            p {
                @apply px-3 text-sm flex-1 text-left block truncate dark:(text-light-900);

                span {
                    @apply block w-full text-gray-400 text-xs bg-transparent p-0;

                    &.insufficient {
                        @apply text-yellow-500;
                    }
                }
            }

            strong {
                @apply px-3 text-sm flex-1 text-left block dark:(text-light-900);
                font-weight: normal;

                span {
                    @apply block w-full text-gray-400 text-xs bg-transparent p-0;
                }
            }

            span {
                @apply px-6px py-2px bg-red-500 text-white rounded-full text-xs;
            }

            i {
                @apply text-3xl text-green-500;
            }
        }
    }

    .skeleton {
        .center();
        // height: 450px;
        font-size: 14px;
    }

    .no-data {
        @apply w-full flex-col pt-2 pb-7 <sm:(pt-30);
        .center();

        i {
            @apply text-3xl text-gray-300 dark: (text-light-900/60);
        }

        p {
            @apply text-sm text-gray-400 mt-2 text-center;
        }
    }
}
</style>
