<template>
    <el-dialog
        :title="$t('Reward.name')"
        v-model="dialogVisible"
        :before-close="handleClose"
        @closed="afterClose"
    >
        <div class="curbox" v-if="state === 1">
            <div class="payCurrency">
                <p>{{ $t('Reward.choose') }}</p>
                <div class="choose">
                    <span :class="{ active: curIndex === 1 }" @click="chooseCurrency(1)">
                        <i class="iconfont icon-chose"></i>
                        ICP
                    </span>
                    <span :class="{ active: curIndex === 2 }" @click="chooseCurrency(2)">
                        <i class="iconfont icon-chose"></i>
                        CKBTC
                    </span>
                </div>
            </div>
            <div class="currencyBox">
                <template v-if="curIndex === 1">
                    <div
                        v-for="icp in currencyICP"
                        :key="icp"
                        class="item"
                        :class="{ active: icp == curAmount }"
                        @click="chooseAmount(icp)"
                        ><img src="@/assets/svg/logo-ic.svg" /><span>{{ icp }}</span></div
                    >
                </template>
                <template v-else>
                    <div
                        v-for="ckbtc in currencyCKBTC"
                        :key="ckbtc"
                        class="item ckbtc"
                        :class="{ active: ckbtc == curAmount }"
                        @click="chooseAmount(ckbtc)"
                        ><img src="@/assets/svg/bitcoin.svg" /><span>{{ ckbtc }}</span></div
                    >
                </template>
                <div
                    class="item merge"
                    :class="{ active: isChooseOtherAmount && curAmount === -1 }"
                >
                    <div class="customize">
                        <input
                            type="number"
                            v-model="otherAmount"
                            placeholder="Other amount"
                            @focus="chooseOtherAmount"
                        />
                        <i>{{ curIndex === 1 ? 'ICP' : 'CKBTC' }}</i>
                    </div>
                </div>
            </div>
            <div class="mora-button">
                <div class="cancel" @click="afterClose"> {{ $t('Reward.btn.btn1') }} </div>
                <div
                    class="confirm"
                    :class="{ disabled: nextLoading || (curAmount === -1 && !otherAmount) }"
                    @click="confirm"
                >
                    <img v-if="nextLoading" src="@/assets/svg/loading.svg" alt="" />
                    {{ $t('Reward.btn.btn2') }}
                </div>
            </div>
        </div>
        <div class="curbox" v-else>
            <div class="paybox">
                <div v-if="curIndex === 1" class="qrcode">
                    <img v-if="invoiceToBase64" :src="invoiceToBase64" alt="" />
                    <p>{{ $t('Reward.qrtxt') }}</p>
                </div>
                <div v-if="curIndex === 1" class="or">or</div>
                <div class="payway send">
                    <div class="header">
                        <div class="sendicp">
                            {{ $t('pay.subscribe.send') }}
                            <span>{{
                                LargeNumberComponent(curAmount !== -1 ? curAmount : otherAmount)
                            }}</span>
                            {{ curIndex === 1 ? $t('pay.subscribe.to') : $t('pay.subscribe.toCk') }}
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="icp">
                                {{ money }}
                                {{
                                    curIndex === 1
                                        ? $t('pay.subscribe.icp')
                                        : $t('pay.subscribe.ckbtc')
                                }}
                            </span>
                            <i
                                class="iconfont icon-refresh"
                                :class="{ refresh: timeoutAnima }"
                                @click="getOrderBalance"
                            ></i>
                        </div>
                    </div>
                    <div class="addbox">
                        <div class="address">
                            {{ address }}
                        </div>
                        <i @click="copy" class="iconfont icon-copy"></i>
                    </div>
                </div>
                <div class="or">or</div>
                <div class="payway wallet">
                    <div class="walletinfo">
                        <i class="iconfont icon-wallet"></i>
                        <div
                            class="dark:(text-light-900/60) items-start justify-start flex flex-col"
                        >
                            {{ curIndex === 1 ? 'ICP Balance' : 'CKBTC Balance' }}
                            <strong v-if="curIndex === 1">
                                {{ store.state.wallet_balance.toFixed(4) }} ICP
                            </strong>
                            <strong v-if="curIndex === 2">
                                {{ store.state.ckbtc_wallet_balance.toFixed(8) }} CKBTC
                            </strong>
                        </div>
                    </div>
                    <button @click="pay" :class="{ disabled: paystate === 1 || payDisabled() }">
                        <img src="@/assets/svg/loading.svg" v-if="paystate === 1" />
                        {{ verify ? 'Confirm' : 'Pay' }}
                    </button>
                </div>
            </div>
        </div>
        <div class="paystate" v-if="showLoading">
            <img src="@/assets/svg/loading2.svg" alt="" />
            <span>Confirming...</span>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { copyText } from '@/utils/functions';
