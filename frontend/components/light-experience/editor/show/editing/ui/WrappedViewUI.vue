<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { TrimmedUnionTransmitShowView } from '../../../../types/parts/shows';
import { deepClone } from '@mora-light/core/types/common';
import { TrimmedCombinedShowViewSubitem } from '../../../../types/parts/shows/combined';
import TextViewUIVue from './basic/TextViewUI.vue';
import BoolViewUIVue from './basic/BoolViewUI.vue';
import ImageViewUIVue from './basic/ImageViewUI.vue';
import TableViewUIVue from './basic/TableViewUI.vue';
import VecViewUIVue from './combined/VecViewUI.vue';
import OptViewUIVue from './combined/OptViewUI.vue';
import RecordViewUIVue from './combined/RecordViewUI.vue';
import VariantViewUIVue from './combined/VariantViewUI.vue';
import TupleViewUIVue from './combined/TupleViewUI.vue';

const props = defineProps({
    view: {
        type: Object as PropType<TrimmedUnionTransmitShowView>,
        required: true,
    },
});

const view = ref<TrimmedUnionTransmitShowView>(deepClone(props.view));

const emit = defineEmits(['changed']);

const onSubtypeChanged = (subtype: TrimmedUnionTransmitShowView[]) => {
    (view.value as any).subtype = deepClone(subtype);
    emit('changed', deepClone(view.value));
};

const onSubitemsChanged = (subitems: TrimmedCombinedShowViewSubitem[]) => {
    (view.value as any).subitems = deepClone(subitems);
    emit('changed', deepClone(view.value));
};

const onUIChanged = (ui: Record<string, any>) => {
    view.value.constraint.ui = deepClone(ui);
    emit('changed', deepClone(view.value));
};
</script>

<template>
    <div class="wrapped-view-ui">
        <!-- basic -->
        <template v-if="view.constraint.name === 'TextView'">
            <TextViewUIVue :ui="view.constraint.ui ?? {}" @uiChanged="onUIChanged" />
        </template>
        <template v-if="view.constraint.name === 'BoolView'">
            <BoolViewUIVue :ui="view.constraint.ui ?? {}" @uiChanged="onUIChanged" />
        </template>
        <template v-if="view.constraint.name === 'ImageView'">
            <ImageViewUIVue :ui="view.constraint.ui ?? {}" @uiChanged="onUIChanged" />
        </template>
        <template v-if="view.constraint.name === 'TableView'">
            <TableViewUIVue :ui="view.constraint.ui ?? {}" @uiChanged="onUIChanged" />
        </template>
        <!-- combined subtype -->
        <template v-if="view.constraint.name === 'VecView'">
            <VecViewUIVue
                :subtype="view.subtype!"
                :ui="view.constraint.ui ?? {}"
                @subtypeChanged="onSubtypeChanged"
                @uiChanged="onUIChanged"
            />
        </template>
        <template v-if="view.constraint.name === 'OptView'">
            <OptViewUIVue
                :subtype="view.subtype!"
                :ui="view.constraint.ui ?? {}"
                @subtypeChanged="onSubtypeChanged"
                @uiChanged="onUIChanged"
            />
        </template>
        <!-- combined subitems -->
        <template v-if="view.constraint.name === 'RecordView'">
            <RecordViewUIVue
                :subitems="view.subitems!"
                :ui="view.constraint.ui ?? {}"
                @subitemsChanged="onSubitemsChanged"
                @uiChanged="onUIChanged"
            />
        </template>
        <template v-if="view.constraint.name === 'VariantView'">
            <VariantViewUIVue
                :subitems="view.subitems!"
                :ui="view.constraint.ui ?? {}"
                @subitemsChanged="onSubitemsChanged"
                @uiChanged="onUIChanged"
            />
        </template>
        <template v-if="view.constraint.name === 'TupleView'">
            <TupleViewUIVue
                :subitems="view.subitems!"
                :ui="view.constraint.ui ?? {}"
                @subitemsChanged="onSubitemsChanged"
                @uiChanged="onUIChanged"
            />
        </template>
    </div>
</template>

<style lang="less" scoped>
.wrapped-view-ui {
    width: 100%;
}
</style>
