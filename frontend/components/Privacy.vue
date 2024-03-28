<template>
    <el-dialog
        v-model="dialogVisible"
        :title="$t('privacy.title')"
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        @closed="afterClose"
        :show-close="false"
    >
        <div class="w-full flex justify-between flex-col">
            <div class="box" v-dompurify-html="$t('privacy.txt')"></div>
            <div class="mora-button">
                <div class="cancel" @click="cancel">
                    {{ $t('privacy.btn.reject') }}
                </div>
                <div class="confirm" @click="confirm">
                    {{ $t('privacy.btn.agree') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        privacyCallback: {
            type: Function,
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);

        const afterClose = () => {
            if (!props.privacyCallback) {
                return;
            }
            props.privacyCallback(false);
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const confirm = () => {
            if (!props.privacyCallback) {
                return;
            }
            props.privacyCallback(true);
        };

        return {
            dialogVisible,
            afterClose,
            confirm,
            cancel,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full overflow-y-auto px-2;
    max-height: calc(100vh - 350px);
    .scrollbar();

    :deep(p) {
        @apply text-left block text-base pb-5 dark:(text-light-900/80);
        word-break: break-word;
    }

    :deep(h3) {
        @apply block pb-5 text-lg text-left font-medium text-black dark:(text-light-900);
    }
}
</style>
