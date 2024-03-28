<template>
    <el-dialog v-model="dialogVisible" :title="$t('rss.title')" @closed="afterClose">
        <template v-if="linkText.length">
            <div class="box">
                <div class="link" v-for="(item, index) in linkText" :key="index">
                    <p class="txt"> {{ CONFIG.rssLinkBaseUrl }}{{ item }} </p>
                    <button @click="copyText(CONFIG.rssLinkBaseUrl + item)">
                        <i class="iconfont icon-copy"></i>
                    </button>
                </div>
                <p><i class="iconfont icon-attention"></i>{{ $t('rss.txt') }}</p>
            </div>
        </template>
        <div class="box" v-else>
            <div class="link">
                <p class="txt">
                    {{ CONFIG.rssLinkBaseUrl }}{{ store.state.current_open_planet }}
                </p>
                <button @click="copyText(CONFIG.rssLinkBaseUrl + store.state.current_open_planet)">
                    <i class="iconfont icon-copy"></i>
                </button>
            </div>
            <p><i class="iconfont icon-attention"></i>{{ $t('rss.txt') }}</p>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { copyText } from '@/utils/functions';
import store from '@/store';
import CONFIG from '@/assets/config';

export default defineComponent({
    emits: ['close'],
    props: {
        linkText: {
            type: Array,
            default: [],
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);

        const afterClose = () => {
            context.emit('close');
        };

        return {
            dialogVisible,
            store,
            CONFIG,
            copyText,
            afterClose,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full;
    .link {
        @apply mb-5 w-full bg-light-600 rounded-xl p-2 flex justify-between items-center dark:(bg-dark-900);
        .txt {
            @apply text-blue-500 pl-2 text-sm flex-1 <sm:(leading-4);
        }
        button {
            @apply ml-3 rounded-lg bg-purple-500 text-white flex items-center justify-center px-3 py-2 border-none transition duration-300 hover:(bg-purple-400 transition duration-300);
        }
    }
    p {
        @apply w-full text-sm break-normal text-dark-500/60 text-left <sm:(px-0) dark:(text-light-900/60);
        i {
            @apply text-dark-50/40 mr-2 dark:(text-light-900/50);
        }
    }
}
</style>
