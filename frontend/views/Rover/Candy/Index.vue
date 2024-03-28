<template>
    <div class="candy">
        <h2>
            {{ $t('roverCandy.title') }}
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </h2>
        <div class="tabs">
            <span :class="{ active: tab === 1 }" @click="switchTab(1)">Airdrop</span>
            <span :class="{ active: tab === 2 }" @click="switchTab(2)">Invitation code</span>
        </div>
        <template v-if="tab === 1">
            <Airdrop />
        </template>
        <template v-else>
            <el-skeleton class="candyBox" v-if="loading" :count="15" animated>
                <template #template>
                    <div class="item">
                        <div class="header">
                            <span>{{ $t('roverCandy.invite') }}</span>
                            <span><el-skeleton-item variant="text" class="w-8" /></span>
                        </div>
                        <div class="code">
                            <el-skeleton-item variant="text" class="w-full h-6 mt-2" />
                        </div>
                    </div>
                </template>
            </el-skeleton>
            <template v-else>
                <div class="candyBox" v-if="invitationCodeList.length > 0">
                    <div class="item" v-for="(item, index) in invitationCodeList" :key="index">
                        <div class="header">
                            <span>{{ $t('roverCandy.invite') }}</span>
                            <span>{{ item.isUsed ? $t('roverCandy.used') : '' }}</span>
                            {{ moment(Number(item.created)).format('L') }}
                        </div>
                        <div class="code">
                            <p>{{ item.code }}</p>
                            <i class="iconfont icon-copy" @click="copyText(item.code)"></i>
                        </div>
                    </div>
                </div>
                <div class="noData" v-else>
                    <i class="iconfont icon-no"></i>
                    <span>{{ $t('roverCandy.nodata') }}</span>
                </div>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { copyText } from '@/utils/functions';
import CONFIG from '@/assets/config';
import store from '@/store';
import { createActor } from '@/request/agent';
import { idlFactory as invitationCodeFactory } from '@/request/canister/invitationCode.did';
import debug from '@/utils/debug';
import moment from 'moment';
import Airdrop from './component/Airdrop.vue';

export default defineComponent({
    name: 'CandyBox',
    components: { Airdrop },
    setup() {
        const isRefresh = ref(false);
        const invitationCodeCanister = ref();
        const invitationCodeList = ref<any[]>([]);
        const loading = ref(true);

        const refresh = () => {
            isRefresh.value = true;
            setTimeout(() => {
                isRefresh.value = false;
            }, 300);
            getInvitationCode();
        };

        const getInvitationCode = async () => {
            try {
                const res = await invitationCodeCanister.value.query_codelist();
                invitationCodeList.value = res;
                if (res) {
                    loading.value = false;
                }
            } catch (err) {
                invitationCodeList.value = [];
                debug('failed', err);
            }
        };

        const init = async () => {
            if (!store.state.agent) {
                return;
            }
            invitationCodeCanister.value = await createActor(
                CONFIG.invitationCodeCanister,
                invitationCodeFactory,
                store.state.agent,
            );
            getInvitationCode();
        };

        onMounted(() => {
            init();
        });

        watch(
            () => store.state.agent,
            (val) => {
                if (val) {
                    init();
                }
            },
        );

        const tab = ref(1);
        const switchTab = (n: number) => {
            tab.value = n;
        };

        return {
            isRefresh,
            invitationCodeList,
            moment,
            loading,
            copyText,
            refresh,
            tab,
            switchTab,
        };
    },
});
</script>

<style scoped lang="less">
.candy {
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

    .candyBox {
        @apply w-full mt-8 grid grid-cols-3 gap-5 <sm:(grid-cols-1) <xl:(grid-cols-2);

        .item {
            @apply w-full rounded-xl border border-gray-200 px-4 py-4 dark:(border-dark-100);

            .header {
                @apply w-full flex justify-between items-center text-xs text-gray-500 pb-1 dark:(text-light-900/50);
            }

            .code {
                @apply w-full flex justify-between items-center;

                p {
                    @apply text-lg text-black font-bold dark:(text-white);
                }

                i {
                    @apply text-gray-400 transition duration-300 dark:(text-light-900/50) hover:(transition duration-300 text-purple-500 cursor-pointer dark:(text-purple-500));
                }
            }

            &.used {
                @apply border-gray-200/80 cursor-not-allowed dark:(border-dark-300);

                .header {
                    @apply text-gray-300 dark:(text-light-900/40);
                }

                .code {
                    p {
                        @apply text-gray-300 dark:(text-light-900/40);
                    }

                    i {
                        @apply text-gray-300 dark:(text-light-900/20) hover:(pointer-events-none);
                    }
                }
            }
        }
    }

    .noData {
        .center();
        .font-size(70);
        .padding(200, 0, 50, 0);
        flex-direction: column;
        width: 100%;

        i {
            .font-size(70);
            color: #dddddd;
        }

        span {
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .line-height(19);
            .margin(10, 0, 0, 0);
            color: @text-color-grey;
        }
    }
}

.tabs {
    @apply w-full py-6;

    span {
        @apply mr-5 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 transition duration-300 dark:(border-dark-50);

        &:hover,
        &.active {
            @apply transition duration-300 text-purple-500 border-purple-500 cursor-pointer;
        }
    }
}
</style>
