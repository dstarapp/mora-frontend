<template>
    <div class="action-value-content">
        <template v-for="(value, index) in values" :key="value.id">
            <div class="item">
                <b class="action">{{ `${value.index + 1}.${value.order + 1}` }}</b>
                <p>{{ value.name }}</p>
                <strong>{{ value?.type?.type ? value.type.type : value.type }}</strong>
            </div>
        </template>

        <div class="no-data" v-if="!values.length">
            <i class="iconfont icon-no"></i>
            <p>{{ $t('plugin.internalVariable.noData') }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref, computed } from 'vue';
import { SupportedAction } from '../../../types/core';
import { CanisterActionResult } from '../../../types/parts/canisters';
import { CombinedActionResult } from '../../../types/parts/combined';
import { CandidType } from '@mora-light/core/types/candid';
import { findTransformToCandidType } from '@mora-light/core/types/transform';

type ValueItem = {
    index: number;
    action: SupportedAction;
    all: number;
    order: number;
    id: string;
    name: string;
    type: CandidType;
};

const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;

const values = computed<ValueItem[]>(() => {
    let values: ValueItem[] = [];

    const parseCanisterActionResult = (
        result: CanisterActionResult,
    ): { id: string; name: string; type: CandidType }[] => {
        let list: { id: string; name: string; type: CandidType }[] = [];

        if (result.exported && result.exported.id && result.exported.name) {
            list.push({
                id: result.exported.id,
                name: result.exported.name,
                type: findTransformToCandidType(result.exported.transform) ?? result.type,
            });
        }

        if (result.subitems) {
            for (let i = 0; i < result.subitems.length; i++) {
                list.push(...parseCanisterActionResult(result.subitems[i]));
            }
        }
        return list;
    };

    const parseCombinedActionResult = (
        result: CombinedActionResult,
    ): { id: string; name: string; type: CandidType }[] => {
        let list: { id: string; name: string; type: CandidType }[] = [];

        if (result.exported && result.exported.id && result.exported.name) {
            list.push({
                id: result.exported.id,
                name: result.exported.name,
                type: findTransformToCandidType(result.exported.transform) ?? result.type,
            });
        }

        if (result.subitems) {
            for (let i = 0; i < result.subitems.length; i++) {
                list.push(...parseCombinedActionResult(result.subitems[i]));
            }
        }
        return list;
    };

    for (let i = 0; i < actions.value.length; i++) {
        let action = actions.value[i];
        let list: { id: string; name: string; type: CandidType }[] = [];
        if (action.type === 'canister') {
            list.push(...parseCanisterActionResult(action.result));
        } else if (action.type === 'combined') {
            list.push(...parseCombinedActionResult(action.result));
        }
        for (let j = 0; j < list.length; j++) {
            const value = list[j];
            values.push({
                index: i,
                action: action,
                all: list.length,
                order: j,
                id: value.id,
                name: value.name,
                type: value.type,
            });
        }
    }

    return values;
});
</script>

<style lang="less" scoped>
@import '../list.less';

.action-value-content {
    width: 100%;
    height: 100%;
}
</style>
