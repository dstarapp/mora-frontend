<template>
    <el-dropdown
        translate="no"
        class="switchMora"
        :class="{ hover: isHover }"
        @visible-change="visibleChange"
        :disabled="planteList.length > 0 ? false : true"
        :teleported="false"
    >
        <el-skeleton class="disconnectFrom" animated v-if="!current_planet_data">
            <template #template>
                <div class="back" @click="globalOutLogin">
                    <i class="iconfont icon-logout"></i>
                    {{ $t('home.disconnectFrom') }}
                </div>
                <span class="el-dropdown-link">
                    <el-skeleton-item variant="image" class="skeletonImg" />
                    <el-skeleton-item variant="h3" style="width: 70px" />
                </span>
            </template>
        </el-skeleton>
        <span class="el-dropdown-link" v-else>
            <img v-if="current_planet_data" :src="getImagesUrl(current_planet_data.avatar)" />
            <p>{{ current_planet_data ? current_planet_data.name : '' }}</p>
            <el-icon class="el-icon--right" v-show="planteList.length > 0">
                <arrow-down />
            </el-icon>
        </span>

        <template #dropdown>
            <el-dropdown-menu class="dropdown-menu">
                <el-dropdown-item
                    class="dropdown-menu-item"
                    v-for="item in planteList"
                    :key="item.avatar"
                    @click="jumpPlanet(item)"
                >
                    <img :src="getImagesUrl(item.avatar)" />
                    <p>{{ item.name }}</p>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, nextTick, inject } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import store from '@/store';
import { getImagesUrl } from '@/utils/functions';
import { useRouter } from 'vue-router';

export default defineComponent({
    components: { ArrowDown },
    name: 'SwitchMora',
    setup() {
        const isHover = ref(false);
        const planteList: any = ref([]);
        const current_planet_data = ref();
        const router = useRouter();
        const reinitialize: any = inject('reinitialize', null);
        const globalOutLogin: any = inject('globalOutLogin', null);

        const visibleChange = (change) => {
            isHover.value = change;
        };

        watch(
            () => store.state.current_open_planet,
            (val: any) => {
                if (val) {
                    nextTick(() => {
                        getPlanetList();
                    });
                }
            },
        );

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (val) {
                    current_planet_data.value = val;
                }
            },
        );

        const getPlanetList = async () => {
            let switchList = store.state.planets_data.filter((item) => {
                return item !== store.state.current_open_planet;
            });

            let arr = switchList.map(async (item) => {
                let res = createActor(item, planetFactory);
                return await res.getPlanetBase();
            });

            Promise.all(arr).then((res) => {
                planteList.value = res;
            });
        };

        const jumpPlanet = (item) => {
            router.push({
                name: 'planetDashboard',
                params: {
                    id: item.canister.toString(),
                },
            });
            reinitialize(item.canister.toString());
        };

        onMounted(() => {
            if (store.state.planets_data) {
                nextTick(() => {
                    getPlanetList();
                });
            }
            if (store.state.current_planet_data) {
                current_planet_data.value = store.state.current_planet_data;
            }
        });

        return {
            planteList,
            isHover,
            store,
            globalOutLogin,
            current_planet_data,
            visibleChange,
            getImagesUrl,
            jumpPlanet,
        };
    },
});
</script>

<style scoped lang="less">
.switchMora {
    display: flex;
    flex-shrink: 1;
    position: relative;
    z-index: 10;

    .el-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        .skeletonImg,
        img {
            width: 28px;
            height: 28px;
            .margin(0, 10, 0, 0);
            border: 1px solid @border-color;
            border-radius: 50%;
            @apply dark:(border-dark-100);
        }

        p {
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            .line-height(19);
            color: @text-color;
            max-width: 80px;
            .ellipsis();
            @apply <sm:(hidden) dark:(text-light-900/80);
        }

        svg {
            color: @text-color;
            .width(36);
            .height(21);
            transition: @transition;
            // .margin(0, 0, 0, 10);
            @apply dark:(text-light-900/80);
        }
    }

    &.hover {
        .el-dropdown-link {
            svg {
                transform: rotate(180deg);
                transition: @transition;
            }
        }
    }
}

:deep(.dropdown-menu) {
    position: relative;
    z-index: 2;
    .dropdown-menu-item {
        @apply transition duration-300;

        &:hover {
            @apply transition duration-300 dark:(bg-dark-300);
        }

        img {
            .width(26);
            .height(26);
            .margin(0, 10, 0, 0);
            border: 1px solid @border-color;
            border-radius: 50%;
            @apply dark:(border-dark-100);
        }

        p {
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            .line-height(19);
            color: @text-color;
            max-width: 140px;
            .ellipsis();
            @apply dark:(text-light-900/80);
        }
    }
}

.disconnectFrom {
    @apply relative;
    .back {
        @apply flex items-center justify-center absolute w-full h-full opacity-0 bg-gray-200 text-dark-200 rounded-lg text-sm transition duration-300 dark:(bg-dark-300 text-light-900/80);
        width: 120%;
        height: 120%;
        top: -10%;
        left: -10%;
        i {
            @apply text-dark-100 mr-2 text-sm dark:(text-light-900/60);
        }
    }

    &:hover {
        .back {
            @apply opacity-100 transition duration-300;
        }
    }
}
</style>
