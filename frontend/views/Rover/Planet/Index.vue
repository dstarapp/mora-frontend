<template>
    <div class="planetBox">
        <h2>
            {{ $t('roverPlanet.title') }}
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </h2>
        <div class="planet" v-if="store.state.planets_data && store.state.planets_data.length">
            <PlanetList v-for="item in store.state.planets_data" :key="item" :canisterId="item" />
        </div>
        <div class="noplanet" v-else>
            <p>
                <i class="iconfont icon-no"></i>
                <span>{{ $t('roverPlanet.norecord') }}</span>
                <span class="tips">
                    {{ $t('roverPlanet.tips') }}
                </span>
                <button @click="goUrl('roverClaim')">
                    {{ $t('roverPlanet.btn') }}
                </button>
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch } from 'vue';
import PlanetList from './components/PlanetList.vue';
import store from '@/store';
import { useRouter } from 'vue-router';
import debug from '@/utils/debug';
import { arraysEqual } from '@/utils/functions';

export default defineComponent({
    components: { PlanetList },
    name: 'Planet',
    setup() {
        const planetList = ref();
        const isRefresh = ref(false);
        const router = useRouter();
        const get_planets_canister: any = inject('get_planets_canister', null);
        const usersCanister: any = inject('usersCanister');

        const refresh = () => {
            isRefresh.value = true;
            store.commit('CLEAR_PLANET_CACHE', {});
            get_planets_canister();
            setTimeout(() => {
                isRefresh.value = false;
            }, 300);
        };

        const goUrl = (str: string) => {
            router.push({ name: str });
        };

        const listenPlanet = async () => {
            try {
                let planetsData = await usersCanister.value.get_planets();
                let arr = planetsData[0].map((item) => {
                    let id = item.toString();
                    return id;
                });
                if (!arraysEqual(arr, [...store.state.planets_data])) {
                    refresh();
                }
            } catch (err) {
                debug('failed', err);
            }
        };

        watch(
            () => usersCanister.value,
            (val) => {
                if (val) {
                    listenPlanet();
                }
            },
            { immediate: true, deep: true },
        );

        return {
            planetList,
            isRefresh,
            store,
            goUrl,
            refresh,
        };
    },
});
</script>

<style scoped lang="less">
.planetBox {
    width: 100%;
    display: flex;
    flex-direction: column;

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

        i {
            .font-size(20);
            color: @text-color-grey;
            margin-left: auto;
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }
}

.planet {
    display: flex;
    align-items: flex-start;
    width: 100%;
    .margin(30, 0, 0, 0);
    flex-wrap: wrap;

    :deep(.item) {
        &:last-child {
            margin-bottom: 0;
        }
    }
}

.noplanet {
    width: 100%;
    .margin(30, 0, 0, 0);

    p {
        .padding(120, 0, 120, 0);
        text-align: center;

        i {
            .font-size(70);
            display: block;
            color: @text-color-grey;
            opacity: 0.5;
        }

        span {
            .padding(20, 0, 0, 0);
            .font-size(16);
            display: block;
            color: @text-color-grey;

            &.tips {
                .padding(40, 0, 0, 0);
                .font-size(16);
            }
        }

        button {
            border: none;
            background-color: @border-color-active;
            color: @text-color-inverse;
            .width(200);
            .padding(15, 0, 15, 0);
            display: block;
            margin: 40px auto;
            .border-radius(15);
            .font-size(16);
            transition: @transition;

            &:hover {
                cursor: pointer;
                opacity: 0.8;
                transition: @transition;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .noplanet {
        p {
            button {
                width: 100%;
            }
        }
    }
}
</style>
