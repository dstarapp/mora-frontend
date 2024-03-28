<template>
    <div class="subscription">
        <div class="info">
            <div class="left">
                <span>
                    <p>{{ $t('planetSubscription.info.hour') }}</p>
                    <strong>{{
                        store.state.current_planet_data &&
                            store.state.current_planet_data.last24subcriber
                            ? store.state.current_planet_data.last24subcriber.toString()
                            : 0
                    }}</strong>
                </span>
                <span>
                    <p>{{ $t('planetSubscription.info.total') }}</p>
                    <strong>{{
                        store.state.current_planet_data
                            ? store.state.current_planet_data.subcriber.toString()
                            : ''
                    }}</strong>
                </span>
                <span>
                    <p>{{ $t('planetSubscription.info.income') }}</p>
                    <strong>
                        {{
                        store.state.current_planet_data
                            ? getAmount(store.state.current_planet_data.income, 2)
                            : ''
                    }}
                        ICP
                    </strong>
                </span>
            </div>
            <div class="right">
                <el-select :teleported="false" class="classificationSelect" v-model="classificationSelect"
                    @change="classificationChange">
                    <el-option v-for="item in classificationList" :key="item.key" :label="item.val" :value="item.key" />
                </el-select>
                <div class="addBlack" @click="addBlackList">
                    {{ $t('planetSubscription.addBlack') }}
                </div>
            </div>
        </div>
        <div class="list" v-if="isLoading">
            <Skeleton v-for="i in 8" :key="i" />
        </div>
        <div class="bottom" v-else-if="listData.length">
            <div class="list">
                <SubscriptionList v-for="(item, idx) in listData" :key="idx" :subscriptionData="item"
                    :isBlack="classificationSelect" />
            </div>
            <Pagination v-if="listData.length" :total="total" :currentPage="currentPage" :pageSize="size" @next="next"
                @prev="prev" @goPage="goPage" />
        </div>
        <div class="noData" v-if="!listData.length && !isLoading">
            <i class="iconfont icon-no"></i>
            <p>{{ $t('roverDashboard.noData') }}</p>
        </div>
    </div>
    <AddBlack v-if="isAddBlackShow" @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, inject, nextTick, provide } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SubscriptionList from './components/SubscriptionList.vue';
import { t } from '@/i18n';
import store from '@/store';
import Skeleton from './components/Skeleton.vue';
import AddBlack from './components/AddBlack.vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getAmount } from '@/utils/functions';
import debug from '@/utils/debug';

