<template>
    <div class="form-value-content">
        <div class="item" v-for="(item, index) in inputs" :key="item.id">
            <b>{{ index + 1 }}</b>
            <p>{{ item.name }}</p>
            <strong>{{ item.input.result.type }}</strong>
            <button @click="onDeleteInput(index)" class="iconfont icon-plugin-add"></button>
        </div>
        <div class="no-data" v-if="!inputs.length">
            <i class="iconfont icon-no"></i>
            <p>{{ $t('plugin.internalVariable.noData') }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref } from 'vue';
import { InputValue } from '../../../types/parts/inputs';

const inputs = inject<Ref<InputValue[]>>('INPUTS')!;
const deleteInput = inject<(index: number) => void>('INPUTS_DELETE')!;
const onDeleteInput = (index: number) => {
    if (0 <= index && index < inputs.value.length) deleteInput(index);
};
</script>

<style lang="less" scoped>
@import '../list.less';

.form-value-content {
    width: 100%;
    height: 100%;
}
</style>
