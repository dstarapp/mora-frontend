<template>
    <div class="history">
        <div class="sticky top-25">
            <div class="header">
                <h3>{{ $t('search.history') }}</h3>
                <i @click="delAll" class="iconfont icon-delete"></i>
            </div>
            <div class="items" v-if="store.state.agent">
                <div class="item" @click="jump(item)" v-for="item in searchHistoryList" :key="item">
                    <span>{{ item }}</span>
                    <i @click.stop="del(item)" class="iconfont icon-failed"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/store';
import bus from 'vue3-eventbus';

export default defineComponent({
    components: {},
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const searchHistoryList: any = inject('searchHistoryList', null);

        const jump = (item) => {
            if (item === route.params.keyword) {
                return;
            }
            bus.emit('homeSearchKeyword', item);
            router.push({
                name: 'homeSearch',
                params: {
                    keyword: item,
                },
            });
        };

        const delAll = () => {
            bus.emit('searchHistoryClear');
        };

        const del = (item) => {
            bus.emit('searchHistoryDelete', item);
        };

        return {
            store,
            searchHistoryList,
            jump,
            delAll,
            del,
        };
    },
});
</script>

<style lang="less" scoped>
.history {
    @apply w-80 mt-8 <xl: (w-70) <lg:(hidden);
    .header {
        @apply flex items-center justify-between pb-3;
        h3 {
            @apply w-full text-left text-xl dark:(text-white);
        }
        i {
            @apply text-lg cursor-pointer transition duration-300 hover:(transition duration-300 text-purple-500);
        }
    }

    .items {
        @apply w-full;
        .item {
            @apply flex items-center float-left mt-4 py-1 mr-4 pl-4 rounded-full bg-purple-200 transition duration-300 dark:(bg-purple-500/20 text-light-900/80);
            &:hover {
                @apply bg-purple-500 cursor-pointer transition duration-300 dark:(bg-purple-500/40);
                span,
                i {
                    @apply text-white dark:(text-light-900);
                }
            }
            span {
                @apply break-all <xl:(text-sm);
            }
            i {
                @apply rounded-full text-xs mx-2 text-dark-900/20 dark:(text-light-900/50);
            }
        }
    }
}
</style>
