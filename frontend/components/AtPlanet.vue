<template>
    <div class="atPlanetBox" :style="{ top: `${offsetTop}px`, left: `${offsetLeft}px` }">
        <el-skeleton animated class="box" v-if="loading">
            <template #template>
                <div class="header">
                    <el-skeleton-item variant="image" class="w-12 h-12 rounded-full mr-3" />
                    <div class="info">
                        <div class="name">
                            <el-skeleton-item variant="text" class="w-4/5" />
                        </div>
                        <el-skeleton-item variant="text" class="w-25" />
                    </div>
                </div>
                <div class="profile">
                    <el-skeleton-item variant="text" class="w-full" />
                    <el-skeleton-item variant="text" class="w-full" />
                    <el-skeleton-item variant="text" class="w-1/2" />
                </div>
                <div class="databox">
                    <div class="item">
                        <span>{{ $t('planet.subs') }}</span>
                        <el-skeleton-item variant="text" class="w-full" />
                    </div>
                    <div class="item">
                        <span>{{ $t('planet.news') }}</span>
                        <el-skeleton-item variant="text" class="w-full" />
                    </div>
                    <div class="item">
                        <span>{{ $t('planet.run.title') }} Days</span>
                        <el-skeleton-item variant="text" class="w-full" />
                    </div>
                </div>
            </template>
        </el-skeleton>
        <div class="box" v-else>
            <div class="header">
                <div class="avatar">
                    <img :src="getImagesUrl(planetData.avatar)" alt="" />
                </div>
                <div class="info">
                    <div class="name">
                        <strong>{{ planetData.name }}</strong>
                        <i v-if="planetData.twitter" class="iconfont icon-twitter"></i>
                    </div>
                    <span>{{ dealPid(planetData.canister.toString()) }}</span>
                </div>
            </div>
            <div class="profile">
                {{ planetData.desc }}
            </div>
            <div class="databox">
                <div class="item">
                    <span>{{ $t('planet.subs') }}</span>
                    {{ Number(planetData.subcriber) }}
                </div>
                <div class="item">
                    <span>{{ $t('planet.news') }}</span>
                    {{ Number(planetData.article) }}
                </div>
                <div class="item">
                    <span>
                        {{ $t('planet.run.title') }}
                        {{ $t('planetDashboard.canister.days') }}
                    </span>
                    {{ getRuntime(Number(planetData.created)).day }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { getImagesUrl, dealPid, getRuntime } from '@/utils/functions';

export default defineComponent({
    props: {
        offsetTop: {
            type: Number,
        },
        offsetLeft: {
            type: Number,
        },
        principalID: {
            type: String,
        },
    },
    setup(props, context) {
        const loading = ref(true);
        const planetData: any = ref();

        onMounted(async () => {
            if (!props.principalID) {
                return;
            }
            try {
                const planetCanister = await createActor(props.principalID, planetFactory);
                let planetBaseData: any = await planetCanister.getPlanetBase();
                planetData.value = planetBaseData;
                loading.value = false;
            } catch {
                loading.value = false;
            }
        });

        return {
            loading,
            planetData,
            getRuntime,
            getImagesUrl,
            dealPid,
        };
    },
});
</script>

<style lang="less" scoped>
.atPlanetBox {
    @apply fixed z-999;

    .box {
        @apply w-80 p-6 bg-white rounded-xl overflow-hidden absolute z-50 dark:(bg-dark-600) <lg:(hidden);
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);

        .header {
            @apply w-full flex items-center;

            .avatar {
                @apply w-12 h-12 mr-3;

                img {
                    @apply w-full h-full rounded-full;
                }
            }

            .info {
                @apply flex-1;

                .name {
                    @apply mb-1 flex items-center;

                    strong {
                        @apply max-w-40 truncate dark:(text-light-900);
                    }

                    i {
                        @apply ml-3;

                        &.icon-cert {
                            @apply text-purple-500;
                        }

                        &.icon-twitter {
                            @apply text-blue-400 transition duration-300 hover:(text-blue-500 transition duration-300 cursor-pointer);
                        }
                    }
                }

                span {
                    @apply bg-gray-100 px-6px py-1px rounded-full text-xs text-gray-500 font-normal dark:(bg-dark-200 text-light-800/80);
                }
            }
        }

        .profile {
            @apply w-full my-4 text-sm max-h-20 overflow-hidden overflow-ellipsis break-words dark:(text-light-900/80);
            .ellipsisMore(3);
            height: 60px;
        }

        .databox {
            @apply w-full flex items-center justify-between;

            .item {
                @apply text-xl text-black font-medium dark:(text-light-900);

                span {
                    @apply block text-xs text-gray-400 font-normal;
                }
            }
        }

        button {
            @apply w-full py-3 mt-4 text-center bg-purple-500 text-white rounded-10px transition duration-300 hover:(transition duration-300 bg-purple-400 cursor-pointer);
        }
    }
}
</style>
