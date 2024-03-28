<template>
    <el-dropdown class="user" :class="{ hover: isHover }" @visible-change="visibleChange" :teleported="false">
        <span class="el-dropdown-link">
            <i class="iconfont icon-user" />
        </span>
        <template #dropdown>
            <el-dropdown-menu class="dropdown-menu">
                <el-dropdown-item v-for="(item, index) in roverMenu" :key="index" class="dropdown-menu-item"
                    @click="jump(item)">
                    <p translate="no">
                        <i class="iconfont" :class="'icon-' + menuIcon(item)"></i>{{ menuFilter(item) }}
                    </p>
                </el-dropdown-item>
                <el-dropdown-item class="dropdown-menu-item center" divided @click="globalOutLogin">
                    <i class="iconfont icon-logout" />
                    <p>{{ $t('roverComponents.header.loginOut') }}</p>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import CONFIG from '@/assets/config';
import { useRouter } from 'vue-router';
import { t } from '@/i18n';

export default defineComponent({
    components: {},
    name: 'User',
    setup() {
        const router = useRouter();
        const isHover = ref(false);
        const roverMenu = CONFIG.roverMenu;
        const globalOutLogin = inject('globalOutLogin', null);

        const visibleChange = (change) => {
            isHover.value = change;
        };

        const menuFilter = (text) => {
            return t(`roverComponents.menu.${text}.name`);
        };

        const menuIcon = (text) => {
            return t(`roverComponents.menu.${text}.icon`);
        };

        const jump = (item) => {
            router.push({
                name: item,
            });
        };

        return {
            visibleChange,
            menuFilter,
            menuIcon,
            jump,
            globalOutLogin,
            isHover,
            roverMenu,
        };
    },
});
</script>

<style scoped lang="less">
.user {
    display: flex;
    flex-shrink: 1;
    .margin(0, 0, 0, 30);
    cursor: pointer;

    .icon-user {
        color: @text-color;
        .font-size(20);
        transition: @transition;
        @apply dark:(text-light-900/80);

        &:hover {
            color: @text-active;
            transition: @transition;
        }
    }
}

:deep(.el-dropdown-menu__item) {
    margin-top: 5px;
    @apply transition duration-300;

    &:hover {
        color: black;
        @apply transition duration-300 dark:(bg-dark-300 text-light-900/80);
    }
}
</style>
