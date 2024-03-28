<script setup lang="ts">
import { ref, reactive } from 'vue'
import List from "./List.vue"
import History from "./History.vue"
import CoinList from "./components/Coin.vue"
const isRefresh = ref(false);
const refresh = () => {
    isRefresh.value = true;
    setTimeout(() => {
        isRefresh.value = false;
    }, 300);
};

const tab = ref(1);
const handClick = (num: number) => {
    tab.value = num;
}
</script>

<template>
    <div class="inscriptions">
        <h2>
            {{ $t('roverInscriptions.title') }}
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </h2>
        <div class="filter">
            <span :class="{ 'active': tab === 1 }" @click="handClick(1)">{{ $t('roverInscriptions.tab.t1') }}</span>
            <span :class="{ 'active': tab === 2 }" @click="handClick(2)">{{ $t('roverInscriptions.tab.t2') }}</span>
        </div>
        <CoinList />
        <List v-if="tab === 1" />
        <History v-if="tab === 2" />
    </div>
</template>

<style scoped lang="less">
.inscriptions {
    @apply w-full;

    h2 {
        display: flex;
        align-items: center;
        font-style: normal;
        font-weight: 500;
        .font-size(24);
        .line-height(29);
        color: @text-color;
        margin: 0;
        @apply dark:(text-light-900);

        i {
            .font-size(20);
            color: @text-color-grey;
            margin-left: auto;
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }

    .filter {
        @apply w-full pt-5;

        span {
            @apply pr-5 text-gray-500 hover:(cursor-pointer);

            &.active {
                @apply text-purple-500 font-medium;
            }
        }
    }
}
</style>
