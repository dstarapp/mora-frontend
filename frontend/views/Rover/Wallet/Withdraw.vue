<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Back } from '@element-plus/icons-vue';
import Record from './components/record.vue';
import store from '@/store';
import { useRoute } from 'vue-router';
import {
    getCkbtcTransactionsList,
    getICPTransactionsList,
    getMoraTransactionsList,
} from './components/getTransactions';
import {
    validatePrincipalId,
    validateAccountId,
    getAmountMax,
    getAmountMaxCKBTC,
    TransferICP,
    TransferCKBTC,
    TransferMora,
} from '@/utils/wallet';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { createActor } from '@/request/agent';
import { idlFactory as icnamingFactory } from '@/request/canister/icnaming.did';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import { decodeIcrcAccount } from '@/utils/ledger.utils';
import { IcrcAccount } from '@/utils/ledger.responses';
import { Principal } from '@dfinity/principal';
import { InitWallet, InitWalletCkBtc, InitWalletMora } from '@/utils/wallet';
import skeleton from './components/skeleton.vue';

const address = ref('');
const quantity = ref();
const optionsValue = ref('');
const bannerAddress = ref<string>('');
const banner = ref<number>();
const router = useRouter();
const route = useRoute();
const recordList = ref<any[] | undefined>(undefined);
const transferLoading = ref(false);
const icnamingCanisterAnonymous = ref();

const options = [
    {
        value: 'icp',
        label: 'ICP',
    },
    {
        value: 'ckbtc',
        label: 'CKBTC',
    },
    {
        value: 'mora',
        label: 'MORA',
    },
];

if (route.params.coin) {
    options.map((item) => {
        if (item.value === route.params.coin) {
            optionsValue.value = item.value;
        }
    });

    if (!optionsValue.value) {
        optionsValue.value = 'icp';
    }
} else {
    optionsValue.value = 'icp';
}

const goBack = () => {
    router.push({ name: 'roverWallet' });
};

const transfer = async () => {
    let addr = address.value;
    transferLoading.value = true;
    if (addr.includes('.ic') || addr.includes('.IC')) {
        const res = await icnamingCanisterAnonymous.value.get_record_value(addr.toLowerCase());
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
        const amount: any = parseFloat(quantity.value);
        if (isNaN(amount)) {
            return;
        }
        const icp = BigInt(Math.round(amount.toFixed(4) * 100 * 1_000_000));
        const height = await TransferICP(addr, icp, {});
        transferLoading.value = false;
        if (!height || height.Err) {
            debug('failed', height);
        } else {
            quantity.value = '';
            ElMessage.success(t(`roverWallet.success`));
            await InitWallet(store.state.user_principal);
            refresh();
        }
    });
};

const transferCKBTC = async () => {
    const addr = address.value;
    const amount = BigInt(Math.round(quantity.value * 100000000));
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
                await InitWalletCkBtc(store.state.user_principal);
                refresh();
            }
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
                await InitWalletCkBtc(store.state.user_principal);
                refresh();
            }
            transferLoading.value = false;
        } catch (err) {
            ElMessage.error('Transfer Error');
            transferLoading.value = false;
        }
    }
};

const transferMora = async () => {
    const addr = address.value;
    const amount = BigInt(Math.round(quantity.value * 100000000));
    transferLoading.value = true;
    if (addr.includes('.')) {
        try {
            const data: IcrcAccount = decodeIcrcAccount(addr);
            const res = await TransferMora(amount, data.owner, data.subaccount!);
            if (res.Err) {
                console.log(res);
                ElMessage.error('Transfer Error');
            } else {
                ElMessage.success(t(`roverWallet.success`));
                await InitWalletMora(store.state.user_principal);
                refresh();
            }
            transferLoading.value = false;
        } catch (err) {
            ElMessage.error('Transfer Error');
            transferLoading.value = false;
        }
    } else {
        try {
            const res = await TransferMora(amount, Principal.fromText(addr), []);
            if (res.Err) {
                console.log(res);
                ElMessage.error('Transfer Error');
            } else {
                ElMessage.success(t(`roverWallet.success`));
                await InitWalletMora(store.state.user_principal);
                refresh();
            }
            transferLoading.value = false;
        } catch (err) {
            ElMessage.error('Transfer Error');
            transferLoading.value = false;
        }
    }
};

const confirm = () => {
    transferLoading.value = true;
    if (optionsValue.value === 'icp' && store.state.wallet_address) {
        transfer();
    }
    if (optionsValue.value === 'ckbtc' && store.state.user_principal) {
        transferCKBTC();
    }
    if (optionsValue.value === 'mora' && store.state.user_principal) {
        transferMora();
    }
};

const goUrl = (str: string, coin: string) => {
    router.push({ name: str, params: { coin: coin } });
};

const onMax = () => {
    if (optionsValue.value === 'icp') {
        quantity.value = getAmountMax(banner.value);
    }
    if (optionsValue.value === 'ckbtc') {
        quantity.value = getAmountMaxCKBTC(banner.value);
    }
    if (optionsValue.value === 'mora') {
        quantity.value = getAmountMaxCKBTC(banner.value);
    }
};

const refresh = async () => {
    recordList.value = undefined;
    if (optionsValue.value === 'icp' && store.state.wallet_address) {
        recordList.value = await getICPTransactionsList();
    }
    if (optionsValue.value === 'ckbtc' && store.state.user_principal) {
        recordList.value = await getCkbtcTransactionsList();
    }
    if (optionsValue.value === 'mora' && store.state.user_principal) {
        recordList.value = await getMoraTransactionsList();
    }
};

const truncateDecimal = (value: number, decimalPlaces: number): number => {
    const power = Math.pow(10, decimalPlaces);
    return Math.trunc(value * power) / power;
};

