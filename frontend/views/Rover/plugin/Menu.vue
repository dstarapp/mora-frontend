<template>
    <div class="menuList" :class="{
        hide: route.name === 'roverClaim',
    }">
        <p v-for="(item, index) in menuList" :key="index" :class="{ active: fullPath === item }" @click="jump(item)">
            <i class="iconfont" :class="'icon-' + $t(`roverComponents.menu.${item}.icon`)"></i>
            {{ menuFilter(item) }}
        </p>
    </div>
    <div class="menuList logout">
        <p @click="logout">
            <i class="iconfont icon-logout"></i>
            {{ $t('roverComponents.header.loginOut') }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, inject, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';

export default defineComponent({
    name: 'Menu',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const fullPath = ref();
        const menuList = ref(
            window?.__PRIVATE_CONFIG__?.planet ? CONFIG.privateRoverMenu : CONFIG.roverMenu,
        );
        const outLogin: any = inject('globalOutLogin');

        const menuFilter = (text) => {
            return t(`roverComponents.menu.${text}.name`);
        };

        const jump = (item) => {
            if (fullPath.value === item) {
                return false;
            }
            router.push({
                name: item,
            });
        };

        const logout = () => {
            outLogin();
        };

        watch(
            () => route.name,
            (n) => {
                fullPath.value = n;
            },
        );
        fullPath.value = route.name ? route.name : 'roverDashboard';

        return {
            fullPath,
            route,
            menuList,
            menuFilter,
            jump,
            logout,
        };
    },
});
</script>

<style scoped lang="less">
.menuList {
    display: flex;
    flex-direction: column;
    background: @bg-color;
    .border-radius(25);
    .padding(30, 0, 30, 0);
    .margin(0, 0, 34, 0);
    .width(320);
    min-width: 280px;
    @apply dark:(bg-dark-600);

    &.logout {
        .padding(15, 0, 15, 0);
    }

    p {
        display: flex;
        align-items: center;
        position: relative;
        overflow: hidden;
        font-style: normal;
        font-weight: 400;
        .height(50);
        .border-radius(15);
        .margin(0, 30, 10, 30);
        .font-size(16);
        color: @text-fcolor;
        cursor: pointer;
        transition: @transition;
        @apply dark:(text-light-900/80);

        i {
            .margin(0, 18, 0, 25);
            .font-size(18);
            color: @text-color-placeholder;
        }

        &:hover,
        &.active {
            background: @bg-color-grey;
            transition: @transition;
            color: @text-color;
            font-weight: 500;
            @apply dark:(bg-dark-300 text-light-900/80);

            i {
                font-weight: normal;
            }
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    &.hide {
        display: none;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .menuList {
        display: none;
    }
}

@media screen and (min-width: 751px) and (max-width: 1240px) {
    .menuList {
        .margin(0, 0, 20, 0);
        .padding(20, 0, 20, 0);

        p {
            .height(60);
            .margin(0, 20, 10, 20);

            i {
                .margin(0, 18, 0, 20);
            }
        }
    }
}
</style>