export default defineComponent({
    components: { Pagination, SubscriptionList, Skeleton, AddBlack },
    name: 'Subscription',
    setup() {
        const router = useRouter();
        const currentPage = ref(1);
        const total = ref();
        const size = ref(16);
        const listData: any = ref([]);
        const isLoading = ref(true);
        const isAddBlackShow = ref(false);
        const classificationSelect = ref(1);
        const classificationList = ref([
            {
                key: 1,
                val: t('planetSubscription.classificationList.all'),
            },
            {
                key: 2,
                val: t('planetSubscription.classificationList.blacklist'),
            },
        ]);
        const planetCanister: any = inject('planetCanister', null);

        const prev = () => {
            currentPage.value = currentPage.value - 1;
            if (classificationSelect.value === 1) {
                getSubscriptionList();
            } else if (classificationSelect.value === 2) {
                getBlackList();
            }
        };

        const next = () => {
            currentPage.value = currentPage.value + 1;
            if (classificationSelect.value === 1) {
                getSubscriptionList();
            } else if (classificationSelect.value === 2) {
                getBlackList();
            }
        };

        const goPage = (num) => {
            currentPage.value = parseInt(num);
            if (classificationSelect.value === 1) {
                getSubscriptionList();
            } else if (classificationSelect.value === 2) {
                getBlackList();
            }
        };

        const classificationChange = () => {
            currentPage.value = 1;
            if (classificationSelect.value === 1) {
                getSubscriptionList();
            } else if (classificationSelect.value === 2) {
                getBlackList();
            }
        };

        const getSubscriptionList = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            isLoading.value = true;
            try {
                let res = await planetCanister.value.adminSubcribers({
                    page: currentPage.value,
                    size: size.value,
                    sort: { TimeAsc: null },
                });
                if (res) {
                    listData.value = res.data;
                    isLoading.value = false;
                    total.value = Number(res.total.toString());
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const getBlackList = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            isLoading.value = true;
            try {
                let res = await planetCanister.value.adminBlackUsers({
                    page: currentPage.value,
                    size: size.value,
                    sort: { TimeAsc: null },
                });
                if (res) {
                    listData.value = res.data;
                    isLoading.value = false;
                    total.value = Number(res.total.toString());
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const addBlackList = () => {
            isAddBlackShow.value = true;
        };

        const componentClose = () => {
            isAddBlackShow.value = false;
        };

        watch(
            () => store.state.agent,
            (val: any) => {
                if (val) {
                    getSubscriptionList();
                    clearNotice();
                }
            },
        );

        const clearNotice = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            try {
                let res = await planetCanister.value.resetSubscriberNew();
                if (res) {
                    debug('success', res, false);
                } else {
                    debug('failed', res);
                }
            } catch (err) {
                debug('failed', err);
            }
        };

        onMounted(() => {
            if (store.state.agent) {
                nextTick(() => {
                    getSubscriptionList();
                    clearNotice();
                });
            }
        });

        provide('getSubscriptionList', getSubscriptionList);
        provide('getBlackList', getBlackList);

        return {
            store,
            currentPage,
            total,
            size,
            listData,
            classificationSelect,
            classificationList,
            isLoading,
            isAddBlackShow,
            prev,
            next,
            goPage,
            classificationChange,
            getAmount,
            addBlackList,
            componentClose,
        };
    },
});
</script>

<style scoped lang="less">
.subscription {
    display: flex;
    flex-direction: column;
    width: 100%;
    .border-radius(25);
    max-width: 1512px;
    min-height: 700px;
    margin: 0 auto 25px auto;

    .info {
        display: flex;
        width: 100%;
        .padding(20, 0, 30, 0);
        justify-content: center;
        align-items: center;

        .left {
            display: flex;

            span {
                display: flex;
                .margin(0, 45, 0, 0);

                p {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(22);
                    color: @text-fcolor;
                }

                strong {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(22);
                    color: @text-color;

                    padding-left: 4px;
                    white-space: nowrap;
                    @apply dark:(text-light-900);
                }
            }
        }

        .right {
            display: flex;
            .font-size(18);
            .line-height(22);
            position: relative;
            z-index: 2;

            .addBlack {
                .center();
                border: 2px solid @border-color;
                box-sizing: border-box;
                transition: @transition;
                color: @text-fcolor;
                border-radius: 10px;
                margin-left: 15px;
                padding: 0 10px;
                height: 38px;
                font-size: 14px;
                cursor: pointer;
                @apply dark:(border-dark-100 text-light-900/80);

                &:hover {
                    border: 2px solid @bg-color-body-active;
                    transition: @transition;
                    color: @text-active;
                }
            }

            .classificationSelect {
                .width(163);
                // .height(45);

                :deep(.select-trigger) {
                    height: 100%;

                    .el-input {
                        background: @bg-color;
                        height: 100%;
                        @apply dark:(bg-dark-300);

                        .el-input__wrapper {
                            border-radius: 10px;
                            height: 40px;
                        }
                    }
                }
            }

            .search {
                .center();
                .width(238);
                .margin(0, 0, 0, 45);
                background: @bg-color-grey;
                border: 2px solid @bg-color-grey;
                .border-radius(15);
                transition: @transition;

                &.active {
                    border: 2px solid @border-color-active;
                    background-color: @text-color-inverse;
                    transition: @transition;
                }

                .icon-search {
                    display: flex;
                    .font-size(14);
                    color: #ccc;
                    .margin(0, 0, 0, 15);
                }

                :deep(.el-input) {
                    height: 100%;

                    // .el-input__wrapper {
                    //   .padding(0, 12, 0, 12);
                    // }
                }
            }

            button {
                .center();
                border: none;
                .font-size(14);
                .padding(0, 20, 0, 20);
                .margin(0, 0, 0, 15);
                border: 2px solid @border-color;
                background-color: @text-color-inverse;
                .border-radius(12);
                transition: @transition;
                @apply dark:(bg-dark-300 text-light-900/80 border-dark-100);

                &:hover {
                    border: 2px solid @border-color-active;
                    background-color: @text-color-inverse;
                    transition: @transition;
                    @apply dark:(bg-dark-700);
                }

                .icon-export {
                    .font-size(18);
                    color: @text-color-grey;
                    .margin(0, 8, 0, 0);
                }
            }
        }
    }

    .bottom {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 700px;
    }

    .list {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        .grid-gap(35, 30);
    }

    :deep(.pagination) {
        .margin(75, 0, 0, 0);

        .el-input {
            background: @bg-color;
            @apply dark:(bg-transparent);
        }
    }

    .noData {
        .center();
        .font-size(70);
        width: 100%;
        flex-direction: column;
        height: 100%;
        margin-top: 20%;

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
}

@media screen and (min-width: 1040px) and (max-width: 1240px) {
    .subscription {
        .list {
            grid-template-columns: repeat(3, 1fr);
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .subscription {
        .info {
            .padding(15, 0, 25, 0);

            .left {
                span {
                    display: flex;
                    align-items: center;
                    .margin(0, 25, 0, 0);

                    p {
                        .width(150);
                        .font-size(14);
                        .line-height(16);
                        text-align: right;
                    }

                    strong {
                        .font-size(22);
                        padding-left: 10px;
                    }
                }
            }

            .right {
                .search {
                    .width(320);
                    .margin(0, 0, 0, 30);
                }
            }
        }

        .list {
            grid-template-columns: repeat(2, 1fr);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .subscription {
        .info {
            flex-direction: column;
            .padding-media(25, 0, 20, 0);

            .left {
                width: 100%;

                span {
                    width: 30%;
                    .margin-media(0, 30, 0, 0);
                    flex-direction: column;

                    p {
                        .font-size(14);
                        .line-height(17);
                    }

                    strong {
                        .margin(10);
                        .font-size(18);
                    }

                    &:last-child {
                        margin-right: 0;

                        strong {
                            .margin(27);
                        }
                    }

                    &:nth-child(3) {
                        flex: 0.6;
                    }
                }
            }

            .right {
                width: 100%;
                .margin(16);

                .classificationSelect {
                    width: 48%;
                    height: auto;
                    max-height: none;
                    min-height: auto;
                    // :deep(.el-input) {
                    //   .el-input__wrapper {
                    //     .border-radius(10);
                    //   }
                    // }
                }

                .search {
                    display: flex;
                    flex: 1;
                    .margin(0, 0, 0, 23);
                    background: @bg-color-grey;
                }

                button {
                    width: 48%;
                }
            }
        }

        .list {
            grid-template-columns: repeat(1, 1fr);
            .grid-gap-media(25, 0);
        }
    }
}

:deep(.el-select) {
    .el-input {
        .el-input__wrapper {
            .border-radius(12);
            @apply dark:(border-dark-100);

            .el-input__inner {
                @apply dark:(text-light-900/80);
            }

            .el-input__suffix {
                .el-input__suffix-inner {
                    .el-select__caret {
                        @apply dark:(text-light-900/80);
                    }
                }
            }
        }
    }
}
</style>
