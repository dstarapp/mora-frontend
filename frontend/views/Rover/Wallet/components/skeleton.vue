<script setup lang="ts">
const props = defineProps({
    types: {
        type: String,
        default: 'deposit',
    },
    options: {
        type: String as any,
    },
});
</script>

<template>
    <div class="w-full <sm:(overflow-x-auto)">
        <div class="list head" :class="{ moraList: options === 'mora' }">
            <div class="item">
                {{
                    props.types == 'deposit'
                        ? $t('roverWallet.list.From')
                        : $t('roverWallet.list.To')
                }}
            </div>
            <div class="item">{{ $t('roverWallet.list.Amount') }}</div>
            <div class="item">{{ $t('roverWallet.list.Date') }}</div>
            <div v-if="options !== 'mora'" class="item">{{ $t('roverWallet.list.Explorer') }}</div>
        </div>
        <el-skeleton
            class="list"
            :class="{ moraList: options === 'mora' }"
            animated
            v-for="_ in 6"
            :key="_"
        >
            <template #template>
                <div class="item">
                    <el-skeleton-item variant="text" class="w-70" />
                </div>
                <div class="item"><el-skeleton-item variant="text" class="w-20" /></div>
                <div class="item"><el-skeleton-item variant="text" class="w-22" /></div>
                <div v-if="options !== 'mora'" class="item">
                    <span>Explorer</span>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<style lang="less" scoped>
.list {
    @apply w-full min-w-140 flex items-center border-b py-3 dark:(border-dark-100) transition duration-300 hover:(transition duration-300 bg-light-100 dark:(bg-dark-400));

    &.head {
        @apply mt-5 hover:(bg-transparent);

        .item {
            @apply text-gray-400 text-sm;
        }
    }

    &.moraList {
        .item {
            &:first-child {
                width: 60% !important;
            }

            &:nth-child(4) {
                width: 0% !important;
            }
        }
    }

    .item {
        @apply text-sm text-gray-500;

        &:first-child {
            width: 50%;
            @apply flex items-center;

            img {
                @apply mr-3 w-8;
            }
        }

        &:nth-child(2) {
            width: 15%;
        }

        &:nth-child(3) {
            width: 25%;
        }

        &:nth-child(4) {
            width: 10%;
        }

        span {
            @apply text-purple-500 text-sm hover:(underline underline-purple-500 underline-offset-4 cursor-pointer);

            &:first-child {
                @apply mr-5;
            }
        }
    }
}
</style>
