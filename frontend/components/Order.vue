<template>
    <el-dialog v-model="dialogVisible" :title="$t('subOrder.title')" @closed="afterClose" class="w900">
        <div class="box" v-if="!loading">
            <el-table :data="orderList" style="width: 100%">
                <el-table-column prop="id" :label="$t('subOrder.header.h1')" width="140" />
                <el-table-column prop="createdTime" :label="$t('subOrder.header.h2')" width="210" />
                <el-table-column prop="amountToFixed" :label="$t('subOrder.header.h3')" width="160" />
                <el-table-column prop="ICPBalanceToFixed" :label="$t('subOrder.header.h4')" width="110" />
                <el-table-column prop="type" :label="$t('subOrder.header.h5')" width="110" />
                <el-table-column fixed="right" :label="$t('subOrder.header.h6')" width="120">
                    <template #default="{ row }">
                        <span v-if="row.orderStatus === 1">
                            {{ titleSuccess }}
                        </span>
                        <span v-if="row.orderStatus === 2">
                            {{ titleVoid }}
                        </span>
                        <span class="refund" @click="showRefund(row)" v-if="row.orderStatus === 3">
                            {{ titleRefund }}
                        </span>
                        <span v-if="row.orderStatus === 4">
                            {{ titleRefunded }}
                        </span>
                        <span v-if="row.orderStatus === 5">
                            {{ titleSuccess }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="noData" v-else>
            <img src="@/assets/svg/loading2.svg" />
        </div>
    </el-dialog>
    <teleport to="body">
        <Refund v-if="isShowRefund" :refundData="refundData" :planetID="planetID?.toString()"
            @componentClose="hideRefund" />
    </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, provide } from 'vue';
import Refund from './Refund.vue';
import store from '@/store';
import debug from '@/utils/debug';
import moment from 'moment';
import CONFIG from '@/assets/config';
import { t } from '@/i18n';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { idlFactory as ledgerFactory } from '@/request/canister/ledger.did';

export default defineComponent({
    name: 'Order',
    emits: ['componentClose'],
    components: { Refund },
    props: {
        planetID: {
            type: String,
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const planetCanister = ref();
        const ledgerActor = ref();
        const orderList = ref([]);
        const loading = ref(true);
        const isShowRefund = ref(false);
        const refundData = ref();

        const showRefund = (item) => {
            refundData.value = item;
            isShowRefund.value = true;
        };

        const titleSuccess = ref(t('subOrder.orderStatus.success'));
        const titleVoid = ref(t('subOrder.orderStatus.void'));
        const titleRefund = ref(t('subOrder.orderStatus.refund'));
        const titleRefunded = ref(t('subOrder.orderStatus.refunded'));

        const hideRefund = () => {
            isShowRefund.value = false;
            getOrderList();
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const getBalance = async (item) => {
            let to = item.to;
            try {
                let res = await ledgerActor.value.account_balance({ account: to });
                let ICPBalance = Number(res.e8s) / 100000000;
                item.ICPBalance = Number(res.e8s);
                item.ICPBalanceToFixed = ICPBalance.toFixed(4);
                if (item.type === 'Free') {
                    item.orderStatus = 1;
                } else if (item.ICPBalance >= 0.0001 * 100000000) {
                    item.orderStatus = 3;
                } else if (item.amountPaid === 0) {
                    item.orderStatus = 2;
                } else if (item.status === 'Refunded') {
                    item.orderStatus = 4;
                } else if (item.status === 'Paid') {
                    item.orderStatus = 5;
                }
            } catch (err) {
                debug('error', err);
            }
        };

        const getOrderList = async () => {
            try {
                let res = await planetCanister.value.queryOrders({
                    page: 1,
                    size: 99999,
                    sort: {
                        TimeDesc: null,
                    },
                });
                if (!res.data.length) {
                    orderList.value = [];
                    loading.value = false;
                    return;
                }
                let arr = res.data.map((item) => {
                    let obj: any = {};
                    obj.id = Number(item.id);
                    obj.createdTime = moment(Number(item.createdTime)).format('llll');
                    obj.amount = Number(item.amount);
                    obj.amountToFixed = (Number(item.amount) / 100000000).toFixed(4);
                    obj.to = item.to;
                    obj.status = Object.keys(item.status)[0];
                    obj.type = Object.keys(item.paytype.Price.subType)[0];
                    obj.amountPaid = Number(item.amountPaid);
                    return obj;
                });
                orderList.value = arr;
                orderList.value.map((item) => {
                    getBalance(item);
                });
                loading.value = false;
            } catch (err) {
                dialogVisible.value = false;
                loading.value = false;
                debug('error', err);
            }
        };

        const init = async () => {
            planetCanister.value = await createActor(
                props.planetID,
                planetFactory,
                store.state.agent,
            );

            ledgerActor.value = await createActor(CONFIG.ledgerId, ledgerFactory);
            getOrderList();
        };

        onMounted(() => {
            init();
        });

        provide('planetCanister', planetCanister);

        return {
            dialogVisible,
            orderList,
            isShowRefund,
            refundData,
            titleSuccess,
            titleVoid,
            titleRefund,
            titleRefunded,
            loading,
            afterClose,
            hideRefund,
            showRefund,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full overflow-y-auto;
    max-height: calc(100vh - 350px);

    span {
        &.refund {
            @apply text-purple-500 text-sm font-medium transition duration-300 hover:(transition duration-300 text-purple-400 cursor-pointer);
            cursor: pointer;
        }
    }

    &> :deep(.el-table) {
        th {
            &.el-table__cell {
                @apply dark:( !bg-dark-600);
            }
        }

        .el-table__body-wrapper {
            tr {
                td {
                    &.el-table-fixed-column--right {
                        @apply dark:( !bg-dark-600);
                    }
                }
            }
        }
    }
}

.noData {
    @apply w-full h-50 flex justify-center items-center;

    img {
        @apply w-8 h-8;
    }
}
</style>
