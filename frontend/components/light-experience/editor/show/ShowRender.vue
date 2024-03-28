<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { ActionValues } from '../../types/common/value';
import { DataShow } from '../../types/parts/show';
import ShowRenderViewVue from './render/ShowRenderView.vue';

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

const show = computed(() => props.show.show);
</script>

<template>
    <div class="show-render-content">
        <ShowRenderViewVue :values="props.values" :show="props.show" />
    </div>
</template>

<style lang="less" scoped>
.show-render-content {
    width: 100%;
}
</style>
