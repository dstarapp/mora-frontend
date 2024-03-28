<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Pagination from '@/components/Pagination.vue';
import TransferInscription from './components/Transfer.vue';
import SplitInscription from './components/Split.vue';
import Imgurl from '@/assets/images/mora-20.png'

const dataList = ref([
    { ordinal: '10001', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 3 },
    { ordinal: '10002', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10003', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10004', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10005', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 2 },
    { ordinal: '10006', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10007', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10008', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10009', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10010', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10011', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10012', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10013', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10014', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
    { ordinal: '10015', picurl: Imgurl, name: "mora", p: "mora-20", amt: "1000", status: 1 },
])
const loading = ref(true);

const init = async () => {
    setTimeout(() => {
        loading.value = false;
    }, 1500);
};

onMounted(() => {
    init();
});

const aloading = ref(false);
const cloading = ref(false);
const Approve = () => {
    aloading.value = true;
}
const Cancel = () => {
    cloading.value = true;
}

const tstate = ref(false);
const Transfer = () => {
    tstate.value = true;
}

const sstate = ref(false);
const amount = ref();
const Split = (amt: number) => {
    sstate.value = true;
    amount.value = amt;
}

const close = () => {
    tstate.value = false;
    sstate.value = false;
}

</script>

<template>
    <el-skeleton class="insbox" v-if="loading" :count="15" animated>
        <template #template>
            <div class="item">
                <div class="imgbox">
                    <el-skeleton-item variant="image" class="w-full h-32" />
                </div>
                <p><el-skeleton-item variant="h1" class="w-20" /></p>
                <p><el-skeleton-item variant="p" class="w-30 h-4" /></p>
                <p><el-skeleton-item variant="p" class="w-30 h-4" /></p>
                <div class="transfer">
                    <el-skeleton-item variant="button" style="width:47%;height:40px;" />
                    <el-skeleton-item variant="button" style="width:47%;height:40px;" />
                </div>
            </div>
        </template>
    </el-skeleton>
    <template v-else>
        <div class="insbox" v-if="dataList.length > 0">
            <div class="item" v-for="item in dataList">
                <div class="imgbox">
                    <i>#{{ item.ordinal }}</i>
                    <img :src="item.picurl" />
                </div>
                <p><strong>{{ item.name }}</strong></p>
                <p>{{ item.p }}<i class="iconfont icon-chose"></i></p>
                <p>amt:{{ item.amt }}</p>
                <div class="transfer">
                    <button class="approve" v-if="item.status == 3" @click="Approve"><img src="@/assets/svg/loading.svg"
                            v-if="aloading" />{{ $t('roverInscriptions.button.t1') }}</button>
                    <button class="cancel" v-else-if="item.status == 2" @click="Cancel"><img
                            src="@/assets/svg/loading.svg" v-if="cloading" />{{ $t('roverInscriptions.button.t2')
                        }}</button>
                    <button v-else @click="Transfer">{{ $t('roverInscriptions.button.t3') }}</button>
                    <!-- <button v-if="item.status == 1" @click="Split(item.amt)">{{ $t('roverInscriptions.button.t4')
                    }}</button> -->
                </div>
            </div>
        </div>
        <div class="noData" v-else>
            <i class="iconfont icon-no"></i>
            <span>{{ $t('roverInscriptions.nodata') }}</span>
        </div>
    </template>
    <Pagination :total="100" :pageSize="5" :currentPage="1" />
    <Teleport to="body">
        <TransferInscription v-if="tstate" @close="close" />
        <SplitInscription :amount="amount" v-if="sstate" @close="close" />
    </Teleport>
</template>

<style lang="less" scoped>
.insbox {
    @apply w-full mt-5 grid grid-cols-3 gap-5 <sm:(grid-cols-1) <xl:(grid-cols-2);

    .item {
        @apply w-full pb-4 rounded-xl border border-gray-200 overflow-hidden dark:(border-dark-100);

        .imgbox {
            @apply w-full h-auto mb-2 relative;

            i {
                @apply absolute z-10 leading-5 bg-dark-900/80 text-white px-1 rounded right-2 top-2 text-xs not-italic;
            }

            img {
                @apply w-full;
            }
        }

        p {
            @apply w-full block px-4 text-gray-500 text-sm leading-6;

            strong {
                @apply text-base text-black dark:(text-white);
            }

            i {
                @apply text-sm text-purple-500 ml-1;
            }
        }

        .transfer {
            @apply w-full px-4 flex justify-between items-center;

            button {
                @apply w-full mt-3 py-2 flex items-center justify-center border rounded-lg text-sm text-gray-500 dark:(text-gray-400) transition duration-300 hover:(border-purple-500 bg-purple-500 text-white transition duration-300 dark:(border-purple-500 text-white)) dark:(border-dark-100);

                &.approve {
                    @apply bg-green-500 text-white w-full border-green-500 transition duration-300 hover:(bg-green-400 border-green-400 transition duration-300);

                    span {
                        @apply text-xs;
                    }
                }

                &.cancel {
                    @apply bg-red-400 text-white w-full border-red-400 transition duration-300 hover:(bg-red-500 border-red-500 transition duration-300);
                }

                img {
                    @apply mr-2 w-4;
                }
            }
        }
    }
}

.noData {
    .center();
    .font-size(70);
    .padding(200, 0, 50, 0);
    flex-direction: column;
    width: 100%;

    i {
        .font-size(70);
        color: #dddddd;
    }

    span {
        font-style: normal;
        font-weight: 400;
        .font-size(16);
        .line-height(19);
        .margin(10, 0, 0, 0);
        color: @text-color-grey;
    }
}

.pagination {
    @apply !mt-6;
}
</style>