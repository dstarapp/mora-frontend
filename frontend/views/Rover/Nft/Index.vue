<template>
    <div class="nftBox">
        <div class="titleBox">
            <h2>
                {{ $t('roverNft.title') }}
            </h2>
            <div>
                <el-select v-model="NFTCanisterId" placeholder="Select" size="large">
                    <el-option key="Mora" label="Mora" :value="CONFIG.moraNFTCanister" />
                    <el-option key="Infinity" label="Infinity" :value="CONFIG.infinityNftCanister" />
                    <el-option key="Nyannyan" label="Nyannyan" :value="CONFIG.nyannyanNftCanister" />
                    <el-option key="86KEY" label="86KEY" :value="CONFIG['86KEYNftCanister']" />
                    <el-option key="MagicShoujo" label="MagicShoujo" :value="CONFIG.magicShoujoNftCanister" />
                </el-select>
            </div>
        </div>
        <div class="sbox" v-show="NFTCanisterId === CONFIG.moraNFTCanister">
            <h3>{{ $t('roverNft.search.title') }}</h3>
            <div class="search">
                <el-input-number class="input" type="number" :max="1500" :min="0" :controls="false"
                    :placeholder="$t('roverNft.placeholder')" v-model.number="searchInput"
                    @keydown.enter="searchNFT(searchInput)" />
                <button :class="{ disabled: searchLoading }" @click="searchNFT(searchInput)">
                    <img v-if="searchLoading" src="@/assets/svg/loading.svg" alt="" />
                    Search
                </button>
            </div>
            <p class="error" v-if="searchRes === 1">
                <i class="iconfont icon-failed"></i>
                {{ $t('roverNft.search.been') }}
            </p>
            <p class="success" v-if="searchRes === 2">
                <i class="iconfont icon-ok"></i>
                {{ $t('roverNft.search.not') }}
            </p>
        </div>
        <Skeleton v-if="isLoading"></Skeleton>

        <template v-if="!isLoading">
            <div class="nft" v-if="ntfList.length">
                <div class="item" v-for="(item, index) in ntfList" :key="index"
                    :class="{ disabled: item.isUsed, active: nftSelected.indexOf(item) !== -1 }">
                    <div class="cover">
                        <img :src="item.metadata && item.metadata.thumb
                    ? item.metadata.thumb
                    : item.url
                    " alt="" />
                        <i v-if="!item.isUsed && NFTCanisterId === CONFIG.moraNFTCanister" class="iconfont icon-chose"
                            @click="chooseNft(item)"></i>
                    </div>
                    <div class="info">
                        <span>
                            <p>{{ item.metadata.name }}</p>
                            <strong>#{{ Number(item.index) }}</strong>
                        </span>
                        <i class="iconfont icon-nfttransfer" @click="openAddress(item)"></i>
                    </div>
                </div>
            </div>
            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverDashboard.noData') }}</p>
            </div>
            <div class="claimbox" v-if="nftSelected.length" @click="exchange">
                <button :class="{ disabled: claimStatus }">
                    <img v-if="claimStatus" src="@/assets/svg/loading.svg" alt="" />
                    {{ $t('roverNft.btn.t1') }} {{ nftSelected.length * 2 }}
                    {{ $t('roverNft.btn.t2') }}
                </button>
            </div>
        </template>
    </div>

    <Address v-if="isAddress" :addressData="addressData" @addressClose="addressClose" @refresh="getList" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, provide } from 'vue';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import store from '@/store';
import Address from './components/Address.vue';
import Skeleton from './components/Skeleton.vue';
import { get_account_id } from '@/utils/wallet';
import { createActor } from '@/request/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as nftInvitationCodeFactory } from '@/request/canister/nftInvitationCode.did';
import { idlFactory as moraNFTFactory } from '@/request/canister/moraNFT.did';
import { ElMessage, ElMessageBox } from 'element-plus';
import { serializeTokenData, getTokenIdentifier } from './components/nft';
import { isPrincipalString } from '@/utils/functions';
import { t } from '@/i18n';

