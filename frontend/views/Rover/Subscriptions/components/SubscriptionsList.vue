<template>
    <Skeleton v-if="isLoading" />

    <div v-else class="item" :class="{ expire: isExpire }" @click="openSubscriptions">
        <i class="iconfont icon-dy copyRss" @click.stop="copyRss"></i>
        <template v-if="isExpire">
            <div class="expire"> </div>
            <div v-if="!unsubscribeLoading" @click.stop="unsubscribe" class="del">
                <i class="iconfont icon-delete"></i>
            </div>
            <div v-if="unsubscribeLoading" @click.stop="unsubscribe" class="loading">
                <img src="@/assets/svg/loading2.svg" />
            </div>
        </template>
        <i v-if="subType" class="combo">{{ subType }}</i>
        <i v-if="isblack" class="black"></i>
        <div class="header">
            <img :src="planetData.avatar ? getImagesUrl(planetData.avatar) : ''" />
        </div>
        <p class="name">{{ planetData.name }}</p>
        <strong>{{ planetData.desc }}</strong>
        <span>
            <i>{{ $t('roverPlanetSubscriptions.planet.Expired') }}</i>
            <time>{{ subType === 'Free' || subType === 'Permanent' ? subType : expireTime }}</time>
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch } from 'vue';
import Skeleton from './Skeleton.vue';
import { useRouter } from 'vue-router';
import debug from '@/utils/debug';
import store from '@/store';
import moment from 'moment';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { copyText, getImagesUrl } from '@/utils/functions';
import CONFIG from '@/assets/config';

import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';

