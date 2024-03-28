<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';
import { ActionValues } from '../../../../../types/common/value';
import { TupleCandidType } from '@mora-light/core/types/candid';
import {
    CanisterActionResult,
    CanisterActionResultTuple,
} from '../../../../../types/parts/canisters';
import { Transform, findTransformToCandidType } from '@mora-light/core/types/transform';
import { deepClone } from '@mora-light/core/types/common';
import { v4 as uuid } from 'uuid';
import ExportValueDialogVue from '../../../../modules/exported/ExportValueDialog.vue';
import WrappedResultEditingVue from '../WrappedResultEditing.vue';

const isSingleEmpty = (item: CanisterActionResult): boolean => {
    if (item.exported?.id && item.exported.name) return false;
    if (item.subitems !== undefined) {
        for (let i = 0; i < item.subitems.length; i++) {
            if (!isSingleEmpty(item.subitems[i])) return false;
        }
    }
    return true;
};
const isEmpty = (subitems: CanisterActionResult[]): boolean => {
    for (let i = 0; i < subitems.length; i++) {
        if (!isSingleEmpty(subitems[i])) return false;
    }
    return true;
};

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    type: {
        type: Object as PropType<TupleCandidType>,
        required: true,
    },
    result: {
        type: Object as PropType<CanisterActionResultTuple>,
        required: true,
    },
});

const expand = ref<boolean>(props.result.subitems !== undefined);

const name = ref<string>(props.result.exported?.name ?? '');
const transform = ref<Transform | undefined>(props.result.exported?.transform);

const emit = defineEmits(['complete']);

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

const length = computed<number>(() => props.type.subitems.length);
const subitems = ref<CanisterActionResult[]>(
    props.result.subitems ??
    (() => {
        const results: CanisterActionResult[] = [];
        for (let i = 0; i < props.type.subitems.length; i++) {
            results[i] = {
                type: deepClone(props.type.subitems[i].type),
                exported: { id: '', name: '' },
            };
        }
        return results;
    })(),
);

const onComplete = () => {
    if (name.value) {
        const id = props.result.exported?.id ? props.result.exported?.id : uuid();
        if (isEmpty(subitems.value)) {
            emit('complete', {
                type: deepClone(props.type),
                exported: transform.value
                    ? { id, name: name.value, transform: transform.value }
                    : { id, name: name.value },
            });
        } else {
            emit('complete', {
                type: deepClone(props.type),
                exported: transform.value
                    ? { id, name: name.value, transform: transform.value }
                    : { id, name: name.value },
                subitems: subitems.value,
            });
        }
    } else {
        emit('complete', {
            type: deepClone(props.type),
            exported: { id: '', name: '' },
        });
        if (isEmpty(subitems.value)) {
            emit('complete', {
                type: deepClone(props.type),
            });
        } else {
            emit('complete', {
                type: deepClone(props.type),
                subitems: subitems.value,
            });
        }
    }
};

const onResultItemComplete = (index: number, r: CanisterActionResult) => {
    subitems.value[index] = r;
    onComplete();
};

const onCancelExportValue = () => {
    name.value = '';
    transform.value = undefined;
};

watch(
    () => [name.value, transform.value, subitems.value],
    () => onComplete(),
    { immediate: true },
);
</script>

<template>
    <div class="tuple-result-editing-content">
        <div class="main-type">
            <span class="type">
                {{ props.type.type }}
                <i>tuple { {{ props.type.subitems.length }} fields}</i>
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
                </span>
                <span class="delete" @click="onCancelExportValue">
                    <i class="iconfont icon-failed"></i>
                </span>
            </div>
            <span class="expand" @click="expand = !expand">
                <i :class="{ open: !expand }" class="iconfont icon-plugin-aup"></i>
            </span>
        </div>
        <div class="expand-list" v-if="expand">
            <div class="items">
                <div class="item" v-for="i in length">
                    <span>{{ i }}</span>
                    <WrappedResultEditingVue :values="props.values" :type="props.type.subitems[i - 1].type"
                        :result="subitems[i - 1]" @complete="(r) => onResultItemComplete(i - 1, r)" />
                </div>
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

.tuple-result-editing-content {
    // width: 100%;
}
</style>
