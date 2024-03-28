<template>
    <div class="identity-value-content">
        <template v-for="(value, index) in values" :key="value.id">
            <div class="item">
                <b>{{ `${value.index + 1}` }}</b>
                <p>{{ value.name }}</p>
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
import { CanisterAction } from '../../../types/parts/canisters';

type IdentityItem = {
    index: number;
    action: CanisterAction;
    id: string;
    name: string;
};

const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;

const values = computed<IdentityItem[]>(() => {
    let values: IdentityItem[] = [];

    for (let i = 0; i < actions.value.length; i++) {
        let action = actions.value[i];

        if (action.type === 'combined') continue;
        if (action.identity.from !== 'host-login') continue;
        if (!action.identity.id || !action.identity.name) continue;

        values.push({
            index: i,
            action,
            id: action.identity.id,
            name: action.identity.name,
        });
    }

    return values;
});
</script>

<style lang="less" scoped>
@import '../list.less';

.identity-value-content {
    width: 100%;
    height: 100%;
}
</style>
