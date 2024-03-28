<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import { ActionValues } from '../../../../../types/common/value';
import { CanisterActionResultForce } from '../../../../../types/parts/canisters';
import { v4 as uuid } from 'uuid';
import ExportValueDialogVue from '../../../../modules/exported/ExportValueDialog.vue';
import { Transform, findTransformToCandidType } from '@mora-light/core/types/transform';
import { CandidType } from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    type: {
        type: Object as PropType<CandidType>,
        required: true,
    },
    result: {
        type: Object as PropType<CanisterActionResultForce>,
        required: true,
    },
});

const name = ref<string>(props.result.exported?.name ?? '');
const transform = ref<Transform | undefined>(props.result.exported?.transform);

const emit = defineEmits(['complete']);

watch(
    () => [name.value, transform.value],
    () => {
        if (name.value) {
            const id = props.result.exported?.id ? props.result.exported?.id : uuid();
            emit('complete', {
                type: deepClone(props.type),
                exported: transform.value
                    ? { id, name: name.value, transform: transform.value }
                    : { id, name: name.value },
            });
        } else {
            emit('complete', {
                type: deepClone(props.type),
                exported: { id: '', name: '' },
            });
        }
    },
    { immediate: true },
);

const exportValueShow = ref(false);
const onExportValue = () => (exportValueShow.value = true);
const onExportValueComplete = (
    r: { name: string; transform: Transform | undefined } | undefined,
) => {
    exportValueShow.value = false;
    if (r !== undefined) {
        transform.value = r.transform;
        name.value = r.name;
    }
};
const onCancelExportValue = () => {
    name.value = '';
    transform.value = undefined;
};
</script>

<template>
    <div class="basic-result-editing-content">
        <div class="main-type">
            <span class="type">
                {{ props.type.type }}
                <i v-if="props?.type?.subitems?.length">
                    {{ props.type.type }} { {{ props.type.subitems.length }} fields}
                </i>
            </span>
            <span class="select" @click="onExportValue">
                <i class="iconfont icon-plugin-export"></i>
            </span>
            <span class="to-type" v-if="transform">
                {{ findTransformToCandidType(transform)!.type }}
            </span>
            <div class="add-success" v-if="name">
                <span class="name">
                    {{ name }}
                    <i class="iconfont icon-edit" @click="onExportValue"></i>
                </span>
                <span class="delete" @click="onCancelExportValue">
                    <i class="iconfont icon-failed"></i>
                </span>
            </div>
        </div>

        <template v-if="exportValueShow">
            <ExportValueDialogVue :show="exportValueShow" :type="props.type" :id="props.result.exported?.id ?? ''"
                :name="name" :transform="transform" @complete="onExportValueComplete" />
        </template>
    </div>
</template>

<style lang="less" scoped>
@import '../public.less';

.basic-result-editing-content {
    // width: 100%;
}
</style>
