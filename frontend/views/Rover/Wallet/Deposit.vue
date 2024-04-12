<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { Back } from '@element-plus/icons-vue';
import Record from './components/record.vue';
import store from '@/store';
import { copyText } from '@/utils/functions';
import {
    getCkbtcTransactionsList,
    getICPTransactionsList,
    getMoraTransactionsList,
} from './components/getTransactions';
import skeleton from './components/skeleton.vue';

const optionsValue = ref('');

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
        value: 'roma',
        label: 'ROMA',
    },
];

const router = useRouter();
const route = useRoute();
const goBack = () => {
    router.push({ name: 'roverWallet' });
};
const bannerAddress = ref<string>('');
const recordList = ref<any[] | undefined>(undefined);

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

const goUrl = (str: string, coin: string) => {
    router.push({ name: str, params: { coin: coin } });
};

watch(
    () => [optionsValue.value, store.state.wallet_address],
    async () => {
        if (optionsValue.value === 'icp' && store.state.wallet_address) {
            bannerAddress.value = store.state.wallet_address;
            recordList.value = await getICPTransactionsList();
        }
        if (optionsValue.value === 'ckbtc' && store.state.user_principal) {
            bannerAddress.value = store.state.user_principal;
            recordList.value = await getCkbtcTransactionsList();
        }
        if (optionsValue.value === 'roma' && store.state.user_principal) {
            bannerAddress.value = store.state.user_principal;
            recordList.value = await getMoraTransactionsList();
        }
    },
    {
        immediate: true,
    },
);

watch(
    () => optionsValue.value,
    (val: string) => {
        recordList.value = undefined;
        goUrl('roverDeposit', val);
    },
);
</script>

<template>
    <div class="box">
        <h2>
            <i @click="goBack">
                <Back />
            </i>
            {{ $t('roverWallet.deposit') }}
        </h2>
        <div class="con">
            <div class="item pb-10">
                <span class="num">1</span>
                <span class="line"></span>
                <h3>{{ $t('roverWallet.deposits.t1') }}</h3>
                <el-select v-model="optionsValue" placeholder="Select" size="large">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </div>
            <div class="item">
                <span class="num">2</span>
                <h3>{{ $t('roverWallet.deposits.t2', [optionsValue.toUpperCase()]) }}</h3>
                <div class="flex justify-between items-center pt-3">
                    <p>{{ bannerAddress }}</p>
                    <button class="copy" @click="copyText(bannerAddress)">
                        <i class="iconfont icon-copy"></i>
                    </button>
                </div>
            </div>
        </div>
        <h2 class="pt-10">{{ $t('roverWallet.deposits.t3') }}</h2>

        <skeleton
            v-if="typeof recordList === 'undefined'"
            types="deposit"
            :options="optionsValue"
        />
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

            h3 {
                @apply w-full font-medium;
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
        }
    }
}
</style>
