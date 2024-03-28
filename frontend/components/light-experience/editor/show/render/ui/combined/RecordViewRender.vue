<script lang="ts" setup>
import { PropType } from 'vue';
import TextViewRenderVue from '../basic/TextViewRender.vue';
import BoolViewRenderVue from '../basic/BoolViewRender.vue';
import ImageViewRenderVue from '../basic/ImageViewRender.vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    subitems: {
        type: Array as PropType<Record<string, any>>,
        required: true,
    },
});
</script>

<template>
    <div class="record-view-render-content">
        <div class="label" v-if="props.ui.customLabel">
            <span>{{ props.ui.customLabel }}</span>
        </div>
        <div
            class="record-content"
            :class="{
                column: !props.ui.flexDirection || props.ui.flexDirection === 'column',
                row: props.ui.flexDirection === 'row',
            }"
        >
            <template v-for="(item, index) in props.subitems" ::key="index">
                <template v-if="item.view.constraint.name === 'TextView'">
                    <div class="record-item">
                        <TextViewRenderVue :ui="item.view.constraint.ui ?? {}" />
                    </div>
                </template>
                <template v-if="item.view.constraint.name === 'BoolView'">
                    <div class="record-item">
                        <BoolViewRenderVue :ui="item.view.constraint.ui ?? {}" />
                    </div>
                </template>
                <template v-if="item.view.constraint.name === 'ImageView'">
                    <div class="record-item">
                        <ImageViewRenderVue :ui="item.view.constraint.ui ?? {}" />
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.record-view-render-content {
    display: flex;
    width: 100%;
    flex-direction: column;

    .label {
        font-size: 18px;
        color: #000;
        text-align: center;
        line-height: 33px;
        flex-shrink: 0;
        padding: 20px 0 15px 0;
        @apply dark:(text-light-900/80);
    }
    .record-content {
        display: flex;
        &.column {
            flex-direction: column;
        }

        &.row {
            flex-direction: row;
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        :deep(.record-item) {
            .text-view-render-content {
                .text-content {
                    @apply mb-2;
                }
            }
            .bool-view-render-content {
                .bool-content {
                    @apply mt-4;
                    .el-result {
                        .el-result__icon {
                            svg {
                                @apply !w-6 !h-6;
                            }
                        }
                        .el-result__title {
                            @apply !mt-1;
                        }
                    }
                }
            }
        }
    }
}
</style>
