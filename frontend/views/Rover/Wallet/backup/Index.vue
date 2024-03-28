<template>
    <div class="wallet">
        <h2>
            {{ $t('roverWallet.t1') }}
        </h2>
        <div class="box">
            <div class="wbox">
                <div class="balance" v-loading="icpRefresh">
                    <div class="header">
                        <div class="title">{{ $t('roverWallet.balance') }}</div>
                        <i class="iconfont icon-refresh" :class="{ refresh: icpRefresh }" @click="refresh('icp')"></i>
                    </div>
                    <span class="price">{{
                store.state.wallet_balance ? store.state.wallet_balance.toFixed(4) : 0
            }}</span>
                    <div class="address">
                        <span>{{ store.state.wallet_address }}</span>
                        <i class="iconfont icon-copy" @click="copy"></i>
                    </div>
                </div>
                <!-- ckbtc -->
                <div class="balance ckbtc" v-loading="ckbtcLoading">
                    <div class="header">
                        <div class="title">{{ $t('roverWallet.ckbtcbalance') }}</div>
                        <i class="iconfont icon-refresh" :class="{ refresh: ckbtcLoading }"
                            @click="refresh('ckbtc')"></i>
                    </div>
                    <span class="price">
                        {{ BigNumber(store.state.ckbtc_wallet_balance).toFixed() }}
                    </span>
                    <div class="address">
                        <span>{{ store.state.user_principal }}</span>
                        <i class="iconfont icon-copy" @click="copyText(store.state.user_principal)"></i>
                    </div>
                </div>
                <!-- ckbtc -->
            </div>
            <div class="wbox withdraw">
                <!-- switch -->
                <div class="switchbox">
                    <div :class="{ active: curIndex === 1 }" @click="switchCurrency(1)"><img
                            src="@/assets/svg/logo-ic.svg" class="h-3" /><span>ICP</span></div>
                    <div :class="{ active: curIndex === 2 }" @click="switchCurrency(2)"><img
                            src="@/assets/svg/bitcoin.svg" /><span>CKBTC</span></div>
                </div>
                <div class="header">
                    <span :class="{ active: options == 1 }" @click="options = 1">{{
                $t('roverWallet.withdraw')
            }}</span>
                    <span :class="{ active: options == 2 }" @click="options = 2">{{
                $t('roverWallet.deposit')
            }}</span>
                </div>
                <div class="group" translate="no" v-if="options == 1">
                    <div class="inputbox">
                        <input type="text" :placeholder="curIndex === 1
                ? $t('roverWallet.receive')
                : $t('roverWallet.ckbtcreceive')
                " v-model="address" />
                    </div>
                    <div class="inputbox">
                        <input type="number" step="0.0001" :placeholder="$t('roverWallet.quantity')"
                            v-model="withdrawpice" />
                        <span>{{ curIndex === 1 ? $t('roverWallet.icp') : 'CKBTC' }}</span>
                        <span @click="withdrawbtn" class="max">{{ $t('roverWallet.max') }}</span>
                    </div>
                    <button v-if="curIndex === 1" @click="transfer" :class="{
                active:
                    !transferLoading &&
                    (validatePrincipalId(address) ||
                        validateAccountId(address) ||
                        address.includes('.ic') ||
                        address.includes('.IC')) &&
                    withdrawpice > 0 &&
                    withdrawpice <= getAmountMax(store.state.wallet_balance as any),
            }">
                        <img src="@/assets/svg/loading.svg" v-if="transferLoading" />
                        {{ $t('roverWallet.btns.confirm') }}
                    </button>
                    <button v-if="curIndex === 2" @click="transferCKBTC" :class="{
                active:
                    !transferLoading &&
                    (validatePrincipalId(address) || address.includes('.')) &&
                    withdrawpice > 0 &&
                    withdrawpice <= getAmountMaxCKBTC(store.state.ckbtc_wallet_balance as any),
            }">
                        <img src="@/assets/svg/loading.svg" v-if="transferLoading" />
                        {{ $t('roverWallet.btns.confirm') }}
                    </button>
                </div>
                <div class="group" v-else>
                    <span class="dtitle">{{
                curIndex === 1
                    ? $t('roverWallet.depositTxt')
                    : $t('roverWallet.ckbtcdepositTxt')
            }}</span>
                    <p class="addressbox">{{
                    curIndex === 1 ? store.state.wallet_address : store.state.user_principal
                }}</p>
                    <button class="active" @click="copy">
                        {{ $t('roverWallet.btns.copy') }}
                    </button>
                </div>
            </div>
        </div>
        <h2>
            {{ $t('roverWallet.t2') }}
            <div class="flex items-center">
                <span @click="transactionTab = 1" :class="transactionTab === 1 ? 'active' : ''">ICP</span>
                <span @click="transactionTab = 2" :class="transactionTab === 2 ? 'active' : ''">CKBTC</span>
                <i class="iconfont icon-refresh" :class="{ refresh: transactionRefresh }"
                    @click="refresh('transactionRefresh')"></i>
            </div>
        </h2>
        <WalletList v-show="transactionTab === 1" ref="listDom" v-loading="transactionRefresh" />
        <WalletListCkbtc v-show="transactionTab === 2" ref="listDomCkbtc" v-loading="transactionRefresh" />
    </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef, ref, onMounted, nextTick } from 'vue';
