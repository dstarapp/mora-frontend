<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { TrimmedUnionTransmitShowView } from '../../../../../types/parts/shows';
import { TrimmedSubtypeShowViewConstraint } from '../../../../../types/parts/shows/combined';
import WrappedViewRenderVue from '../WrappedViewRender.vue';

const props = defineProps({
    view: {
        type: Object as PropType<{
            subtype: TrimmedUnionTransmitShowView;
            subitems?: undefined;
            constraint: TrimmedSubtypeShowViewConstraint; // show constraint
        }>,
        required: true,
    },
});

const ui = computed(() => props.view.constraint.ui ?? {});
</script>

<template>
    <div class="opt-view-render-content">
        <div class="label" v-if="ui.customLabel">
            <span>{{ ui.customLabel }}</span>
        </div>
        <div
            class="opt-content"
            :class="{
                column: !ui.flexDirection || ui.flexDirection === 'column',
                row: ui.flexDirection === 'row',
            }"
        >
            <div class="opt-item">
                <WrappedViewRenderVue :view="props.view.subtype" />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.opt-view-render-content {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0 26px;

    .label {
        font-size: 18px;
        color: #000;
        text-align: center;
        line-height: 33px;
        flex-shrink: 0;
        padding: 20px 0 15px 0;
        @apply dark:(text-light-900/80);
    }

    .opt-content {
        display: flex;

        .opt-item {
            margin-bottom: 10px;
            &.txtList {
                @apply relative;
                i {
                    @apply w-5px h-5px rounded-full bg-green-500 absolute left-3 top-1/2 transform -translate-y-1/2;
                }
            }
        }

        &.column {
            flex-direction: column;
        }

        &.row {
            flex-direction: row;
            flex-shrink: 0;
            overflow-x: scroll;
        }
    }
}
</style>
