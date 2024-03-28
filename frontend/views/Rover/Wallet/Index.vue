<template>
    <div class="wallet">
        <h2>
            {{ $t('roverWallet.t1') }}
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </h2>
        <div class="sbox">
            <div class="search">
                <i class="iconfont icon-search"></i>
                <input type="text" v-model="searchVal" placeholder="search coin" />
            </div>
            <div class="flex <sm:(w-full justify-between items-center)">
                <button @click="goUrl('roverDeposit', 'icp')">Deposit</button>
                <button @click="goUrl('roverWithdraw', 'icp')">WithDraw</button>
            </div>
        </div>

        <div class="w-full overflow-x-auto">
            <div class="list head">
                <div class="item">Coin</div>
                <div class="item">Amount</div>
                <div class="item">Actions</div>
            </div>
            <div class="list" v-show="searchVal === '' || 'icp'.includes(searchVal.toLocaleLowerCase())">
                <div class="item">
                    <img src="@/assets/images/pic-icp.jpg" alt="" />
                    ICP
                </div>
                <div class="item">
                    {{ store.state.wallet_balance!.toFixed(4) }}
                </div>
                <div class="item">
                    <span @click="goUrl('roverDeposit', 'icp')">Deposit</span>
                    <span @click="goUrl('roverWithdraw', 'icp')">WithDraw</span>
                </div>
            </div>
            <div class="list" v-show="searchVal === '' || 'ckbtc'.includes(searchVal.toLocaleLowerCase())">
                <div class="item">
                    <img src="@/assets/svg/ckbtc-icon.svg" alt="" />
                    ckbtc
                </div>
                <div class="item">
                    {{ store.state.ckbtc_wallet_balance }}
                </div>
                <div class="item">
                    <span @click="goUrl('roverDeposit', 'ckbtc')">Deposit</span>
                    <span @click="goUrl('roverWithdraw', 'ckbtc')">WithDraw</span>
                </div>
            </div>
            <div class="list" v-show="searchVal === '' || 'mora'.includes(searchVal.toLocaleLowerCase())">
                <div class="item">
                    <img src="https://infura-ipfs.mora.host/ipfs/QmdhjBCsaCaZr7Qmxz47Ujg8E5zSieWyrhjFffnBbXM5Wd"
                        alt="" />
                    mora
                </div>
                <div class="item">
                    {{ truncateDecimal(store.state.mora_wallet_balance, 4) }}
                </div>
                <div class="item">
                    <span @click="goUrl('roverDeposit', 'mora')">Deposit</span>
                    <span @click="goUrl('roverWithdraw', 'mora')">WithDraw</span>
                </div>
            </div>
            <!-- <div
                v-for="item in tokenList"
                :key="item.tick"
                class="list"
                v-show="searchVal === '' || item.tick.includes(searchVal.toLocaleLowerCase())"
            >
                <div class="item">
                    <img :src="item.uri" alt="" />
                    {{ item.tick }}
                </div>
                <div class="item">100000</div>
                <div class="item">
                    <span>Deposit</span>
                    <span>WithDraw</span>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router';
import { InitWallet, InitWalletCkBtc, InitWalletMora } from '@/utils/wallet';

const router = useRouter();
const goUrl = (str: string, coin: string) => {
    router.push({ name: str, params: { coin: coin } });
};

const searchVal = ref<string>('');

const isRefresh = ref(false);
const refresh = async () => {
    isRefresh.value = true;
    await InitWallet(store.state.user_principal);
    await InitWalletCkBtc(store.state.user_principal);
    await InitWalletMora(store.state.user_principal);
};

const truncateDecimal = (value: number, decimalPlaces: number): number => {
    const power = Math.pow(10, decimalPlaces);
    return Math.trunc(value * power) / power;
};

</script>

<style lang="less" scoped>
.wallet {
    @apply w-full;

    h2 {
        @apply flex justify-between items-center font-normal font-medium text-2xl text-black m-0 dark:(text-light-900);

        i {
            @apply text-xl ml-auto cursor-pointer;
            color: @text-color-grey;

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

    .sbox {
        @apply w-full flex justify-between items-center mt-8 <sm:(flex-col);

        .search {
            @apply w-3/5 px-3 border rounded-xl flex items-center dark:(border-dark-100) <sm:(w-full);

            i {
                @apply text-gray-300 mr-3 dark:(text-dark-50);
            }

            input {
                @apply w-full h-10 bg-transparent;
            }
        }

        button {
            @apply bg-transparent rounded-xl border h-10 text-sm px-3 text-gray-500 transition duration-300 dark:(border-dark-50 text-gray-400) hover:(transition duration-300 bg-gray-100 dark:(bg-dark-300)) <sm:(w-12/25 mt-5);

            &:first-child {
                @apply mr-3 text-purple-500 border-purple-500 transition duration-300 hover:(transition duration-300 bg-purple-500 text-white) <sm:(mr-0);
            }
        }
    }

    .list {
        @apply w-full min-w-100 flex items-center border-b py-3 dark:(border-dark-100) transition duration-300 hover:(transition duration-300 bg-light-100 dark:(bg-dark-400));

        &.head {
            @apply mt-5 hover:(bg-transparent);

            .item {
                @apply text-gray-400 text-sm;
            }
        }

        .item {
            &:first-child {
                @apply w-2/5 flex items-center;

                img {
                    @apply mr-3 w-8 rounded-full overflow-hidden;
                }
            }

            &:nth-child(2) {
                @apply w-2/5 <sm:(w-1/5);
            }

            &:last-child {
                @apply w-1/5 <sm:(w-2/5);
            }

            span {
                @apply text-purple-500 text-sm hover:(underline underline-purple-500 underline-offset-4 cursor-pointer);

                &:first-child {
                    @apply mr-5;
                }
            }
        }
    }
}
</style>
