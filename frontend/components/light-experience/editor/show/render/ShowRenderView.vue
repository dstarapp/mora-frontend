<script lang="ts" setup>
import { PropType } from 'vue';
import { ActionValues } from '../../../types/common/value';
import { DataShow } from '../../../types/parts/show';
import WrappedViewRenderVue from './ui/WrappedViewRender.vue';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    show: {
        type: Object as PropType<DataShow>,
        required: true,
    },
});
</script>

<template>
    <div class="show-render-view-content">
        <WrappedViewRenderVue :view="props.show.show.view" />
    </div>
</template>

<style lang="less" scoped>
.show-render-view-content {
    width: 100%;
}
</style>
