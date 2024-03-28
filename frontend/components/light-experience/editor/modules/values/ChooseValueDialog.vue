<script lang="ts" setup>
import { ActionValues } from '../../../types/common/value';
import { PropType, ref, watch } from 'vue';
import ChooseValueVue from './ChooseValue.vue';
import { CandidType } from '@mora-light/core/types/candid';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    chosen: {
        type: Array as PropType<string[]>,
        required: true,
    },
    needs: {
        type: Function as PropType<(type: CandidType) => CandidType | undefined>,
        required: false,
    },
});

const show = ref(props.show);

watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');
const onClose = () => emit('complete');

const onComplete = (r: { id: string; type: CandidType; name: string } | undefined) =>
    emit('complete', r);
</script>

<template>
    <div class="choose-value-dialog-content">
        <el-dialog class="noHeader" v-model="show" @closed="onDialogClose">
            <ChooseValueVue :values="props.values" :chosen="props.chosen" :needs="props.needs" @complete="onComplete" />
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.choose-value-dialog-content {
    width: 100%;
}
</style>
