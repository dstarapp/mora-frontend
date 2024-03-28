<template>
    <div class="w-130 mx-auto <sm:(w-full px-4)">
        <div class="rewardbox">
            <div class="rhead">
                <div class="rtitle">
                    {{ $t('Reward.name') }}<span>{{ $t('Reward.txt') }}</span>
                </div>
                <button @click="openReward">{{ $t('Reward.name') }}</button>
            </div>
            <div class="rlist">
                <template v-for="(item, index) in queryAwardsList" :key="item.id">
                    <span v-if="index < 10">
                        <img v-if="!item.avatar" src="@/assets/svg/defaultAvatar.svg" />
                        <img v-else :src="item.avatar" />
                    </span>
                </template>

                <span v-if="queryAwardsList.length" class="more" @click="isShowRewardList = !isShowRewardList"><i
                        class="iconfont icon-more"></i></span>
            </div>
        </div>
    </div>
    <teleport to="body">
        <Rewardlist v-if="isShowRewardList" :listData="queryAwardsList" @close="showRewardList" />
        <RewardPay v-if="isShowReward" @close="showReward" />
    </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onUnmounted } from 'vue';
import Rewardlist from './Rewardlist.vue';
import RewardPay from './RewardPay.vue';
import store from '@/store';
import bus from 'vue3-eventbus';
import { getAvatar } from '@/utils/getAvatar';
import CONFIG from '@/assets/config';
import { getIcnaming } from '@/utils/icnaming';

export default defineComponent({
    components: { Rewardlist, RewardPay },
    setup(props, context) {
        const openLogin = inject<any>('openLogin');
        const currentCanister = inject<any>('currentCanister', null);
        const articleId = inject<any>('articleId');

        const isShowReward = ref(false);
        const showReward = () => {
            isShowReward.value = !isShowReward.value;
        };

        const isShowRewardList = ref(false);
        const showRewardList = () => {
            isShowRewardList.value = !isShowRewardList.value;
        };

        const openReward = () => {
            if (!store.state.agent) {
                openLogin();
                return;
            }
            isShowReward.value = true;
        };

        const queryAwardsList = ref<any[]>([]);
        const queryAwards = async () => {
            const str = {
                aid: articleId.value,
                page: 1,
                size: 99999,
                sort: { TimeDesc: null },
            };
            currentCanister.value.value
                .queryAwards(str)
                .then((res) => {
                    const list = res.data;
                    queryAwardsList.value = list;
                    queryAwardsList.value.map(async (item, index) => {
                        getAvatar(item.from).then(async (res) => {
                            if (res) {
                                item.avatar = CONFIG.imgBaseUrl + res;
                            }
                            item.icnaming = await getIcnaming(item.from);
                        });
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        queryAwards();

        bus.on('queryAwards', queryAwards);

        onUnmounted(() => {
            bus.off('queryAwards', queryAwards);
        });

        return {
            isShowReward,
            showReward,
            isShowRewardList,
            showRewardList,
            openReward,
            queryAwardsList,
        };
    },
});
</script>

<style lang="less" scoped>
.rewardbox {
    @apply w-full mb-12 border border-light-700 bg-white rounded-xl p-5 transition duration-300 hover:(transition duration-300 shadow-xl) dark:(bg-dark-500 border-dark-100) <sm:(my-8);

    .rhead {
        @apply w-full flex justify-between items-center;

        .rtitle {
            @apply flex-1 text-black text-xl font-medium dark:(text-light-900);

            span {
                @apply block text-gray-400 text-sm font-normal dark:(text-gray-400/60);
            }
        }

        button {
            @apply ml-8 rounded-xl px-5 py-3 bg-yellow-400 text-black transition duration-300 hover:(transition duration-300 bg-yellow-300);
        }
    }

    .rlist {
        @apply w-full flex justify-center flex-wrap;

        span {
            @apply w-13 h-13 rounded-full p-1px mx-2 mt-4 overflow-hidden <sm:(w-12 h-12 mx-5px);

            img {
                @apply w-full h-full rounded-full;
            }

            &.more {
                @apply bg-gray-200 flex justify-center items-center transition duration-30 dark:(bg-dark-50);

                i {
                    @apply text-gray-400 text-2xl transition duration-300;
                }

                &:hover {
                    @apply transition duration-300 bg-yellow-400 cursor-pointer;

                    i {
                        @apply text-black transition duration-300;
                    }
                }
            }
        }
    }
}
</style>
