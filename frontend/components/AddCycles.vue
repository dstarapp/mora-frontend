<template>
    <el-dialog :title="$t('planetTips.addCycles.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="conversion">
            <div class="item">
                <div class="input">
                    <el-input :disabled="!rate" maxlength="5" v-model="icpVal" />
                </div>
                <div class="unit">ICP</div>
            </div>
            <i class="iconfont icon-exchange"></i>
            <div class="item">
                <div class="input">
                    <p>{{ !icpVal ? '' : (icpVal * rate).toFixed(2) }}</p>
                </div>
                <div class="unit">T</div>
            </div>
        </div>

        <div class="operation">
            <div class="btn wallet" :class="{ active: payWay === 1 }" @click="chosePay(1)">
                <div>
                    <i class="iconfont icon-wallet"></i>
                    {{ $t('planetTips.addCycles.wallet') }}
                </div>
                <span> {{ store.state.wallet_balance }} ICP </span>
            </div>
            <div class="pay right" @click="pay" :class="{
        disable:
            !icpVal ||
            payWay === -1 ||
            isLoading ||
            store.state.wallet_balance - 0.0002 < icpVal,
    }">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetTips.addCycles.pay') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import store from '@/store';
import { LoadIcpCycleRate, getBalance, DepositCycles } from '@/utils/wallet';
import { Principal } from '@dfinity/principal';

export default defineComponent({
    name: 'Updates',
    emits: ['componentClose', 'refreshCycles'],
    props: {
        componentData: {
            type: Object || Array,
            default: [],
        },
        principalID: {
            type: String,
            default: '',
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref();
        const icpVal = ref();
        const payWay = ref(-1);
        const rate = ref();

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.warning(t('planetTips.addCycles.transferring'));
                return;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const chosePay = (num: number) => {
            if (payWay.value == num) {
                payWay.value = -1;
            } else {
                payWay.value = num;
            }
        };

        const pay = async () => {
            if (payWay.value === -1) {
                return;
            }
            if (isLoading.value) {
                return;
            }
            if (!icpVal.value || icpVal.value === '0') {
                ElMessage.warning(t('planetTips.addCycles.agreementEmpty'));
                return;
            }
            if (store.state.wallet_balance - 0.0002 < icpVal.value) {
                ElMessage.error(t('planetTips.addCycles.agreementNot'));
                return;
            }

            isLoading.value = true;
            let amount = BigInt(icpVal.value * 100 * 1_000_000);
            try {
                let res = await DepositCycles(
                    Principal.fromText(
                        props.principalID ? props.principalID : store.state.current_open_planet,
                    ),
                    amount,
                    payWay.value === 1 ? 'ii' : 'plug',
                );
                if (res) {
                    getBalance(store.state.wallet_address);
                    ElMessage.success(t('planetTips.addCycles.agreementSuccess'));
                    isLoading.value = false;
                    nextTick(() => {
                        context.emit('refreshCycles');
                    });
                    handleClose();
                }
            } catch (err) {
                debug('error', err);
                isLoading.value = false;
            }
        };

        const jumpLink = () => {
            window.open(CONFIG.addCyclesLink);
        };

        onMounted(() => {
            nextTick(async () => {
                getBalance(store.state.wallet_address);
                rate.value = await LoadIcpCycleRate();
            });
        });

        return {
            dialogVisible,
            isLoading,
            icpVal,
            payWay,
            store,
            rate,
            jumpLink,
            handleClose,
            afterClose,
            pay,
            chosePay,
        };
    },
});
</script>

<style scoped lang="less">
.conversion {
    display: flex;
    .padding(0, 35, 0, 35);
    align-items: center;
    .margin(13, 0, 0, 0);

    .item {
        display: flex;
        align-items: center;
        flex: 1;
        .height(50);
        background: @bg-color-grey;
        .border-radius(10);
        @apply dark:(bg-dark-900);

        .input {
            display: flex;
            background: @bg-color;
            .border-radius(8);
            .margin(2, 9, 2, 2);
            .height(46);
            flex: 1;
            background: url(@/assets/svg/add-cycles-bg.svg) no-repeat;
            background-size: cover;
            @apply dark:(bg-none);

            :deep(.el-input) {
                .el-input__wrapper {
                    padding: 0;
                    @apply dark:( !bg-transparent);

                    .el-input__inner {
                        height: 100%;
                        font-style: normal;
                        .font-size(24);
                        color: @text-color;
                        text-align: center;
                        @apply dark:(text-light-900);
                    }
                }
            }

            p {
                .center();
                width: 100%;
                height: 100%;
                font-style: normal;
                font-weight: 700;
                .font-size(24);
                color: @text-color;
                text-align: center;
                @apply dark:(text-light-900);
            }
        }

        .unit {
            .center();
            .width(44);
            .height(26);
            .margin(0, 10, 0, 0);
            background: @bg-color;
            color: @text-color;
            border: 2px solid @bg-color-grey;
            .border-radius(18);
            // .margin(14, 13, 0, 0);
            .font-size(16);
            @apply dark:(bg-dark-300 text-light-900 border-dark-300);

            @media screen and (min-width: 0) and (max-width: 750px) {
                .font-size(10);
            }
        }
    }

    .icon-exchange {
        .font-size(20);
        .margin(0, 30, 0, 30);
        color: @text-color;
        @apply dark:(text-light-900/60);
    }
}

.operation {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .padding(0, 35, 0, 35);
    .margin(30, 0, 0, 0);

    .btn {
        .center();
        .height(45);
        width: 30%;
        border: 2px solid @border-color;
        box-sizing: border-box;
        .border-radius(10);
        .font-size(16);
        color: @text-color;
        cursor: pointer;
        transition: @transition;
        .padding(0, 20, 0, 20);
        @apply dark:(text-light-900/80 border-dark-100);

        &.wallet {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .margin(0, 0, 20, 0);

            i {
                .font-size(20);
            }

            span {
                color: @text-fcolor;
                .font-size(14);
            }
        }

        img {
            height: 50%;
            width: auto;
            .margin(0, 6, 0, 0);
        }

        &:hover,
        &.active {
            border-color: @border-color-active;
            transition: @transition;
        }
    }

    .pay {
        .center();
        background-color: @bg-color-body-active;
        width: 30%;
        .height(45);
        .border-radius(10);
        .font-size(16);
        color: @text-color-inverse;
        cursor: pointer;
        transition: @transition;

        &.right {
            margin-left: auto;
        }

        &.disable {
            background: @bg-color-body-disable;
            cursor: not-allowed;
        }

        &.loading {
            transition: @transition;
            background: @bg-color-body-loading;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

.tip {
    font-style: normal;
    font-weight: 325;
    .font-size(14);
    .line-height(17);
    text-align: right;
    color: @text-active;
    .margin(26);
    .padding(0, 40, 0, 40);
    cursor: pointer;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .conversion {
        .padding(0, 10, 0, 10);

        .icon-exchange {
            .font-size(14);
            .margin(0, 15, 0, 15);
        }
    }

    .operation {
        .padding-media(0, 15, 0, 15);

        .btn {
            width: 47%;
            .height(84);
        }

        .pay {
            width: 100%;
            .height(84);
            .margin(20, 0, 0, 0);
        }
    }
}
</style>
