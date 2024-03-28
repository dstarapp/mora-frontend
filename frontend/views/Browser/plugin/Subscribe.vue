<template>
    <el-drawer
        v-model="isShow"
        direction="rtl"
        :class="{ countdownEnd: !countdowning }"
        :before-close="handleClose"
        :title="componentData.expireTime ? $t('pay.subscribe.renewal') : $t('pay.subscribe.title')"
        :size="subWidth"
    >
        <template #default>
            <div class="box" v-if="step === 1">
                <div class="combo">
                    <template v-if="!componentData.subType && !componentData.hideFree">
                        <h3>{{ $t('pay.subscribe.basic') }}</h3>
                        <div
                            class="items mb-8 free"
                            :class="{ active: isFreeSubscribe }"
                            @click="freeSubscribe"
                        >
                            <div class="days">{{ $t('pay.free') }}</div>
                            <div class="price !text-sm">
                                {{ $t('pay.onlyPublic') }}
                            </div>
                        </div>
                    </template>
                    <h3>{{ $t('pay.subscribe.paid') }}</h3>
                    <div
                        class="items"
                        :class="{ active: index === checkState }"
                        v-for="(item, index) in subprices"
                        :key="index"
                        @click="Check(index, item)"
                    >
                        <div class="days">{{ Object.keys(item.subType)[0] }}</div>
                        <div class="price">
                            <i class="not-italic text-sm">$</i
                            >{{ (Number(item.price) / 10000).toFixed(2) }}
                            <div class="icp" v-if="currentRate">
                                <span>≈</span>
                                {{ (Number(item.price) / 10000 / currentRate).toFixed(3) }}
                                {{ $t('pay.subscribe.icp') }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full mt-8 px30">
                    <div class="combotime" v-if="checkState !== -1">
                        <i class="iconfont icon-time"></i>
                        {{ generateListDueTime() }}
                    </div>
                    <div class="tips">
                        <i class="iconfont icon-attention"></i>
                        {{ $t('pay.subscribe.tip') }}
                    </div>
                    <button
                        class="browserBtn w-full"
                        :class="{
                            disabled: checkState === -1 && !isFreeSubscribe,
                            loading: generateOrderLoading,
                        }"
                        @click="Pay"
                    >
                        <img src="@/assets/svg/loading.svg" v-show="generateOrderLoading" />
                        {{
                            isFreeSubscribe
                                ? $t('btns.sub')
                                : !generateOrderLoading
                                ? $t('pay.btn')
                                : $t('pay.subscribe.generatorder')
                        }}
                    </button>
                </div>
            </div>

            <div class="box" v-else>
                <div class="w-full flex-1 overflow-y-auto">
                    <div class="orderbox">
                        <div class="card">
                            <h3>{{ $t('pay.subscribe.information') }}</h3>
                            <h4>{{ $t('pay.subscribe.subscriptionDuration') }}</h4>
                            <div class="subcombo">
                                <div>
                                    {{ currentCheck && Object.keys(currentCheck.subType)[0] }}
                                </div>
                                <div class="price">
                                    <div class="icp">
                                        {{ getAmount(invoice.amount) }}
                                        {{ $t('pay.subscribe.icp') }}
                                    </div>
                                </div>
                            </div>
                            <div class="orderdate">{{ dueTime }}</div>
                        </div>
                        <div class="px-5">
                            <div class="ordernum">
                                <span>{{ $t('pay.subscribe.invoice') }}</span>
                                <span>{{ invoice.id }}</span>
                            </div>
                            <div class="changeorder" @click="prevStep">
                                {{ $t('pay.subscribe.order') }}
                            </div>
                        </div>
                    </div>
                    <div class="payment">
                        <h3>{{ $t('pay.subscribe.method') }}</h3>
                        <div class="remaintime">
                            <span>{{ $t('pay.remaintime') }}</span>
                            <div class="timer">
                                <i class="iconfont icon-time"></i>
                                <span>{{ countdownText }}</span>
                            </div>
                        </div>
                        <div v-if="invoiceToBase64" class="qrcode">
                            <div class="imgbox">
                                <img :src="invoiceToBase64" alt="" />
                                <!-- <div class="qrlogo">
                                    <div>
                                        <img src="@/assets/svg/me.svg" alt="" />
                                    </div>
                                </div> -->
                            </div>
                            <p>{{ $t('pay.qrcodeTxt') }}</p>
                        </div>
                        <div class="or">{{ $t('pay.subscribe.or') }}</div>
                        <div class="payway send">
                            <div class="header">
                                <div class="sendicp">
                                    {{ $t('pay.subscribe.send') }}
                                    <span>{{ getAmount(invoice.amount) }}</span>
                                    {{ $t('pay.subscribe.to') }}
                                </div>
                                <div class="flex justify-between">
                                    <span class="icp">
                                        {{ orderBalance.toFixed(4) }}
                                        {{ $t('pay.subscribe.icp') }}
                                    </span>
                                    <i
                                        class="iconfont icon-refresh"
                                        :class="{ refresh: isRefresh }"
                                        @click="getOrderBalance"
                                    ></i>
                                </div>
                            </div>
                            <div class="addbox">
                                <div class="address">
                                    {{ toHexString(invoice.to) }}
                                </div>
                                <i @click="copy" class="iconfont icon-copy"></i>
                            </div>
                        </div>
                        <div class="or">{{ $t('pay.subscribe.or') }}</div>

                        <div v-if="isAstrox" class="paywallet">
                            <div class="payway plugin" @click="checkPay('astrox')">
                                {{ $t('pay.astrox') }}
                                <img src="@/assets/svg/logo-astrox.svg" />
                            </div>
                        </div>
                        <div v-else-if="store.state.current_login_way === 'plug'" class="paywallet">
                            <div class="payway plugin" @click="checkPay('plug')">
                                {{ $t('pay.plug') }}
                                <img src="@/assets/svg/logo-plug.png" />
                            </div>
                        </div>
                        <div v-else class="payway walletbox">
                            <div class="wallet">
                                <div>
                                    <i class="iconfont icon-wallet"></i>
                                    {{ $t('pay.balance') }}
                                </div>
                                <span>
                                    {{ store.state.wallet_balance }} {{ $t('pay.subscribe.icp') }}
                                </span>
                            </div>
                            <button
                                class="browserBtn disabled"
                                :class="{
                                    actrive:
                                        store.state.wallet_balance >= getAmount(invoice.amount),
                                }"
                                @click="checkPay('wallet')"
                            >
                                <img src="@/assets/svg/loading.svg" v-show="startSubscribe" />
                                {{ $t('pay.btn') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <transition name="el-fade-in-linear">
                <div class="successModel" v-if="startSubscribe">
                    <transition name="order">
                        <div class="successBox">
                            <strong
                                @click="startSubscribe = false"
                                class="iconfont icon-close"
                            ></strong>
                            <template v-if="submitOrder == 0">
                                <div class="loading">
                                    <img src="@/assets/svg/loading2.svg" />
                                    <span>{{ $t('pay.successModel.wait') }}</span>
                                </div>
                            </template>
                            <template v-if="submitOrder == 1">
                                <div class="loading">
                                    <img src="@/assets/svg/loading2.svg" />
                                    <span>{{ $t('pay.successModel.successful') }}</span>
                                </div>
                            </template>
                            <template v-if="submitOrder == 2">
                                <i class="iconfont icon-chose"></i>
                                <span>{{ $t('pay.successModel.succeeded') }}</span>
                            </template>
                        </div>
                    </transition>
                </div>
            </transition>
        </template>
    </el-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from 'vue';
import debug from '@/utils/debug';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@/i18n';
import { toHexString, getAccountBalance, TransferICP, getBalance } from '@/utils/wallet';
import { getAmount, copyText, getAmountICP } from '@/utils/functions';
import moment from 'moment';
import countdown from './countdown.js';
import CONFIG from '@/assets/config';
import store from '@/store';
import bus from 'vue3-eventbus';
import { getRate } from '@/request/axios/bv';
import QRCode from 'qrcode';

export default defineComponent({
    props: {
        componentData: {
            type: Object,
            default: '',
        },
    },
    emits: ['componentClose'],
    setup(props, context) {
        const subWidth = document.body.clientWidth > 1024 ? '450px' : '100%';
        const checkState = ref(-1);
        const isFreeSubscribe = ref(false);
        const isShow = ref(true);
        const state = ref(0);
        const step = ref(1);
        const isRefresh = ref(false);
        const payMethod = ref('');
        const subprices = ref<any[]>([]);
        const currentCheck = ref();
        const generateOrderLoading = ref(false);
        const invoice = ref();
        const dueTime = ref();
        const orderBalance = ref(0);
        const orderBalanceTimeOut = ref();
        const startSubscribe = ref(false);
        const submitOrder = ref(0);
        const currentRate = ref(0);
        const invoiceToBase64 = ref();
        const countdowning = ref(true);
        const countdownText = ref();
        const payCountdownTimeout = ref();

        const connectClient: any = inject('connectClient', null);
        const browserPlanetID: any = inject('browserPlanetID', null);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const planetCanister: any = inject('planetCanister', null);

        const isAstrox = ref<boolean>(
            !!(window as any).icx && /[Mm][Ee]\/\d+\.\d+\.\d+$/.test(window.navigator.userAgent),
        );

        const prevStep = () => {
            step.value = 1;
            clearTimeout(orderBalanceTimeOut.value);
        };

        const Check = (num: number, item) => {
            if (checkState.value !== num) {
                checkState.value = num;
                currentCheck.value = item;
                isFreeSubscribe.value = false;
            } else {
                checkState.value = -1;
                currentCheck.value = '';
            }
        };

        const Pay = async () => {
            if (isFreeSubscribe.value) {
                context.emit('componentClose');
                bus.emit('browserOpenComponent', {
                    type: 'FreeSubscribe',
                    expireTime: '',
                });
                clearTimeout(orderBalanceTimeOut.value);
                return;
            }
            if (!currentCheck.value) {
                return;
            }
            if (generateOrderLoading.value) {
                return;
            }
            generateOrderLoading.value = true;
            const key = Object.keys(currentCheck.value.subType)[0];
            const res = await planetCanister.value.preSubscribe('Mora', {
                price: currentCheck.value.price,
                subType: {
                    [key]: null,
                },
            });
            generateDueTime(key);
            if (res.Err) {
                ElMessage.error(res.Err);
            }
            if (res.Ok) {
                invoice.value = res.Ok.invoice;
                invoiceToBase64.value = await QRCode.toDataURL(toHexString(invoice.value.to));
                step.value = 2;
                clearTimeout(orderBalanceTimeOut.value);
                let createdTime = res.Ok.invoice.createdTime;
                createdTime = Math.trunc(Number(createdTime));
                createdTime = new Date(createdTime);
                payCountdown(createdTime.getTime() + CONFIG.payCountdownTime);
                getOrderBalance();
            }
            generateOrderLoading.value = false;
        };

        const freeSubscribe = () => {
            isFreeSubscribe.value = !isFreeSubscribe.value;
            checkState.value = -1;
        };

        const generateDueTime = (key) => {
            const timeMapping = {
                Day30: 30 * 86400,
                Day90: 90 * 86400,
                Day180: 180 * 86400,
                Day360: 360 * 86400,
                Day1000: 1000 * 86400,
            };
            const time = timeMapping[key];
            if (!timeMapping[key]) {
                dueTime.value = t('pay.subscribe.permanent');
                return;
            }
            dueTime.value = moment(
                (props.componentData.expireTime
                    ? Number(props.componentData.expireTime)
                    : Date.now()) +
                    time * 1000,
            ).format('MMMM Do YYYY');
        };

        const generateListDueTime = () => {
            const key = Object.keys(subprices.value[checkState.value].subType)[0];
            if (key === 'Permanent') return 'Permanent';
            const timeMapping = {
                Day30: 30 * 86400,
                Day90: 90 * 86400,
                Day180: 180 * 86400,
                Day360: 360 * 86400,
                Day1000: 1000 * 86400,
            };
            const time = timeMapping[key];
            if (!timeMapping[key]) {
                dueTime.value = t('pay.subscribe.permanent');
                return;
            }
            return moment(
                (props.componentData.expireTime
                    ? Number(props.componentData.expireTime)
                    : Date.now()) +
                    time * 1000,
            ).format('MMMM Do YYYY');
        };

        const getOrderBalance = async () => {
            clearTimeout(orderBalanceTimeOut.value);
            isRefresh.value = true;
            setTimeout(() => {
                isRefresh.value = false;
            }, 300);

            const res = await getAccountBalance(invoice.value.to);
            orderBalance.value = res;
            if (orderBalance.value >= getAmount(invoice.value.amount)) {
                clearTimeout(orderBalanceTimeOut.value);
                submitOrder.value = 1;
                startSubscribe.value = true;
                subscribeTo();
                return;
            }
            orderBalanceTimeOut.value = setTimeout(() => {
                getOrderBalance();
            }, CONFIG.orderBalanceInterval);
        };

        const checkPay = (methodPayment) => {
            const _pay = async () => {
                startSubscribe.value = true;
                submitOrder.value = 0;
                try {
                    await TransferICP(
                        toHexString(invoice.value.to),
                        BigInt(Math.ceil(getAmount(invoice.value.amount) * 10 ** 8)),
                        {},
                        methodPayment,
                    );
                } catch (err) {
                    debug('failed _pay', err);
                    startSubscribe.value = false;
                    submitOrder.value = 0;
                }
            };

            const _astroxPay = async () => {
                startSubscribe.value = true;
                submitOrder.value = 0;
                try {
                    await connectClient.activeProvider.requestTransfer({
                        amount: getAmountICP(getAmount(invoice.value.amount)),
                        to: toHexString(invoice.value.to),
                        symbol: 'ICP',
                        standard: 'ICP',
                        fee: 10000,
                    });
                } catch (err) {
                    debug(' _astroxPay', err);
                    startSubscribe.value = false;
                    submitOrder.value = 0;
                }
            };

            if (methodPayment === 'wallet') {
                if (store.state.wallet_balance < getAmount(invoice.value.amount)) {
                    ElMessage.warning(t('planet.lackBalance'));
                    return;
                }
                ElMessageBox.confirm(
                    `${getAmount(invoice.value.amount)} ${t('planet.paymentConfirmation.content')}`,
                    t('planet.paymentConfirmation.title'),
                    {
                        confirmButtonText: t('planet.paymentConfirmation.confirm'),
                        cancelButtonText: t('planet.paymentConfirmation.cancel'),
                        type: 'warning',
                    },
                )
                    .then(() => {
                        _pay();
                    })
                    .catch(() => {});
            } else if (methodPayment === 'astrox') {
                _astroxPay();
            } else {
                _pay();
            }
        };

        const subscribeTo = async () => {
            const subscribe = await planetCanister.value.subscribe(invoice.value.id);
            if (!subscribe) {
                ElMessage.error(t('planet.subscribeError'));
            } else {
                clearTimeout(orderBalanceTimeOut.value);
                submitOrder.value = 2;
                bus.emit('browserSubscribeSuccess');

                setTimeout(() => {
                    startSubscribe.value = false;
                    context.emit('componentClose', true);
                    clearTimeout(orderBalanceTimeOut.value);
                }, 1000);
            }
            startSubscribe.value = false;
        };

        const payCountdown = (endDate) => {
            const _countdown = () => {
                clearTimeout(payCountdownTimeout.value);
                const remainingTime = countdown(endDate);

                const minutes =
                    remainingTime.minutes < 10
                        ? `0${remainingTime.minutes}`
                        : remainingTime.minutes;
                const seconds =
                    remainingTime.seconds < 10
                        ? `0${remainingTime.seconds}`
                        : remainingTime.seconds;

                countdownText.value = `${minutes}:${seconds}`;

                if (remainingTime.value <= -1000) {
                    payCountdownTimeout.value = setTimeout(() => {
                        _countdown();
                    }, 1000);
                } else {
                    countdowning.value = false;
                    countdownText.value = `00:00`;
                }
            };

            _countdown();
        };

        const handleClose = () => {
            if (startSubscribe.value) {
                return;
            }
            ElMessageBox.confirm(t('pay.subscribe.closeContent'), t('pay.subscribe.closeTitle'), {
                confirmButtonText: t('pay.subscribe.closeOk'),
                cancelButtonText: t('pay.subscribe.closeCancel'),
                type: 'warning',
            })
                .then(() => {
                    context.emit('componentClose');
                    clearTimeout(orderBalanceTimeOut.value);
                    clearTimeout(payCountdownTimeout.value);
                })
                .catch(() => {});
        };

        const copy = () => {
            copyText(toHexString(invoice.value.to));
        };

        const rate = async () => {
            const res = await getRate();
            currentRate.value = parseFloat(res.data[0]);
        };

        onMounted(() => {
            subprices.value = browserPlanetUserData.value.subprices;
            subprices.value.map((item, index) => {
                if (Number(item.price) / 10000 >= 100000) {
                    subprices.value.splice(index, 1);
                }
            });
            if (store.state.current_login_way === 'ii') {
                getBalance();
            }
            rate();
        });

        return {
            subWidth,
            checkState,
            subprices,
            isShow,
            state,
            step,
            isRefresh,
            payMethod,
            invoiceToBase64,
            generateOrderLoading,
            invoice,
            isFreeSubscribe,
            dueTime,
            currentCheck,
            orderBalance,
            store,
            startSubscribe,
            submitOrder,
            currentRate,
            countdowning,
            isAstrox,
            countdownText,
            generateDueTime,
            generateListDueTime,
            copy,
            getOrderBalance,
            prevStep,
            subscribeTo,
            handleClose,
            toHexString,
            getAmount,
            freeSubscribe,
            Check,
            checkPay,
            Pay,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full pb-7 flex flex-col justify-between h-full relative;

    .combo {
        @apply flex-1 pt-8 overflow-y-auto px-30px;
        .scrollbar();

        h3 {
            @apply w-full block text-lg font-medium;
        }

        .items {
            @apply w-full h-12 mt-6 border-2 border-gray-200 rounded-xl px-5 py-10px flex justify-between items-center cursor-pointer transition duration-300 dark:(border-dark-100);
            position: relative;

            .days {
                @apply text-gray-500 dark:(text-light-900/60);
            }

            .price {
                @apply text-black flex items-center text-xl dark:(dark:(text-light-900));

                .icp {
                    @apply text-base text-gray-500 dark:(text-light-900/60);

                    span {
                        @apply px-1;
                    }
                }
            }

            &.free {
                .price {
                    @apply text-gray-500;
                }
            }

            &.active {
                @apply border-purple-500 transition duration-300;

                .days {
                    @apply text-purple-500;
                }

                .price {
                    @apply text-purple-500 dark:(text-purple-500);

                    .icp {
                        @apply text-purple-500;
                    }
                }
            }
        }
    }

    .px30 {
        @apply px-30px;
    }

    .combotime {
        @apply w-full px-30px flex items-center justify-center py-2 mb-4 bg-gray-100 px-3 rounded-lg text-sm text-dark-50/80 dark:(bg-dark-400 text-light-900/60);

        i {
            @apply mr-2 text-dark-50/60 text-sm dark:(text-light-900/60);
        }
    }

    .tips {
        @apply w-full pb-5 text-gray-400 text-sm;

        i {
            @apply text-gray-300;
            margin-right: 4px;
        }
    }

    .orderbox {
        @apply mx-30px mt-8 bg-light-300 rounded-xl dark:(bg-dark-300);

        .card {
            @apply w-full py-4 px-5 rounded-xl bg-indigo-500 text-white shadow shadow-xl shadow-gray-900/10;

            h3 {
                @apply w-full text-lg pb-2 font-medium;
            }

            h4 {
                @apply w-full text-sm text-indigo-200;
            }

            .subcombo {
                @apply py-2 flex justify-between;

                .price {
                    @apply flex items-center text-xl;

                    .icp {
                        @apply text-base px-1;
                    }
                }
            }

            .orderdate {
                @apply w-full pt-1 text-yellow-300 text-sm text-right;
            }
        }

        .ordernum {
            @apply w-full flex justify-between py-3 border-b border-dashed border-light-900;

            span {
                &:first-child {
                    @apply text-gray-400;
                }
            }
        }

        .changeorder {
            @apply w-full py-3 text-right text-purple-500 font-bold text-sm cursor-pointer;
        }
    }

    .payment {
        @apply w-full mt-6 mb-10 px-30px;

        h3 {
            @apply w-full text-lg mb-2 font-medium;
        }

        .remaintime {
            @apply w-full my-5 rounded-lg px-4 py-2 flex justify-between items-center text-sm bg-gray-100 px-3 rounded-lg text-sm text-dark-50/80 dark:(bg-dark-400 text-light-900/60);

            .timer {
                @apply ml-5 text-right flex items-center;

                i {
                    @apply mr-1 text-xs;
                }

                span {
                    @apply font-medium text-black dark:(text-light-900);
                }
            }
        }

        .qrcode {
            @apply w-45 mt-3 mx-auto border-2 rounded-xl border-gray-200 overflow-hidden dark:(border-dark-100);

            .imgbox {
                @apply w-full relative;

                img {
                    @apply w-45 h-45;
                }

                .qrlogo {
                    @apply absolute w-full top-0 bottom-0 flex items-center justify-center;

                    div {
                        @apply w-8 h-8 border-2 bg-black rounded-lg flex justify-center items-center;
                        border-color: #65cecf;

                        img {
                            @apply w-4/5;
                        }
                    }
                }
            }

            p {
                @apply w-full block text-center pb-3 px-5 font-bold text-sm -mt-1 dark:(pt-2);
            }
        }

        .payway {
            @apply border-2 border-gray-200 rounded-xl px-5 py-10px transition duration-300 dark:(border-dark-100);

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
                }

                .addbox {
                    @apply w-full pt-2 flex justify-between items-center;

                    .address {
                        @apply flex-1 text-sm text-gray-400 break-all;
                    }

                    .icon-copy {
                        @apply text-gray-400 ml-5 transition duration-300 hover:(transition duration-300 cursor-pointer text-gray-600);
                    }
                }
            }

            &.walletbox {
                @apply w-full py-3 mb-5 cursor-pointer;

                .wallet {
                    @apply flex justify-between items-center;

                    .icon-wallet {
                        @apply text-xl mr-1 text-black dark:(text-light-900/80);
                    }

                    span {
                        @apply text-sm;
                    }
                }
            }

            &.plugin {
                width: 100%;
                @apply flex justify-between items-center cursor-pointer hover:(border-purple-500);

                img {
                    @apply h-5;
                }
            }

            .browserBtn {
                @apply w-full !mt-4 !mb-2;
            }
        }

        .or {
            @apply w-full py-4 block text-center <2xl:(py-3);
        }

        .paywallet {
            @apply w-full flex justify-center items-center;
        }
    }
}

.successModel {
    @apply absolute w-full top-0 bottom-0 bg-light-50/85 flex flex-col-reverse dark:(bg-dark-300/85);

    .successBox {
        @apply py-12 px-10 flex flex-col bottom-0 bg-white rounded-tl rounded-tl-2xl rounded-tr rounded-tr-2xl z-50 dark:(bg-dark-300);
        box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1);
        position: relative;

        .icon-close {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 14px;
            color: #000;
            cursor: pointer;
            transition: @transition;
            @apply dark:(text-light-900);

            &:hover {
                color: @text-active;
                transition: @transition;
            }
        }

        i {
            @apply text-6xl mx-auto text-green-500;

            &.icon-order {
                @apply text-gray-400;
            }

            &.icon-chose {
                @apply text-green-500;
            }
        }

        span {
            @apply w-full pt-5 pb-8 text-base text-center text-dark-700 dark:(text-light-900/80);
        }

        .browserBtn {
            @apply w-3/5 mx-auto;
        }

        .loading {
            @apply w-full;

            img {
                @apply mx-auto w-16 mt-10;
            }

            span {
                @apply w-full text-center block;
            }
        }
    }
}

.refresh {
    animation: refresh 1s linear infinite;
}

.order-enter-active {
    -webkit-animation: to-top 0.2s ease-in;
    animation: to-top 0.2s ease-in;
}

@-webkit-keyframes to-top {
    0% {
        -webkit-transform: translateY(200px);
        transform: translateY(200px);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateY(0);
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes to-top {
    0% {
        -webkit-transform: translateY(200px);
        transform: translateY(200px);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateY(0);
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
