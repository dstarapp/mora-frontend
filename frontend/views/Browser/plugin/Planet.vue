<template>
    <el-skeleton animated class="planet" v-if="!browserPlanetUserData">
        <template #template>
            <el-skeleton-item variant="image" class="avatarImg" />
            <div class="adaptation">
                <div class="plantName">
                    <el-skeleton-item variant="text" class="w-25 h-7" />
                </div>
                <div class="w-full py-3 flex justify-center <lg:(w-auto)">
                    <el-skeleton-item variant="text" class="w-35 h-7" />
                </div>
            </div>
            <p>
                <el-skeleton-item variant="text" class="w-full" v-for="i in 4" :key="i" />
            </p>
            <div class="data">
                <div class="items">
                    <div class="t">{{ $t('planet.run.title') }}</div>
                    <strong>
                        <el-skeleton-item variant="text" class="w-10" />
                    </strong>
                </div>
                <div class="items">
                    <div class="t">{{ $t('planet.news') }}</div>
                    <strong>
                        <el-skeleton-item variant="text" class="w-10" />
                    </strong>
                </div>
                <div class="items">
                    <div class="t">{{ $t('planet.subs') }}</div>
                    <strong>
                        <el-skeleton-item variant="text" class="w-10" />
                    </strong>
                </div>
                <div class="items relative <lg:(!hidden)">
                    <div class="t">{{ $t('planet.canisterId') }}</div>
                    <div class="text-sm pt-1 dark:(text-gray-400)">
                        <el-skeleton-item variant="text" class="w-10" />
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>
    <div class="planet" v-else>
        <i class="iconfont icon-rss tr" @click="showRss"></i>
        <i class="iconfont icon-ledger tr" v-if="store.state.agent" @click="showOrder"></i>
        <div class="imgbox">
            <img
                v-if="browserPlanetUserData && browserPlanetUserData.avatar"
                :src="getImagesUrl(browserPlanetUserData.avatar)"
                alt="avatar"
            />
            <img v-else src="@/assets/svg/defaultPlanet.png" alt="avatar" />
        </div>
        <div class="adaptation">
            <div class="plantName">
                <span>{{ browserPlanetUserData ? browserPlanetUserData.name : 'loading...' }}</span>
                <i v-if="isOfficial" class="iconfont icon-cert text-purple-500"></i>
            </div>

            <template
                v-if="
                    !(
                        store.state.user_data &&
                        browserPlanetUserData.owner &&
                        browserPlanetUserData.owner.toString() === store.state.user_data.pid
                    )
                "
            >
                <template v-if="isBlack">
                    <div class="flex items-center justify-center">
                        <div class="blackList">
                            <i class="iconfont icon-blacklist"></i>
                            {{ $t('btns.isBlack') }}
                        </div>
                    </div>
                </template>
                <template v-else-if="!store.state.agent">
                    <div class="flex items-center justify-center" @click="openLogin()">
                        <div class="subscribe" @click="subscribe">
                            {{ $t('btns.sub') }}
                            <template
                                v-if="
                                    browserPlanetUserData && browserPlanetUserData.subprices.length
                                "
                            >
                                +
                            </template>
                            <span
                                v-if="
                                    browserPlanetUserData && !browserPlanetUserData.subprices.length
                                "
                                class="free"
                            >
                                {{ $t('planet.free') }}
                            </span>
                        </div>
                    </div>
                </template>
                <template v-else-if="isSubscribeShow">
                    <div class="flex items-center justify-center" v-if="!isSubscribe">
                        <div class="subscribe" @click="subscribe">
                            {{ $t('btns.sub') }}
                            <template
                                v-if="
                                    browserPlanetUserData && browserPlanetUserData.subprices.length
                                "
                            >
                                +
                            </template>
                            <span
                                v-if="
                                    browserPlanetUserData && !browserPlanetUserData.subprices.length
                                "
                                class="free"
                            >
                                {{ $t('planet.free') }}
                            </span>
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-center"
                        v-else-if="subType === 'Permanent'"
                    >
                        <div class="subscribed permanent">
                            {{ $t('pay.subscribe.permanent') }}
                            <strong></strong>
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-center"
                        v-else-if="!browserPlanetUserData.subprices.length"
                    >
                        <div class="freeOnly">
                            {{ $t('planet.subscribed') }}
                            <span class="freeIcon">
                                {{ $t('planet.free') }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center justify-center" v-else>
                        <div class="upgrade">
                            <span>{{ $t('planet.subscribed') }}</span>
                            <el-tooltip
                                :teleported="false"
                                :content="$t('planet.moreTime')"
                                placement="top"
                            >
                                <div class="upgradeIcon" @click="subscribe">
                                    <i class="iconfont icon-upgrade-1"></i>
                                </div>
                            </el-tooltip>
                        </div>
                    </div>
                </template>
                <el-skeleton v-else animated class="w-full flex justify-center my-3">
                    <template #template>
                        <el-skeleton-item variant="text" class="w-35 h-9" />
                    </template>
                </el-skeleton>
            </template>
            <div class="manage" @click="openManage" v-else>
                {{ $t('planet.manage') }}
            </div>
        </div>
        <div class="mPlanetItem">
            <el-tooltip
                class="box-item"
                effect="dark"
                :content="browserPlanetUserData ? browserPlanetUserData.owner.toString() : ''"
                :teleported="false"
                placement="top"
            >
                <!-- <i class="iconfont icon-author m"></i> -->
                <img
                    class="rightAuthor"
                    v-if="ownerAvatar"
                    :src="getImagesUrl(ownerAvatar)"
                    alt=""
                />
                <i v-else class="iconfont icon-author m"></i>
            </el-tooltip>
            <a
                v-if="browserPlanetUserData && browserPlanetUserData.twitter"
                :href="browserPlanetUserData.twitter"
                target="_blank"
                ><i class="iconfont icon-twitter m"></i
            ></a>
            <i class="iconfont icon-rss m" @click="showRss"></i>
            <i class="iconfont icon-poster m" @click="showPoster"></i>
        </div>
        <p>{{ browserPlanetUserData ? browserPlanetUserData.desc : '' }}</p>
        <div class="data">
            <div class="items">
                <div class="t">{{ $t('planet.run.title') }}</div>
                <strong>
                    {{
                        browserPlanetUserData
                            ? getRuntime(Number(browserPlanetUserData.created)).day
                            : ''
                    }}
                    <i>{{ $t('planet.run.unit') }}</i>
                </strong>
            </div>
            <div class="items">
                <div class="t">{{ $t('planet.news') }}</div>
                <strong>
                    {{ browserPlanetUserData ? Number(browserPlanetUserData.article) : '' }}
                </strong>
            </div>
            <div class="items">
                <div class="t">{{ $t('planet.subs') }}</div>
                <strong>
                    {{
                        browserPlanetUserData
                            ? numFormat(Number(browserPlanetUserData.subcriber))
                            : ''
                    }}</strong
                >
            </div>
            <div class="items relative <sm:(!hidden)" @click="copy">
                <div class="t">{{ $t('planet.canisterId') }}</div>
                <div class="text-sm pt-1 dark:(text-light-900) <lg:(text-base pt-0 pb-1 font-bold)">
                    {{
                        browserPlanetUserData
                            ? dealPid(browserPlanetUserData.canister.toString())
                            : ''
                    }}
                </div>
                <i
                    class="iconfont icon-copy absolute right-2 top-1.5 font-14 text-gray-400 <lg:(hidden)"
                ></i>
            </div>
        </div>
        <div class="plantItem">
            <el-tooltip
                class="box-item"
                effect="dark"
                :content="browserPlanetUserData ? browserPlanetUserData.owner.toString() : ''"
                :teleported="false"
                placement="top"
            >
                <img
                    class="rightAuthor"
                    v-if="ownerAvatar"
                    :src="getImagesUrl(ownerAvatar)"
                    alt=""
                />
                <i v-else class="iconfont icon-author"></i>
            </el-tooltip>
            <a
                v-if="browserPlanetUserData && browserPlanetUserData.twitter"
                :href="browserPlanetUserData.twitter"
                target="_blank"
                ><i class="iconfont icon-twitter"></i
            ></a>
            <i class="iconfont icon-poster" @click="showPoster"></i>
        </div>
        <Teleport to="body">
            <Rss v-if="isShowRss" @close="showRss" />
            <Invite v-if="isPoster" @close="showPoster" />
            <Order v-if="isOrder" :planetID="browserPlanetID" @componentClose="showOrder" />
        </Teleport>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { dealPid, copyText, getImagesUrl, numFormat, getRuntime } from '@/utils/functions';
import store from '@/store';
import bus from 'vue3-eventbus';
import { t } from '@/i18n';
import debug from '@/utils/debug';
import { useRouter } from 'vue-router';
import Rss from '@/components/Rss.vue';
import { getAvatar } from '@/utils/getAvatar';
import Invite from '../Invite/Index.vue';
import Order from '@/components/Order.vue';

export default defineComponent({
    components: { Rss, Invite, Order },
    setup() {
        const router = useRouter();
        const isSubscribe = ref(false);
        const isSubscribeShow = ref(false);
        const subType = ref();
        const expireTime = ref();
        const isBlack = ref(false);
        const browserPlanetID: any = inject('browserPlanetID', null);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const planetCanister: any = inject('planetCanister', null);
        const openLogin: any = inject('openLogin', null);
        const isOfficial = ref(false);
        const subscribeLoading = ref(false);
        const ownerAvatar = ref();

        const subscribe = async () => {
            if (subscribeLoading.value) {
                return;
            }
            if (!store.state.agent) {
                openLogin();
                return;
            }

            if (!browserPlanetUserData.value) {
                return;
            }

            bus.emit('startSubscribing');
            const prices = browserPlanetUserData.value.subprices;
            if (!prices.length) {
                subscribeLoading.value = true;
                bus.emit('browserOpenComponent', {
                    type: 'FreeSubscribe',
                    expireTime: '',
                });
            } else {
                bus.emit('browserOpenComponent', {
                    type: 'Subscribe',
                    subType: subType.value,
                    expireTime: expireTime.value,
                });
            }
        };

        const getIsSubscribe = async () => {
            if (!planetCanister) {
                return;
            }
            try {
                const res = await planetCanister.value.getSelfSubcriber();

                if (!res.data.length) {
                    isSubscribe.value = false;
                    expireTime.value = null;
                } else {
                    isSubscribe.value = true;
                    isBlack.value = res.isblack;
                    subType.value = Object.keys(res.data[0].subType)[0];
                    expireTime.value = Number(res.data[0].expireTime);
                }
                isSubscribeShow.value = true;
            } catch (err) {
                isSubscribe.value = false;
            }
        };

        const openManage = () => {
            const current_open_planet = store.state.current_open_planet;
            if (!current_open_planet) {
                return;
            }
            router.push({
                name: 'planetDashboard',
                params: {
                    id: current_open_planet,
                },
            });
        };

        const subscribeSuccess = () => {
            subscribeLoading.value = false;
        };

        const browserSubscribeStart = () => {
            subscribeLoading.value = true;
        };

        const isShowRss = ref(false);
        const showRss = () => {
            isShowRss.value = !isShowRss.value;
        };

        const isPoster = ref(false);
        const showPoster = () => {
            isPoster.value = !isPoster.value;
        };

        const isOrder = ref(false);
        const showOrder = () => {
            isOrder.value = !isOrder.value;
        };

        watch(
            () => store.state.agent,
            (val: any) => {
                if (val) {
                    getIsSubscribe();
                } else {
                    isSubscribe.value = false;
                }
            },
        );

        watch(
            () => browserPlanetUserData?.value,
            async (val: any) => {
                if (!ownerAvatar.value) {
                    ownerAvatar.value = await getAvatar(val.owner);
                }
            },
        );

        onUnmounted(() => {
            bus.off('browserSubscribeRefresh', getIsSubscribe);
            bus.off('browserSubscribeSuccess', subscribeSuccess);
            bus.off('browserSubscribeStart', browserSubscribeStart);
        });

        onMounted(async () => {
            if (store.state.agent) {
                getIsSubscribe();
            }
            bus.on('browserSubscribeRefresh', getIsSubscribe);
            bus.on('browserSubscribeSuccess', subscribeSuccess);
            bus.on('browserSubscribeStart', browserSubscribeStart);
        });

        const copy = () => {
            copyText(browserPlanetUserData.value.canister.toString());
        };

        return {
            isOfficial,
            isBlack,
            isSubscribe,
            isSubscribeShow,
            subType,
            browserPlanetUserData,
            store,
            expireTime,
            openLogin,
            ownerAvatar,
            isShowRss,
            isOrder,
            isPoster,
            browserPlanetID,
            copy,
            dealPid,
            getImagesUrl,
            numFormat,
            getRuntime,
            subscribe,
            openManage,
            showRss,
            showPoster,
            showOrder,
        };
    },
});
</script>

<style lang="less" scoped>
.planet {
    @apply relative w-full border rounded-xl border-light-700 p-5 bg-white dark:(border-dark-300 bg-dark-600) <lg:(pt-2 px-4 border-none rounded-none dark:(bg-dark-900));

    .imgbox {
        @apply w-22 h-22 border border-light-700 p-2px rounded-full overflow-hidden mb-2 mt-2 block mx-auto <lg:(hidden);

        img {
            @apply w-full rounded-full;
            height: 100%;
        }
    }

    .avatarImg {
        @apply w-22 h-22 rounded-full mx-auto mb-4 mt-2 block flex items-center justify-center <lg:(hidden);
    }

    .adaptation {
        @apply w-full flex flex-col <lg:(flex-row justify-between);

        .plantName {
            @apply text-lg flex items-center <lg:(w-auto mr-5);

            span {
                @apply <lg:(text-xl max-w-45 block truncate);
            }
        }
    }

    .plantName {
        @apply w-full flex items-center justify-center;

        span {
            @apply text-base font-medium block truncate dark:(text-light-500);
        }

        i {
            @apply ml-1;
        }
    }

    .subscribe {
        @apply mx-auto text-center py-2 px-3 my-3 rounded-xl font-medium text-sm text-white bg-purple-500 relative transition duration-300 hover: (bg-purple-400 transition cursor-pointer duration-300) <lg:(my-1 rounded-lg);

        .free {
            @apply ml-1 border border-white text-white text-xs px-1 rounded-full font-medium transform scale-80;
            zoom: 0.8;
        }
    }

    .manage {
        @apply mx-auto border transition duration-300 my-3 py-2 px-5 rounded-xl text-purple-500 border-purple-500 cursor-pointer hover:(bg-purple-500 text-white) <lg:(my-1 rounded-lg mx-0 px-3);
        .center();
    }

    .renewal {
        @apply py-2 px-3 ml-3 rounded-xl text-purple-500 border border-purple-500 transition duration-300 hover: (bg-purple-500 text-white transition cursor-pointer duration-300) <lg:(my-1 rounded-lg);

        i {
            @apply text-sm;
        }
    }

    .subscribed {
        @apply px-3 py-2 my-3 rounded-xl font-medium text-sm text-gray-500 border border-gray-300 bg-gray-50 transition duration-300 cursor-pointer dark:(bg-dark-300 border-dark-100) <lg:(my-1 rounded-lg);
        display: flex;

        i {
            @apply text-gray-400 mr-2 text-sm dark:(text-light-900/40);
        }

        &.permanent {
            @apply border-red-500 bg-red-500/4 text-red-500;

            strong {
                display: flex;
                background: url(@/assets/svg/permanent.svg) no-repeat center center;
                background-size: 100% auto;
                .width(18);
                .margin(0, 0, 0, 6);
            }
        }
    }

    .blackList {
        @apply px-3 py-2 my-3 rounded-xl font-medium text-sm text-gray-400 border border-gray-200 bg-gray-50 hover:(cursor-not-allowed) dark:(bg-dark-300 border-dark-100) <lg:(my-1 rounded-lg);
        .center();
        padding: 0 15px;
        height: 36px;

        i {
            @apply text-sm mr-2 text-gray-500/60;
        }
    }

    .freeOnly {
        @apply px-3 py-2 my-3 rounded-xl font-medium text-sm text-gray-500 border border-gray-300 bg-gray-50 transition duration-300 cursor-pointer dark:(bg-dark-300 border-dark-100) <lg:(my-1 rounded-lg);
        .center();
        padding: 0 15px;
        height: 36px;

        .freeIcon {
            @apply ml-1 border border-black text-black text-xs px-1 rounded-full font-medium transform scale-80 dark:(border-gray-400 text-light-900/60);
            zoom: 0.8;
        }

        i {
            @apply text-gray-400 mr-2 text-sm dark:(text-light-900/40);
        }
    }

    .upgrade {
        @apply flex items-center justify-between;

        span {
            @apply px-3 py-2 my-3 rounded-xl font-medium text-sm text-gray-500 border border-gray-300 bg-gray-50 dark:(bg-dark-300 border-dark-100) <lg:(my-1 rounded-lg);
        }

        .upgradeIcon {
            @apply text-gray-400 ml-2 py-1 w-38px text-center rounded-xl text-yellow-400 border border-yellow-400 transition duration-300 dark:(text-light-900/40) hover:(cursor-pointer transition duration-300 bg-yellow-400 text-black);

            i {
                @apply text-xl dark:(text-yellow-400);
            }

            &:hover {
                i {
                    @apply dark:(text-black);
                }
            }

            :deep(.el-popper) {
                width: 160px;
                text-align: center;
            }
        }
    }

    p {
        @apply w-full text-center text-sm pb-5 dark:(text-light-900/80) <lg:(mt-1 pb-3 text-left text-base);
        color: #666;
    }

    > p {
        white-space: pre-line;
        word-break: break-word;
    }

    .data {
        @apply grid grid-cols-2 gap-5 <lg:(grid-rows-none flex justify-between);

        .items {
            @apply border border-light-800 rounded-lg px-3 py-1 dark:(border-dark-300) <lg:(px-0 py-0 border-none flex flex-col-reverse text-center);

            .t {
                @apply w-full text-xs pt-1 text-zinc-600 dark:(text-zinc-500) <lg:(pt-0);
            }

            strong {
                @apply w-full text-black text-xl font-medium dark:(text-light-900) <lg:(text-lg);

                i {
                    @apply text-sm not-italic;
                }
            }
        }
    }

    .icon-author,
    .icon-twitter,
    .icon-rss,
    .icon-poster {
        @apply text-xl mx-3 transition duration-300 hover:(cursor-pointer transition duration-300);

        &.m {
            @apply ml-0 mr-4;
        }
    }

    .icon-author {
        @apply text-slate-400 hover:(text-slate-300);
    }

    .icon-twitter {
        @apply text-blue-400 hover: (text-blue-500);
    }

    .icon-poster {
        @apply text-2xl text-green-500 hover: (text-green-400);
    }

    .icon-rss {
        @apply text-yellow-500 text-2xl hover:(text-yellow-400);

        &.tr {
            @apply absolute right-1 top-3 text-2xl <sm:(hidden);
        }
    }

    .icon-ledger {
        @apply text-base absolute right-2 bottom-1 text-gray-300 transition duration-300 hover:(transition duration-300 text-gray-400 cursor-pointer dark:(text-gray-400)) dark:(text-gray-400/50) <sm:(top-14 right-4);
    }

    .icon-copy {
        @apply transition duration-300;

        &:hover {
            @apply text-purple-500 transition duration-300 cursor-pointer;
        }
    }

    .rightAuthor {
        @apply w-6 h-6 rounded-full mr-4;
    }

    .plantItem {
        @apply pt-5 w-full flex items-center justify-center <lg:(hidden);
    }

    .mPlanetItem {
        @apply w-full hidden <lg:(flex items-center);
    }
}

.fixed {
    @apply fixed top-20 w-70;
}
</style>
