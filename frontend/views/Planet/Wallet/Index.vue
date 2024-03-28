<template>
    <div class="mywallet">
        <i class="iconfont icon-wallet" @click="openWallet"></i>
        <el-drawer
            v-model="showWallet"
            :title="$t('planetWallet.t3')"
            direction="rtl"
            :size="walletWidth + '%'"
        >
            <div class="container">
                <div class="box">
                    <div class="wbox">
                        <div class="balance icp">
                            <div class="header">
                                <div class="title">{{ $t('planetWallet.icp') }}</div>
                                <i
                                    class="iconfont icon-refresh"
                                    :class="{ refresh: icpRefresh }"
                                    @click="refresh('icp')"
                                ></i>
                            </div>

                            <el-skeleton
                                animated
                                class="price"
                                v-if="store.state.current_planet_wallet_balance === null"
                            >
                                <template #template>
                                    <el-skeleton-item variant="h3" style="width: 100px" />
                                </template>
                            </el-skeleton>

                            <span class="price" v-else>
                                <!-- {{ store.state.current_planet_wallet_balance }} -->
                                {{
                                    lodash
                                        .floor(store.state.current_planet_wallet_balance, 4)
                                        .toFixed(4)
                                }}
                            </span>
                            <button class="icp" @click="isComponent = 'WithDraw'">
                                {{ $t('planetWallet.btn1') }}
                            </button>
                        </div>
                    </div>

                    <div class="wbox">
                        <div class="balance cycles">
                            <div class="header">
                                <div class="title">{{ $t('planetWallet.cycles') }}</div>
                                <i
                                    class="iconfont icon-refresh"
                                    :class="{ refresh: cyclesRefresh }"
                                    @click="refresh('cycles')"
                                ></i>
                            </div>
                            <el-skeleton
                                animated
                                class="price"
                                v-if="store.state.current_planet_cycles_balance === null"
                            >
                                <template #template>
                                    <el-skeleton-item variant="h3" style="width: 100px" />
                                </template>
                            </el-skeleton>
                            <span class="price" v-else>
                                {{ store.state.current_planet_cycles_balance }} T
                            </span>
                            <button class="cycles" @click="isComponent = 'AddCycles'">
                                {{ $t('planetWallet.btn2') }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="ckbtc">
                    <div class="ckbtcBox">
                        <span>{{ $t('planetWallet.ckbtc') }}</span>
                        <div class="price">
                            <strong
                                v-if="
                                    store.state.current_planet_wallet_balance_ckbtc ||
                                    store.state.current_planet_wallet_balance_ckbtc === 0
                                "
                            >
                                {{ store.state.current_planet_wallet_balance_ckbtc }}
                            </strong>
                            <el-skeleton
                                class="w-[150px] h-[32px]"
                                animated
                                v-if="store.state.current_planet_wallet_balance_ckbtc === null"
                            >
                                <template #template>
                                    <el-skeleton-item
                                        variant="h3"
                                        style="width: 150px; height: 32px"
                                    />
                                </template>
                            </el-skeleton>
                            <i
                                class="iconfont icon-refresh"
                                :class="{ refresh: ckbtcRefresh }"
                                @click="refresh('ckbtc')"
                            ></i>
                        </div>
                    </div>
                    <button @click="isComponent = 'WithDrawCKBTC'">{{
                        $t('planetWallet.btn1')
                    }}</button>
                </div>
                <h2>
                    {{ $t('planetWallet.t2') }}
                    <div class="flex items-center">
                        <span @click="tab = 1" :class="tab === 1 ? 'active' : ''">ICP</span>
                        <span @click="tab = 2" :class="tab === 2 ? 'active' : ''">CKBTC</span>
                        <i
                            class="iconfont icon-refresh"
                            :class="{ refresh: transactionRefresh }"
                            @click="refresh('transaction')"
                        ></i>
                    </div>
                </h2>
                <WalletList v-show="tab === 1" ref="listDom" />
                <WalletListCKBTC v-show="tab === 2" ref="listDom2" />
            </div>
        </el-drawer>

        <component :is="isComponent" @componentClose="componentClose" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, inject } from 'vue';
import { ElDrawer } from 'element-plus';
import WalletList from './WalletList.vue';
import WalletListCKBTC from './WalletListCKBTC.vue';
import WithDraw from '../components/WithDraw.vue';
import WithDrawCKBTC from '../components/WithDrawCKBTC.vue';
import AddCycles from '@/components/AddCycles.vue';
import store from '@/store';
import lodash from 'lodash';
import BigNumber from 'bignumber.js';