watch(
    () => [
        optionsValue.value,
        store.state.wallet_address,
        store.state.mora_wallet_balance,
        store.state.ckbtc_wallet_balance,
    ],
    async () => {
        if (optionsValue.value === 'icp' && store.state.wallet_address) {
            bannerAddress.value = store.state.wallet_address;
            banner.value = store.state.wallet_balance;
            recordList.value = await getICPTransactionsList();
        }
        if (optionsValue.value === 'ckbtc' && store.state.user_principal) {
            bannerAddress.value = store.state.user_principal;
            banner.value = store.state.ckbtc_wallet_balance;
            recordList.value = await getCkbtcTransactionsList();
        }
        if (optionsValue.value === 'mora' && store.state.user_principal) {
            bannerAddress.value = store.state.user_principal;
            banner.value = store.state.mora_wallet_balance;
            recordList.value = await getMoraTransactionsList();
        }
    },
    {
        immediate: true,
        deep: true,
    },
);

watch(
    () => optionsValue.value,
    (val: string) => {
        recordList.value = undefined;
        quantity.value = '';
        goUrl('roverWithdraw', val);
    },
);

onMounted(() => {
    icnamingCanisterAnonymous.value = createActor(CONFIG.icnamingId, icnamingFactory);
});
</script>

<template>
    <div class="box">
        <h2>
            <i @click="goBack">
                <Back />
            </i>
            {{ $t('roverWallet.withdraw') }}
        </h2>
        <div class="con">
            <div class="item pb-10">
                <span class="num">1</span>
                <span class="line"></span>
                <h3>{{ $t('roverWallet.withdraws.t1') }}</h3>
                <el-select v-model="optionsValue" placeholder="Select" size="large">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="item">
                <span class="num">2</span>
                <div class="title">
                    <h3>
                        {{ $t('roverWallet.withdraws.t2') }}
                    </h3>
                    <em v-if="optionsValue === 'mora'">
                        {{ truncateDecimal(store.state.mora_wallet_balance, 4) }} {{ optionsValue }}
                    </em>
                    <em v-if="optionsValue === 'ckbtc'">
                        {{ store.state.ckbtc_wallet_balance }} {{ optionsValue }}
                    </em>
                    <em v-if="optionsValue === 'icp'">
                        {{ store.state.wallet_balance }} {{ optionsValue }}
                    </em>
                </div>

                <div class="inputbox">
                    <input type="text" :placeholder="$t('roverWallet.receive')" v-model="address" />
                </div>
                <div class="inputbox">
                    <input type="number" :placeholder="$t('roverWallet.quantity')" v-model="quantity" />
                    <span class="max" @click="onMax">{{ $t('roverWallet.max') }}</span>
                </div>
                <div class="mora-button" @click="confirm">
                    <!-- :class="address == '' || isLoading ? 'disabled' : ''" -->
                    <div class="confirm" :class="{
                disabled: !(
                    !transferLoading &&
                    (validatePrincipalId(address) ||
                        validateAccountId(address) ||
                        address.includes('.ic') ||
                        address.includes('.IC')) &&
                    quantity > 0 &&
                    quantity <=
                    (optionsValue === 'ckbtc'
                        ? getAmountMaxCKBTC(banner)
                        : getAmountMax(banner))
                ),
            }">
                        <img src="@/assets/svg/loading.svg" v-if="transferLoading" />
                        {{ $t('roverWallet.withdraw') }}
                    </div>
                </div>
            </div>
        </div>
        <h2 class="pt-10 mt-[30px]">{{ $t('roverWallet.withdraws.t3') }}</h2>

        <skeleton v-if="typeof recordList === 'undefined'" types="to" :options="optionsValue" />
        <Record v-else types="deposit" :list="recordList" :options="optionsValue" />
    </div>
</template>

<style lang="less" scoped>
.box {
    @apply w-full;

    h2 {
        @apply w-full flex items-center font-normal font-medium text-2xl text-black m-0 dark:(text-light-900);

        i {
            @apply cursor-pointer mr-3;

            svg {
                @apply w-7;
            }
        }
    }

    .con {
        @apply w-3/5 block mt-8 <sm:(w-full);

        .item {
            @apply pl-14 w-full relative <sm:(pl-10);

            .num {
                @apply w-8 h-8 rounded-full border text-center leading-7 absolute left-0 -top-1 dark:(border-dark-50 text-light-900/80);
            }

            .line {
                @apply w-1 absolute left-4 top-8 bottom-2 border-l border-dashed border-gray-300 dark:(border-dark-50);
            }

            .title {
                @apply flex w-full font-medium justify-between;

                h3 {
                    @apply font-medium;
                }

                em {
                    @apply not-italic inline-flex;
                }
            }

            :deep(.el-select) {
                @apply w-full mt-5;

                .el-input {
                    .el-input__wrapper {
                        @apply border-1 rounded-lg px-3;
                    }
                }
            }

            p {
                @apply text-gray-500 text-sm break-all;
            }

            .copy {
                @apply w-10 h-8 border rounded-lg ml-5 bg-transparent transition duration-300 dark:(border-dark-50) hover:(transition duration-300 bg-gray-100 dark:(bg-dark-300));

                i {
                    @apply text-gray-500;
                }
            }

            .inputbox {
                @apply mt-5 border rounded-lg text-sm overflow-hidden flex justify-between items-center dark:(border-dark-100);

                input {
                    @apply flex-1 border-transparent w-full h-full px-3 h-10 bg-transparent;
                }

                span {
                    @apply w-15 text-center;

                    &.max {
                        @apply text-purple-500 font-medium cursor-pointer;
                    }
                }
            }

            .mora-button {
                @apply px-0;
            }
        }
    }
}
</style>
