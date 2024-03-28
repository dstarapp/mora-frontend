<template>
    <div class="dbox" v-if="store.state.directory_data.length">
        <div class="header">
            <div class="title" translate="yes">
                <i class="iconfont icon-directory"></i>
                {{ $t('utils.directory') }}
            </div>
            <i v-show="isView" @click="isView = false" class="iconfont icon-noview"></i>
            <i v-show="!isView" @click="isView = true" class="iconfont icon-views"></i>
        </div>
        <transition name="el-zoom-in-top">
            <ul v-show="isView" translate="yes">
                <li
                    v-for="(item, index) in store.state.directory_data"
                    :key="index"
                    @click="directorChange(item)"
                    :class="{ active: index === directoryIndex }"
                >
                    <span
                        v-if="item && item.text"
                        :class="{
                            level1: item.type === 'header1',
                            level2: item.type === 'header2',
                        }"
                    >
                        {{ item.text }}
                    </span>
                </li>
            </ul>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import bus from 'vue3-eventbus';
import store from '@/store';

export default defineComponent({
    props: {
        directoryIndex: {
            type: Number,
        },
    },
    setup() {
        const dialogVisible = ref(true);
        const isView = ref(true);

        const directorChange = (item) => {
            bus.emit('locateArticle', item);
        };

        return {
            dialogVisible,
            store,
            isView,
            directorChange,
        };
    },
});
</script>

<style lang="less" scoped>
.dbox {
    max-height: calc(100vh - 130px);
    overflow: scroll;
    .noScrollbar();
    .header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .font-size(18);
        .margin(0, 0, 20, 0);
        @apply <lg:(hidden);
        .title {
            display: flex;
            align-items: center;
            .font-size(18);
            font-weight: 500;
            padding-top: 0;
            @apply dark:(text-light-900/80);
        }
        i {
            margin-right: 8px;
            &.icon-directory {
                .font-size(14);
            }
            &.icon-noview,
            &.icon-views {
                .font-size(18);
                color: @text-color-grey;
                transition: @transition2;
                font-weight: 500;
                &:hover {
                    transition: @transition2;
                    color: @text-color;
                    cursor: pointer;
                    @apply dark:(text-light-900/80);
                }

                &.icon-views {
                    .font-size(16);
                }
            }
        }
    }

    ul {
        border-left: 2px solid @border-color;

        @apply <lg:(ml-2 border-none mt-5) dark:(border-dark-100);
        li {
            max-width: 100%;
            cursor: pointer;
            display: block;
            .margin(0, 0, 14, -2);
            .padding(0, 0, 0, 20);
            .ellipsis();
            transition: @transition2;
            color: @text-fcolor;
            @apply dark:(text-light-900/60) <lg:(!mb-6);

            span {
                
                &.level1 {
                    .font-size(14);
                    @apply <lg:(!text-lg);
                }
                &.level2 {
                    .font-size(12);
                    padding: 0 0 0 15px;
                    @apply <lg:(!text-base);
                }
            }

            &.active,
            &:hover {
                transition: @transition2;
                color: @text-color;
                font-weight: 500;
                border-left: 4px solid @border-color-active;
                color: @text-active;
                @apply dark:(text-purple-500);
            }
        }
    }
}
</style>
