<template>
    <el-dialog v-model="dialogVisible" :title="$t('planetTips.updates.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="text">
            {{ $t('planetTips.updates.textLeft') }}
            <em @click="oepnGitBub">{{ githubUrl }}</em>
            {{ $t('planetTips.updates.textRight') }}
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('planetTips.updates.cancel') }}
            </div>
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetTips.updates.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: 'Updates',
    emits: ['componentClose'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const addressVal = ref();
        const isLoading = ref(false);
        const githubUrl = 'https://github.com/coolmanj/mora';

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('planetTips.updates.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            isLoading.value = true;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const oepnGitBub = () => {
            window.open(githubUrl);
        };

        return {
            dialogVisible,
            addressVal,
            isLoading,
            githubUrl,
            oepnGitBub,
            handleClose,
            afterClose,
            cancel,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
.text {
    font-style: normal;
    .font-size(16);
    .line-height(23);
    color: @text-color;
    text-align: left;
    @apply dark:(text-light-900/80);

    .padding(0, 20, 0, 20);

    em {
        font-style: normal;
        color: @text-active;
        cursor: pointer;
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {}
</style>
