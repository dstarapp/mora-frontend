<template>
    <Skeleton v-if="isLoading || store.state.planets_loading" />

    <div class="item" v-else translate="no">
        <div class="header">
            <div class="planetInfo">
                <div class="avatar">
                    <img :src="getImagesUrl(planetData.avatar)" />
                </div>
                <div class="info">
                    <div class="name">
                        <span>{{ planetData.name }}</span>
                        <!-- <i v-if="isOfficial" class="iconfont icon-cert"></i> -->
                        <i v-if="planetData.twitter" class="iconfont icon-twitter"></i>
                    </div>
                    <div class="pid">
                        <span>
                            <i class="iconfont icon-point"></i>
                            {{ dealPid(planetData.canister) }}
                        </span>
                        <span class="views" @click="openIcscan">
                            <i class="iconfont icon-views"></i>
                        </span>
                        <span class="link" @click="openPlanet('browserHome')">
                            <i class="iconfont icon-link"></i>
                        </span>
                    </div>
                </div>
            </div>
            <div class="planetData">
                <div class="dataItem">
                    <span class="title" translate="yes">
                        {{ $t('roverComponents.subscriptions.planetComponent.income') }}
                        <em>(ICP)</em>
                    </span>
                    <span class="data">
                        {{ numFormat(getAmount(planetData.income ? planetData.income : 0, 2), 2) }}
                    </span>
                </div>
                <div class="dataItem">
                    <span class="title" translate="yes">
                        {{ $t('roverComponents.subscriptions.planetComponent.article') }}
                    </span>
                    <span class="data">{{
        numFormat(planetData.article ? planetData.article : 0, 1)
    }}</span>
                </div>
                <div class="dataItem">
                    <span class="title" translate="yes">
                        {{ $t('roverComponents.subscriptions.planetComponent.subscribers') }}
                    </span>
                    <span class="data">{{
        numFormat(planetData.subcriber ? planetData.subcriber : 0, 1)
    }}</span>
                </div>
            </div>
        </div>
        <div class="pbox">
            <div class="profile">{{ planetData.desc }}</div>
            <div class="info">
                <div class="btnbox" :class="{ disabled: !planetData.isOwner && !planetData.isWriter }">
                    <button class="manage" @click="openPlanet('planetDashboard')">
                        {{ $t('roverPlanet.planetBtns.manage') }}
                    </button>
                    <button class="create" @click="goUrl('planetEditor')">
                        {{ $t('roverPlanet.planetBtns.create') }}
                    </button>
                </div>
            </div>
        </div>
        <span class="tag owner" v-if="planetData.isOwner">
            {{ $t('roverComponents.owner') }}
        </span>
        <span class="tag writer" v-if="!planetData.isOwner && planetData.isWriter">
            {{ $t('roverComponents.writer') }}
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Skeleton from './Skeleton.vue';
import { dealPid, numFormat, getImagesUrl, getAmount, isMobile } from '@/utils/functions';
import store from '@/store';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import CONFIG from '@/assets/config';
import { Principal } from '@dfinity/principal';
import { getOfficial } from '@/utils/official';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';

export default defineComponent({
    name: 'PlanetComponent',
    components: { Skeleton },
    props: {
        canisterId: { type: String, default: '' },
    },
    setup(props, context) {
        const router = useRouter();
        const isLoading = ref(true);
        const planetCanister = ref();
        const planetData = ref();
        const isOfficial = ref(false);

        const openPlanet = (type) => {
            router.push({
                name: type,
                params: {
                    id: planetData.value.canister,
                },
            });
        };

        const goUrl = (str: string) => {
            if (isMobile()) {
                ElMessage.warning(t('editor.isMobile'));
                return;
            }
            router.push({
                name: str,
                params: {
                    id: planetData.value.canister,
                },
            });
        };

        const getData = async () => {
            let res;
            let planet_cache = store.state.planet_cache;
            planetCanister.value = await createActor(props.canisterId, planetFactory);

            if (planet_cache[props.canisterId]) {
                res = planet_cache[props.canisterId];
                isLoading.value = false;
            } else {
                res = await planetCanister.value.getPlanetBase();
                let cacheData = {
                    [props.canisterId]: res,
                };
                store.commit('SET_PLANET_CACHE', cacheData);
                isLoading.value = false;
            }

            res.canister = res.canister.toString();
            res.created = Number(res.created);
            res.subcriber = Number(res.subcriber);
            res.article = Number(res.article);
            res.writers = res.writers.map((item) => {
                return item.toString();
            });
            res.isOwner = undefined;
            res.isWriter = undefined;
            planetData.value = res;

            planetCanister.value
                .verifyOwner([Principal.fromText(store.state.user_principal)])
                .then((bol) => {
                    planetData.value.isOwner = bol;
                });

            planetCanister.value
                .verifyWriter([Principal.fromText(store.state.user_principal)])
                .then((bol) => {
                    planetData.value.isWriter = bol;
                });
        };

        const openIcscan = () => {
            window.open(`${CONFIG.icscanLink}${planetData.value.canister}`);
        };

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val) {
                    getData();
                }
            },
        );

        onMounted(async () => {
            if (store.state.user_data) {
                getData();
            }

            let isOfficialVal = await getOfficial(props.canisterId);
            if (isOfficialVal) {
                isOfficial.value = isOfficialVal;
            }
        });

        return {
            isLoading,
            planetCanister,
            planetData,
            store,
            CONFIG,
            isOfficial,
            openIcscan,
            openPlanet,
            dealPid,
            numFormat,
            goUrl,
            getImagesUrl,
            getAmount,
        };
    },
});
</script>

<style scoped lang="less">
@import './item.less';
</style>
