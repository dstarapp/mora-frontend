<template>
    <el-dialog v-model="dialogVisible" :title="$t('clear.title')" @closed="afterClose">
        <p>{{ $t('clear.txt') }}</p>
        <div class="mora-button">
            <div class="cancel" @click="afterClose">
                {{ $t('clear.btn.cancel') }}
            </div>
            <div class="confirm" @click="confirm">
                {{ $t('clear.btn.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { removeCacheAll } from '@/utils/functions';

export default defineComponent({
    name: 'Clear',
    emits: ['close'],
    setup(props, context) {
        const dialogVisible = ref(true);

        const afterClose = () => {
            context.emit('close');
        };

        const confirm = () => {
            removeCacheAll();
            context.emit('close');
        };

        return {
            dialogVisible,
            afterClose,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
p {
    @apply py-3;
}
</style>
