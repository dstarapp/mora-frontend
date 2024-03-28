<template>
    <el-skeleton animated class="record" v-if="transactionsListCKBTC.length < 0">
        <template #template>
            <div class="table">
                <div class="header">
                    <p>{{ $t('roverWallet.list.Type') }}</p>
                    <p>{{ $t('roverWallet.list.From') }}</p>
                    <p>{{ $t('roverWallet.list.Amount') }}</p>
                    <p>{{ $t('roverWallet.list.Date') }}</p>
                    <p>{{ $t('roverWallet.list.Detail') }}</p>
                </div>
                <div class="item" v-for="(item, index) in 6" :key="index">
                    <p><el-skeleton-item variant="text" style="width: 90%" /></p>
                    <p><el-skeleton-item variant="text" /></p>
                    <p><el-skeleton-item variant="text" /></p>
                    <p><el-skeleton-item variant="text" style="width: 90%" /></p>
                    <p><el-skeleton-item variant="text" /></p>
                </div>
            </div>
        </template>
    </el-skeleton>
    <div v-else>
        <div class="record" v-if="transactionsListCKBTC.length">
            <div class="table">
                <div class="header">
                    <p>{{ $t('roverWallet.list.Type') }}</p>
                    <p>{{ $t('roverWallet.list.From') }}</p>
                    <p>{{ $t('roverWallet.list.Amount') }}</p>
                    <p>{{ $t('roverWallet.list.Date') }}</p>
                    <p>{{ $t('roverWallet.list.Detail') }}</p>
                </div>
                <div class="item" v-for="(item, index) in transactionsListCKBTC" :key="index">
                    <p>{{ item.kind }}</p>
                    <p>
                        <span>{{ item.from.owner.toString() }}</span>
                    </p>
                    <p>{{ LargeNumberComponent(Number(item.amount) / 100000000) }} CKBTC</p>
                    <p>{{ format_date(item.timestamp) }}</p>
                    <p @click="openExplorer(item.id)">
                        {{ $t('roverWallet.list.Explorer') }}
                    </p>
                </div>
            </div>
        </div>
        <div class="noData" v-else>
            <i class="iconfont icon-no"></i>
            <p>{{ $t('roverDashboard.noData') }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { format_amount2, format_date } from '@/utils/functions';
import { LoadTransaction } from '@/utils/wallet';
import CONFIG from '@/assets/config';
import store from '@/store';
import { idlFactory as ckbtcRecordFactory } from '@/request/canister/ckbtcRecord.did';
import { createActor } from '@/request/agent';
import { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';

export default defineComponent({
    setup() {
        const transactionsListCKBTC: any = ref([]);

        const openExplorer = (id) => {
            window.open(`https://dashboard.internetcomputer.org/bitcoin/transaction/${Number(id)}`);
        };

        const LargeNumberComponent = (number) => {
            const formattedNumber = new BigNumber(number).toFixed();
            return formattedNumber;
        };

        const getListCKBTC = async () => {
            let ckbtcRecordCanister = createActor(CONFIG.ckbtcRecordsCanister, ckbtcRecordFactory);
            try {
                let list: any = await ckbtcRecordCanister.get_account_transactions({
                    max_results: 9999,
                    start: [],
                    account: {
                        owner: Principal.fromText(store.state.current_open_planet as string),
                        subaccount: [],
                    },
                });
                let data = list.Ok.transactions.map((item) => {
                    return {
                        ...item.transaction.transfer[0],
                        id: item.id,
                        kind: item.transaction.kind,
                        timestamp: parseInt(Number(item.transaction.timestamp) / 1000000),
                    };
                });
                transactionsListCKBTC.value = data;
            } catch (err) {
                console.log(err);
                transactionsListCKBTC.value = [];
            }
        };

        onMounted(() => {
            getListCKBTC();
        });

        return {
            transactionsListCKBTC,
            LargeNumberComponent,
            format_date,
            format_amount2,
            openExplorer,
            getListCKBTC,
        };
    },
});
</script>

<style lang="less" scoped>
.record {
    width: 100%;

    .table {
        width: 100%;
        .margin(15, 0, 30, 0);

        .header {
            display: flex;
            width: 100%;
            align-items: center;
            .height(60);

            p {
                font-style: normal;
                .font-size(14);
                color: @text-color-grey;
                text-align: left;

                &:first-child {
                    .width(150);
                }

                &:nth-child(2) {
                    flex: 1;
                    box-sizing: border-box;
                    .ellipsis();
                }

                &:nth-child(3) {
                    .width(150);
                    box-sizing: border-box;
                    .padding(0, 0, 0, 10);
                    .ellipsis();
                }

                &:nth-child(4) {
                    flex: 1;
                }

                &:nth-child(5) {
                    .width(70);
                }
            }
        }

        .item {
            display: flex;
            width: 100%;
            .height(60);
            align-items: center;
            border-bottom: 1px solid @border-color;
            @apply dark:(border-dark-100);

            &:last-child {
                border-bottom: none;
            }

            p {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                color: @text-color-grey;
                text-align: left;

                span {
                    max-width: 220px;
                    .ellipsisMore(1);
                }

                &:first-child {
                    .width(150);
                    color: @text-color;

                    @apply dark:(text-light-900);
                }

                &:nth-child(2) {
                    flex: 1;
                    box-sizing: border-box;
                    overflow: hidden;
                    word-break: break-all;
                }

                &:nth-child(3) {
                    .width(150);
                    .padding(0, 0, 0, 10);
                    box-sizing: border-box;
                    overflow: hidden;
                    word-break: break-all;
                }

                &:nth-child(4) {
                    flex: 1;
                    margin-left: 1%;
                }

                &:nth-child(5) {
                    .width(70);
                    color: @text-active;

                    &:hover {
                        cursor: pointer;
                        font-weight: 500;
                    }
                }
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                .height(90);
            }
        }
    }
}
.noData {
    .center();
    .font-size(70);
    .margin(100, 0, 50, 0);
    flex-direction: column;

    i {
        .font-size(70);
        color: #dddddd;
    }

    p {
        font-style: normal;
        font-weight: 400;
        .font-size(16);
        .line-height(19);
        .margin(10, 0, 0, 0);
        color: @text-color-grey;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .record {
        .table {
            .header {
                p {
                    &:first-child {
                        width: 90px;
                    }

                    &:nth-child(2),
                    &:nth-child(3) {
                        display: none;
                    }

                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6) {
                        flex: 1;
                    }
                }
            }

            .item {
                p {
                    &:first-child {
                        width: 90px;
                    }

                    &:nth-child(2),
                    &:nth-child(3) {
                        display: none;
                    }

                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6) {
                        flex: 1;
                    }
                }
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .record {
        .table {
            .header {
                p {
                    &:first-child {
                        width: 100px;
                    }

                    &:nth-child(2) {
                        flex: 1;
                    }

                    &:nth-child(3) {
                        display: none;
                    }

                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6) {
                        flex: 1;
                    }
                }
            }

            .item {
                p {
                    &:first-child {
                        width: 100px;
                    }

                    &:nth-child(2) {
                        flex: 1;
                    }

                    &:nth-child(3) {
                        display: none;
                    }

                    &:nth-child(4),
                    &:nth-child(5),
                    &:nth-child(6) {
                        flex: 1;
                    }
                }
            }
        }
    }
}
</style>
