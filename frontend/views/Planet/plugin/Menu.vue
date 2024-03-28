<template>
    <div class="menuList">
        <p v-for="(item, index) in menuList" :key="index" :class="{ active: fullPath === item }" @click="jump(item)">
            {{ menuFilter(item) }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CONFIG from '@/assets/config';
import { t } from '@/i18n';
import store from '@/store';
import bus from 'vue3-eventbus';

export default defineComponent({
    name: 'Menu',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const fullPath = ref();
        const menuList = ref(CONFIG.planeMenu);

        watch(
            () => route.name,
            (n) => {
                fullPath.value = n;
            },
        );
        fullPath.value = route.name ? route.name : 'planetDashboard';

        const menuFilter = (text) => {
            return t(`planetComponents.menu.${text}.name`);
        };

        const jump = (item) => {
            if (fullPath.value === item) {
                return false;
            }
            bus.emit('clearKeepAliveCache');
            nextTick(() => {
                router.push({
                    name: item,
                    params: {
                        id: route.params.id,
                    },
                });
            });
        };

        const init = () => {
            if (store.state?.current_planet_data && store.state?.user_data) {
                if (
                    ~store.state?.current_planet_data?.owner
                        .toString()
                        .indexOf(store.state?.user_data?.pid)
                ) {
                    menuList.value = CONFIG.planeMenu;
                } else {
                    menuList.value = ['planetDashboard', 'planetContent'];
                }
            }
        };

        watch(
            () => store.state?.current_planet_data,
            (val) => {
                if (val) {
                    init();
                }
            },
        );

        watch(
            () => store.state?.user_data,
            (val) => {
                if (val) {
                    init();
                }
            },
        );

        onMounted(() => {
            nextTick(() => {
                init();
            });
        });

        return {
            route,
            fullPath,
            menuList,
            menuFilter,
            jump,
        };
    },
});
</script>

<style scoped lang="less">
.menuList {
    .center();
    flex: 1;

    p {
        font-style: normal;
        font-weight: 600;
        .font-size(16);
        .line-height(19);
        color: @text-color;
        .margin(0, 60, 0, 0);
        position: relative;
        .center();
        opacity: 0.6;
        cursor: pointer;
        transition: @transition;
        @apply dark:(text-light-900);

        &.active,
        &:hover {
            opacity: 1;
            transition: @transition;

            &:after {
                content: '';
                background: @bg-color-body-active;
                border-radius: 6px;
                position: absolute;
                .bottom(-15);
                .width(35);
                .height(5);
                transition: @transition;
            }
        }
    }

    @media screen and (min-width: 0) and (max-width: 750px) {
        display: none;
    }
}
</style>
