<template>
    <SkeletonVue v-if="isSkeleton" />
    <div class="frozen" v-else-if="!detailsData"> Taken down </div>
    <template v-else>
        <div class="img-box" @click.stop="onUse()">
            <img :src="getImagesUrl(detailsData.done_info.cover)" alt="" />
        </div>

        <div class="con-box" @click.stop="onUse()">
            <div class="info">
                <div class="logo">
                    <img :src="getImagesUrl(detailsData.done_info.thumbnail)" alt="" />
                </div>
                <div class="plugin-name">{{ detailsData.done_info.name }}</div>
            </div>
            <div class="des">
                {{ detailsData.done_info.instruction }}
            </div>
            <div class="flex justify-between items-center h-9">
                <div class="category">
                    {{ detailsData.done_info.categories[0] }}
                </div>
                <!-- <div class="btn-box">
                    <button class="editBtn" @click.stop="onUse()">
                        {{ $t('plugin.profileUser.use') }}
                    </button>
                </div> -->
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
import { ref, onMounted, PropType } from 'vue';
import { getImagesUrl } from '@/utils/functions';
import { useRouter } from 'vue-router';
import {
    ExperienceUserCollection,
    DoneLightExperienceWorker,
} from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import SkeletonVue from './Skeleton.vue';
import { queryLightDetailsById } from '@/components/light-experience/canisters/experience_worker/apis';
import store from '@/store';
import { isExperienceFrozen } from '@/components/light-experience/canisters/common';

const router = useRouter();
const isSkeleton = ref(true);
const detailsData = ref<DoneLightExperienceWorker | undefined>(undefined);

const props = defineProps({
    listData: {
        type: Object as PropType<ExperienceUserCollection>,
        required: true,
    },
});

const onUse = () => {
    if (!detailsData?.value) {
        return;
    }
    router.push({
        name: 'lightDetails',
        params: {
            canisterId: detailsData.value.status.Done.canister_id,
            hash: detailsData.value.status.Done.hash,
        },
    });
};

onMounted(() => {
    const key = `${props.listData.canister_id.toString()}/${props.listData.id}`;
    const cacheData = store.state.light_collect_cache[key];
    if (cacheData) {
        detailsData.value = cacheData;
        isSkeleton.value = false;
    } else {
        queryLightDetailsById(props.listData.canister_id.toString(), props.listData.id)
            .then((res: DoneLightExperienceWorker[]) => {
                if (res.length) {
                    detailsData.value = res[0];
                    store.commit('SET_LIGHT_COLLECT_CACHE', {
                        key: key,
                        detailsData: detailsData.value,
                    });
                } else {
                    detailsData.value = undefined;
                }
            })
            .catch((error) => {
                detailsData.value = undefined;
            })
            .finally(() => {
                isSkeleton.value = false;
            });
    }
});
</script>

<style lang="less" scoped>
@import url('./list.less');
</style>
