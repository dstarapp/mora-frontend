<template>
    <div class="category">
        <template v-if="browserPlanetUserData">
            <p class="item" :class="{ active: currentOpen === 'all' }" @click="handleOpen('all')">
                {{ $t('home.all') }}
            </p>
            <div class="menus">
                <template v-for="(item, index) in browserPlanetUserData.categorys" :key="index">
                    <p :class="{
            active: currentOpen === Number(item.id),
            noC: currentSecondaryOpen,
        }" class="item" @click="handleOpen(Number(item.id))">
                        {{ item.name }}
                        <i v-if="item.children.length" class="iconfont icon-arrow-down"></i>
                    </p>
                    <div>
                        <div class="child" :class="{
            active: currentOpen === Number(item.id),
            open: currentOpen === Number(item.id),
        }" v-for="(children, index) in item.children" :key="index">
                            <p class="item" :class="{
            active: currentSecondaryOpen === Number(children.id),
        }" @click="childrenClick(Number(item.id), Number(children.id))">
                                {{ children.name }}
                            </p>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, inject } from 'vue';
import bus from 'vue3-eventbus';

export default defineComponent({
    setup() {
        const isFixed = ref(false);
        const browserPlanetUserData: any = inject('browserPlanetUserData', null);
        const menuDom = shallowRef();

        const currentOpen: any = ref('all');
        const currentSecondaryOpen = ref();

        const handleOpen = (l1: String | Number) => {
            if (l1 === currentOpen.value && !currentSecondaryOpen.value) {
                return;
            }
            currentOpen.value = l1;
            currentSecondaryOpen.value = '';
            bus.emit('browserCategory', {
                l1,
            });
        };

        const childrenClick = (l1, l2) => {
            currentOpen.value = l1;
            currentSecondaryOpen.value = l2;
            bus.emit('browserCategory', {
                l1,
                l2,
            });
        };

        return {
            currentOpen,
            currentSecondaryOpen,
            isFixed,
            browserPlanetUserData,
            menuDom,
            childrenClick,
            handleOpen,
        };
    },
});
</script>

<style lang="less" scoped>
.category {
    @apply w-full border rounded-xl border-light-700 overflow-hidden bg-white dark:(border-dark-300 bg-dark-600);

    .item {
        @apply border-t-1 border-light-500 2xl:(text-base) flex cursor-pointer h-15 items-center text-sm relative px-5 text-dark-700 transition duration-300 dark:(text-light-900/80 border-dark-100);

        i {
            position: absolute;
            right: 10px;
            transition: @transition;
        }

        &:hover {
            @apply transition duration-300 bg-purple-50 dark:(bg-dark-400);
        }

        &:first-child {
            border-top: none;
        }

        &.active {
            background: rgba(128, 110, 242, 0.1);
            color: rgba(139, 92, 246, 1);

            i {
                transition: @transition;
                transform: rotate(180deg);
            }
        }

        &.noC {
            color: rgba(48, 49, 51, 1);
            @apply dark:(text-light-900/80);
        }
    }

    .child {
        max-height: 0;
        overflow: hidden;

        .item {
            .padding(0, 40, 0, 40);
        }

        &.open {
            max-height: none;
        }
    }

    .menus {
        max-height: 480px;
        overflow-y: auto;
        .scrollbar();
    }
}

:deep(.el-menu) {
    border-radius: none !important;
    border-right: none;

    @apply dark:(bg-dark-600);

    >.el-menu-item {
        &.is-active {
            background: rgba(128, 110, 242, 0.1);
        }
    }

    .el-menu-item {
        @apply border-t-1 border-light-500 2xl:(text-base) dark:(bg-dark-600 border-dark-300 text-light-900/80);

        &:hover {
            @apply bg-purple-50 dark:(bg-dark-300);
        }

        &:first-child {
            border-top: none;
        }

        &.is-active {
            @apply text-purple-500;
        }
    }

    .el-sub-menu {
        &.is-opened {
            background: rgba(128, 110, 242, 0.1) !important;
        }

        .el-sub-menu__title {
            @apply border-t-1 border-light-700 2xl:(text-base) dark:(bg-dark-600 border-dark-300 text-light-900/80);

            &:hover {
                @apply bg-purple-50 dark:(bg-dark-300);
            }
        }
    }
}
</style>
