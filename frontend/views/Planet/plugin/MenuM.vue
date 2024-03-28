<template>
    <el-drawer v-model="isMenu" size="100%" :with-heade="false" direction="rtl" :before-close="handleClose"
        @closed="afterClose">
        <div class="menuList">
            <p v-for="(item, index) in menuList" :key="index" :class="{ active: fullPath === item }"
                @click="jump(item)">
                <i class="iconfont" :class="'icon-' + $t(`planetComponents.menu.${item}.icon`)"></i>
                {{ menuFilter(item) }}
            </p>
        </div>
        <div class="addbox">
            <button class="addCycles" @click="addCycles()">
                {{ menuFilter('planetAddCycles') }}
            </button>
        </div>
    </el-drawer>

    <component :is="isComponent" @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CONFIG from '@/assets/config';
import { t } from '@/i18n';
import store from '@/store';
import AddCycles from '@/components/AddCycles.vue';

export default defineComponent({
    components: { AddCycles },
    name: 'MenuM',
    emits: ['menuClose'],
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const fullPath = ref();
        const isMenu = ref(true);
        const menuList = ref(CONFIG.planeMenu);
        const isComponent = ref();

        const componentClose = () => {
            isComponent.value = undefined;
        };

        const handleClose = () => {
            isMenu.value = false;
        };

        const afterClose = () => {
            isMenu.value = true;
            context.emit('menuClose');
        };

        const menuFilter = (text) => {
            return t(`planetComponents.menu.${text}.name`);
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

        const addCycles = () => {
            isComponent.value = 'AddCycles';
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
            () => route.name,
            (n) => {
                fullPath.value = n;
            },
        );
        fullPath.value = route.name ? route.name : 'planetDashboard';

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
            fullPath,
            isMenu,
            menuList,
            isComponent,
            componentClose,
            addCycles,
            menuFilter,
            handleClose,
            afterClose,
            jump,
        };
    },
});
</script>

<style scoped lang="less">
.menuList {
    display: flex;
    flex-direction: column;
    .margin(25, 0, 0, 0);
    .padding(0, 30, 0, 30);

    p {
        position: relative;
        .font-size(18);
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
            .margin(0, 15, 0, 0);
        }

        &.active {
            color: @text-color;
            font-weight: 500;
            @apply dark:(text-light-900);

            i {
                font-weight: normal;
            }
        }
    }

    .planetAddCycles,
    .planetCreateArticle {
        em {
            display: inline-block;
            .width(28);
            .height(28);
            background: url(@/assets/svg/icon-addcycles.svg) no-repeat center center;
            background-size: 100% 100%;
            color: #ff0000;
            .margin(0, 15, 0, 0);
        }

        &.planetCreateArticle {
            em {
                background: url(@/assets/svg/icon-create.svg) no-repeat center center;
                background-size: 100% 100%;
            }
        }
    }
}

.addbox {
    .padding(0, 30, 0, 30);
    position: fixed;
    .bottom(50);
    display: flex;
    justify-content: space-between;
    width: 100%;

    button {
        width: 100%;
        .border-radius(20);
        .font-size(16);
        border: none;
        .height(70);

        &.createArticle {
            background-color: @text-active;
            color: @text-color-inverse;
        }

        &.addCycles {
            border: 1px solid @text-active;
            color: @text-active;
            background-color: @text-color-inverse;
        }
    }
}
</style>
