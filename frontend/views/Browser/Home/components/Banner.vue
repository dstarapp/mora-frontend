<template>
    <el-skeleton class="banner" animated v-if="!browserPlanetUserData">
        <template #template>
            <el-skeleton-item variant="image" class="skeletonImg" />
        </template>
    </el-skeleton>
    <div class="banner" v-else>
        <img
            v-if="browserPlanetUserData && browserPlanetUserData.cover"
            :src="getImagesUrl(browserPlanetUserData.cover)"
        />
        <img v-else src="@/assets/pic/banner.png" />
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { getImagesUrl } from '@/utils/functions';

export default defineComponent({
    components: {},
    name: 'Banner',
    setup() {
        const browserPlanetUserData = inject('browserPlanetUserData', null);

        return {
            browserPlanetUserData,
            getImagesUrl,
        };
    },
});
</script>

<style scoped lang="less">
.banner {
    @apply w-full h-60 overflow-hidden md:(h-50) lg:(h-60) xl:(h-60) sm:(h-30) <sm:(h-20);

    img {
        @apply w-full h-full object-cover;
    }
    .skeletonImg {
        @apply w-full  md:(h-60) lg:(h-60) xl:(h-60) sm:(h-40) <sm:(h-30);
    }
}
</style>
