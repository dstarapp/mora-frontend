<script lang="ts" setup>
import { PropType, computed } from 'vue';
import {
    TrimmedCombinedShowViewSubitem,
    TrimmedSubitemsShowViewConstraint,
} from '../../../../../types/parts/shows/combined';
import WrappedViewRenderVue from '../WrappedViewRender.vue';

const props = defineProps({
    view: {
        type: Object as PropType<{
            subtype?: undefined;
            subitems: TrimmedCombinedShowViewSubitem[];
            constraint: TrimmedSubitemsShowViewConstraint; // show constraint
        }>,
        required: true,
    },
});

const ui = computed(() => props.view.constraint.ui ?? {});
</script>

<template>
    <div class="variant-view-render-content">
        <div class="label" v-if="ui.customLabel">
            <span>{{ ui.customLabel }}</span>
        </div>
        <div class="variant-content column">
            <template v-for="(subitem, index) in props.view.subitems" ::key="index">
                <div class="variant-item">
                    <WrappedViewRenderVue :view="subitem.view" />
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.variant-view-render-content {
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
    .variant-content {
        display: flex;
        &.column {
            flex-direction: column;
        }

        &.row {
            flex-direction: row;
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        :deep(.variant-item) {
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
