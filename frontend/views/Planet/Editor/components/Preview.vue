<template>
    <el-dialog class="w100vw" :title="$t('editor.preview.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="w728">
            <Preview :content="content" :title="title" />
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Preview from '@/components/Preview.vue';

export default defineComponent({
    components: { Preview },
    name: 'Formula',
    emits: ['componentClose'],
    props: {
        componentDefaultValue: { type: Object },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const title = ref(props?.componentDefaultValue?.title ?? '');
        const content = ref(props?.componentDefaultValue?.content ?? '');

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        return {
            dialogVisible,
            title,
            content,
            handleClose,
            afterClose,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
.w728 {
    margin: 0 auto;
    width: 728px;
}
</style>
