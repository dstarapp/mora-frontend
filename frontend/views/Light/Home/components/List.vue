<template>
    <div class="imgbox">
        <strong :class="{ isLoading: imgLoading }" v-if="imgLoading"></strong>
        <img :src="getImagesUrl(data.done_info.cover)" @load="loadImg" />
    </div>
    <div class="conbox">
        <div class="info">
            <div class="logo">
                <img :src="getImagesUrl(data.done_info.thumbnail)" />
            </div>
            <div class="plugin-name">{{ data.done_info.name }}</div>
        </div>
        <div class="des">
            {{ data.done_info.instruction }}
        </div>
        <div class="flex justify-between items-center h-9">
            <div class="category">
                {{ data.done_info.categories.toString() }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { DoneLightExperienceManager } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import { getImagesUrl } from '@/utils/functions';

defineProps({
    data: {
        type: Object as PropType<DoneLightExperienceManager>,
        required: true,
    },
});

const imgLoading = ref(true);
const loadImg = () => {
    imgLoading.value = false;
};
</script>

<style scoped lang="less">
.imgbox {
    @apply w-full relative;
    strong {
        @apply w-full h-52 rounded-tl-2xl rounded-tr-2xl flex justify-center items-center border border-light-700 border-b-transparent dark:(border-transparent);
        &.isLoading {
            background: url('@/assets/svg/loading3.svg') no-repeat center center;
            background-size: 40px auto;
        }
    }
    img {
        @apply w-full h-full rounded-tl-2xl rounded-tr-2xl object-cover;
    }
}

.conbox {
    @apply w-full p-5 border border-light-700 border-t-transparent rounded-bl-2xl rounded-br-2xl dark:(border-dark-100);
    .info {
        @apply w-full -mt-10 flex relative;
        .logo {
            @apply w-13 h-13 rounded-xl border-3 border-white overflow-hidden dark:(border-dark-300);
            img {
                @apply w-full h-full;
            }
        }
        .plugin-name {
            @apply flex-1 ml-3 pt-8 truncate font-medium;
        }
    }
    .des {
        @apply w-full mt-3 mb-5 h-14 text-dark-50/60 text-sm dark:(text-light-900/60);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }
    .category {
        background-image: linear-gradient(to right, #34d399, #7cee83);
        -webkit-background-clip: text;
        color: transparent;
        font-weight: 500;
    }
    .editBtn {
        @apply py-2 px-4 rounded-lg text-black transition duration-300 hover:(transition duration-300 transform scale-110);
        background-image: linear-gradient(to right, #34d399, #7cee83);
    }
}
</style>
