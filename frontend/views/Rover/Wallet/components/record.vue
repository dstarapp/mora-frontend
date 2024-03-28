<script setup lang="ts">

const props = defineProps({
    types: {
        type: String,
        default: 'deposit',
    },
    list: {
        type: Array as any,
    },
    options: {
        type: String as any,
    },
});

const onExplorer = (item: any) => {
    window.open(item, '_blank');
};

const maskString = (input: string, placeholder = '...'): string => {
    const segments = input.split('-');

    if (segments.length < 7) {
        return input;
    }

    const maskedSegments = [...segments.slice(0, 3)];
    const maskedSegmentsR = [...segments.slice(-3)];

    const result = maskedSegments.join('-');
    const result2 = maskedSegmentsR.join('-');

    return result + placeholder + result2;
};
</script>

<template>
    <div class="w-full overflow-x-auto" v-if="props.list?.length > 0">
        <div class="list head" :class="{ moraList: options === 'mora' }">
            <div class="item">{{
        props.types == 'deposit' ? $t('roverWallet.list.From') : $t('roverWallet.list.To')
    }}</div>
            <div class="item">{{ $t('roverWallet.list.Amount') }}</div>
            <div class="item">{{ $t('roverWallet.list.Date') }}</div>
            <div v-if="options !== 'mora'" class="item">{{ $t('roverWallet.list.Explorer') }}</div>
        </div>
        <div class="list" v-for="(item, index) in (props.list as any)" :key="index"
            :class="{ moraList: options === 'mora' }">
            <div class="item pr-[15px] col-span-1 break-all">
                <el-tooltip effect="dark" placement="top" :teleported="false" :content="item.from">
                    {{ maskString(item.from) }}
                </el-tooltip>
            </div>
            <div class="item">{{ item.amount }}{{ item.unit }}</div>
            <div class="item">{{ item.date }}</div>
            <div v-if="item.explorer" class="item" @click="onExplorer(item.explorer)">
                <span>Explorer</span>
            </div>
        </div>
    </div>
    <div class="noData" v-else>
        <i class="iconfont icon-no"></i>
        <span>{{ $t('search.noData') }}</span>
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

.noData {
    @apply w-full flex items-center justify-center flex-col pt-20 !h-auto;
    height: 100%;

    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }

    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
    }
}
</style>
