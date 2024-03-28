<script setup lang="ts">
import { ref, reactive } from 'vue'

const coinList = ref([
    'mora',
    'ICPS',
    'dstar',
    'peter',
    'robot',
    'mora',
    'ICPS',
    'dstar',
    'peter',
    'robot',
    'mora',
    'ICPS',
    'dstar',
    'peter',
    'robot',
]);
</script>

<template>
    <div class="coinlist">
        <span class="active">All</span>
        <span v-for="(item, index) in coinList">{{ item }}</span>
    </div>
</template>

<style lang="less" scoped>
.coinlist {
    @apply w-full max-h-42 overflow-y-auto flex flex-wrap;

    span {
        @apply border rounded-lg px-2 py-1 mr-3 mt-3 text-sm text-gray-500 transition duration-300 dark:(border-dark-100) hover:(transition duration-300 bg-gray-100 cursor-pointer dark:(bg-dark-50 bg-dark-300 text-light-900/60));

        &.active {
            @apply border-purple-500 text-purple-500 hover:(bg-transparent);
        }
    }
}
</style>