import store from '@/store';
import {
    getBalance,
    toHexString,
    TransferICP,
    TransferCKBTC,
    InitWalletCkBtc,
} from '@/utils/wallet';
import debug from '@/utils/debug';
import QRCode from 'qrcode';
import bus from 'vue3-eventbus';
import { ab2str } from '@/utils/functions';
import { decodeIcrcAccount } from '@/utils/ledger.utils';
import { IcrcAccount } from '@/utils/ledger.responses';
import BigNumber from 'bignumber.js';

export default defineComponent({
    emits: ['close'],
    setup(props, context) {
        const articleId = inject<any>('articleId', null);
        const currentCanister = inject<any>('currentCanister', null);

        const dialogVisible = ref(true);
        const state = ref(1);
        const handleClose = () => {
            context.emit('close');
        };
        const afterClose = () => {
            context.emit('close');
        };

        const payDisabled = () => {
            const requirement = curAmount.value !== -1 ? curAmount.value : otherAmount.value;

            if (
                curIndex.value === 1 &&
                store.state.wallet_balance < requirement &&
                requirement > 0.001
            ) {
                return true;
            }

            if (curIndex.value === 2 && store.state.ckbtc_wallet_balance < requirement) {
                return true;
            }

            return false;
        };

        const curIndex = ref(1);
        const chooseCurrency = (num: number) => {
            curIndex.value = num;
        };

        const otherAmount = ref();
        const isChooseOtherAmount = ref(false);
        const chooseOtherAmount = () => {
            curAmount.value = -1;
            isChooseOtherAmount.value = true;
        };

        const curAmount = ref(-1);
        const currencyICP = [1, 2, 5, 10];
        const currencyCKBTC = [0.00003, 0.00015, 0.0003, 0.0006];
        const chooseAmount = (num: number) => {
            if (curAmount.value == num) {
                curAmount.value = -1;
            } else {
                curAmount.value = num;
            }
        };

        const nextLoading = ref(false);
        const invoice = ref<any>();
        const address = ref('');
        const orderId = ref();
        const invoiceToBase64 = ref();
        const confirm = async () => {
            if (nextLoading.value) return;
            if (curAmount.value === -1 && !otherAmount.value) {
                return;
            }

            const requirement = curAmount.value !== -1 ? curAmount.value : otherAmount.value;
            if (curIndex.value === 1) {
                if (requirement < 0.001) {
                    ElMessage.error('The amount you entered is too small');
                    return false;
                }
            }

            if (curIndex.value === 2) {
                if (requirement <= 0.0000001) {
                    ElMessage.error('The amount you entered is too small');
                    return false;
                }
            }

            nextLoading.value = true;

            currentCanister.value.value
                .preAward('mora.app', articleId.value, curIndex.value === 1 ? 'ICP' : 'CKBTC')
                .then(async (res) => {
                    if (res.Err) {
                        ElMessage.error(res.Err);
                    } else {
                        invoice.value = res.Ok.invoice;
                        orderId.value = Number(invoice.value.id);
                        address.value =
                            curIndex.value === 1
                                ? toHexString(invoice.value.to)
                                : ab2str(invoice.value.to);
                        invoiceToBase64.value = await QRCode.toDataURL(address.value);
                        state.value = 2;
                        getOrderBalance();
                    }
                })
                .finally(() => {
                    nextLoading.value = false;
                });
        };

        const money = ref(0);
        const showLoading = ref(false);
        let timeout;
        const timeoutAnima = ref(false);
        const getOrderBalance = async () => {
            clearTimeout(timeout);
            timeoutAnima.value = true;
            setTimeout(() => {
                timeoutAnima.value = false;
            }, 2000);

            if (curIndex.value === 1) {
                getBalance(address.value, false).then(async (res) => {
                    money.value = res;
                    const requirement =
                        curAmount.value !== -1 ? curAmount.value : otherAmount.value;

                    if (money.value >= requirement) {
                        showLoading.value = true;
                        const res = await currentCanister.value.value.confirmAward(orderId.value);
                        if (res) {
                            ElMessage.success('Successful reward');
                            paystate.value = 0;
                            context.emit('close');
                            bus.emit('queryAwards');
                        }
                    } else {
                        timeout = setTimeout(() => {
                            getOrderBalance();
                        }, 3000);
                    }
                });
            } else if (curIndex.value === 2) {
                const data: IcrcAccount = decodeIcrcAccount(address.value);

                InitWalletCkBtc(data.owner.toString(), false, [data.subaccount]).then(
                    async (res) => {
                        money.value = res;
                        const requirement =
                            curAmount.value !== -1 ? curAmount.value : otherAmount.value;
                        if (money.value >= requirement) {
                            showLoading.value = true;

                            const res = await currentCanister.value.value.confirmAward(
                                orderId.value,
                            );
                            if (res) {
                                ElMessage.success('Successful reward');
                                paystate.value = 0;
                                context.emit('close');
                                bus.emit('queryAwards');
                            }
                        } else {
                            timeout = setTimeout(() => {
                                getOrderBalance();
                            }, 3000);
                        }
                    },
                );
            }
        };

        const copy = async () => {
            await copyText(address.value);
        };

        const paystate = ref(0);
        const verify = ref(false);
        const pay = async () => {
            if (paystate.value === 1) {
                return;
            }
            paystate.value = 1;

            if (curIndex.value === 1) {
                const requirement = curAmount.value !== -1 ? curAmount.value : otherAmount.value;

                const amountInMicroICP = BigInt(
                    Math.round(parseFloat(requirement.toFixed(4)) * 100 * 1_000_000),
                );
                if (amountInMicroICP <= 0) {
                    ElMessage.error('Please tip a larger amount');
                    state.value = 1;
                    paystate.value = 0;
                    return;
                }

                try {
                    const res = await TransferICP(address.value, amountInMicroICP, {}, 'wallet');
                    console.log(res);
                } catch (err) {
                    debug(' _Reward', err);
                    paystate.value = 0;
                    ElMessage.error('Payment failure');
                }
            } else {
                try {
                    const data: IcrcAccount = decodeIcrcAccount(address.value);
                    const requirement =
                        curAmount.value !== -1 ? curAmount.value : otherAmount.value;
                    let amountInMicroCKBTC = BigInt(Math.round(requirement * 100000000));
                    if (amountInMicroCKBTC < 0) {
                        amountInMicroCKBTC = BigInt(0);
                    }
                    await TransferCKBTC(amountInMicroCKBTC, data.owner, data.subaccount!);
                } catch {
                    debug(' _Reward ckbtc');
                    paystate.value = 0;
                    ElMessage.error('Payment failure');
                }
            }
        };

        const isRefresh = ref(false);

        const LargeNumberComponent = (number) => {
            const formattedNumber = new BigNumber(number).toFixed();
            return formattedNumber;
        };

        return {
            dialogVisible,
            handleClose,
            afterClose,
            curIndex,
            chooseCurrency,
            confirm,
            state,
            curAmount,
            currencyICP,
            currencyCKBTC,
            chooseAmount,
            otherAmount,
            LargeNumberComponent,
            chooseOtherAmount,
            isChooseOtherAmount,
            getOrderBalance,
            copy,
            isRefresh,
            invoiceToBase64,
            pay,
            paystate,
            verify,
            nextLoading,
            address,
            store,
            money,
            payDisabled,
            showLoading,
            timeoutAnima,
        };
    },
});
</script>