export default defineComponent({
    components: {
        Address,
        Skeleton,
    },
    name: 'Nft',
    setup() {
        const isRefresh = ref(false);
        const isLoading = ref(true);
        const percentage = ref(0);
        const currentPage = ref(1);
        const total = ref(15);
        const ntfList = ref<any[]>([]);
        const isAddress = ref(false);
        const addressData = ref();
        const nftInvitationCodeCanister = ref();
        const searchInput = ref();
        const searchLoading = ref(false);
        const searchRes = ref(-1);
        const nftSelected = ref<any[]>([]);
        const claimStatus = ref(false);
        const claimState = ref(false);
        const NFTCanister = ref();
        const NFTCanisterId = ref(CONFIG.moraNFTCanister);

        const searchIsUsed = async (id) => {
            try {
                const res = await nftInvitationCodeCanister.value.isInvitationAvailableById(id);
                if (res) {
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                return false;
            }
        };

        const searchNFT = async (searchInput) => {
            if (searchInput === undefined) {
                searchRes.value = -1;
                return false;
            }

            searchLoading.value = true;
            const res = await searchIsUsed(searchInput);
            searchLoading.value = false;

            if (!res) {
                searchRes.value = 1;
            } else {
                searchRes.value = 2;
            }
        };

        const openAddress = (item) => {
            addressData.value = item;
            isAddress.value = true;
        };

        const addressClose = () => {
            addressData.value = '';
            isAddress.value = false;
        };

        const chooseNft = (item) => {
            if (nftSelected.value.indexOf(item) === -1) {
                nftSelected.value.push(item);
            } else {
                nftSelected.value.splice(nftSelected.value.indexOf(item), 1);
            }
        };

        const getList = async () => {
            if (!store.state?.user_data?.pid) {
                return;
            }
            isLoading.value = true;
            const from = get_account_id(store.state.user_data.pid);
            const ret = await NFTCanister.value.tokens_ext(from);
            if (!ret) {
                ntfList.value = [];
            }
            if ('err' in ret) {
                ntfList.value = [];
            }
            const tokens = ret.ok || [];
            const arr = tokens.map((token) => {
                const metadata = token[2];
                const tokenIndex = token[0];
                return serializeTokenData(
                    metadata,
                    getTokenIdentifier(NFTCanisterId.value, tokenIndex),
                    tokenIndex,
                    NFTCanisterId.value,
                );
            });
            isLoading.value = false;
            ntfList.value = arr;

            ntfList.value.map(async (item) => {
                item.isUsed = true;
                const res = await searchIsUsed(item.index);
                item.isUsed = !res;
            });
        };

        const exchange = () => {
            if (!nftSelected.value.length || claimStatus.value) {
                return;
            }

            ElMessageBox.prompt('Send the invitation code to : ', 'Claim', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputErrorMessage: 'Invalid Principal ID',
                customClass: 'ElMessageBoxInput',
                inputPlaceholder: 'Principal ID',
                inputValue: store.state.user_data?.pid ? store.state.user_data?.pid : '',
                closeOnPressEscape: false,
                closeOnClickModal: false,
                beforeClose: (action, instance, done) => {
                    if (action === 'cancel') {
                        done();
                    } else if (isPrincipalString(instance.inputValue)) {
                        done();
                    } else {
                        ElMessage.error(t('roverNft.address.pidError'));
                    }
                },
            })
                .then(async ({ value }) => {
                    const indexArr = nftSelected.value.map((item) => {
                        return item.id;
                    });
                    claimStatus.value = true;
                    try {
                        const res = await nftInvitationCodeCanister.value.generateInvitationCodes(
                            indexArr,
                            Principal.fromText(value),
                        );
                        if (res.length) {
                            getList();
                            nftSelected.value = [];
                            ElMessage.success(t('roverNft.btn.success'));
                        }
                        claimStatus.value = false;
                        claimState.value = true;
                    } catch (err) {
                        debug('nft failed', err);
                        claimStatus.value = false;
                        ElMessage.error(t('roverNft.btn.failure'));
                    }
                })
                .catch(() => { });
        };

        const init = async () => {
            nftInvitationCodeCanister.value = await createActor(
                CONFIG.nftInvitationCode,
                nftInvitationCodeFactory,
                store.state.agent,
            );

            const canisterId = NFTCanisterId.value;
            NFTCanister.value = await createActor(canisterId, moraNFTFactory, store.state.agent);

            getList();
        };

        watch(
            () => store.state.user_data,
            (val) => {
                if (val) {
                    init();
                }
            },
            { immediate: true },
        );

        watch(
            () => NFTCanisterId.value,
            (val) => {
                if (val) {
                    nftSelected.value = [];
                    init();
                }
            },
        );

        onMounted(() => {
            if (store.state.user_data) {
                init();
            }
        });

        provide('NFTCanisterId', NFTCanisterId);

        return {
            currentPage,
            total,
            isRefresh,
            isLoading,
            percentage,
            ntfList,
            addressData,
            isAddress,
            nftSelected,
            searchInput,
            searchLoading,
            searchRes,
            claimStatus,
            NFTCanisterId,
            CONFIG,
            exchange,
            openAddress,
            addressClose,
            chooseNft,
            searchNFT,
            getList,
        };
    },
});
</script>

