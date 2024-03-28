<template>
    <el-dialog class="w828 localHistoryBox" :title="$t('editor.localHistory.title')" v-model="dialogVisible"
        :before-close="handleClose" @closed="afterClose">
        <div class="left">
            <h3>
                <i class="iconfont icon-editor-history"></i>
                {{ $t('editor.localHistory.title') }}
            </h3>
            <div class="timeline">
                <el-timeline>
                    <el-timeline-item v-for="(item, index) in localHistoryData" :key="index"
                        @click="chooseLocalHistory(index)" :timestamp="$t('editor.localHistory.autoSave')"
                        :hollow="true" :class="{ current: currentChooseDataIdx === index }">
                        {{ moment(item.editorTime).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>
        <div class="right">
            <div class="previewBox" v-if="currentData">
                <Preview :content="currentData.article.content" :title="currentData.article.title" />
            </div>
            <div class="noData" v-else>
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverDashboard.noData') }}</p>
            </div>
            <div class="recovery">
                <div v-if="currentData" @click="recovery" class="recovery">
                    <i class="iconfont icon-editor-recovery"></i>
                    {{ $t('editor.localHistory.recovery') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, Ref, nextTick } from 'vue';
import moment from 'moment';
import _ from 'lodash';
import Preview from '@/components/Preview.vue';
import debug from '@/utils/debug';

export default defineComponent({
    components: { Preview },
    name: 'LocalHistory',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: {
            type: Object,
        },
    },
    setup(props, context) {
        const articleId: Ref<string> | undefined = inject('articleId', null)!;
        const dialogVisible = ref(true);

        const localHistoryData: Ref<any[]> = ref([]);
        const currentChooseDataIdx = ref(0);
        const currentData = ref();

        const title = ref('');
        const content = ref('');

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const chooseLocalHistory = (idx) => {
            if (currentChooseDataIdx.value === idx) {
                return;
            }
            currentChooseDataIdx.value = idx;
            currentData.value = '';
            nextTick(() => {
                currentData.value = localHistoryData.value[idx];
            });
        };

        const recovery = () => {
            if (props.insertCallback) {
                props.insertCallback(currentData.value);
            }
            handleClose();
        };

        const clearHistory = () => { };

        onMounted(() => {
            if (!props.componentDefaultValue || !articleId.value) {
                return;
            }

            let customerObjectStore = props.componentDefaultValue
                .transaction('moraArticleData', 'readwrite')
                .objectStore('moraArticleData');

            let request = customerObjectStore.get(articleId.value);
            request.onerror = (event) => {
                debug('failed', event, false);
            };

            request.onsuccess = () => {
                let arr = request.result?.articleData;
                if (arr && arr.length) {
                    localHistoryData.value = arr;
                    currentData.value = arr[0];
                }
            };
        });

        return {
            dialogVisible,
            title,
            content,
            localHistoryData,
            currentChooseDataIdx,
            moment,
            currentData,
            clearHistory,
            recovery,
            handleClose,
            afterClose,
            confirm,
            chooseLocalHistory,
        };
    },
});
</script>

<style scoped lang="less">
.localHistoryBox {
    display: flex;

    .left {
        display: flex;
        width: 220px;
        // height: 100%;
        border-right: 1px solid #e8e8e8;
        flex-direction: column;
        flex-shrink: 0;
        @apply dark:(border-dark-300);

        h3 {
            width: 100%;
            color: #121212;
            font-size: 17px;
            line-height: 24px;
            padding: 20px;
            font-weight: 500;
            display: flex;
            align-items: center;
            @apply dark:(text-light-900/80);

            i {
                color: #000;
                margin-right: 10px;
                font-weight: normal;
                @apply dark:(text-light-900/80);
            }
        }

        :deep(.timeline) {
            position: relative;
            height: 100%;
            margin: 0 0 0 20px;
            overflow-y: scroll;
            padding-top: 10px;
            .scrollbar();
            max-height: calc(85vh - 100px);

            .el-timeline-item {
                padding-bottom: 30px;

                &.current {
                    .el-timeline-item__node {
                        background: @bg-color-body-active;
                        transition: @transition;
                    }

                    .el-timeline-item__node.is-hollow {
                        border-color: @bg-color-body-active;
                        transition: @transition;
                    }

                    .el-timeline-item__wrapper {
                        .el-timeline-item__content {
                            color: @bg-color-body-active;
                            font-size: 14px;
                        }
                    }

                    .el-timeline-item__timestamp {
                        color: @bg-color-body-active;
                        font-size: 12px;
                    }
                }
            }

            .el-timeline-item__wrapper {
                cursor: pointer;

                .el-timeline-item__content {
                    font-size: 14px;
                    @apply dark:(text-light-900/80);
                }
            }

            .el-timeline-item__tail {
                border-color: #ebebeb;
                @apply dark:(border-dark-200);
            }

            .el-timeline-item__node {
                background: #fff;
                transition: @transition;
                @apply dark:(bg-dark-900);
            }

            .el-timeline-item__node.is-hollow {
                border-color: #999;
                transition: @transition;
                @apply dark:(border-dark-50);
            }

            .el-timeline-item__node--normal {
                width: 8px;
                height: 8px;
                left: 1px;
            }

            .el-timeline-item__content {
                font-size: 15px;
                line-height: 14px;
                color: #121212;
                text-align: left;
            }

            .el-timeline-item__timestamp {
                text-align: left;
                font-size: 12px;
                @apply dark:(text-light-900/40);
            }
        }
    }

    .right {
        display: flex;
        height: 100%;
        position: relative;
        flex: 1;
        flex-direction: column;

        :deep(.previewBox) {
            display: flex;
            width: 100%;
            max-width: 768px;
            height: 100%;
            overflow-y: scroll;
            position: relative;
            margin: 10px 0;
            padding: 0 30px;
            max-height: calc(85vh - 200px);
            .scrollbar();

            .container {
                width: 100% !important;

                .title,
                p {
                    word-break: break-word;
                }
            }
        }

        .recovery {
            .center();
            padding: 20px 0;

            .recovery {
                width: 60%;
                .center();
                background-color: @bg-color-body-active;
                color: @text-color-inverse;
                font-size: 14px;
                padding: 0 20px;
                height: 50px;
                border-radius: 10px;
                cursor: pointer;
                z-index: 2;
                margin-right: 15px;
                transition: @transition;

                i {
                    margin-right: 10px;
                    font-size: 18px;
                }

                &:hover {
                    transition: @transition;
                    background-color: #9185ec;
                }
            }
        }

        .noData {
            width: 100%;
            height: 100%;
            .padding(40, 0, 20, 0);
            text-align: center;
            .center();
            flex-direction: column;

            i {
                .font-size(70);
                .line-height(70);
                color: #dddddd;
            }

            p {
                width: 100%;
                display: block;
                .font-size(16);
                .padding(10, 0, 0, 0);
                color: @text-color-grey;
            }
        }
    }
}
</style>