export default defineComponent({
    components: { WalletList, WithDraw, AddCycles, ElDrawer, WalletListCKBTC, WithDrawCKBTC },
    setup() {
        const listDom = shallowRef();
        const listDom2 = shallowRef();
        const showWallet = ref(false);
        const walletWidth = ref(document.body.clientWidth > 1024 ? 60 : 100);
        const icpRefresh = ref(false);
        const cyclesRefresh = ref(false);
        const transactionRefresh = ref(false);
        const isComponent = ref();
        const ckbtcRefresh = ref(false);

        const getPlanetBalance: any = inject('getPlanetBalance', null);
        const getPlanetBalanceCKBTC: any = inject('getPlanetBalanceCKBTC', null);
        const getCycles: any = inject('getCycles', null);
        const tab = ref(1);

        const openWallet = () => {
            showWallet.value = true;
        };

        const refresh = (str: string) => {
            if (str == 'icp') {
                getPlanetBalance();
                icpRefresh.value = true;
                setTimeout(() => {
                    icpRefresh.value = false;
                }, 300);
            } else if (str == 'cycles') {
                getCycles();
                cyclesRefresh.value = true;
                setTimeout(() => {
                    cyclesRefresh.value = false;
                }, 300);
            } else if (str === 'transaction') {
                if (tab.value === 1) {
                    listDom.value.getList();
                } else if (tab.value === 2) {
                    listDom2.value.getListCKBTC();
                }
                transactionRefresh.value = true;
                setTimeout(() => {
                    transactionRefresh.value = false;
                }, 300);
            } else if (str === 'ckbtc') {
                getPlanetBalanceCKBTC();
                ckbtcRefresh.value = true;
                setTimeout(() => {
                    ckbtcRefresh.value = false;
                }, 300);
            }
        };

        const componentClose = () => {
            isComponent.value = undefined;
        };

        return {
            store,
            ckbtcRefresh,
            showWallet,
            walletWidth,
            icpRefresh,
            cyclesRefresh,
            transactionRefresh,
            isComponent,
            getPlanetBalance,
            getCycles,
            listDom,
            lodash,
            openWallet,
            refresh,
            componentClose,
            tab,
            BigNumber,
        };
    },
});
</script>

<style lang="less" scoped>
.mywallet {
    .center();
}
.icon-wallet {
    .font-size(26);
    .margin(0, 0, 0, 25);
    transition: @transition;
    @apply dark:(text-light-900/80);
    &:hover {
        cursor: pointer;
        color: @text-active;
        transition: @transition;
    }
}
.container {
    .padding(0, 30, 0, 30);

    h2 {
        width: 100%;
        .font-size(20);
        display: flex;
        align-items: center;
        justify-content: space-between;

        i {
            color: @text-fcolor;
            cursor: pointer;
        }
        span {
            @apply mr-5 text-base hover:(cursor-pointer);
            &.active {
                @apply text-purple-500;
            }
        }
    }

    .box {
        width: 100%;
        display: flex;
        justify-content: space-between;
        .margin(30, 0, 30, 0);

        .wbox {
            width: 48%;

            .balance {
                .border-radius(20);
                .padding(30, 30, 30, 30);
                @apply dark:(text-black);
                &.icp {
                    background: linear-gradient(155deg, #ffe9e9 20%, #eafff6 80%);
                }

                &.cycles {
                    background: linear-gradient(155deg, #c8fcb0 20%, #fff9dc 80%);
                }

                .header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .title {
                        flex: 1;
                        .font-size(16);
                    }

                    i {
                        cursor: pointer;
                        transition: @transition;

                        &:hover {
                            color: @text-fcolor;
                            transition: @transition;
                        }
                    }
                }

                .price {
                    .padding(20, 0, 0, 0);
                    .font-size(24);
                    display: block;
                    word-break: break-word;
                    font-weight: 500;
                    @apply dark:(text-black);
                }

                button {
                    border: none;
                    width: 100%;
                    .border-radius(12);
                    .height(45);
                    text-align: center;
                    .font-size(16);
                    font-weight: bold;
                    color: #fff;
                    transition: @transition;
                    .margin(20, 0, 0, 0);
                    opacity: 0.8;

                    &.icp {
                        background-color: #24cb8b;
                    }

                    &.cycles {
                        background-color: #71a559;
                    }

                    &:hover {
                        opacity: 1;
                        cursor: pointer;
                        transition: @transition;
                    }
                }
            }
        }
    }
}

.refresh {
    animation: refresh 1s linear infinite;
}

.ckbtc {
    @apply w-full p-7 rounded-2xl mb-8 flex items-center justify-between <sm:(flex-col items-start);
    background: linear-gradient(134deg, #f5bc8e 0.48%, #fbe98b 101.31%);
    .ckbtcBox {
        @apply flex-1 text-black;
        span {
            @apply block;
        }
        .price {
            @apply w-full flex items-center pt-3;
            strong {
                @apply text-2xl;
            }
            i {
                @apply ml-5 cursor-pointer;
            }
        }
    }
    button {
        width: 43%;
        @apply bg-orange-500 text-white h-11 rounded-xl text-center transition duration-300 hover:(transition duration-300 bg-orange-400) <sm:(w-full mt-4);
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .container {
        .box {
            flex-wrap: wrap;

            .wbox {
                width: 100%;

                .balance {
                    &.cycles {
                        .margin(25, 0, 0, 0);
                    }
                }
            }
        }
    }
}
</style>
