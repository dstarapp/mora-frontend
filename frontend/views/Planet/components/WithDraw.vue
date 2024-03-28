<template>
    <el-dialog v-model="dialogVisible" :title="$t('planetDashboard.canister.withdraw')" :before-close="handleClose"
        @closed="afterClose">
        <div class="box">
            <span>{{ $t('planetDashboard.canister.address') }}</span>
            <div class="address">
                <input type="text" v-model="walletAddress" :placeholder="$t('planetDashboard.canister.receive')" />
            </div>
            <span>
                {{ $t('planetDashboard.canister.balance') }}:
                {{ lodash.floor(store.state.current_planet_wallet_balance, 4).toFixed(4) }}
                {{ $t('planetDashboard.canister.icpTitle') }}

                <i class="iconfont icon-refresh" :class="{ refresh: icpRefresh }" @click="refresh()"></i>
            </span>
            <div class="amount">
                <div class="inputbox">
                    <input type="number" v-model="amount" step="0.0001"
                        :placeholder="$t('planetDashboard.canister.amount')" />
                </div>
                <span>{{ $t('planetDashboard.canister.icpTitle') }}</span>
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
            !(
                validatePrincipalId(walletAddress) ||
                validateAccountId(walletAddress) ||
                walletAddress.includes('.ic') ||
                walletAddress.includes('.IC')
            ) ||
            amount <= 0 ||
            amount > getAmountMax(store.state.current_planet_wallet_balance),
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
    getAmountMax,
    fromHexString,
    get_account_id,
} from '@/utils/wallet';
import { getPid } from '@/utils/icnaming';
import debug from '@/utils/debug';
import store from '@/store';
import lodash from 'lodash';
import { getBalance } from '@/utils/wallet';

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
            isLoading.value = true;
            if (walletAddress.value.includes('.ic') || walletAddress.value.includes('.IC')) {
                let res = await getPid(walletAddress.value);
                if (res) {
                    walletAddress.value = res;
                } else {
                    ElMessage.error(t(`roverWallet.principalExist`));
                    isLoading.value = false;
                    return;
                }
            }
            if (validatePrincipalId(walletAddress.value)) {
                walletAddress.value = get_account_id(walletAddress.value);
            }
            try {
                let res = await planetCanister.value.canisterTransfer({
                    to: fromHexString(walletAddress.value),
                    memo: 0,
                    amount: Math.trunc(amount.value * 100000000),
                });
                if (res) {
                    isLoading.value = false;
                    handleClose();
                    ElMessage.success(t(`roverWallet.success`));
                    getPlanetBalance();
                } else {
                    isLoading.value = false;
                    ElMessage.success(t(`roverWallet.error`));
                }
            } catch (err) {
                debug('failed', err);
                isLoading.value = false;
                ElMessage.error(t(`roverWallet.error`));
            }
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const handleMax = () => {
            amount.value = getAmountMax(store.state.current_planet_wallet_balance);
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
            validatePrincipalId,
            validateAccountId,
            getAmountMax,
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

@media screen and (min-width: 0) and (max-width: 750px) {
    .box {
        .padding(0, 15, 0, 15);
    }
}
</style>
