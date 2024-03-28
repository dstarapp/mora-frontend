<template>
    <p class="text-gray-500 text-sm bg-gray-100 px-4 py-2 rounded-xl !mb-5 dark:(bg-dark-300 text-light-900/60)">
        Registration must be completed to ensure eligibility for future airdrops. The registration
        event will continue until mora launches on sns.</p>
    <div class="flex" v-if="typeof airdropList === 'undefined'">
        <el-skeleton animated :count="5">
            <template #template>
                <div class="droplist">
                    <div class="left">
                        <div class="dropitem">
                            <el-skeleton-item variant="image" class="simg" />
                            <el-skeleton-item variant="h1" class="w-15 h-6" />
                        </div>
                        <div class="points">
                            <span>YOUR POINTS</span>
                            <el-skeleton-item variant="text" />
                        </div>
                    </div>
                    <div class="operate">
                        <el-skeleton-item variant="button" class="rbtn mr-5" />
                        <el-skeleton-item variant="button" class="sbtn" />
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
    <div class="flex flex-col" v-else-if="Object.keys(airdropList).length">
        <div class="droplist" v-if="airdropList.Nft">
            <div class="left">
                <div class="dropitem">
                    <img src="@/assets/images/nft.jpg" />
                    <span>NFT</span>
                </div>
                <div class="points">
                    <span>YOUR POINTS</span>
                    <strong>{{ getAmount(Number(airdropList.Nft.point)).toFixed(2) }}</strong>
                </div>
            </div>
            <div class="operate">
                <button class="rbtn" :class="{ disabled: airdropList.Nft.isregister }"
                    @click="nftRegister(airdropList.Nft)">
                    <img src="@/assets/svg/loading.svg" class="w-5" v-if="isLoading === 'Nft'" />
                    <img src="@/assets/svg/kaleidoscope.svg" v-else-if="!airdropList.Nft.isregister" />
                    <i class="iconfont icon-chose" v-else></i>
                    {{ airdropList.Nft.isregister ? 'Registered' : 'Register' }}
                </button>
                <!-- <button class="sbtn" :class="{ disabled: nftClaimState !== 2 }" @click="nftClaim">
                <img src="@/assets/svg/loading.svg" class="w-5" v-if="nftClaimState === 1" />
                {{ nftClaimState === 0 ? 'waiting to claim ' : nftNums + ' / 10 Claim' }}
            </button> -->
            </div>
        </div>
        <div class="droplist" v-if="airdropList.Note">
            <div class="left">
                <div class="dropitem">
                    <img src="@/assets/svg/dstar.svg" />
                    <span>Note</span>
                </div>
                <div class="points">
                    <span>YOUR POINTS</span>
                    <strong>{{ getAmount(Number(airdropList.Note.point)).toFixed(2) }}</strong>
                </div>
            </div>
            <div class="operate">
                <button class="rbtn" :class="{ disabled: airdropList.Note.isregister }"
                    @click="nftRegister(airdropList.Note)">
                    <img src="@/assets/svg/loading.svg" class="w-5" v-if="isLoading === 'Note'" />
                    <img src="@/assets/svg/kaleidoscope.svg" v-else-if="!airdropList.Note.isregister" />
                    <i class="iconfont icon-chose" v-else></i>
                    {{ airdropList.Note.isregister ? 'Registered' : 'Register' }}
                </button>
            </div>
        </div>
        <div class="droplist" v-if="airdropList.Insc">
            <div class="left">
                <div class="dropitem">
                    <img src="@/assets/images/Inscription.png" />
                    <span>Inscription</span>
                </div>
                <div class="points">
                    <span>YOUR POINTS</span>
                    <strong>{{ getAmount(Number(airdropList.Insc.point)).toFixed(2) }}</strong>
                </div>
            </div>
            <div class="operate">
                <button class="rbtn" :class="{ disabled: airdropList.Insc.isregister }"
                    @click="nftRegister(airdropList.Insc)">
                    <img src="@/assets/svg/loading.svg" class="w-5" v-if="isLoading === 'Insc'" />
                    <img src="@/assets/svg/kaleidoscope.svg" v-else-if="!airdropList.Insc.isregister" />
                    <i class="iconfont icon-chose" v-else></i>
                    {{ airdropList.Insc.isregister ? 'Registered' : 'Register' }}
                </button>
            </div>
        </div>
        <div class="droplist" v-if="airdropList.Mainnet">
            <div class="left">
                <div class="dropitem">
                    <img src="@/assets/svg/logo.png" />
                    <span>Mora</span>
                </div>
                <div class="points">
                    <span>YOUR POINTS</span>
                    <strong>{{ getAmount(Number(airdropList.Mainnet.point)).toFixed(2) }}</strong>
                </div>
            </div>
            <div class="operate">
                <button class="rbtn" :class="{ disabled: airdropList.Mainnet.isregister }"
                    @click="nftRegister(airdropList.Mainnet)">
                    <img src="@/assets/svg/loading.svg" class="w-5" v-if="isLoading === 'Mainnet'" />
                    <img src="@/assets/svg/kaleidoscope.svg" v-else-if="!airdropList.Mainnet.isregister" />
                    <i class="iconfont icon-chose" v-else></i>
                    {{ airdropList.Mainnet.isregister ? 'Registered' : 'Register' }}
                </button>
            </div>
        </div>
        <div class="droplist" v-if="airdropList.Testnet">
            <div class="left">
                <div class="dropitem">
                    <img src="@/assets/svg/testnet.svg" />
                    <span>TestNet</span>
                </div>
                <div class="points">
                    <span>YOUR POINTS</span>
                    <strong>{{ getAmount(Number(airdropList.Testnet.point)).toFixed(2) }}</strong>
                </div>
            </div>
            <div class="operate">
                <button class="rbtn" :class="{ disabled: airdropList.Testnet.isregister }"
                    @click="nftRegister(airdropList.Testnet)">
                    <img src="@/assets/svg/loading.svg" class="w-5" v-if="isLoading === 'Testnet'" />
                    <img src="@/assets/svg/kaleidoscope.svg" v-else-if="!airdropList.Testnet.isregister" />
                    <i class="iconfont icon-chose" v-else></i>
                    {{ airdropList.Testnet.isregister ? 'Registered' : 'Register' }}
                </button>
            </div>
        </div>
    </div>
    <div class="noData" v-else>
        <i class="iconfont icon-no"></i>
        <span>You are not eligible!</span>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { startConfettiInner, removeConfettiInner } from '@/utils/luck';