<style lang="less" scoped>
.curbox {
    @apply w-full px-2;

    .payCurrency {
        @apply w-full flex items-center justify-between text-lg <sm:(flex-col justify-start items-start);

        .choose {
            @apply flex items-center ml-10 <sm:(ml-0 pt-3);

            span {
                @apply flex items-center whitespace-nowrap hover:(cursor-pointer) dark:(text-light-900/50);

                i {
                    @apply text-gray-300 mr-2 dark:(text-dark-50);
                }

                &:nth-child(2) {
                    @apply ml-8;
                }

                &.active {
                    @apply text-black dark:(text-light-900);

                    i {
                        @apply text-purple-500;
                    }
                }
            }
        }
    }

    .currencyBox {
        @apply w-full py-8 grid grid-cols-3 gap-6 <sm:(py-5 grid-cols-2 gap-4);

        .item {
            @apply w-full border border-gray-200 rounded-xl px-4 h-18 flex items-center justify-center dark:(border-dark-100) transition duration-300 hover:(transition duration-300 cursor-pointer border-2 border-purple-500) <sm:(h-15);

            img {
                @apply h-4;
            }

            span {
                @apply pl-3 text-black font-bold text-2xl dark:(text-light-900/60);
            }

            &.merge {
                @apply col-start-auto col-span-2 py-3;
            }

            &.active {
                @apply border-2 border-purple-500;

                span {
                    @apply dark:(text-light-900);
                }
            }

            &.ckbtc {
                span {
                    @apply text-xl;
                }

                img {
                    @apply h-5;
                }
            }

            .customize {
                @apply w-full px-1 bg-gray-200/60 rounded-lg flex justify-between items-center h-10 dark:(bg-dark-300) <sm:(px-0 m-0 bg-transparent dark:(bg-transparent));

                input {
                    @apply flex-1 border-transparent bg-transparent pl-3 text-lg text-black dark:(text-light-900) <sm:(pl-2);
                }

                i {
                    @apply text-black px-3 font-medium not-italic dark:(text-light-900/80);
                }
            }
        }
    }

    .mora-button {
        @apply px-0 mt-0;
    }

    .paybox {
        @apply w-full flex flex-col items-center justify-center;

        .qrcode {
            @apply w-44 border-2 border-gray-200 rounded-xl p-2 dark:(border-dark-100);

            img {
                @apply w-full;
            }

            p {
                @apply w-full block text-center text-sm text-black dark:(text-light-900/80 pt-2);
            }
        }

        .or {
            @apply w-full text-center py-2;
        }

        .payway {
            @apply w-full border-2 border-gray-200 rounded-xl px-5 py-10px transition duration-300 dark:(border-dark-100);

            &.active {
                @apply border-purple-500 transition duration-300;
            }

            &.send {
                @apply w-full;

                .header {
                    @apply w-full flex justify-between items-center;

                    .sendicp {
                        @apply text-base text-black dark:(text-light-900/80);

                        span {
                            @apply text-purple-500;
                        }
                    }

                    .icp {
                        @apply text-purple-500 mr-3;
                    }

                    i {
                        @apply text-gray-400 block w-5 h-5 text-sm cursor-pointer flex justify-center;
                    }

                    @keyframes rotateAnimation {
                        0% {
                            transform: rotate(0deg);
                        }

                        100% {
                            transform: rotate(360deg);
                        }
                    }

                    .refresh {
                        animation: rotateAnimation 2s linear infinite;
                    }
                }

                .addbox {
                    @apply w-full pt-2 flex justify-between items-center;

                    .address {
                        @apply flex-1 text-sm text-gray-400 break-all text-left;
                    }

                    .icon-copy {
                        @apply text-gray-400 ml-5 transition duration-300 hover:(transition duration-300 cursor-pointer text-gray-600);
                    }
                }
            }

            &.wallet {
                @apply flex py-3 items-center justify-between;

                .walletinfo {
                    @apply flex-1 flex;

                    i {
                        @apply text-2xl mr-3 dark:(text-light-900/60);
                    }

                    strong {
                        @apply block text-black dark:(text-light-900);
                    }
                }

                button {
                    @apply w-40 p-3 flex duration-300 opacity-100 justify-center items-center rounded-xl bg-purple-500 text-white transition duration-300 hover:(transition duration-300 bg-purple-400) <sm:(w-25 hover:(bg-purple-500));

                    &.disabled {
                        @apply opacity-60 duration-300 cursor-not-allowed;
                    }

                    img {
                        @apply h-4 mr-6px;
                    }
                }
            }
        }
    }
}

.paystate {
    @apply absolute w-full left-0 top-0 bottom-0 bg-light-50/60 rounded-2xl backdrop-filter backdrop-blur-sm flex flex-col justify-center items-center dark:(bg-dark-500/50);

    img {
        @apply w-13;
    }

    span {
        @apply pt-3 text-base block text-center;
    }
}
</style>
