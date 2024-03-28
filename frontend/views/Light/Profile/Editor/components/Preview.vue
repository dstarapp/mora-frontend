<script lang="ts" setup>
import { ref, watch, PropType, computed, nextTick } from 'vue';
import { Agent } from '@dfinity/agent';
import {
    LightExecutingQueryResult,
    LightExecutingQueryValue,
} from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import store from '@/store';
import { CandidValue, getInitialCandidTypeValue } from '@mora-light/core/types/candid';
import { LightCore, findPropDataSources } from '@mora-light/core/types';
import { DataSourceProp } from '@mora-light/core/types/source';
import { isSame, DataResult, deepClone } from '@mora-light/core/types/common';
import { ConstantInput as ConstantInputVue } from '@mora-light/vue';
import { WrappedMoraLight as WrappedMoraLightVue } from '@mora-light/vue';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    data: {
        type: Object as PropType<LightExecutingQueryResult>,
        required: true,
    },
});

const agent = computed<Agent>(() => store.state.agent);

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);
const emit = defineEmits(['close']);
const onDialogClose = () => emit('close');

const propSources = ref<DataSourceProp[]>(
    findPropDataSources(JSON.parse(props.data['value'].core_json).data),
);
const propValues = ref<DataResult<CandidValue>[]>([]);
const onValueChanged = (i: number, value: DataResult<CandidValue>) => {
    propValues.value[i] = value;
};
const checked = computed(() => {
    for (let i = 0; i < propSources.value.length; i++) {
        if (!propValues.value[i] || propValues.value[i].err) return false;
    }
    return true;
});
const propValue = computed(() => {
    const value: Record<string, CandidValue> = {};
    for (let i = 0; i < propSources.value.length; i++) {
        if (propValues.value[i]) {
            const ok = propValues.value[i].ok;
            if (ok) value[propSources.value[i].prop.name] = deepClone(ok);
        }
    }
    console.error('value', value);
    return value;
});
const showPreview = ref(true);
watch(
    () => propValue.value,
    (nv, ov) => {
        if (isSame(nv, ov)) return;
        showPreview.value = false;
        nextTick(() => (showPreview.value = true));
    },
);

const isStart = ref(false);
watch(
    () => props.data,
    () => {
        console.log(props.data);
        const value: LightExecutingQueryValue = props.data['value'];
        console.error('🚀 ~ file: Preview.vue:27 ~ value:', value);
        const core: LightCore = JSON.parse(value.core_json);
        console.error('🚀 ~ file: Preview.vue:29 ~ core:', core, value.core_json);
        propSources.value = findPropDataSources(core.data);

        if (propSources.value.length === 0) isStart.value = true;
    },
    { immediate: true },
);

const onStart = () => {
    if (!checked.value) return;
    isStart.value = true;
};
</script>

<template>
    <el-dialog style="width: 854px" :title="$t('plugin.preview.title')" v-model="show" @closed="onDialogClose">
        <div class="preview-box">
            <div class="prop" v-if="propSources.length && !isStart">
                <div class="list" v-for="(source, i) in propSources">
                    <div class="label">
                        {{ propSources.length > 1 ? `${i + 1}. ` : '' }}
                        {{ `${source.prop.label ? source.prop.label : source.prop.name}` }}
                    </div>
                    <div class="input">
                        <ConstantInputVue :initial="{
        type: source.prop.result,
        value: getInitialCandidTypeValue(source.prop.result, [], []),
    }" :disabled="false" @changed="(r: DataResult<CandidValue>) => (onValueChanged(i, r))" />
                    </div>
                </div>
                <div class="btn" :class="{ disabled: !checked }" @click="onStart">Start</div>
            </div>

            <div class="main-preview" v-if="showPreview && isStart">
                <WrappedMoraLightVue :hostAgent="agent" :data="props.data" :status="'running'"
                    :prop="JSON.stringify(propValue)" />
            </div>
        </div>
    </el-dialog>
</template>

<style lang="less" scoped>
.preview-box {
    width: 100%;

    .prop {
        display: flex;
        flex-direction: column;
        height: 100%;

        .list {
            display: flex;
            width: 100%;
            position: relative;
            margin-bottom: 30px;

            .label {
                display: flex;
                font-weight: 400;
                font-size: 16px;
                align-items: center;
                justify-content: center;
                width: 180px;
                flex-shrink: 0;
                text-align: left;
                height: 44px;
                line-height: 44px;
                align-items: flex-start;
                justify-content: flex-start;
            }

            .input {
                width: 100%;
                display: flex;
                text-align: left;
            }
        }

        .btn {
            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
            border-radius: 10px;
            height: 44px;
            width: 100%;
            font-weight: 400;
            font-size: 16px;
            line-height: 140%;
            color: #000000;
            cursor: pointer;
            .center();

            &.disabled {
                opacity: 0.5;
            }
        }
    }

    .main-preview {
        max-height: 80vh;
        overflow-y: auto;
    }
}
</style>
