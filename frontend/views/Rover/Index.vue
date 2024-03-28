<template>
    <Header />
    <div translate="yes" class="rover" :class="{ hide: route.name === 'roverClaim' }">
        <div class="left">
            <Menu />
        </div>
        <div class="main">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import Header from './plugin/Header.vue';
import Menu from './plugin/Menu.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { Header, Menu },
    name: 'Rover',
    setup() {
        const route = useRoute();

        return {
            route,
        };
    },
});
</script>

<style scoped lang="less">
.rover {
    display: flex;
    align-items: flex-start;
    margin: 0 auto;
    width: 100vw;
    max-width: 1260px;
    .padding(95, 30, 0, 30);

    .left {
        display: flex;
        order: 1;
        flex-direction: column;
        .margin(0, 40, 0, 0);
        .width(320);
        min-width: 280px;
        position: relative;
        opacity: 1;
        transition: 0.05s;
        overflow: hidden;
    }

    .main {
        display: flex;
        flex: 1;
        order: 2;
        height: auto;
        background: @bg-color;
        .padding(38, 35, 38, 35);
        .margin(0, 0, 30, 0);
        margin-bottom: 30px;
        .border-radius(25);
        min-height: 814px;
        position: relative;
        @apply dark:(bg-dark-600);
    }

    .noScrollbar();

    &.hide {
        max-width: 1442px;

        .left {
            width: 0;
            min-width: auto;
            max-width: none;
            margin: 0;
            opacity: 0;
            transition: @transition;
            overflow: hidden;
        }

        .main {
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1240px) {
    .rover {
        .padding(70, 30, 0, 30);

        .main {
            min-height: 80vh;
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .rover {
        flex-direction: column;
        justify-content: flex-start;
        .padding-media(95, 20, 0, 20);

        .left {
            width: 100%;
            max-width: 750px;
            margin-right: 0;
            order: 2;

            .user {
                width: 100%;
            }
        }

        .main {
            order: 1;
            flex: none;
            width: 100%;
            .padding-media(30, 25, 30, 25);
            min-height: calc(100vh - 90px);
        }
    }
}
</style>
