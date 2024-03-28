<template>
    <el-drawer v-model="isMenu" size="100%" :with-heade="false" direction="rtl" :before-close="handleClose"
        @closed="afterClose">
        <div class="menuList">
            <p v-for="(item, index) in menuList" :key="index" :class="{ active: fullPath === item }"
                @click="jump(item)">
                <i class="iconfont" :class="'icon-' + $t(`roverComponents.menu.${item}.icon`)"></i>
                {{ menuFilter(item) }}
            </p>
            <p @click="outLogin">
                <i class="iconfont icon-logout"></i>{{ $t('roverComponents.header.loginOut') }}
            </p>
        </div>
        <div class="box">
            <div class="mora-button" @click="jump('roverClaim')">
                {{ $t('roverComponents.header.btn') }}
            </div>
        </div>
    </el-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';

export default defineComponent({
    name: 'MenuM',
    emits: ['menuClose'],
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const fullPath = ref();
        const isMenu = ref(true);
        const menuList = ref(CONFIG.roverMenu);
        const globalOutLogin: any = inject('globalOutLogin');

        watch(
            () => route.name,
            (n) => {
                fullPath.value = n;
            },
        );
        fullPath.value = route.name ? route.name : 'roverDashboard';

        const handleClose = () => {
            isMenu.value = false;
        };

        const afterClose = () => {
            isMenu.value = true;
            context.emit('menuClose');
        };

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
            handleClose();
        };

        const outLogin = () => {
            globalOutLogin();
            handleClose();
        };

        return {
            fullPath,
            isMenu,
            menuList,
            menuFilter,
            handleClose,
            afterClose,
            jump,
            outLogin,
        };
    },
});
</script>

<style scoped lang="less">
.menuList {
    display: flex;
    flex-direction: column;
    .margin(15, 0, 0, 0);
    .padding(0, 30, 0, 30);

    p {
        position: relative;
        .font-size(16);
        width: 100%;
        overflow: hidden;
        .height(90);
        display: flex;
        align-items: center;
        .lineBottom();
        color: @text-fcolor;
        @apply dark:(text-light-900/80);

        &::before {
            @apply dark:(bg-dark-300);
        }

        i {
            .font-size(22);
            .margin(0, 20, 0, 0);
            color: @text-color-placeholder;
        }

        &.active {
            color: @text-color;
            font-weight: 500;
            @apply dark:(text-light-900);
        }
    }
}

.box {
    position: fixed;
    .bottom(50);
    width: 100%;

    .mora-button {
        .center();
        color: @text-color-inverse;
        background: @bg-color-body-active;
        .font-size(18);
        .border-radius(15);
        transition: @transition;
        cursor: pointer;
        width: 85%;
        margin: auto;
        .height(70);
    }
}
</style>
