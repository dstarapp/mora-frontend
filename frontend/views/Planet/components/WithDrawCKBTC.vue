<template>
    <el-dialog v-model="dialogVisible" :title="$t('planetDashboard.canister.withdraw')" :before-close="handleClose"
        @closed="afterClose">
        <div class="box">
            <span>{{ $t('planetDashboard.canister.address') }}</span>
            <div class="address">
                <input type="text" v-model="walletAddress" :placeholder="$t('planetDashboard.canister.receive2')" />
            </div>
            <span>
                {{ $t('planetDashboard.canister.balance') }}:
                {{ store.state.current_planet_wallet_balance_ckbtc }}
                CKBTC

                <i class="iconfont icon-refresh" :class="{ refresh: icpRefresh }" @click="refresh()"></i>
            </span>
            <div class="amount">
                <div class="inputbox">
                    <input type="number" v-model="amount" step="0.0001"
                        :placeholder="$t('planetDashboard.canister.amount')" />
                </div>
                <span>CKBTC</span>
                <button @click="handleMax">
                    {{ $t('planetDashboard.canister.max') }}
                </button>
            </div>
        </div>
        <div class="mora-button" translate="no">
            <div class="cancel" @click="cancel">
                {{ $t('planetTips.updates.cancel') }}
            </div>
            <div class="confirm" :class="{
        disabled:
            isLoading ||
            !walletAddress ||
            !amount ||
            !validatePrincipalId(walletAddress) ||
            amount <= 0 ||
            amount > getAmountMaxCKBTC(store.state.current_planet_wallet_balance_ckbtc),
    }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetDashboard.canister.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import {
    validatePrincipalId,
    validateAccountId,
    getAmountMaxCKBTC,
    TransferCKBTC,
} from '@/utils/wallet';
import { getPid } from '@/utils/icnaming';
import debug from '@/utils/debug';
import store from '@/store';
import lodash from 'lodash';
import { getBalance } from '@/utils/wallet';
import { decodeIcrcAccount } from '@/utils/ledger.utils';
import { IcrcAccount } from '@/utils/ledger.responses';
import { Principal } from '@dfinity/principal';

export default defineComponent({
    emits: ['componentClose'],
    name: 'WithDraw',
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const amount = ref();
        const walletAddress = ref();
        const planetCanister: any = inject('planetCanister', null);
        const getPlanetBalance: any = inject('getPlanetBalance', null);
        const getPlanetBalanceCKBTC: any = inject('getPlanetBalanceCKBTC', null);
        const icpRefresh = ref(false);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('planetTips.updates.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const refresh = () => {
            getBalance(store.state.current_planet_wallet_address, false);
            icpRefresh.value = true;
            setTimeout(() => {
                icpRefresh.value = false;
            }, 300);
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = async () => {
            if (isLoading.value === true) {
                return;
            }
            if (!validatePrincipalId(walletAddress.value) && !walletAddress.value.includes('.')) {
                return;
            }
            isLoading.value = true;
            let amountCKBTC = BigInt(Math.round(amount.value * 100000000));

            try {
                let res = await planetCanister.value.icrc1_transfer({
                    to: {
                        owner: Principal.fromText(walletAddress.value),
                        subaccount: [],
                    },
                    token: 'CKBTC',
                    from_subaccount: [],
                    memo: [],
                    amount: amountCKBTC,
                });

                if (res.Err) {
                    console.log(res);
                    ElMessage.error('Transfer Error');
                } else {
                    ElMessage.success(t(`roverWallet.success`));
                    getPlanetBalanceCKBTC();
                }
                isLoading.value = false;
            } catch (err) {
                console.log(err);
                ElMessage.error('Transfer Error');
                isLoading.value = false;
            }
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const handleMax = () => {
            amount.value = getAmountMaxCKBTC(store.state.current_planet_wallet_balance_ckbtc);
        };

        return {
            store,
            walletAddress,
            dialogVisible,
            isLoading,
            amount,
            lodash,
            icpRefresh,
            refresh,
            getAmountMaxCKBTC,
            validatePrincipalId,
            validateAccountId,
            handleClose,
            afterClose,
            confirm,
            cancel,
            handleMax,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    .padding(0, 35, 0, 35);

    span {
        width: 100%;
        display: flex;
        .font-size(14);
        padding-bottom: 5px;
        text-align: left;

        >i {
            margin-left: auto;
            font-size: 14px;
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }

    .address {
        width: 100%;
        .padding(10, 15, 10, 15);
        .font-size(16);
        .margin(0, 0, 20, 0);
        .border-radius(12);
        text-align: left;
        border: 1px solid @border-color;
        @apply dark:(border-dark-100);

        input {
            border: none;
            width: 100%;
            background: none;
        }
    }

    .amount {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        .border-radius(12);
        border: 1px solid @border-color;
        @apply dark:(border-dark-100);

        .inputbox {
            flex: 1;

            input {
                width: 100%;
                border: none;
                line-height: 35px;
                background: none;
            }
        }

        span {
            padding: 0 10px;
            width: auto;
        }

        button {
            border: none;
            background: none;
            color: @text-active;
            .font-size(16);
            cursor: pointer;
        }
    }
}

.disabled {
    pointer-events: none;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .box {
        .padding(0, 15, 0, 15);
    }
}
</style>
