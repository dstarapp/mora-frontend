<template>
    <div class="footer">
        <div class="box">
            <div>
                <img src="@/assets/svg/editor-logo.svg" class="h-9 <sm:(hidden)" />
                <div class="text block mt-2 text-sm">
                    {{ CONFIG.footerContent }}
                </div>
            </div>
            <div class="social">
                <i @click="jumpLink(CONFIG.footerLink.twitter)" class="iconfont icon-twitter2" />
                <i @click="jumpLink(CONFIG.footerLink.github)" class="iconfont icon-github" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CONFIG from '@/assets/config';
import store from '@/store';

export default defineComponent({
    name: 'Footer',
    setup() {
        const jumpLink = (link) => {
            window.open(link);
        };

        return {
            CONFIG,
            store,
            jumpLink,
        };
    },
});
</script>

<style lang="less" scoped>
.footer {
    @apply w-full mt-8 pt-4 pb-3 bg-light-600 dark:(bg-dark-600);
    .box {
        @apply max-w-384 mx-auto flex justify-between items-center <sm:(px-5) sm:(px-5) md:(px-5) lg:(px-10) xl:(px-20) 2xl:(px-8);
        .text {
            @apply dark:(text-light-900/50);
        }
        .social {
            i {
                @apply text-3xl ml-4;
                &.icon-twitter2 {
                    @apply text-blue-400 transition duration-300 hover: (text-blue-500 transition duration-300 cursor-pointer);
                }
                &.icon-github {
                    @apply text-green-500 transition duration-300 hover: (text-green-600 transition duration-300 cursor-pointer);
                }
                &.icon-discord {
                    @apply text-indigo-500 transition duration-300 hover: (text-indigo-600 transition duration-300 cursor-pointer);
                }
            }
        }
    }
}
</style>