import { idlFactory as airdropFactory } from '@/request/canister/airdrop.did';
import { createActor } from '@/request/agent';
import CONFIG from '@/assets/config';
import store from '@/store';
import _ from 'lodash';
import { getAmount } from '@/utils/functions';

const airdropList = ref<any>(undefined);
const airdropActor = ref();

onMounted(async () => {
    if (store.state.user_principal) {
        airdropActor.value = await createActor(
            CONFIG.airdropCanister,
            airdropFactory,
            store.state.agent,
        );
        airdropActor.value.checkAirdrop().then((res: any) => {
            console.log(res);
            const list = {};
            res.map((item) => {
                const name: string = Object.keys(item.atype)[0];
                list[name] = item;
            });
            console.log(list);
            airdropList.value = list;
        });
    }
});

const isLoading = ref();
const nftRegister = (item) => {
    if (item.isregister) {
        return;
    }
    isLoading.value = Object.keys(item.atype)[0];
    airdropActor.value
        .register(item.atype)
        .then((res: any) => {
            if (res) {
                item.isregister = true;
            }
        })
        .finally(() => {
            isLoading.value = '';
        });
};

const nftClaimState = ref(2);
const nftNums = ref(10);
const nftClaim = () => {
    if (nftClaimState.value == 2) {
        nftClaimState.value = 1;
        setTimeout(() => {
            startConfettiInner();
            nftNums.value--;
            nftClaimState.value = 2;
            ElMessage.success('Claim successful！');
        }, 1500);

        setTimeout(() => {
            removeConfettiInner();
        }, 3500);
    }
};
</script>

<style lang="less" scoped>
.droplist {
    @apply w-full mb-6 border border-gray-200 rounded-xl px-5 py-6 bg-white flex items-center items-center justify-between transition duration-300 <sm:(flex-col) hover:(transition duration-300 shadow-xl shadow-dark-900/5 dark:(shadow-dark-900/50)) dark:(bg-dark-300 border-dark-100);

    .left {
        @apply flex items-center <sm:(w-full justify-between);

        .dropitem {
            @apply w-50 pr-5 flex items-center;

            img,
            .simg {
                @apply w-10 h-10 rounded-full mr-4 <sm:(mr-2 w-11 h-11);
            }

            span {
                @apply text-black text-xl font-medium dark:(text-light-900);
            }
        }

        .points {
            // @apply flex-1;

            span {
                @apply block text-xs text-gray-500 dark:(text-light-900/60) <sm:(text-right);
            }

            strong {
                @apply block text-3xl text-black dark:(text-light-900) <sm:(text-2xl text-right);
            }
        }
    }

    .operate {
        @apply flex items-center justify-between <sm:(mt-5);

        .rbtn,
        .sbtn {
            @apply h-12 rounded-xl flex items-center justify-center text-white transition duration-300 hover:(transition duration-300 cursor-pointer);
        }

        .rbtn {
            @apply w-34 bg-dark-800 hover:(bg-dark-100 bg-dark-500) <sm:(mr-5);

            &.disabled {
                @apply cursor-not-allowed bg-dark-100/70;
            }

            img {
                @apply mr-2 h-7;
            }

            i {
                @apply mr-2 text-green-400;
            }
        }

        .sbtn {
            @apply w-40 bg-purple-500 hover:(bg-purple-500/80);

            &.disabled {
                @apply cursor-not-allowed bg-purple-500/60 dark:(bg-purple-500/40);
            }

            img {
                @apply mr-2;
            }
        }
    }
}

.noData {
    @apply w-full pt-50 flex items-center justify-center flex-col <sm:(pt-30);

    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }

    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
    }
}
</style>
