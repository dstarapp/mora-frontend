<template>
    <el-dialog v-model="dialogVisible" :title="$t('planetTips.insufficient.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="text">
            {{ $t('planetTips.insufficient.text') }}
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('planetTips.insufficient.cancel') }}
            </div>
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetTips.insufficient.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: 'Insufficient',
    emits: ['componentClose'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const addressVal = ref();
        const isLoading = ref(false);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('planetTips.insufficient.isLoadingClose'));
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

        return {
            dialogVisible,
            addressVal,
            isLoading,
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
    display: flex;
    font-style: normal;
    .font-size(16);
    .line-height(23);
    color: @text-color;
    text-align: left;
    .padding(0, 20, 0, 20);
    @apply dark:(text-light-900/80);
}

.mora-button {
    display: flex;
    .padding(0, 50, 0, 50);
    .margin(30, 0, 0, 0);

    div {
        .border-radius(10);
        .center();
        .height(45);
        min-height: 45px;
        flex: 1;
        font-style: normal;
        font-weight: 350;
        .font-size(16);
        .line-height(19);
        cursor: pointer;
        transition: @transition;
    }

    .cancel {
        .margin(0, 30, 0, 0);
        border: 1px solid @border-color;
        color: @text-fcolor;
    }

    .confirm {
        background: @bg-color-body-active;
        color: @text-color-inverse;

        &.loading {
            transition: @transition;
            background: @bg-color-body-loading;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {}
</style>
