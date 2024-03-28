<template>
    <pre class="line-numbers">
        <code class="language-json">
            {{ props.code }}
        </code>
    </pre>
</template>
​
<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import Prism from 'prismjs';
const props = defineProps({
    code: {
        type: String,
        default: '',
    },
});

onMounted(() => {
    nextTick(() => {
        setTimeout(() => {
            Prism.highlightAll();
        }, 0);
    });
});
</script>

<style scoped lang="less">
pre {
    @apply max-w-full max-h-167 overflow-auto rounded-lg dark:(bg-dark-300);
    .scrollbar();
    &.line-numbers {
        @apply leading-4 p-0;
    }

    code {
        @apply !text-sm leading-5;
        .token {
            &.operator {
                background-color: transparent !important;
            }
        }
    }
}
pre[class*='language-'] {
    &.line-numbers > code {
        @apply -ml-12;
    }
}
.light {
    pre[class*='language-'] {
        @apply pl-8;
    }
    &:not(pre) {
        & > code[class*='language-'],
        .light pre[class*='language-'] {
            @apply bg-gray-100;
        }
    }
}
</style>
