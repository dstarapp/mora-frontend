<script lang="ts" setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import Prism from 'prismjs';

const props = defineProps({
    show: { type: Boolean, required: true },
    candid: { type: String, required: true },
});

const show = ref(props.show);

watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const emit = defineEmits(['close']);

const onClosed = () => emit('close');

onMounted(() => {
    nextTick(() => {
        setTimeout(() => Prism.highlightAll(), 0);
    });
});
</script>

<template>
    <el-dialog :title="$t('plugin.editor.candidPreview')" v-model="show" @closed="onClosed" class="w768">
        <div class="candid-preview-content">
            <pre class="language-javascript">
<code>{{ props.candid }}
                </code>
            </pre>
        </div>
    </el-dialog>
</template>

<style lang="less" scoped>
.candid-preview-content {
    display: flex;
    max-height: 600px;
    overflow-y: scroll;

    :deep(.code-toolbar) {
        width: 100%;
        font-size: 14px;
    }
}
</style>
