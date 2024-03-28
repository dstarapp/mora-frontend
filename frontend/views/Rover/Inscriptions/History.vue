<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dealPid } from '@/utils/functions';
import Pagination from '@/components/Pagination.vue';
const loading = ref(true);

const init = async () => {
    setTimeout(() => {
        loading.value = false;
    }, 1500);
};

onMounted(() => {
    init();
});
</script>

<template>
    <div class="hbox">
        <div class="list head">
            <div class="item">{{ $t('roverInscriptions.history.inscription') }}</div>
            <div class="item">{{ $t('roverInscriptions.history.coin') }}</div>
            <div class="item">{{ $t('roverInscriptions.history.amount') }}</div>
            <div class="item">{{ $t('roverInscriptions.history.from') }}</div>
            <div class="item">{{ $t('roverInscriptions.history.to') }}</div>
            <div class="item">{{ $t('roverInscriptions.history.time') }}</div>
        </div>
        <el-skeleton class="list" v-if="loading" animated>
            <template #template>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-4/5 h-4" />
                </div>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-4/5 h-4" />
                </div>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-4/5 h-4" />
                </div>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-4/5 h-4" />
                </div>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-4/5 h-4" />
                </div>
                <div class="item">
                    <el-skeleton-item variant="p" class="w-full h-4" />
                </div>
            </template>
        </el-skeleton>
        <template v-else>
            <div class="list" v-for="i in 20" :key="i">
                <div class="item"><span>#100001</span></div>
                <div class="item">mora</div>
                <div class="item">1000</div>
                <div class="item">{{
                dealPid('2cs4k-4cuj5-5sg3c-7s6zz-ur7cr-ianjr-33hqo-i3vsf-b75mp-fotmx-xae')
            }}</div>
                <div class="item">{{
                    dealPid('olu4e-4cuj5-5sg3c-7s6zz-ur7cr-ianjr-33hqo-i3vsf-b75mp-fotmx-cai')
                }}</div>
                <div class="item">2023/12/7 13:03:51</div>
            </div>
        </template>
    </div>
    <Pagination :total="100" :pageSize="5" :currentPage="1" />
</template>

<style lang="less" scoped>
.hbox {
    @apply w-full overflow-x-auto;

    .list {
        @apply w-full flex items-center border-b py-3 min-w-150 dark:(border-dark-200);

        &.head {
            @apply mt-5;

            .item {
                @apply text-gray-400 text-sm dark:(text-gray-300);
            }
        }

        .item {
            @apply text-sm text-gray-600 px-1 dark:(text-gray-400);

            &:first-child {
                width: 15%;

                img {
                    @apply mr-3 w-8;
                }
            }

            &:nth-child(2) {
                width: 15%;
            }

            &:nth-child(3) {
                width: 15%;
            }

            &:nth-child(4) {
                width: 18%;
            }

            &:nth-child(5) {
                width: 18%;
            }

            &:last-child {
                width: 19%;
            }

            span {
                @apply text-purple-500 text-sm hover:(underline underline-purple-500 underline-offset-4 cursor-pointer);

                &:first-child {
                    @apply mr-5;
                }
            }
        }
    }
}

.pagination {
    @apply !mt-6;
}
</style>
