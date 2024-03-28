<script lang="ts" setup>
import { ref, watch, reactive, shallowRef } from 'vue';
import CodeMirror from 'vue-codemirror6';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { EditorView, ViewUpdate } from '@codemirror/view';
import themes from './themes';

const emit = defineEmits(['changed']);
const props = defineProps({
    code: {
        type: String,
        required: true,
    },
    mirrorClass: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const state = reactive({
    lines: null as null | number,
    cursor: null as null | number,
    selected: null as null | number,
    length: null as null | number,
});

const cmView = shallowRef<EditorView>();

const codeData = ref<string>(props.code);

const handleStateUpdate = (viewUpdate: ViewUpdate) => {
    // selected
    const ranges = viewUpdate.state.selection.ranges;
    state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0);
    state.cursor = ranges[0].anchor;
    // length
    state.length = viewUpdate.state.doc.length;
    state.lines = viewUpdate.state.doc.lines;
};

const handleReady = ({ view }: any) => {
    cmView.value = view;
};

watch(
    () => codeData.value,
    () => {
        emit('changed', codeData.value);
    },
);
</script>

<template>
    <code-mirror v-if="disabled" class="line-none" :class="mirrorClass" :lang="javascript()" :tab="true"
        :extensions="[themes.oneDark, autocompletion()]" :disabled="disabled" basic gutter wrap
        @update="handleStateUpdate" @ready="handleReady" v-model="props.code">
    </code-mirror>
    <code-mirror v-if="!disabled" class="line-none" :class="mirrorClass" :lang="javascript()" :tab="true"
        :extensions="[themes.oneDark, autocompletion()]" :disabled="disabled" basic gutter wrap
        @update="handleStateUpdate" @ready="handleReady" v-model="codeData">
    </code-mirror>
</template>

<style lang="less" scoped>
.fixed-height {
    min-height: 200px;
    background-color: #282c34;
}

.fixed-height-250 {
    min-height: 250px;
    background-color: #282c34;
}

.fixed-height-330 {
    min-height: 330px;
    background-color: #282c34;
}

.fixed-height-530 {
    min-height: 530px;
    background-color: #282c34;
}

:deep(.cm-editor) {
    &.cm-focused {
        outline: none;
    }
}
</style>
