<template>
    <div class="cbox">
        <div class="titleBox">
            <h2>
                {{ $t('roverCollection.title') }}
            </h2>
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </div>

        <el-skeleton class="list" v-if="store.state.collections_loading" animated>
            <template #template>
                <div class="rows" v-for="i in 5" :key="i">
                    <div class="title">
                        <el-skeleton-item variant="caption" style="height: 26px"></el-skeleton-item>
                    </div>
                    <div class="items">
                        <div class="item">
                            <el-skeleton-item style="width: 50px" variant="text" />
                        </div>
                        <div class="item">
                            <el-skeleton-item style="width: 50px" variant="text" />
                        </div>
                        <div class="item">
                            <el-skeleton-item style="width: 50px" variant="text" />
                        </div>
                        <div class="item">
                            <el-skeleton-item style="width: 20px" variant="text" />
                        </div>
                    </div>
                </div>
            </template>
        </el-skeleton>

        <template v-if="!store.state.collections_loading && collectionsList.length">
            <Article v-for="item in collectionsList" :key="item.article_id" :listData="item" />
        </template>
        <div class="noData" v-if="!store.state.collections_loading && !collectionsList.length">
            <i class="iconfont icon-no"></i>
            <p>{{ $t('roverDashboard.noData') }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from 'vue';
import Article from './components/Articles.vue';
import store from '@/store';

export default defineComponent({
    components: { Article },
    setup() {
        const isRefresh = ref(false);
        const collectionsList: any = inject('collectionsList', null);
        const get_collections_canister: any = inject('get_collections_canister', null);

        const refresh = () => {
            isRefresh.value = true;
            get_collections_canister();
            setTimeout(() => {
                isRefresh.value = false;
            }, 300);
        };

        onMounted(() => { });

        return {
            store,
            isRefresh,
            collectionsList,
            refresh,
        };
    },
});
</script>

<style lang="less" scoped>
.cbox {
    width: 100%;

    .titleBox {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
            display: flex;
            align-items: center;
            font-style: normal;
            font-weight: 500;
            .font-size(24);
            color: @text-color;
            margin: 0;

            @apply dark:(text-light-900);
        }

        i {
            color: @text-color-grey;
            .font-size(20);
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }
}

.list {
    width: 100%;
    .margin(30, 0, 0, 0);

    .items {
        display: flex;
    }

    .rows {
        .margin(0, 0, 20, 0);
    }

    .items {
        width: 100%;
        .margin(10, 0, 0, 0);
        display: flex;
        align-items: center;
    }

    .item {
        display: flex;
        align-items: center;
        .margin(0, 30, 0, 0);
        color: @text-fcolor;
        .font-size(14);

        i {
            color: @text-color-grey;
            margin-right: 8px;
        }

        .icon-collection {
            color: @text-active;
            cursor: pointer;

            &:hover {
                opacity: 0.85;
                color: @text-fcolor;
                transition: @transition;
            }
        }
    }
}

.noData {
    .center();
    .font-size(70);
    height: 100%;
    flex-direction: column;

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
</style>