export default defineComponent({
    name: 'subscriptions',
    components: {
        Skeleton,
    },
    props: {
        pid: { type: String },
    },
    setup(props, context) {
        const router = useRouter();
        const isLoading = ref(false);
        const planetData: any = ref({});
        const expireTime = ref();
        const subType = ref();
        const planetCanister = ref();
        const isblack = ref();
        const unsubscribeLoading = ref(false);
        const get_subscribes_canister: any = inject('get_subscribes_canister', null);
        const isExpire = ref(false);

        const openSubscriptions = () => {
            if (isblack.value) {
                ElMessage.warning(t('roverPlanetSubscriptions.planet.isblack'));
                return;
            }
            router.push({
                name: 'roverPlanetDetail',
                params: {
                    id: props.pid.toString(),
                },
            });
        };

        const getPlanetData = async () => {
            let subscriptionsCache = store.state?.subscriptions_cache[props?.pid];
            if (subscriptionsCache) {
                planetData.value = subscriptionsCache;
                return;
            }
            isLoading.value = true;
            try {
                let res = await planetCanister.value.getPlanetBase();
                if (res) {
                    let cacheData = {
                        [props.pid]: res,
                    };
                    store.commit('SET_SUBSCRIPTIONS_CACHE', cacheData);

                    planetData.value = res;
                    isLoading.value = false;
                }
            } catch (err) {
                debug('get failed', err);
            }
        };

        const copyRss = () => {
            const link = `${CONFIG.rssLinkBaseUrl}${props.pid}`;
            copyText(link);
        };

        const getExpirationTime = async () => {
            try {
                let res = await planetCanister.value.getSelfSubcriber();
                if (res && res.data[0]) {
                    isblack.value = res.isblack;
                    subType.value = Object.keys(res.data[0].subType)[0];
                    expireTime.value = moment(Number(res.data[0].expireTime)).format(
                        'h:mm MMM Do YYYY',
                    );
                    if (subType.value !== 'Free' && subType.value !== 'Permanent') {
                        if (Number(res.data[0].expireTime) - new Date().getTime() <= 0) {
                            isExpire.value = true;
                        }
                    }
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push({
                    name: 'roverPlanetSubscriptions',
                });
            }
        };

        const unsubscribe = async () => {
            if (!props.pid) {
                return;
            }
            if (unsubscribeLoading.value) {
                return;
            }

            unsubscribeLoading.value = true;

            planetCanister.value = await createActor(
                props.pid?.toString(),
                planetFactory,
                store.state.agent,
            );
            try {
                await planetCanister.value.unsubscribe();
                unsubscribeLoading.value = false;
                get_subscribes_canister();
            } catch (err) {
                ElMessage.warning(t('roverPlanetSubscriptions.planet.unsubscribeError'));
            }
        };

        const init = async () => {
            try {
                planetCanister.value = await createActor(
                    props.pid?.toString(),
                    planetFactory,
                    store.state.agent,
                );
                getPlanetData();
                getExpirationTime();
            } catch (err) {
                debug('failed', err);
                router.push({ path: '/404' });
            }
        };

        watch(
            () => store.state.agent,
            (val) => {
                if (val) {
                    init();
                }
            },
            { immediate: true },
        );

        return {
            isLoading,
            planetData,
            expireTime,
            subType,
            isblack,
            isExpire,
            unsubscribeLoading,
            copyRss,
            unsubscribe,
            openSubscriptions,
            getImagesUrl,
        };
    },
});
</script>

<style scoped lang="less">
.item {
    background: @bg-color-body;
    .center();
    flex-direction: column;
    .margin(0, 20, 20, 0);
    .border-radius(20);
    .padding(20, 20, 10, 20);
    cursor: pointer;
    transition: @transition;
    min-width: 200px;
    position: relative;
    overflow: hidden;
    @apply dark:(bg-dark-300);

    .copyRss {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 30px;
        height: 30px;
        font-style: normal;
        cursor: pointer;
        font-size: 12px;
        transition: @transition;
        padding: 6px;
        border-radius: 50%;
        .center();

        &:hover {
            background-color: rgba(245, 158, 11, 1);
            transition: @transition;
            color: #fff;
        }
    }

    .expire {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(1px);
        z-index: 2;
        top: 0;
    }

    .black {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: @bg-color-mask;
    }

    .loading {
        @apply absolute w-8 h-8 rounded-full right-3 top-3 flex items-center justify-center transition duration-300;
        z-index: 3;

        i {
            @apply text-xl text-dark-50/60 transition duration-300;
            color: #fff;
        }
    }

    .del {
        @apply absolute w-7 h-7 bg-dark-50/50 rounded-full right-3 top-3 flex items-center justify-center transition duration-300 dark:(bg-dark-50);
        z-index: 3;

        i {
            @apply text-lg text-dark-50/60 transition duration-300;
            color: #fff;
        }

        &:hover {
            @apply transition duration-300 bg-purple-500;

            i {
                @apply text-white transition duration-300;
            }
        }
    }

    .header {
        .center();
        .height(80);
        .width(80);
        border: 1px solid @border-color;
        background: @bg-color;
        border-radius: 50%;
        overflow: hidden;
        padding: 3px;
        @apply dark:(bg-dark-400 border-dark-400);

        img {
            height: 100%;
            width: 100%;
            border-radius: 100%;
        }
    }

    .name {
        width: 100%;
        font-style: normal;
        font-weight: 400;
        .font-size(16);
        color: @text-color;
        .margin(15, 0, 0, 0);
        text-align: center;
        .ellipsis();
        display: block;
        @apply dark:(text-light-900);
    }

    strong {
        .margin(18, 0, 15, 0);
        font-style: normal;
        font-weight: 400;
        .font-size(14);
        .line-height(17);
        text-align: center;
        color: @text-fcolor;
        .ellipsisMore(4);
        overflow: hidden;
        height: 68px;
        @apply dark:(text-light-900/60);
    }

    span {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid @border-color;
        width: 100%;
        .line-height(16);
        .height(45);
        align-items: center;
        @apply dark:(border-dark-100);

        i {
            font-style: normal;
            font-weight: 400;
            .font-size(12);
            color: @text-color;
            @apply dark:(text-light-900/80);
        }

        time {
            font-style: normal;
            font-weight: 400;
            .font-size(12);
            color: @text-fcolor;
            .margin(0, 0, 0, 5);
            text-align: right;
            @apply dark:(text-light-900/60);
        }
    }

    .btnBox {
        display: flex;
        width: 100%;

        p {
            display: flex;
            flex: 1;
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            .line-height(14);
            color: @text-active;
            .height(45);
            border-top: 1px solid @border-color;
            align-items: center;

            &:last-child {
                justify-content: flex-end;
            }
        }
    }

    &:nth-child(3n) {
        margin-right: 0;
    }

    &:hover {
        border-color: transparent;
        transition: @transition;
        box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.1);
        background-color: @text-color-inverse;
        @apply dark:(shadow shadow-lg shadow-dark-900 bg-dark-400);
    }

    .combo {
        @apply absolute left-3 top-3 border border-purple-500 text-purple-500 rounded-full px-2 py-2px text-xs not-italic;
        zoom: 0.9;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .item {
        width: 100%;
        .margin(0, 0, 25, 0);

        .header {
            .height(160);
            .width(160);
        }

        .name {
            .font-size(16);
        }

        strong {
            .font-size(14);
            .line-height(18);
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .item {
        .margin(0, 0, 25, 0);
    }
}
</style>
