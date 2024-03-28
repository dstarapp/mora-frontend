<script lang="ts" setup>
import { PropType } from 'vue';
import { ActionValues } from '../../types/common/value';
import { DataShow } from '../../types/parts/show';
import ShowEditingViewVue from './editing/ShowEditingView.vue';
import { TrimmedUnionTransmitShowView } from '../../types/parts/shows';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    data: {
        type: Object as PropType<DataShow>,
        required: true,
    },
});

const emit = defineEmits(['complete']);

const onComplete = (r: { id: string; view: TrimmedUnionTransmitShowView } | undefined) => {
    if (r === undefined) {
        emit('complete');
        return;
    }

    const value: DataShow = {
        id: props.data.id,
        show: {
            id: r.id,
            view: r.view,
        },
    };

    emit('complete', value);
};
</script>

<template>
    <div class="show-editing-content">
        <ShowEditingViewVue
            :title="props.title"
            :values="props.values"
            :id="props.data.show.id"
            :view="props.data.show.view"
            @complete="onComplete"
        />
    </div>
</template>

<style lang="less" scoped>
.show-editing-content {
    width: 100%;
}
</style>
