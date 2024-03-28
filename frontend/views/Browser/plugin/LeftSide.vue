<template>
    <div
        class="fixed right-0 top-0 bottom-0 z-160 bg-white dark:(bg-dark-600) <sm:(w-4/5) md:(w-3/5)"
    >
        <div class="w-full mt-5 ml-5">
            <i class="iconfont icon-close" @click="close"></i>
        </div>
        <Planet />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Planet from './Planet.vue';

export default defineComponent({
    components: { Planet },
    emits: ['showPlanet'],
    props: {
        type: {
            type: Number,
        },
        msg: {
            type: String,
        },
    },
    setup(props, context) {
        const close = () => {
            context.emit('showPlanet');
        };

        return { close };
    },
});
</script>

<style lang="less" scoped>
:deep(.planet) {
    @apply border-none w-full ml-0 px-5 pt-10;
}
.icon-close {
    @apply dark:(text-gray-400);
}
</style>
