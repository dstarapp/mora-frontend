<script lang="ts" setup>
import { PropType } from 'vue';
import { TrimmedUnionTransmitShowView } from '../../../../types/parts/shows';
import TextViewRenderVue from './basic/TextViewRender.vue';
import BoolViewRenderVue from './basic/BoolViewRender.vue';
import ImageViewRenderVue from './basic/ImageViewRender.vue';
import TableViewRenderVue from './basic/TableViewRender.vue';
import VecViewRenderVue from './combined/VecViewRender.vue';
import OptViewRenderVue from './combined/OptViewRender.vue';
import RecordViewRenderVue from './combined/RecordViewRender.vue';
import VariantViewRenderVue from './combined/VariantViewRender.vue';
import TupleViewRenderVue from './combined/TupleViewRender.vue';

const props = defineProps({
    view: {
        type: Object as PropType<TrimmedUnionTransmitShowView>,
        required: true,
    },
});
</script>

<template>
    <div class="wrapped-view-render-content">
        <!-- basic -->
        <template v-if="props.view.constraint.name === 'TextView'">
            <TextViewRenderVue :ui="props.view.constraint.ui ?? {}" />
        </template>
        <template v-if="props.view.constraint.name === 'BoolView'">
            <BoolViewRenderVue :ui="props.view.constraint.ui ?? {}" />
        </template>
        <template v-if="props.view.constraint.name === 'ImageView'">
            <ImageViewRenderVue :ui="props.view.constraint.ui ?? {}" />
        </template>
        <template v-if="props.view.constraint.name === 'TableView'">
            <TableViewRenderVue :ui="props.view.constraint.ui ?? {}" />
        </template>
        <!-- combined subtype -->
        <template v-if="props.view.constraint.name === 'VecView'">
            <VecViewRenderVue :ui="props.view.constraint.ui ?? {}" :subtype="props.view.subtype!" />
        </template>
        <template v-if="props.view.constraint.name === 'OptView'">
            <OptViewRenderVue :view="(props.view as any)" />
        </template>
        <!-- combined subitems -->
        <template v-if="props.view.constraint.name === 'RecordView'">
            <RecordViewRenderVue
                :ui="props.view.constraint.ui ?? {}"
                :subitems="props.view.subitems ?? []"
            />
        </template>
        <template v-if="props.view.constraint.name === 'VariantView'">
            <VariantViewRenderVue :view="(props.view as any)" />
        </template>
        <template v-if="props.view.constraint.name === 'TupleView'">
            <TupleViewRenderVue :view="(props.view as any)" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.wrapped-view-render-content {
    width: 100%;
}
</style>
