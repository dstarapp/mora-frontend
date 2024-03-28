<template>
    <Header />
    <div translate="yes" class="planet" :class="{
        h100: route.name === 'planetEditor',
        isHeader: route.name === 'planetEditor' && !isHeader,
    }">
        <router-view />
    </div>
    <component :is="isComponent" @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from './plugin/Header.vue';
import Insufficient from './components/Insufficient.vue';
import Updates from './components/Updates.vue';
import store from '@/store';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { ElMessage } from 'element-plus';
import { createActor } from '@/request/agent';
import { t } from '@/i18n';
import debug from '@/utils/debug';
import { getBalance, toHexString } from '@/utils/wallet';
import ChooseLanguage from '@/components/ChooseLanguage.vue';
import { InitWalletCkBtc } from '@/utils/wallet';

export default defineComponent({
    components: { Header, Insufficient, Updates, ChooseLanguage },
    props: {},
    name: 'Planet',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isComponent = ref();
        const isHeader = ref(true);
        const canisterId = ref();
        const planetCanister = ref();

        const componentClose = () => {
            isComponent.value = '';
        };

        watch(
            () => store.state.isHeader,
            (val) => {
                isHeader.value = val;
            },
        );

        const getPlanetInfo = async () => {
            let planetCurrentData;
            try {
                planetCurrentData = await planetCanister.value.getPlanetInfo();
                if (planetCurrentData) {
                    planetCurrentData.subprices.forEach((item) => {
                        item.price = Number(item.price.toString()) / 10000;
                    });
                }
                store.commit('SET_CURRENT_PLANET_DATA', planetCurrentData);
                if (!planetCurrentData.lang) {
                    isComponent.value = 'ChooseLanguage';
                }
            } catch (err) {
                debug('error ', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const getCycles = () => {
            store.commit('SET_CURRENT_PLANET_CYCLES_BALANCE', null);
            planetCanister.value.wallet_balance().then((res) => {
                const val = (res.toString() / 1000000000000).toFixed(4);
                store.commit('SET_CURRENT_PLANET_CYCLES_BALANCE', Number(val));
            });
        };

        const getPlanetBalance = () => {
            store.commit('SET_CURRENT_PLANET_WALLET_BALANCE', null);
            // balance
            planetCanister.value.canisterAccount().then(async (res) => {
                const address = toHexString(res);
                store.commit('SET_CURRENT_PLANET_WALLET_ADDRESS', address);
                await getBalance(address, false);
            });
        };

        const getPlanetBalanceCKBTC = async () => {
            store.commit('SET_CURRENT_PLANET_WALLET_BALANCE_CKBTC', null);
            try {
                const balance = await InitWalletCkBtc(canisterId.value, false);
                store.commit('SET_CURRENT_PLANET_WALLET_BALANCE_CKBTC', balance);
            } catch (err) {
                console.log(err);
            }
        };

        const init = async () => {
            if (!canisterId.value) {
                ElMessage.error(t('utils.planetError'));
                router.push({
                    name: 'roverPlanet',
                });
                return;
            }

            planetCanister.value = createActor(canisterId.value, planetFactory, store.state.agent);
            getPlanetInfo();
            getCycles();
            getPlanetBalance();
            getPlanetBalanceCKBTC();
        };

        const reinitialize = (cid) => {
            store.commit('SET_CURRENT_OPEN_PLANET', cid);
            canisterId.value = cid;
            init();
        };

        watch(
            () => store.state.agent,
            (val: any) => {
                if (val) {
                    init();
                }
            },
        );

        onMounted(() => {
            canisterId.value = route.params.id;
            if (!canisterId.value) {
                router.push('/rover/planet');
                return;
            }
            store.commit('SET_CURRENT_OPEN_PLANET', canisterId.value);
            if (store.state.agent) {
                init();
            }
        });

        provide('planetCanister', planetCanister);
        provide('getPlanetInfo', getPlanetInfo);
        provide('reinitialize', reinitialize);
        provide('getPlanetBalance', getPlanetBalance);
        provide('getCycles', getCycles);
        provide('getPlanetBalanceCKBTC', getPlanetBalanceCKBTC);

        return {
            isComponent,
            route,
            isHeader,
            canisterId,
            componentClose,
        };
    },
});
</script>

<style scoped lang="less">
.planet {
    display: flex;
    align-items: flex-start;
    margin: 0 auto;
    width: 100%;
    .padding(80, 30, 0, 30);
    box-sizing: border-box;
    transition: @transition;

    &.isHeader {
        .padding(0, 0, 0, 0) !important;
        transition: @transition;
    }

    &.h100 {
        .padding(0, 30, 0, 30);
    }

    @media screen and (min-width: 0) and (max-width: 750px) {
        flex-direction: column;
        justify-content: flex-start;
        .padding-media(90, 20, 0, 20);
        flex: none;
    }

    @media screen and (min-width: 750px) and (max-width: 1240px) {
        .padding(80, 30, 0, 30);
    }
}
</style>