<style scoped lang="less">
.nftBox {
    width: 100%;
    display: flex;
    flex-direction: column;

    .titleBox {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;

        h2 {
            display: flex;
            align-items: center;
            font-style: normal;
            font-weight: 500;
            .font-size(24);
            .line-height(29);
            color: @text-color;
            margin: 0;
            @apply dark:(text-light-900);

            @media screen and (min-width: 750px) and (max-width: 1240px) {
                .height(55 + 4);
            }
        }

        .select {
            position: absolute;
            right: 0;
            top: 0;
            border: 2px solid @border-color;
            .border-radius(15);
            min-width: 150px;
            box-sizing: border-box;
            background: @text-color-inverse;

            .current {
                display: flex;
                align-items: center;
                .height(45);
                cursor: pointer;

                @media screen and (min-width: 750px) and (max-width: 1240px) {
                    .height(55);
                }

                p {
                    .center();
                    flex: 1;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    color: @text-color;
                    .margin(0, 10, 0, 20);
                }

                span {
                    display: flex;
                    margin-left: auto;
                    align-items: center;
                    height: 100%;

                    em {
                        background: @bg-color-grey;
                        font-weight: 400;
                        .font-size(14);
                        color: @text-color;
                        font-style: normal;
                        .padding(2, 10, 2, 10);
                        .border-radius(17);
                    }

                    i {
                        display: flex;
                        .margin(0, 10, 0, 10);
                        .font-size(16);
                    }
                }
            }

            .list {
                display: flex;
                flex-direction: column;
                max-height: 0;
                overflow: hidden;
                transition: @transition;

                span {
                    display: flex;
                    align-items: center;
                    .margin(5, 18, 5, 18);
                    .height(40);
                    .border-radius(10);
                    .padding(12, 0, 12, 0);
                    cursor: pointer;

                    @media screen and (min-width: 0) and (max-width: 750px) {
                        .padding(15, 0, 15, 0);
                        .margin(5, 18, 5, 5);
                    }

                    img {
                        .width(26);
                        .height(26);
                        border-radius: 50%;
                        .margin(0, 0, 0, 12);
                    }

                    p {
                        font-style: normal;
                        font-weight: 400;
                        .font-size(14);
                        color: #000000;
                        .margin(0, 0, 0, 10);
                    }

                    em {
                        border: 1px solid @bg-color-grey;
                        font-weight: 400;
                        .margin(0, 11, 0, 0);
                        margin-left: auto !important;
                        .font-size(14);
                        color: @text-color;
                        font-style: normal;
                        .padding(2, 11, 2, 11);
                        .border-radius(17);
                        background-color: @text-color-inverse;

                        @media screen and (min-width: 0) and (max-width: 750px) {
                            margin-left: auto !important;
                        }
                    }

                    &:hover {
                        background: @bg-color-grey;
                        transition: @transition;
                    }

                    &:last-child {
                        margin-bottom: 15px;
                    }
                }
            }

            &:hover {
                .list {
                    transition: @transition;
                    max-height: 500px;
                }
            }
        }
    }

    .sbox {
        @apply w-full mt-8 flex flex-col bg-light-400 p-6 pb-7 rounded-xl <sm:(p-3) dark:(bg-dark-300);

        h3 {
            @apply block pb-4 font-medium dark:(text-light-900/80) <sm:(pb-2);
        }

        .search {
            @apply w-full flex items-center rounded-lg overflow-hidden dark: (bg-dark-300);

            :deep(.input) {
                @apply w-full h-full border-1 border-light-800 border-r-transparent px-3 rounded-tl-lg rounded-bl-lg flex-1 transition duration-300 placeholder-gray-300 dark:(border-dark-100 placeholder-light-900/50 bg-dark-300);
                border-radius: 10px 0 0 10px;
                background: #fff;

                .el-input__wrapper {
                    padding: 0;
                }

                .el-input__inner {
                    text-align: left;
                }
            }

            button {
                @apply w-40 flex items-center justify-center border-transparent relative bg-purple-500 text-white p-4 font-medium transition duration-300 hover:(transition duration-300 bg-purple-400 cursor-pointer) <sm:(w-24 p-3);

                img {
                    @apply mr-2;
                }

                &.disabled {
                    @apply bg-purple-300;
                    cursor: not-allowed;
                }
            }
        }

        p {
            @apply w-full text-sm pt-3 flex text-gray-500 dark:(text-light-900/60);

            &.error {
                @apply text-red-400;
            }

            &.success {
                @apply text-green-400;
            }

            .icon-attention {
                @apply mr-2 text-gray-500/40 dark:(text-light-900/30);
            }

            .icon-failed {
                @apply mr-2 text-red-400/60;
            }

            .icon-ok {
                @apply mr-2 text-green-400/60;
            }
        }
    }

    .nft {
        @apply w-full mt-6 grid grid-cols-3 gap-8 <lg:(grid-cols-2 gap-5);

        .item {
            @apply w-full;
            transition: @transition;

            .cover {
                @apply w-full border border-light-800 rounded-tl-xl rounded-tr-xl overflow-hidden relative min-h-59 <xl:(min-h-31);
                border-bottom: none;

                img {
                    width: 100%;
                    object-fit: cover;
                    transition: @transition;
                }

                .icon-chose {
                    @apply absolute right-3 top-2 text-light-900/60 text-lg hover:(cursor-pointer);
                }
            }

            .info {
                @apply w-full border border-light-800 rounded-bl-xl rounded-br-xl bg-white flex justify-between px-4 py-2 items-center dark:(bg-dark-300 border-dark-100) <sm:(px-3);
                border-top: none;

                span {
                    @apply flex flex-col;

                    p {
                        @apply text-gray-500 text-sm dark:(text-light-900/60);
                    }

                    strong {
                        @apply text-black text-sm font-bold dark:(text-light-900);
                    }
                }

                i {
                    @apply text-base text-black hover:(text-purple-500 cursor-pointer) dark:(text-light-900);
                    transition: @transition;
                }
            }

            &.disabled {
                .cover {
                    @apply cursor-not-allowed opacity-50 dark:(opacity-40);

                    .icon-chose {
                        @apply pointer-events-none;
                    }
                }
            }

            &.active {
                .cover {
                    .icon-chose {
                        @apply text-purple-500;
                    }
                }

                .info {
                    @apply border-purple-500 dark:(border-dark-50);

                    span {
                        p {
                            @apply text-black dark:(text-light-900);
                        }

                        strong {
                            @apply text-purple-500;
                        }
                    }
                }
            }

            &:hover {
                .cover {
                    img {
                        @apply transform scale-110;
                        transition: @transition;
                    }
                }
            }
        }
    }

    .claimbox {
        @apply w-full mt-9 flex justify-center <sm:(mt-5);

        button {
            @apply w-1/2 py-4 rounded-xl bg-purple-500 text-white text-center transition duration-300 hover:(transition duration-300 bg-purple-400 cursor-pointer) <sm:(w-full);
            .center();

            img {
                margin-right: 5px;
                width: 16px;
                height: 16px;
            }

            &.disabled {
                opacity: 0.6;
            }
        }
    }

    .noData {
        .center();
        .font-size(70);
        .padding(200, 0, 50, 0);
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
}
</style>
