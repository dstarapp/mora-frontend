<template>
    <el-dialog
        v-model="dialogVisible"
        :title="$t('roverClaim.disclaimer.title')"
        @closed="afterClose"
    >
        <div class="box" v-dompurify-html="$t('roverClaim.disclaimer.txt')"></div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    emits: ['close'],
    setup(props, context) {
        const dialogVisible = ref(true);

        const afterClose = () => {
            context.emit('close');
        };

        return {
            dialogVisible,
            afterClose,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full overflow-y-auto px-2;
    max-height: calc(100vh - 300px);
    .scrollbar();
    :deep(p) {
        @apply text-left block text-base pb-5 dark:(text-light-900/80);
        word-break: break-word;
    }
}
</style>
