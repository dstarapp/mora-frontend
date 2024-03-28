<template>
    <div class="backhome" @click="openHome">
        <i class="iconfont icon-home"></i>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import CONFIG from '@/assets/config';

export default defineComponent({
    components: {},
    setup() {
        const router = useRouter();

        const openHome = () => {
            if (CONFIG.indexPageLink) {
                window.open(CONFIG.indexPageLink);
                return;
            }
            router.push('/');
        };

        return {
            openHome,
        };
    },
});
</script>

<style lang="less" scoped>
.backhome {
    position: fixed;
    .left(30);
    .bottom(30);
    .width(45);
    .height(45);
    min-width: 45px;
    min-height: 45px;
    border-radius: 15px;
    background-color: @bg-color-body-active;
    transition: @transition;
    z-index: 9999;
    .center();
    color: @text-color-inverse;
    @apply dark:(bg-light-700 shadow shadow-xl text-black hover:(text-white));

    i {
        .font-size(16);
    }

    &:hover {
        cursor: pointer;
        background-color: @text-active;
        transition: @transition;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .backhome {
        .left(50);
        .bottom(70);
    }
}
</style>
