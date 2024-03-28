<template>
    <div class="mentionBox">
        <div class="inputbox">
            <span>@</span>
            <input ref="inputDom" type="text" v-model="planetName" :placeholder="$t('editor.mention.searchInput')" />
        </div>
        <div class="authors">
            <div class="list" v-for="item in planetData" @click="addEditor(item)">
                <img :src="getImagesUrl(item.avatar)" alt="" />
                <div class="ainfo">
                    <div class="name">
                        <p>{{ item.name }}</p>
                    </div>
                    <div class="subs">
                        {{ item.subcriber }}
                        <i>{{ $t('editor.mention.subscribes') }}</i>
                    </div>
                </div>
                <span class="pid">{{ dealPid(item.canister) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
import { dealPid, getImagesUrl } from '@/utils/functions';
import { IDomEditor } from '@wangeditor/editor';
import { getHomeSearch } from '@/request/axios/bv';
import bus from 'vue3-eventbus';
import _ from 'lodash';

export default defineComponent({
    name: 'GetAuthors',
    props: {
        editor: {
            type: Object as () => IDomEditor,
        },
    },
    emits: ['componentClose'],
    setup(props, context) {
        const planetName = ref('');
        const planetData: any = ref([]);
        const data = ref();
        const limit = ref(30);
        const inputDom = ref();

        const throttledGetHomeSearch = _.throttle(async () => {
            if (!planetName.value) {
                planetData.value = [];
                return;
            }
            let res = await getHomeSearch({
                keyword: planetName.value,
                type: 'Planet',
                limit: limit.value,
            });
            if (res.canister) {
                planetData.value = res.canister;
            } else if (res.name) {
                planetData.value = res.name;
            } else {
                planetData.value = [];
            }
        }, 500);

        watch(() => planetName.value, throttledGetHomeSearch, { immediate: true });

        const addEditor = (item) => {
            const modalElem = document.getElementById('mention-modal');
            if (!modalElem) {
                return;
            }
            props.editor.restoreSelection();

            props.editor.deleteBackward('character');
            const mentionNode = {
                type: 'mention',
                value: item.name,
                info: item.canister,
                children: [{ text: '' }],
            };

            props.editor.insertNode(mentionNode);

            props.editor.move(1);
            planetName.value = '';
            modalElem.style.display = 'none';
        };

        const mentionOpen = () => {
            planetName.value = '';
            planetData.value = [];
        };

        onMounted(() => {
            bus.on('mentionOpen', mentionOpen);
        });

        onUnmounted(() => {
            bus.off('mentionOpen', mentionOpen);
        });

        return {
            planetName,
            data,
            planetData,
            inputDom,
            dealPid,
            addEditor,
            getImagesUrl,
        };
    },
});
</script>

<style scoped lang="less">
.mentionBox {
    @apply w-80 flex flex-col bg-white rounded-xl overflow-hidden absolute top-50 left-1/2 dark:(bg-dark-600);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    display: none;

    .inputbox {
        @apply mt-4 mx-4 border border-light-700 rounded-lg overflow-hidden flex items-center transition duration-300 hover:(border border-blue-500 transition duration-300 dark:(border-blue-500)) dark:(border-dark-100);

        span {
            @apply px-3 text-blue-500;
        }

        input {
            @apply flex-1 h-10 w-full pr-3 border-transparent bg-transparent;
        }
    }

    .authors {
        @apply w-full mt-2 pb-2 max-h-80 overflow-y-auto;
        .scrollbar();

        .list {
            @apply w-full px-4 py-2 flex items-center justify-between transition duration-300;

            img {
                @apply w-8 h-8 mr-3 rounded-full;
            }

            .ainfo {
                @apply w-full flex-1 flex flex-col;

                .name {
                    @apply w-full flex items-center;

                    p {
                        @apply max-w-30 truncate text-sm dark:(text-light-900);
                    }

                    i {
                        @apply ml-2 text-sm text-purple-500;
                    }
                }

                .subs {
                    @apply w-full text-gray-600 text-xs font-medium dark:(text-light-900/80);

                    i {
                        @apply pl-1 text-xs not-italic text-gray-400 font-normal dark:(text-light-900/50);
                    }
                }
            }

            .pid {
                @apply bg-gray-100 px-6px py-1px rounded-full text-xs text-gray-500 font-normal dark:(bg-dark-200 text-light-800/80);
            }

            &:hover {
                @apply transition duration-300 cursor-pointer bg-light-500 dark:(bg-dark-900);

                .pid {
                    @apply bg-gray-300 text-gray-700 dark:(bg-dark-200 text-light-800/80);
                }
            }
        }
    }

    .loading {
        @apply w-full h-40 flex justify-center items-center;

        img {
            @apply w-6;
        }
    }
}
</style>
