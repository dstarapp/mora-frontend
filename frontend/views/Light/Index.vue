<template>
    <div class="layout">
        <Header />
        <router-view></router-view>
        <Footer />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Header from './plugin/Header.vue';
import Footer from './plugin/Footer.vue';

export default defineComponent({
    components: { Header, Footer },
    props: {},
    name: 'Plugin',
    setup() {
        return {};
    },
});
</script>

<style scoped lang="less">
.layout {
    @apply w-full min-h-full;
    background: url(@/assets/svg/plugin-bg.svg) #fff no-repeat left top;
    // background-size: contain;
    background-size: 100% auto;
}

.dark {
    .layout {
        background: url(@/assets/svg/plugin-dark-bg.svg) #0f0f0f no-repeat left top;
        // background-size: contain;
        background-size: 100% auto;
    }
}
</style>
