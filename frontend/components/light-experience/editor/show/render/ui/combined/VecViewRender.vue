<script lang="ts" setup>
import { PropType } from 'vue';
import TextViewRenderVue from '../basic/TextViewRender.vue';
import BoolViewRenderVue from '../basic/BoolViewRender.vue';
import ImageViewRenderVue from '../basic/ImageViewRender.vue';
import RecordViewRenderVue from './RecordViewRender.vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
    subtype: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});
</script>

<template>
    <div class="vec-view-render-content">
        <div class="label" v-if="props.ui.customLabel">
            <span>{{ props.ui.customLabel }}</span>
        </div>
        <div
            class="vec-content"
            :class="{
                column: !props.ui.flexDirection || props.ui.flexDirection === 'column',
                row: props.ui.flexDirection === 'row',
            }"
        >
            <template v-if="props.subtype.constraint.name === 'TextView'">
                <div class="vec-item txtList" v-for="i in 2" :key="i">
                    <i></i>
                    <TextViewRenderVue :ui="props.subtype.constraint.ui ?? {}" />
                </div>
            </template>
            <template v-if="props.subtype.constraint.name === 'BoolView'">
                <div class="vec-item" v-for="i in 2" :key="i">
                    <BoolViewRenderVue :ui="props.subtype.constraint.ui ?? {}" />
                </div>
            </template>
            <template v-if="props.subtype.constraint.name === 'ImageView'">
                <div class="vec-item" v-for="i in 2" :key="i">
                    <ImageViewRenderVue :ui="props.subtype.constraint.ui ?? {}" />
                </div>
            </template>
            <template v-if="props.subtype.constraint.name === 'RecordView'">
                <div class="vec-item" v-for="i in 2" :key="i">
                    <RecordViewRenderVue
                        :ui="props.subtype.constraint.ui ?? {}"
                        :subitems="props.subtype.subitems ?? []"
                    />
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.vec-view-render-content {
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

    .vec-content {
        display: flex;

        .vec-item {
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