import {
    validatePrincipalId,
    validateAccountId,
    TransferICP,
    TransferCKBTC,
    getAmountMax,
    InitWallet,
    InitWalletCkBtc,
    getAmountMaxCKBTC,
    GetBalance,
} from '@/utils/wallet';
import store from '@/store';
import WalletList from './WalletList.vue';
import WalletListCkbtc from './WalletListCkbtc.vue';
import { ElMessage } from 'element-plus';
import { createActor } from '@/request/agent';
import { idlFactory as icnamingFactory } from '@/request/canister/icnaming.did';
import debug from '@/utils/debug';
import CONFIG from '@/assets/config';
import { t } from '@/i18n';
import { copyText } from '@/utils/functions';
import { decodeIcrcAccount } from '@/utils/ledger.utils';
import { IcrcAccount } from '@/utils/ledger.responses';
import { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';

export default defineComponent({
    name: 'PlanetWallet',
    components: {
        WalletList,
        WalletListCkbtc,
    },
    setup() {
        const options = ref(1);
        const listDom = shallowRef();
        const listDomCkbtc = shallowRef();
        const withdrawpice = ref();
        const isError = ref();
        const transferLoading = ref(false);
        const transactionRefresh = ref(false);
        const icpRefresh = ref(false);
        const address = ref('');
        const icnamingCanisterAnonymous = ref();
        const ckbtcLoading = ref(false);
        const transactionTab = ref(1);

        const refresh = (str: string) => {
            if (str == 'icp') {
                InitWallet(store.state.user_principal);
                icpRefresh.value = true;
                setTimeout(() => {
                    icpRefresh.value = false;
                }, 300);
            } else if (str === 'ckbtc') {
                ckbtcLoading.value = true;
                InitWalletCkBtc(store.state.user_principal);
                setTimeout(() => {
                    ckbtcLoading.value = false;
                }, 300);
            } else if (str === 'transactionRefresh') {
                listDom.value.getList();
                transactionRefresh.value = true;
                setTimeout(() => {
                    transactionRefresh.value = false;
                }, 300);
            }
        };

        const wallet_balance = () => {
            return GetBalance();
        };

        const LargeNumberComponent = (number) => {
            const formattedNumber = new BigNumber(number).toFixed();
            return formattedNumber;
        };

        const transfer = async () => {
            let addr = address.value;
            transferLoading.value = true;
            if (addr.includes('.ic') || addr.includes('.IC')) {
                const res = await icnamingCanisterAnonymous.value.get_record_value(
                    addr.toLowerCase(),
                );
                if (res.Ok.length) {
                    address.value = res.Ok[0][1];
                    addr = res.Ok[0][1];
                } else {
                    ElMessage.error(t(`roverWallet.principalExist`));
                    transferLoading.value = false;
                    return;
                }
            }
            if (addr == '' || (!validatePrincipalId(addr) && !validateAccountId(addr))) {
                ElMessage.error(t(`roverWallet.addressError`));
                return;
            }
            nextTick(async () => {
                const amount: any = parseFloat(withdrawpice.value);
                if (isNaN(amount)) {
                    return;
                }
                const icp = BigInt(Math.round(amount.toFixed(4) * 100 * 1_000_000));
                const height = await TransferICP(addr, icp, {});
                transferLoading.value = false;
                if (!height || height.Err) {
                    debug('failed', height);
                } else {
                    withdrawpice.value = '';
                    ElMessage.success(t(`roverWallet.success`));
                    icpRefresh.value = true;
                    transactionRefresh.value = true;
                    setTimeout(() => {
                        refresh('icp');
                        refresh('transactionRefresh');
                    }, 1000);
                }
            });
        };

        const transferCKBTC = async () => {
            const addr = address.value;
            const amount = BigInt(Math.round(withdrawpice.value * 100000000));
            transferLoading.value = true;
            if (addr.includes('.')) {
                try {
                    const data: IcrcAccount = decodeIcrcAccount(addr);
                    const res = await TransferCKBTC(amount, data.owner, data.subaccount!);
                    if (res.Err) {
                        console.log(res);
                        ElMessage.error('Transfer Error');
                    } else {
                        ElMessage.success(t(`roverWallet.success`));
                        refresh('ckbtc');
                    }
                    ckbtcLoading.value = false;
                    transferLoading.value = false;
                } catch (err) {
                    ElMessage.error('Transfer Error');
                    transferLoading.value = false;
                }
            } else {
                try {
                    const res = await TransferCKBTC(amount, Principal.fromText(addr), []);
                    if (res.Err) {
                        console.log(res);
                        ElMessage.error('Transfer Error');
                    } else {
                        ElMessage.success(t(`roverWallet.success`));
                        refresh('ckbtc');
                    }
                    ckbtcLoading.value = false;
                    transferLoading.value = false;
                } catch (err) {
                    ElMessage.error('Transfer Error');
                    transferLoading.value = false;
                }
            }
        };

        // max
        const withdrawbtn = () => {
            if (curIndex.value === 1) {
                withdrawpice.value = getAmountMax(store.state.wallet_balance as any);
            }
            if (curIndex.value === 2) {
                withdrawpice.value = getAmountMaxCKBTC(store.state.ckbtc_wallet_balance as any);
            }
        };

        const copy = () => {
            copyText(store.state.wallet_address);
        };

        onMounted(() => {
            icnamingCanisterAnonymous.value = createActor(CONFIG.icnamingId, icnamingFactory);
        });

        // switch ckbtc - icp
        const curIndex = ref(1);
        const switchCurrency = (num: number) => {
            if (num === curIndex.value) return;
            if (transferLoading.value) return;
            curIndex.value = num;
            withdrawpice.value = '';
            address.value = '';
        };

        return {
            isError,
            store,
            listDom,
            transferLoading,
            icpRefresh,
            transactionRefresh,
            withdrawpice,
            options,
            address,
            validatePrincipalId,
            validateAccountId,
            refresh,
            transfer,
            wallet_balance,
            withdrawbtn,
            copy,
            copyText,
            getAmountMax,
            getAmountMaxCKBTC,
            curIndex,
            ckbtcLoading,
            switchCurrency,
            listDomCkbtc,
            transactionTab,
            transferCKBTC,
            BigNumber,
        };
    },
});
</script>

<style lang="less" scoped>
.wallet {
    width: 100%;

    h2 {
        display: flex;
        justify-content: space-between;
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
        .margin(30, 0, 50, 0);

        .wbox {
            width: 48%;

            .balance {
                .border-radius(20);
                .padding(20, 20, 20, 20);
            }

            .balance>.header {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                @apply dark:(text-black);

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

            .balance {
                background: linear-gradient(155deg, #2aeebf 20%, #87ff69 80%);

                .price {
                    .padding(10, 0, 10, 0);
                    .font-size(22);
                    display: block;
                    word-break: break-word;
                    font-weight: 700;
                    @apply dark:(text-black);
                }

                .address {
                    @apply w-full flex items-center justify-between;

                    span {
                        .font-size(12);
                        display: block;
                        word-break: break-all;
                        @apply dark:(text-black);
                    }

                    i {
                        @apply ml-6 cursor-pointer dark:(text-black);
                    }
                }

                &.ckbtc {
                    @apply mt-6;
                    background: linear-gradient(134deg, #f5bc8e 0.48%, #fbe98b 101.31%);
                }
            }

            .switchbox {
                border: 1px solid @border-color;
                @apply w-full rounded-xl flex items-center mt-2 mb-3 overflow-hidden dark:(border-dark-100);

                div {
                    @apply w-1/2 py-2 flex items-center justify-center cursor-pointer;

                    img {
                        @apply h-4 mr-2;
                    }

                    &.active {
                        background-color: @border-color;
                        @apply dark:(bg-dark-200);
                    }
                }
            }

            &.withdraw {
                border: 1px solid @border-color;
                .border-radius(20);
                .padding(15, 25, 15, 25);
                @apply dark:(border-dark-100 bg-dark-700);

                .header {
                    .center();

                    span {
                        color: @text-color-grey;
                        .padding(5, 10, 0, 10);
                        .font-size(16);
                        cursor: pointer;
                        @apply dark:(text-light-900/40);

                        &.active {
                            color: @text-color;
                            @apply dark:(text-light-900/80);
                        }
                    }
                }

                .group {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;

                    .inputbox,
                    button {
                        width: 100%;
                        .border-radius(12);
                        height: 45px;
                    }

                    .inputbox {
                        .margin(20, 0, 0, 0);
                        .padding(3, 3, 3, 3);
                        border: 1px solid @border-color;
                        .font-size(14);
                        overflow: hidden;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        @apply dark:(border-dark-100);

                        input {
                            flex: 1;
                            border: none;
                            width: 100%;
                            height: 100%;
                            padding-left: 10px;
                            line-height: 45px;
                            background: none;
                        }

                        span {
                            .width(60);
                            text-align: center;
                            .font-size(16);

                            &.max {
                                color: @text-active;
                                font-weight: 500;
                                transition: @transition;

                                &:hover {
                                    cursor: pointer;
                                    transition: @transition;
                                }
                            }
                        }
                    }

                    button {
                        .center();
                        .margin(20, 0, 0, 0);
                        border: none;
                        background-color: @border-color-active;
                        color: @text-color-inverse;
                        text-align: center;
                        .font-size(16);
                        opacity: 0.6;
                        cursor: not-allowed;
                        transition: @transition;
                        pointer-events: none;

                        &.active {
                            opacity: 1;
                            transition: @transition;
                            cursor: auto;
                            pointer-events: initial;

                            &:hover {
                                opacity: 0.85;
                                cursor: pointer;
                                transition: @transition;
                                box-shadow: 0 0 15px rgba(128, 110, 242, 0.3);
                            }
                        }

                        img {
                            margin-right: 10px;
                        }
                    }

                    .dtitle {
                        .font-size(14);
                        .padding(25, 0, 0, 0);
                        font-weight: 500;
                        color: @text-fcolor;
                        @apply dark:(text-light-900/60);
                    }

                    .addressbox {
                        width: 100%;
                        .border-radius(12);
                        .font-size(14);
                        background-color: @bg-color-hover;
                        .padding(15, 15, 15, 15);
                        .margin(20, 0, 0, 0);
                        word-break: break-all;
                        @apply dark:(bg-dark-300 text-light-900/80);
                    }
                }
            }
        }
    }
}

.refresh {
    animation: refresh 1s linear infinite;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .wallet {
        .box {
            flex-wrap: wrap;

            .wbox {
                width: 100%;

                &.withdraw {
                    .margin(25, 0, 0, 0);
                }
            }
        }
    }
}

.fadein-enter-active {
    -webkit-animation: fade-in 0.5s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    animation: fade-in 0.5s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
